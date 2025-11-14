// src/app/cfb/page.tsx
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
  Chip,
  Popover,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Divider,
} from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import GameCard from "../components/GameCard";
import { useOdds } from "../hooks/useOdds";
import type { Game } from "../api/odds/route";
import { useSearchParams } from "next/navigation";
import {
  CONFERENCES,
  GROUP5,
  POWER5,
  type Conference,
  getConferenceForTeam,
} from "../data/cfbConferences";

import { isFinal } from "@/app/utils/isFinal";
import { useGameDialog } from "../components/GameDialogProvider";

type View = "all" | "ml" | "ou";
type Market = "Moneyline" | "Total";

export default function CollegeFootballPage() {
  const [view, setView] = useState<View>("all");
  const { games, loading, error, reload } = useOdds({ sport: "ncaaf" });

  // ---- Search wiring ----
  const searchParams = useSearchParams();
  const [query, setQuery] = useState<string>(searchParams.get("q") || "");
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

  // ---- Conference filter state ----
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [selectedConfs, setSelectedConfs] = useState<Set<Conference>>(
    new Set()
  );

  const handleOpenConfs = (e: React.MouseEvent<HTMLElement>) =>
    setAnchorEl(e.currentTarget);
  const handleCloseConfs = () => setAnchorEl(null);
  const popoverOpen = Boolean(anchorEl);

  const toggleConf = (conf: Conference) => {
    setSelectedConfs((prev) => {
      const next = new Set(prev);
      if (next.has(conf)) next.delete(conf);
      else next.add(conf);
      return next;
    });
  };

  const clearConfs = () => setSelectedConfs(new Set());
  const selectP5 = () => setSelectedConfs(new Set(Array.from(POWER5)));
  const selectG5 = () => setSelectedConfs(new Set(Array.from(GROUP5)));
  const selectInd = () =>
    setSelectedConfs(new Set<Conference>(["Independents"]));

  // ---- filtering pipeline ----
  const activeGames: Game[] = useMemo(() => {
    if (!games) return [];
    return games.filter((g) => !isFinal(g));
  }, [games]);

  const searchedGames: Game[] = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return activeGames;
    return activeGames.filter((g) => {
      const [away, home] = g.teams;
      const a = away.toLowerCase();
      const h = home.toLowerCase();
      return a.includes(q) || h.includes(q) || `${a} @ ${h}`.includes(q);
    });
  }, [activeGames, query]);

  const filteredGames: Game[] = useMemo(() => {
    if (selectedConfs.size === 0) return searchedGames;
    return searchedGames
      .map((g) => ({ ...g }))
      .filter((g) => {
        const [away, home] = g.teams;
        const ca = getConferenceForTeam(away);
        const ch = getConferenceForTeam(home);
        return selectedConfs.has(ca) || selectedConfs.has(ch);
      });
  }, [searchedGames, selectedConfs]);

  const market: Market = useMemo(
    () => (view === "ou" ? "Total" : "Moneyline"),
    [view]
  );

  const viewLabel =
    view === "all" ? "All Games" : view === "ml" ? "Moneyline" : "O/U";

  const metaSubtitle = React.useMemo(() => {
    const parts: string[] = [];
    if (query) parts.push(`Search “${query}”`);
    if (selectedConfs.size > 0) parts.push(`${selectedConfs.size} conf`);
    if (parts.length === 0) return "";
    return parts.join(" · ");
  }, [query, selectedConfs]);

  const conferenceChipLabel =
    selectedConfs.size > 0
      ? `Conference (${selectedConfs.size})`
      : "Select Conference";

  const { openWithGame } = useGameDialog();

  const handleOpen = React.useCallback(
    (g: Game) => {
      openWithGame(g, { detailView: view, market });
    },
    [openWithGame, view, market]
  );

  return (
    <Stack spacing={2}>
      {/* Header */}
      <Stack spacing={1.25}>
        {/* Top row: CFB title + refresh */}
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          sx={{ minWidth: 0 }}
        >
          <Typography
            variant="h4"
            sx={{ fontWeight: 700, flexShrink: 0 }}
          >
            CFB
          </Typography>

          <IconButton aria-label="refresh" onClick={reload}>
            <RefreshIcon />
          </IconButton>
        </Stack>

        {/* Subtitle (optional info) */}
        <Typography variant="caption" sx={{ opacity: 0.8 }}>
          {metaSubtitle}
        </Typography>

        {/* View toggle row + conference filters */}
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={1}
          alignItems={{ xs: "stretch", sm: "center" }}
          justifyContent="space-between"
        >
          {/* Left cluster: view label + conference filters */}
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={1}
            alignItems={{ xs: "flex-start", sm: "center" }}
            sx={{ flex: 1, minWidth: 0 }}
          >
            <Typography
              variant="subtitle1"
              sx={{
                fontWeight: 700,
                display: { xs: "none", sm: "block" },
              }}
            >
              {viewLabel}
            </Typography>

            <Stack
              direction="row"
              spacing={0.75}
              alignItems="center"
              flexWrap="wrap"
            >
              <Chip
                label={conferenceChipLabel}
                onClick={handleOpenConfs}
                variant="outlined"
                color={selectedConfs.size ? "primary" : "default"}
                sx={{
                  borderRadius: 999,
                  flexShrink: 0,
                }}
              />

              {/* Quick chips: show on sm+ to avoid crowding on tiny screens */}
              <Stack
                direction="row"
                spacing={0.75}
                sx={{ display: { xs: "none", sm: "flex" } }}
              >
                <Chip label="P5" variant="outlined" onClick={selectP5} />
                <Chip label="G5" variant="outlined" onClick={selectG5} />
                <Chip label="Ind" variant="outlined" onClick={selectInd} />
                {selectedConfs.size > 0 && (
                  <Chip
                    label="Clear"
                    variant="outlined"
                    onClick={clearConfs}
                  />
                )}
              </Stack>
            </Stack>
          </Stack>

          {/* Right: view toggle buttons */}
          <ButtonGroup
            sx={{
              width: { xs: "100%", sm: "auto" },
            }}
          >
            <Button
              variant={view === "all" ? "contained" : "outlined"}
              onClick={() => setView("all")}
              aria-label="All Games"
              sx={{ flex: { xs: 1, sm: "0 0 auto" } }}
            >
              All Games
            </Button>
            <Button
              variant={view === "ml" ? "contained" : "outlined"}
              onClick={() => setView("ml")}
              aria-label="Moneyline"
              sx={{ flex: { xs: 1, sm: "0 0 auto" } }}
            >
              Moneyline
            </Button>
            <Button
              variant={view === "ou" ? "contained" : "outlined"}
              onClick={() => setView("ou")}
              aria-label="O/U"
              sx={{ flex: { xs: 1, sm: "0 0 auto" } }}
            >
              O/U
            </Button>
          </ButtonGroup>
        </Stack>
      </Stack>

      {/* Conference popover */}
      <Popover
        open={popoverOpen}
        anchorEl={anchorEl}
        onClose={handleCloseConfs}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
      >
        <Box sx={{ p: 2, maxWidth: 280 }}>
          <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 700 }}>
            Choose conferences
          </Typography>
          <FormGroup>
            {CONFERENCES.map((c) => (
              <FormControlLabel
                key={c}
                control={
                  <Checkbox
                    size="small"
                    checked={selectedConfs.has(c)}
                    onChange={() => toggleConf(c)}
                  />
                }
                label={c}
              />
            ))}
          </FormGroup>
          <Divider sx={{ my: 1.5 }} />
          <Stack direction="row" spacing={1}>
            <Button size="small" variant="outlined" onClick={selectP5}>
              P5
            </Button>
            <Button size="small" variant="outlined" onClick={selectG5}>
              G5
            </Button>
            <Button size="small" variant="outlined" onClick={selectInd}>
              Ind
            </Button>
            <Button size="small" onClick={clearConfs}>
              Clear
            </Button>
          </Stack>
        </Box>
      </Popover>

      {error && <Alert severity="error">{error}</Alert>}

      {loading && (
        <Stack spacing={1.5}>
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} variant="rounded" height={84} />
          ))}
        </Stack>
      )}

      {!loading && (
        <Stack spacing={1.5}>
          {filteredGames.length === 0 && (
            <Alert severity="info">
              No games match your search/filters. Try clearing Conference or
              search.
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
