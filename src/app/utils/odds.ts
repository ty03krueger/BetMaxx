// src/utils/odds.ts
import type { BookOdds, BookTotals } from "../data/mockOdds";




// Format American odds nicely
export const formatAmerican = (n: number) => (n > 0 ? `+${n}` : `${n}`);

// "Better" means more favorable payout for the bettor.
// - Positive: higher is better (e.g., +140 > +130)
// - Negative: less negative is better (e.g., -110 > -130)
export const isBetterPrice = (a: number, b: number): boolean => {
  if (a >= 0 && b >= 0) return a > b;
  if (a < 0 && b < 0) return Math.abs(a) < Math.abs(b);
  return a >= 0; // positive beats negative
};

// ---------------- MONEYLINE ----------------
export const bestForTeam = (books: BookOdds[], team: string) => {
  const entries = books
    .filter((b) => b.odds[team] !== undefined)
    .map((b) => ({ book: b.name, price: b.odds[team] }));

  if (entries.length === 0) return null;

  return entries.reduce((best, curr) =>
    isBetterPrice(curr.price, best.price) ? curr : best
  );
};

export const sortedForTeam = (books: BookOdds[], team: string) => {
  const entries = books
    .filter((b) => b.odds[team] !== undefined)
    .map((b) => ({ book: b.name, price: b.odds[team] }));

  // Sort best -> worst for the bettor
  return entries.sort((a, b) => (isBetterPrice(a.price, b.price) ? -1 : 1));
};

// ---------------- TOTALS (O/U) ----------------

// Finds the most common total line across books (e.g., 47.5 if most use it)
const modalLine = (totals: BookTotals[]) => {
  const count = new Map<number, number>();
  for (const t of totals) count.set(t.line, (count.get(t.line) || 0) + 1);
  let best = { line: totals[0]?.line ?? 0, freq: -1 };
  for (const [line, freq] of count) if (freq > best.freq) best = { line, freq };
  return best.line;
};

// Get best Over or Under odds for the most common line
export const bestTotalsSide = (totals: BookTotals[], side: "Over" | "Under") => {
  if (!totals.length) return null;
  const line = modalLine(totals);
  const entries = totals
    .filter((t) => t.line === line)
    .map((t) => ({ book: t.name, line: t.line, price: t.prices[side] }));

  if (entries.length === 0) return null;

  return entries.reduce((best, curr) =>
    isBetterPrice(curr.price, best.price) ? curr : best
  );
};

// Return all totals for a side (Over/Under), sorted best -> worst
export const sortedTotalsSide = (totals: BookTotals[], side: "Over" | "Under") => {
  const entries = totals.map((t) => ({
    book: t.name,
    line: t.line,
    price: t.prices[side],
  }));
  return entries.sort((a, b) => (isBetterPrice(a.price, b.price) ? -1 : 1));
};
