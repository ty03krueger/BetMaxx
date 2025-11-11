"use client";
import { useEffect, useState, useCallback, useRef } from "react";
import type { Game } from "../api/odds/route";

type Sport = "nfl" | "ncaaf";

type UseOddsOptions = {
  sport?: Sport;            // default: "nfl"
  markets?: string;         // default: "h2h,totals"
  bookmakers?: string;      // e.g. "draftkings,fanduel,betmgm,caesars"
  refreshMs?: number;       // default: 60_000
};

type State = {
  games: Game[] | null;
  loading: boolean;
  error: string | null;
};

export function useOdds({
  sport = "nfl",
  markets = "h2h,totals",
  bookmakers,
  refreshMs = 60_000,
}: UseOddsOptions = {}) {
  const [state, setState] = useState<State>({
    games: null,
    loading: true,
    error: null,
  });

  // Keep a ref for the latest abort controller so we can cancel in-flight requests on prop changes/unmount.
  const abortRef = useRef<AbortController | null>(null);

  const load = useCallback(async () => {
    try {
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      setState((s) => ({ ...s, loading: true, error: null }));

      const params = new URLSearchParams();
      if (sport) params.set("sport", sport);
      if (markets) params.set("markets", markets);
      if (bookmakers) params.set("bookmakers", bookmakers);

      const res = await fetch(`/api/odds?${params.toString()}`, {
        cache: "no-store",
        signal: controller.signal,
      });

      const text = await res.text();
      if (!res.ok) throw new Error(text || res.statusText);

      const json = JSON.parse(text) as { games?: Game[] };
      const list = (json.games || []).slice();

      // Sort by kickoff ascending
      list.sort(
        (a, b) =>
          new Date(a.commenceTime).getTime() - new Date(b.commenceTime).getTime()
      );

      setState({ games: list, loading: false, error: null });
    } catch (e: any) {
      if (e?.name === "AbortError") return; // ignore aborted loads
      setState({ games: null, loading: false, error: e?.message || "Failed to load odds" });
    }
  }, [sport, markets, bookmakers]);

  useEffect(() => {
    load();
    const id = setInterval(load, refreshMs);
    return () => {
      clearInterval(id);
      abortRef.current?.abort();
    };
  }, [load, refreshMs]);

  return {
    games: state.games,
    loading: state.loading,
    error: state.error,
    reload: load,
  };
}
