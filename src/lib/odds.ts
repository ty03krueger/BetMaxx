// lib/odds.ts
export type BookOdds = { name: string; odds: Record<string, number> };
export type BookTotals = { name: string; line: number; prices: { Over: number; Under: number } };

export const compareAmerican = (a: number, b: number) => {
  // higher is better: +150 > +120; -105 > -120
  const rank = (p: number) => (p > 0 ? 10000 + p : 10000 - Math.abs(p));
  return rank(a) - rank(b);
};

export function bestMoneyline(books: BookOdds[], team: string) {
  let best: { book: string; price: number } | null = null;
  for (const b of books) {
    const price = b.odds[team];
    if (typeof price !== "number") continue;
    if (!best || compareAmerican(price, best.price) > 0) {
      best = { book: b.name, price };
    }
  }
  return best;
}

export function bestTotals(totals: BookTotals[]) {
  if (!totals.length) return null;
  // pick the most common line
  const counts = new Map<number, number>();
  for (const t of totals) counts.set(t.line, (counts.get(t.line) || 0) + 1);
  const line = [...counts.entries()].sort((a, b) => b[1] - a[1])[0][0];

  let bestOver: { book: string; price: number } | null = null;
  let bestUnder: { book: string; price: number } | null = null;

  for (const t of totals) {
    if (t.line !== line) continue;
    const o = t.prices.Over;
    const u = t.prices. Under;
    if (typeof o === "number" && (!bestOver || compareAmerican(o, bestOver.price) > 0))
      bestOver = { book: t.name, price: o };
    if (typeof u === "number" && (!bestUnder || compareAmerican(u, bestUnder.price) > 0))
      bestUnder = { book: t.name, price: u };
  }
  if (!bestOver || !bestUnder) return null;
  return { line, over: bestOver, under: bestUnder };
}
