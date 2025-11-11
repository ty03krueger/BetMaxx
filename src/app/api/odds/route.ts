import { NextResponse } from "next/server";

// ===== Provider types (simplified) =====
type ApiOutcome = { name: string; price: number; point?: number | null };
type ApiMarketKey = "h2h" | "totals" | "player_anytime_td";
type ApiMarket = { key: ApiMarketKey; outcomes: ApiOutcome[] };
type ApiBookmaker = { key: string; title: string; markets: ApiMarket[] };
type ApiEvent = {
  id: string;
  commence_time: string;
  home_team: string;
  away_team: string;
  bookmakers: ApiBookmaker[];
};

// ===== App types (UI contracts) =====
type BookOdds = { name: string; odds: Record<string, number> }; // moneyline per team
type BookTotals = { name: string; line: number; prices: { Over: number; Under: number } };
type TDBest = { player: string; best: { book: string; price: number } | null };

export type Game = {
  eventId: string;
  league: "NFL" | "NCAAF";
  commenceTime: string;
  teams: [string, string];
  books: BookOdds[];
  totals: BookTotals[];
  td?: TDBest[]; // Anytime TD (optional if not requested / not available)
};

// Server cache
export const revalidate = 60;

// ---- helpers ----
function betterAmerican(a: number, b: number) {
  // higher is better: +150 > +120; if both negative, the one closer to 0 is better (-105 > -120)
  const rank = (p: number) => (p > 0 ? 10000 + p : 10000 - Math.abs(p));
  return rank(a) - rank(b);
}
const aliasPlayer = (s: string) => s.replaceAll(".", "").replace(/\s+/g, " ").trim();

export async function GET(req: Request) {
  const apiKey = process.env.ODDS_API_KEY;
  const base = process.env.ODDS_API_BASE || "https://api.the-odds-api.com/v4";
  if (!apiKey) {
    return NextResponse.json({ error: "Missing ODDS_API_KEY in .env.local" }, { status: 500 });
  }

  // Read query params
  const urlIn = new URL(req.url);

  // NEW: sport selector (default nfl). Accepts: nfl | ncaaf
  const sportParam = (urlIn.searchParams.get("sport") || "nfl").toLowerCase();
  const sportKey =
    sportParam === "ncaaf" ? "americanfootball_ncaaf" : "americanfootball_nfl";
  const league: "NFL" | "NCAAF" = sportParam === "ncaaf" ? "NCAAF" : "NFL";

  const marketsParam =
    urlIn.searchParams.get("markets") || "h2h,totals"; // allow player_anytime_td to be requested
  const bookmakersParam = urlIn.searchParams.get("bookmakers"); // optional limiter
  const regions = urlIn.searchParams.get("regions") || "us";
  const oddsFormat = urlIn.searchParams.get("oddsFormat") || "american";
  const dateFormat = urlIn.searchParams.get("dateFormat") || "iso";

  const providerUrl = new URL(`${base}/sports/${sportKey}/odds`);
  providerUrl.searchParams.set("regions", regions);
  providerUrl.searchParams.set("markets", marketsParam);
  providerUrl.searchParams.set("oddsFormat", oddsFormat);
  providerUrl.searchParams.set("dateFormat", dateFormat);
  providerUrl.searchParams.set("apiKey", apiKey);
  if (bookmakersParam) providerUrl.searchParams.set("bookmakers", bookmakersParam);

  try {
    const res = await fetch(providerUrl.toString(), { next: { revalidate } });
    if (!res.ok) {
      const text = await res.text();
      return NextResponse.json({ error: text || res.statusText }, { status: res.status });
    }

    const data = (await res.json()) as ApiEvent[];

    const includeTD = marketsParam.split(",").map((s) => s.trim()).includes("player_anytime_td");

    const games: Game[] = data.map((e) => {
      const teams: [string, string] = [e.away_team, e.home_team];

      // --- Moneyline ---
      const books: BookOdds[] = e.bookmakers
        .map((b) => {
          const h2h = b.markets.find((m) => m.key === "h2h");
          if (!h2h) return null;
          const odds: Record<string, number> = {};
          for (const o of h2h.outcomes) {
            if (typeof o.price === "number") odds[o.name] = o.price;
          }
          if (!Object.keys(odds).length) return null;
          return { name: b.title, odds };
        })
        .filter(Boolean) as BookOdds[];

      // --- Totals ---
      const totals: BookTotals[] = e.bookmakers
        .map((b) => {
          const tot = b.markets.find((m) => m.key === "totals");
          if (!tot) return null;

          let line: number | undefined;
          let over: number | undefined;
          let under: number | undefined;

          for (const o of tot.outcomes) {
            const lower = o.name.toLowerCase();
            if (lower.includes("over")) {
              if (o.point != null) line = o.point;
              if (typeof o.price === "number") over = o.price;
            } else if (lower.includes("under")) {
              if (o.point != null && line == null) line = o.point;
              if (typeof o.price === "number") under = o.price;
            }
          }
          if (line == null || over == null || under == null) return null;
          return { name: b.title, line, prices: { Over: over, Under: under } };
        })
        .filter(Boolean) as BookTotals[];

      // --- Anytime TD (optional) ---
      let td: TDBest[] | undefined = undefined;
      if (includeTD) {
        // aggregate per player across all books, then pick the best price/book
        const perPlayer: Map<string, { book: string; price: number }> = new Map();

        for (const b of e.bookmakers) {
          const m = b.markets.find((m) => m.key === "player_anytime_td");
          if (!m) continue;

          for (const o of m.outcomes) {
            const player = aliasPlayer(o.name);
            if (typeof o.price !== "number") continue;

            const existing = perPlayer.get(player);
            if (!existing || betterAmerican(o.price, existing.price) > 0) {
              perPlayer.set(player, { book: b.title, price: o.price });
            }
          }
        }

        if (perPlayer.size) {
          td = Array.from(perPlayer.entries())
            .map(([player, best]) => ({ player, best }))
            .sort((a, b) => betterAmerican(b.best!.price, a.best!.price));
        }
      }

      return {
        eventId: e.id,
        league,
        commenceTime: e.commence_time,
        teams,
        books,
        totals,
        ...(td ? { td } : {}),
      };
    });

    const upcoming = games.filter(
      (g) => g.books.length || g.totals.length || (g.td && g.td.length)
    );
    return NextResponse.json({ games: upcoming });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Unexpected error" }, { status: 500 });
  }
}


