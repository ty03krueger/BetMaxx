// src/app/nfl/page.tsx
"use client";
import * as React from "react";
import { useMemo, useState, useEffect } from "react";
import {
  Stack,
  Typography,
  Button,
  ButtonGroup,
  Alert,
  Skeleton,
  IconButton,
  Card,
  CardContent,
  Box,
} from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import GameCard from "../components/GameCard";
import { useOdds } from "../hooks/useOdds";
import type { Game } from "../api/odds/route";
import { useSearchParams } from "next/navigation";
import { isFinal } from "../utils/isFinal";
import { useGameDialog } from "../components/GameDialogProvider";

type View = "all" | "ml" | "ou";
type Market = "Moneyline" | "Total";

function NFLPageContent() {
  const [view, setView] = useState<View>("all");
  const { games, loading, error, reload } = useOdds(); // NFL by default
  const searchParams = useSearchParams();
  const [query, setQuery] = useState<string>(searchParams.get("q") || "");

  const { openWithGame } = useGameDialog();

  useEffect(() => {
    setQuery(searchParams.get("q") || "");
  }, [searchParams]);

  useEffect(() => {
    function onSearch(e: any) {
      setQuery((e?.detail?.q || "") as string);
    }
    window.addEventListener("betmaxx:search", onSearch);
    return () => window.removeEventListener("betmaxx:search", onSearch);
  }, []);

  const filteredGames = useMemo(() => {
    if (!games) return null;
    const activeOnly = games.filter((g) => !isFinal(g));
    const q = query.trim().toLowerCase();
    if (!q) return activeOnly;
    return activeOnly.filter((g) => {
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
      view === "all"
        ? "NFL · All Games"
        : view === "ml"
        ? "NFL · Moneyline"
        : "NFL · Over/Under";
    return query ? `${base} · Search: “${query}”` : base;
  }, [view, query]);

  const handleOpen = React.useCallback(
    (g: Game) => {
      openWithGame(g, { detailView: view, market });
    },
    [openWithGame, view, market]
  );

  return (
    <Stack spacing={2}>
      {/* Header + filters */}
      <Stack spacing={1.5}>
        {/* Top row: title + refresh */}
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          sx={{ gap: 1 }}
        >
          {/* Desktop: full title; Mobile: simple "NFL" */}
          <Typography
            variant="h4"
            sx={{
              fontWeight: 700,
              display: { xs: "none", sm: "block" },
            }}
          >
            {title}
          </Typography>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 700,
              display: { xs: "block", sm: "none" },
            }}
          >
            NFL
          </Typography>

          <IconButton aria-label="refresh" onClick={reload}>
            <RefreshIcon />
          </IconButton>
        </Stack>

        {/* Second row: view toggles (under title on mobile) */}
        <Stack
          direction="row"
          justifyContent={{ xs: "center", sm: "flex-start" }}
        >
          <ButtonGroup
            fullWidth
            sx={{
              width: { xs: "100%", sm: "auto" },
              "& .MuiButton-root": {
                flex: { xs: 1, sm: "initial" },
                whiteSpace: "nowrap",
              },
            }}
          >
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
              Moneyline
            </Button>
            <Button
              variant={view === "ou" ? "contained" : "outlined"}
              onClick={() => setView("ou")}
              aria-label="Over/Under"
            >
              O/U
            </Button>
          </ButtonGroup>
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

      {/* Lists */}
      {!loading && filteredGames && (
        <Stack spacing={1.5}>
          {filteredGames.length === 0 && (
            <Alert severity="info">
              No games match your filters. Try a team name (e.g., “Eagles” or
              “Chiefs”).
            </Alert>
          )}

          {view === "all" &&
            filteredGames.map((g) => (
              <AllGamesCard
                key={g.eventId}
                game={g}
                onOpen={() => handleOpen(g)}
              />
            ))}

          {view !== "all" &&
            filteredGames.map((g) => (
              <GameCard
                key={g.eventId}
                game={g}
                onOpen={handleOpen}
                market={market}
              />
            ))}
        </Stack>
      )}
    </Stack>
  );
}

/** Minimal card for the “All Games” view: matchup + kickoff only */
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
        <Box
          display="flex"
          alignItems="center"
          justifyContent="space-between"
          gap={2}
        >
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

// ✅ Default export wrapped in Suspense for useSearchParams
export default function Home() {
  return (
    <React.Suspense
      fallback={
        <div style={{ padding: 24, opacity: 0.8 }}>
          Loading NFL board…
        </div>
      }
    >
      <NFLPageContent />
    </React.Suspense>
  );
}
