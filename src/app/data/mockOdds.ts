// src/data/mockOdds.ts
export type BookOdds = {
  name: string;
  odds: Record<string, number>; // Moneyline: team -> American odds
};

export type BookTotals = {
  name: string;
  line: number;                     // e.g., 47.5
  prices: { Over: number; Under: number }; // American odds for each side
};

export type Game = {
  eventId: string;
  league: "NFL";
  commenceTime: string;             // ISO
  teams: [string, string];          // [away, home] (order not enforced)
  books: BookOdds[];                // moneyline
  totals: BookTotals[];             // NEW: O/U
};

export const mockOdds: Game[] = [
  {
    eventId: "BUF-KC-2025-11-15",
    league: "NFL",
    commenceTime: "2025-11-15T21:25:00Z",
    teams: ["Bills", "Chiefs"],
    books: [
      { name: "DraftKings", odds: { Bills: -115, Chiefs: +105 } },
      { name: "FanDuel",    odds: { Bills: -110, Chiefs: +102 } },
      { name: "Caesars",    odds: { Bills: -118, Chiefs: +108 } }
    ],
    totals: [
      { name: "DraftKings", line: 47.5, prices: { Over: -110, Under: -110 } },
      { name: "FanDuel",    line: 47.5, prices: { Over: -108, Under: -112 } },
      { name: "Caesars",    line: 48.0, prices: { Over: -105, Under: -115 } }
    ]
  },
  {
    eventId: "DAL-PHI-2025-11-15",
    league: "NFL",
    commenceTime: "2025-11-15T22:20:00Z",
    teams: ["Cowboys", "Eagles"],
    books: [
      { name: "DraftKings", odds: { Cowboys: +125, Eagles: -140 } },
      { name: "FanDuel",    odds: { Cowboys: +128, Eagles: -138 } },
      { name: "Caesars",    odds: { Cowboys: +122, Eagles: -145 } }
    ],
    totals: [
      { name: "DraftKings", line: 50.5, prices: { Over: -110, Under: -110 } },
      { name: "FanDuel",    line: 50.5, prices: { Over: -112, Under: -108 } },
      { name: "Caesars",    line: 50.0, prices: { Over: -105, Under: -115 } }
    ]
  },
  {
    eventId: "SF-SEA-2025-11-16",
    league: "NFL",
    commenceTime: "2025-11-16T21:05:00Z",
    teams: ["49ers", "Seahawks"],
    books: [
      { name: "DraftKings", odds: { "49ers": -155, Seahawks: +135 } },
      { name: "FanDuel",    odds: { "49ers": -150, Seahawks: +138 } },
      { name: "Caesars",    odds: { "49ers": -160, Seahawks: +142 } }
    ],
    totals: [
      { name: "DraftKings", line: 43.5, prices: { Over: -110, Under: -110 } },
      { name: "FanDuel",    line: 43.5, prices: { Over: -108, Under: -112 } },
      { name: "Caesars",    line: 43.0, prices: { Over: -102, Under: -118 } }
    ]
  }
];
