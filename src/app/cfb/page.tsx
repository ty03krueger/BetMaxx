"use client";
import * as React from "react";
import { useMemo, useState, useEffect } from "react";
import {
  Stack, Typography, Button, ButtonGroup, Alert, Skeleton, IconButton, Card, CardContent, Box
} from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import GameCard from "../components/GameCard";
import GameDetail from "../components/GameDetail";
import { useOdds } from "../hooks/useOdds";
import type { Game } from "../api/odds/route";
import { useSearchParams } from "next/navigation";

type View = "all" | "ml" | "ou";
type Market = "Moneyline" | "Total";

export default function CollegeFootballPage() {
  const [selected, setSelected] = useState<Game | null>(null);
  const [view, setView] = useState<View>("all");

  // College feed
  const { games, loading, error, reload } = useOdds({ sport: "ncaaf" });

  // ---- Search wiring ----
  const searchParams = useSearchParams();
  const [query, setQuery] = useState<string>(searchParams.get("q") || "");

  // Keep local query in sync if URL changes (e.g., via header clear/type)
  useEffect(() => {
    setQuery(searchParams.get("q") || "");
  }, [searchParams]);

  // Listen to the custom event fired by the header
  useEffect(() => {
    function onSearch(e: any) {
      setQuery((e?.detail?.q || "") as string);
    }
    window.addEventListener("betmaxx:search", onSearch);
    return () => window.removeEventListener("betmaxx:search", onSearch);
  }, []);

  // Filter games by team names
  const filteredGames = useMemo(() => {
    if (!games) return null;
    const q = query.trim().toLowerCase();
    if (!q) return games;
    return games.filter((g) => {
      const [away, home] = g.teams;
      const a = away.toLowerCase();
      const h = home.toLowerCase();
      return a.includes(q) || h.includes(q) || `${a} @ ${h}`.includes(q);
    });
  }, [games, query]);

  const market: Market = useMemo(
    () => (view === "ou" ? "Total" : "Moneyline"),
    [view]
  );

  const title = useMemo(() => {
    const base =
      view === "all" ? "CFB · All Games" :
      view === "ml"  ? "CFB · Moneyline" :
                       "CFB · Over/Under";
    return query ? `${base} · Search: “${query}”` : base;
  }, [view, query]);

  return (
    <Stack spacing={2}>
      {/* Header row */}
      <Stack direction="row" alignItems="center" justifyContent="space-between">
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          {title}
        </Typography>

        <Stack direction="row" alignItems="center" spacing={1}>
          <ButtonGroup>
            <Button
              variant={view === "all" ? "contained" : "outlined"}
              onClick={() => setView("all")}
              aria-label="All Games"
            >
              All Games
            </Button>
            <Button
              variant={view === "ml" ? "contained" : "outlined"}
              onClick={() => setView("ml")}
              aria-label="Moneyline"
            >
              ML
            </Button>
            <Button
              variant={view === "ou" ? "contained" : "outlined"}
              onClick={() => setView("ou")}
              aria-label="Over/Under"
            >
              O/U
            </Button>
          </ButtonGroup>

          <IconButton aria-label="refresh" onClick={reload}>
            <RefreshIcon />
          </IconButton>
        </Stack>
      </Stack>

      {error && <Alert severity="error">{error}</Alert>}

      {loading && (
        <Stack spacing={1.5}>
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} variant="rounded" height={84} />
          ))}
        </Stack>
      )}

      {!loading && filteredGames && (
        <Stack spacing={1.5}>
          {filteredGames.length === 0 && (
            <Alert severity="info">
              No games match your search. Try a team name (e.g., “Alabama” or “Ohio State”).
            </Alert>
          )}

          {view === "all" &&
            filteredGames.map((g) => (
              <AllGamesCard key={g.eventId} game={g} onOpen={() => setSelected(g)} />
            ))}

          {view !== "all" &&
            filteredGames.map((g) => (
              <GameCard key={g.eventId} game={g} onOpen={setSelected} market={market} />
            ))}
        </Stack>
      )}

      <GameDetail
        game={selected}
        open={Boolean(selected)}
        onClose={() => setSelected(null)}
        market={market}
        detailView={view}
      />
    </Stack>
  );
}

function AllGamesCard({
  game,
  onOpen,
}: {
  game: Game;
  onOpen: () => void;
}) {
  const [away, home] = game.teams;
  const kickoff = new Date(game.commenceTime).toLocaleString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

  return (
    <Card variant="outlined" sx={{ borderRadius: 4 }}>
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between" gap={2}>
          <Box>
            <Typography variant="overline" sx={{ opacity: 0.75 }}>
              {kickoff}
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              {away} @ {home}
            </Typography>
          </Box>
          <Button
            variant="contained"
            onClick={onOpen}
            sx={{ borderRadius: 999 }}
            aria-label={`View ${away} at ${home}`}
          >
            View Game
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
}

