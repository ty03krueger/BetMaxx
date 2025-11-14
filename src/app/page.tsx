"use client";

import * as React from "react";
import Link from "next/link";
import { useMemo } from "react";
import {
  Box,
  Stack,
  Typography,
  Button,
  Card,
  CardContent,
  IconButton,
  Chip,
} from "@mui/material";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import SportsFootballIcon from "@mui/icons-material/SportsFootball";
import SportsBasketballIcon from "@mui/icons-material/SportsBasketball";
import SportsHockeyIcon from "@mui/icons-material/SportsHockey";
import SportsBaseballIcon from "@mui/icons-material/SportsBaseball";
import SchoolIcon from "@mui/icons-material/School";
import { alpha } from "@mui/material/styles";

import { useOdds } from "./hooks/useOdds";
import { isFinal } from "./utils/isFinal";
import type { Game } from "./api/odds/route";

/* ---------- league config (shared) ---------- */
const LEAGUES = [
  { href: "/nfl", title: "NFL", icon: <SportsFootballIcon />, coming: false },
  { href: "/cfb", title: "College Football", icon: <SchoolIcon />, coming: false },
  { href: "/nba", title: "NBA", icon: <SportsBasketballIcon />, coming: true },
  { href: "/nhl", title: "NHL", icon: <SportsHockeyIcon />, coming: true },
  { href: "/mlb", title: "MLB", icon: <SportsBaseballIcon />, coming: true },
];

/* ---------- subtle gold divider ---------- */
function GoldDivider() {
  return (
    <Box
      aria-hidden
      sx={{
        mx: { xs: 2, md: 4 },
        height: 1,
        background: `linear-gradient(90deg,
          ${alpha("#FFD600", 0)} 0%,
          ${alpha("#FFD600", 0.28)} 18%,
          ${alpha("#FFD600", 0.12)} 50%,
          ${alpha("#FFD600", 0.28)} 82%,
          ${alpha("#FFD600", 0)} 100%
        )`,
        opacity: 0.6,
      }}
    />
  );
}

/* ---------- league + deeplink helpers ---------- */
function leagueRouteFor(game: any): string {
  const lg = String(game.league ?? game.sportKey ?? "").toUpperCase();
  if (lg === "NFL") return "/nfl";
  if (lg === "CFB" || lg === "NCAAF" || lg.includes("NCAA")) return "/cfb";
  return "/";
}

function hrefForGame(game: any): string {
  const base = leagueRouteFor(game);
  const id = encodeURIComponent(game.eventId ?? game.id ?? "");
  return `${base}?game=${id}`;
}

/* ---------- moneyline helpers (best per team) ---------- */
type BestSide = { price: number; book?: string };
type BestML = { away?: BestSide; home?: BestSide };

function getBestMoneylines(game: any): BestML {
  const teams: string[] = game?.teams ?? [];
  const awayName = teams[0] ?? "";
  const homeName = teams[1] ?? "";
  const bms = game?.bookmakers;
  if (!Array.isArray(bms)) return {};

  const betterForBettor = (a: number, b: number) => {
    if (a > 0 && b > 0) return a > b;
    if (a > 0 && b <= 0) return true;
    if (a <= 0 && b > 0) return false;
    return a > b;
  };

  const best: BestML = {};

  for (const bm of bms) {
    const book = bm?.title || bm?.key || bm?.name;
    const markets = bm?.markets ?? bm?.bets ?? [];
    const ml = markets.find((m: any) =>
      /moneyline|ml/i.test(m?.key || m?.market || m?.name || "")
    );
    if (!ml) continue;

    const outcomes = ml?.outcomes ?? ml?.selections ?? [];
    outcomes.forEach((o: any, idx: number) => {
      const team = (o?.name || o?.team || o?.participant || "").toString();
      const price = Number(o?.price ?? o?.odds ?? o?.american);
      if (!Number.isFinite(price)) return;

      if (awayName && team && team.toLowerCase() === awayName.toLowerCase()) {
        if (!best.away || betterForBettor(price, best.away.price)) best.away = { price, book };
        return;
      }
      if (homeName && team && team.toLowerCase() === homeName.toLowerCase()) {
        if (!best.home || betterForBettor(price, best.home.price)) best.home = { price, book };
        return;
      }

      if (!best.away && idx === 0) best.away = { price, book };
      if (!best.home && idx === 1) best.home = { price, book };
    });
  }

  return best;
}

function fmtAmerican(n?: number): string {
  if (typeof n !== "number" || !Number.isFinite(n)) return "—";
  return n > 0 ? `+${Math.round(n)}` : `${Math.round(n)}`;
}

/* ---------- page ---------- */
export default function HomePage() {
  const { games: nflGames, loading } = useOdds({ sport: "nfl" });
  const { games: cfbGames } = useOdds({ sport: "ncaaf" });

  const { upcoming, windowLabel } = useMemo(() => {
    const now = Date.now();
    const sixHours = 6 * 60 * 60 * 1000;
    const twentyFourHours = 24 * 60 * 60 * 1000;

    const all = [...(nflGames ?? []), ...(cfbGames ?? [])].filter((g) => !isFinal(g));

    const inRange = (ms: number) =>
      all
        .filter((g) => {
          const t = Date.parse((g as any).commenceTime ?? "");
          return Number.isFinite(t) && t >= now && t <= now + ms;
        })
        .sort((a, b) => Date.parse((a as any).commenceTime) - Date.parse((b as any).commenceTime))
        .slice(0, 12);

    const six = inRange(sixHours);
    if (six.length > 0) {
      return { upcoming: six, windowLabel: "next 6h" };
    }

    const twentyFour = inRange(twentyFourHours);
    return { upcoming: twentyFour, windowLabel: "next 24h" };
  }, [nflGames, cfbGames]);

  return (
    <Stack spacing={10} sx={{ pb: 10 }}>
      {/* HERO */}
      <Box
        sx={{
          position: "relative",
          pt: { xs: 8, md: 12 },
          pb: { xs: 8, md: 12 },
          px: { xs: 2, md: 4 },
          background: `
            radial-gradient(900px 500px at 15% 50%, rgba(255, 214, 0, 0.10), transparent 70%),
            radial-gradient(1200px 600px at 80% -10%, rgba(255,255,255,0.12), transparent),
            linear-gradient(180deg, rgba(255,255,255,0.02), transparent)
          `,
          backgroundRepeat: "no-repeat",
          backgroundSize: "cover",
          backgroundPosition: "center",
          borderBottom: "1px solid",
          borderColor: "divider",
        }}
      >
        <Stack alignItems="center" spacing={3}>
          <Typography variant="overline" sx={{ letterSpacing: 2, opacity: 0.8 }}>
            BetMaxx
          </Typography>
          <Typography
            variant="h2"
            sx={{ fontWeight: 900, textAlign: "center", lineHeight: 1.1 }}
          >
            Compare Odds. <br /> Bet Smarter. <br /> Win Maxx.
          </Typography>
          <Typography
            variant="subtitle1"
            sx={{ textAlign: "center", maxWidth: 720, opacity: 0.85 }}
          >
            A clean, pro-grade odds hub designed to make your bets <b>easier</b>,{" "}
            <b>faster</b>, and <b>more profitable</b>.
          </Typography>

          {/* HERO BUTTONS - centered + stacked on mobile */}
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={2}
            sx={{
              pt: 1,
              width: "100%",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Button
              component={Link}
              href="/nfl"
              size="large"
              variant="contained"
              sx={{
                borderRadius: 999,
                width: { xs: "100%", sm: "auto" },
                textAlign: "center",
              }}
            >
              View NFL Odds
            </Button>
            <Button
              component={Link}
              href="/cfb"
              size="large"
              variant="outlined"
              sx={{
                borderRadius: 999,
                width: { xs: "100%", sm: "auto" },
                textAlign: "center",
              }}
            >
              College Football
            </Button>
          </Stack>
        </Stack>
      </Box>

      {/* divider */}
      <GoldDivider />

      {/* LEAGUE SECTION */}

      {/* Mobile: pill row */}
      <Box
        sx={{
          display: { xs: "block", md: "none" },
          px: { xs: 2, md: 4 },
        }}
      >
        <Stack spacing={1.5} alignItems="center">
          <Typography
            variant="subtitle2"
            sx={{
              textTransform: "uppercase",
              letterSpacing: 2,
              opacity: 0.7,
            }}
          >
            Sports
          </Typography>
          <Stack
            direction="row"
            spacing={1}
            flexWrap="wrap"
            justifyContent="center"
          >
            {LEAGUES.map((lg) => (
              <LeaguePill
                key={lg.href}
                href={lg.href}
                title={lg.title}
                icon={lg.icon}
                coming={lg.coming}
              />
            ))}
          </Stack>
        </Stack>
      </Box>

      {/* Desktop / tablet: compact, centered cards (no Grid) */}
      <Box
        sx={{
          display: { xs: "none", md: "block" },
          px: { xs: 2, md: 4 },
          maxWidth: 960,
          mx: "auto",
        }}
      >
        <Stack spacing={2} alignItems="center">
          <Typography
            variant="subtitle2"
            sx={{
              textTransform: "uppercase",
              letterSpacing: 2,
              opacity: 0.7,
            }}
          >
            Sports on BetMaxx
          </Typography>
          <Stack
            direction="row"
            spacing={2}
            flexWrap="wrap"
            justifyContent="center"
          >
            {LEAGUES.map((lg) => (
              <LeagueCard
                key={lg.href}
                href={lg.href}
                title={lg.title}
                icon={lg.icon}
                coming={lg.coming}
              />
            ))}
          </Stack>
        </Stack>
      </Box>

      {/* divider */}
      <GoldDivider />

      {/* UPCOMING CAROUSEL */}
      <Box sx={{ px: { xs: 2, md: 4 } }}>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          alignItems={{ xs: "flex-start", sm: "center" }}
          justifyContent={{ xs: "center", sm: "space-between" }}
          sx={{ mb: 2, gap: { xs: 1, sm: 0 } }}
        >
          <Typography
            variant="h5"
            sx={{ fontWeight: 800, textAlign: { xs: "center", sm: "left" } }}
          >
            Upcoming · Best Odds ({windowLabel})
          </Typography>
          <Stack
            direction="row"
            spacing={1}
            alignItems="center"
            sx={{ alignSelf: { xs: "center", sm: "auto" } }}
          >
            <Chip size="small" label="NFL" variant="outlined" />
            <Chip size="small" label="CFB" variant="outlined" />
          </Stack>
        </Stack>

        <UpcomingCarousel games={upcoming} loading={loading} windowLabel={windowLabel} />
      </Box>

      {/* divider */}
      <GoldDivider />

      {/* VALUE PROPS */}
      <Box
        sx={{
          px: { xs: 2, md: 4 },
          maxWidth: 960,
          mx: "auto",
        }}
      >
        <Stack spacing={2}>
          <Typography
            variant="subtitle2"
            sx={{
              textTransform: "uppercase",
              letterSpacing: 2,
              opacity: 0.7,
              textAlign: { xs: "center", md: "left" },
            }}
          >
            Why Bettors Use BetMaxx
          </Typography>
          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={2}
            alignItems="stretch"
          >
            <ValueCard
              title="Best Line, Instantly"
              body="We scan multiple books so you don’t leave value on the table."
            />
            <ValueCard
              title="Live Refresh"
              body="Odds update instantly. React like you’re in the bleachers."
            />
            <ValueCard
              title="Built for Speed"
              body="Minimal clicks. Faster decisions. More fun. A true bettor’s UI."
            />
          </Stack>
        </Stack>
      </Box>

      {/* ROADMAP / BETA */}
      <Box sx={{ px: { xs: 2, md: 4 } }}>
        <Card variant="outlined" sx={{ borderRadius: 4 }}>
          <CardContent>
            <Stack
              direction={{ xs: "column", md: "row" }}
              alignItems={{ xs: "flex-start", md: "center" }}
              justifyContent={{ xs: "flex-start", md: "space-between" }}
              spacing={2}
            >
              <Stack spacing={0.5}>
                <Typography variant="h6" sx={{ fontWeight: 800 }}>
                  Customize Your Board, Maxx Your Bets Effortlessly
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.8 }}>
                  Personalize your board, track markets you care about, and catch shifts in real time.
                </Typography>
              </Stack>
              {/* CTA BUTTONS - centered / full width on mobile */}
              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={2}
                sx={{ width: { xs: "100%", sm: "auto" }, alignItems: "center" }}
              >
                <Button
                  component={Link}
                  href="/account"
                  variant="contained"
                  sx={{
                    borderRadius: 999,
                    width: { xs: "100%", sm: "auto" },
                    textAlign: "center",
                  }}
                >
                  My Account
                </Button>
                <Button
                  component={Link}
                  href="/nba"
                  variant="outlined"
                  sx={{
                    borderRadius: 999,
                    width: { xs: "100%", sm: "auto" },
                    textAlign: "center",
                  }}
                >
                  See What’s Next
                </Button>
              </Stack>
            </Stack>
          </CardContent>
        </Card>
      </Box>
    </Stack>
  );
}

/* ---------- Components ---------- */

function LeaguePill({
  href,
  title,
  icon,
  coming,
}: {
  href: string;
  title: string;
  icon: React.ReactNode;
  coming?: boolean;
}) {
  return (
    <Button
      component={Link as any}
      href={href}
      size="small"
      variant={coming ? "outlined" : "contained"}
      startIcon={icon}
      sx={{
        borderRadius: 999,
        textTransform: "none",
        fontSize: 12,
        px: 1.8,
        py: 0.6,
        opacity: coming ? 0.8 : 1,
        borderColor: coming ? alpha("#ffffff", 0.25) : undefined,
      }}
    >
      {title}
      {coming && (
        <Typography
          component="span"
          sx={{ ml: 0.5, fontSize: 10, opacity: 0.9 }}
        >
          Soon
        </Typography>
      )}
    </Button>
  );
}

function LeagueCard({
  href,
  title,
  icon,
  coming = false,
}: {
  href: string;
  title: string;
  icon: React.ReactNode;
  coming?: boolean;
}) {
  return (
    <Box
      sx={{
        flex: "0 1 220px",
        maxWidth: 240,
      }}
    >
      <Card
        variant="outlined"
        component={Link as any}
        href={href}
        sx={{
          textDecoration: "none",
          borderRadius: 999,
          transition: "transform 160ms ease, box-shadow 160ms ease, border-color 160ms ease",
          ":hover": {
            transform: "translateY(-2px)",
            borderColor: alpha("#FFD600", 0.7),
            boxShadow: "0 10px 30px rgba(0,0,0,0.45)",
          },
          position: "relative",
          height: "100%",
          bgcolor: "rgba(255,255,255,0.02)",
        }}
      >
        <CardContent sx={{ py: 1.4, px: 2.2 }}>
          <Stack
            direction="row"
            spacing={1.25}
            alignItems="center"
            justifyContent="space-between"
          >
            <Stack direction="row" spacing={1.2} alignItems="center">
              <Box sx={{ opacity: 0.9 }}>{icon}</Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                {title}
              </Typography>
            </Stack>
            {coming && (
              <Chip
                label="Soon"
                size="small"
                sx={{
                  fontSize: 10,
                  px: 0.5,
                  height: 22,
                  borderRadius: 999,
                }}
              />
            )}
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}

function ValueCard({ title, body }: { title: string; body: string }) {
  return (
    <Box
      sx={{
        flex: "1 1 0",
        minWidth: { xs: "100%", md: 0 },
      }}
    >
      <Card
        variant="outlined"
        sx={{
          borderRadius: 3,
          height: "100%",
          bgcolor: "rgba(255,255,255,0.02)",
        }}
      >
        <CardContent>
          <Typography variant="h6" sx={{ fontWeight: 800, mb: 0.75 }}>
            {title}
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.85 }}>
            {body}
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
}

function UpcomingCarousel({
  games,
  loading,
  windowLabel,
}: {
  games: Game[];
  loading?: boolean;
  windowLabel: string;
}) {
  const scrollerRef = React.useRef<HTMLDivElement | null>(null);

  const scrollByCard = (dir: -1 | 1) => () => {
    const el = scrollerRef.current;
    if (!el) return;
    const child = el.querySelector(":scope > *") as HTMLElement | null;
    const w = child ? child.offsetWidth + 16 : 260;
    el.scrollBy({ left: dir * w * 1.25, behavior: "smooth" });
  };

  if (loading && (!games || games.length === 0)) {
    return (
      <Box
        sx={{
          borderRadius: 4,
          border: "1px solid",
          borderColor: "divider",
          p: 4,
          textAlign: "center",
          opacity: 0.8,
        }}
      >
        Loading live board…
      </Box>
    );
  }

  if (!games || games.length === 0) {
    const emptyText =
      windowLabel === "next 24h"
        ? "No upcoming games in the next 24 hours."
        : "No upcoming games in the next 6 hours.";
    return (
      <Box
        sx={{
          borderRadius: 4,
          border: "1px solid",
          borderColor: "divider",
          p: 4,
          textAlign: "center",
          opacity: 0.8,
        }}
      >
        {emptyText}
      </Box>
    );
  }

  return (
    <Box
      sx={{
        position: "relative",
        width: "100%",
        mx: { xs: "auto", sm: 0 },
      }}
    >
      <IconButton
        aria-label="prev"
        onClick={scrollByCard(-1)}
        sx={{
          display: { xs: "none", sm: "flex" },
          position: "absolute",
          left: -8,
          top: "50%",
          transform: "translateY(-50%)",
          zIndex: 1,
          background: "background.paper",
          border: "1px solid",
          borderColor: "divider",
        }}
      >
        <ArrowBackIosNewIcon fontSize="small" />
      </IconButton>

      <Stack
        ref={scrollerRef}
        direction="row"
        spacing={2}
        sx={{
          overflowX: "auto",
          scrollBehavior: "smooth",
          py: 1,
          px: { xs: 3, sm: 6 },
          justifyContent: { xs: "flex-start", sm: "flex-start" },
          scrollSnapType: { xs: "x mandatory", sm: "none" } as any,
          "::-webkit-scrollbar": { height: 8 },
          "::-webkit-scrollbar-thumb": {
            background: "rgba(255,255,255,0.2)",
            borderRadius: 999,
          },
        }}
      >
        {games.map((g) => (
          <UpcomingCard key={g.eventId} game={g} />
        ))}
      </Stack>

      <IconButton
        aria-label="next"
        onClick={scrollByCard(1)}
        sx={{
          display: { xs: "none", sm: "flex" },
          position: "absolute",
          right: -8,
          top: "50%",
          transform: "translateY(-50%)",
          zIndex: 1,
          background: "background.paper",
          border: "1px solid",
          borderColor: "divider",
        }}
      >
        <ArrowForwardIosIcon fontSize="small" />
      </IconButton>
    </Box>
  );
}

function UpcomingCard({ game }: { game: Game }) {
  const [away, home] = game.teams;
  const best = getBestMoneylines(game);

  const kickoff = new Date((game as any).commenceTime).toLocaleString(undefined, {
    weekday: "short",
    hour: "numeric",
    minute: "2-digit",
  });

  const league = (game as any).league || (game as any).sportKey || "Game";
  const href = hrefForGame(game);

  return (
    <Card
      variant="outlined"
      sx={{
        minWidth: { xs: 260, sm: 280 },
        borderRadius: 4,
        transition: "transform 160ms ease",
        ":hover": { transform: "translateY(-2px)" },
        scrollSnapAlign: { xs: "center", sm: "none" } as any,
      }}
    >
      <CardContent>
        <Stack spacing={1}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Chip size="small" label={league.toString().toUpperCase()} />
            <Typography variant="caption" sx={{ opacity: 0.8 }}>
              {kickoff}
            </Typography>
          </Stack>

          <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
            {away} @ {home}
          </Typography>

          <Stack spacing={0.5} sx={{ pt: 0.5 }}>
            <Typography variant="body2" sx={{ opacity: 0.75 }}>
              Best ML
            </Typography>
            <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
              <Chip
                size="small"
                variant="outlined"
                label={`${away}: ${fmtAmerican(best.away?.price)}${
                  best.away?.book ? ` · ${best.away.book}` : ""
                }`}
              />
              <Chip
                size="small"
                variant="outlined"
                label={`${home}: ${fmtAmerican(best.home?.price)}${
                  best.home?.book ? ` · ${best.home.book}` : ""
                }`}
              />
            </Stack>
          </Stack>

          <Stack direction="row" spacing={1} sx={{ pt: 1 }}>
            <Button
              component={Link}
              href={href}
              variant="contained"
              size="small"
              sx={{ borderRadius: 999 }}
            >
              View Odds
            </Button>
            <Button
              component={Link}
              href={href}
              variant="outlined"
              size="small"
              sx={{ borderRadius: 999 }}
            >
              Details
            </Button>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}


