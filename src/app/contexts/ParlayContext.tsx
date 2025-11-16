"use client";

import * as React from "react";

export type ParlayLeg = {
  id: string;                 // unique for this leg (e.g. gameId + market + team)
  gameId: string;
  sportKey?: string | null;
  description: string;        // "ASU ML", "Over 48.5", "Kelce TD"
  marketType: "moneyline" | "spread" | "total" | "prop";
  // Odds per book: normalized book key -> american price
  oddsByBook: Record<string, number>;
};

type ParlayContextValue = {
  legs: ParlayLeg[];
  addLeg: (leg: ParlayLeg) => void;
  removeLeg: (id: string) => void;
  clear: () => void;
};

const ParlayContext = React.createContext<ParlayContextValue | undefined>(
  undefined
);

export function useParlay() {
  const ctx = React.useContext(ParlayContext);
  if (!ctx) {
    throw new Error("useParlay must be used within ParlayProvider");
  }
  return ctx;
}

const MAX_LEGS = 6;

export function ParlayProvider({ children }: { children: React.ReactNode }) {
  const [legs, setLegs] = React.useState<ParlayLeg[]>([]);

  const addLeg = React.useCallback((leg: ParlayLeg) => {
    setLegs((prev) => {
      // prevent exact duplicates by id
      if (prev.some((l) => l.id === leg.id)) return prev;

      // cap at MAX_LEGS
      if (prev.length >= MAX_LEGS) {
        // optional: log for debugging; UI can also check length before calling
        console.warn("Max parlay legs reached:", MAX_LEGS);
        return prev;
      }

      return [...prev, leg];
    });
  }, []);

  const removeLeg = React.useCallback((id: string) => {
    setLegs((prev) => prev.filter((l) => l.id !== id));
  }, []);

  const clear = React.useCallback(() => {
    setLegs([]);
  }, []);

  const value = React.useMemo(
    () => ({ legs, addLeg, removeLeg, clear }),
    [legs, addLeg, removeLeg, clear]
  );

  return (
    <ParlayContext.Provider value={value}>
      {children}
    </ParlayContext.Provider>
  );
}
