// src/app/parlay/page.tsx
"use client";

import React from "react";
import {
  Stack,
  Typography,
  ToggleButton,
  ToggleButtonGroup,
  TextField,
  Card,
  CardContent,
  Button,
  Divider,
  List,
  ListItem,
  ListItemText,
  InputAdornment,
  IconButton,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

import { ParlayProvider, useParlay } from "../contexts/ParlayContext";
import type { Game } from "../api/odds/route";
import {
  formatAmerican,
  sortedForTeam,
  sortedTotalsSide,
} from "../utils/odds";

// -------- API fetcher --------
async function fetchGames(league: "NFL" | "CFB") {
  // Mirror the main pages: NFL -> nfl, CFB -> ncaaf
  const sport = league === "NFL" ? "nfl" : "ncaaf";

  const res = await fetch(`/api/odds?sport=${sport}`, {
    cache: "no-store",
  });

  const { games } = await res.json();
  return games as Game[] | undefined;
}

// -------- Wrapper so /parlay still works the same --------
export default function ParlayPageWrapper() {
  return (
    <ParlayProvider>
      <ParlayPage />
    </ParlayProvider>
  );
}

// --------------------------------------------------------------
// MAIN PAGE
// --------------------------------------------------------------
function ParlayPage() {
  const [league, setLeague] = React.useState<"NFL" | "CFB">("NFL");
  const [market, setMarket] = React.useState<"Moneyline" | "Total">(
    "Moneyline"
  );
  const [search, setSearch] = React.useState("");
  const [games, setGames] = React.useState<Game[]>([]);

  React.useEffect(() => {
    fetchGames(league)
      .then((data) => {
        if (Array.isArray(data)) {
          setGames(data);
        } else {
          setGames([]);
        }
      })
      .catch((err) => {
        console.error("Failed to fetch games for league:", league, err);
        setGames([]);
      });
  }, [league]);

  const filtered = games.filter((g) => {
    const text = `${g.teams[0]} ${g.teams[1]}`.toLowerCase();
    return text.includes(search.toLowerCase());
  });

  const gameKey = (g: Game) =>
    (g as any).id ??
    (g as any).eventId ??
    `${g.teams[0]}-${g.teams[1]}-${g.commenceTime}`;

  return (
    <Stack spacing={4} sx={{ pb: 12 }}>
      <Typography variant="h4" sx={{ fontWeight: 800 }}>
        BetMaxx Parlay Builder
      </Typography>

      {/* MAXXSLIP (picked legs + payouts) */}
      <MaxxSlip />

      <Divider sx={{ my: 2 }} />

      {/* Toggles + Search */}
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={1.5}
        alignItems={{ xs: "stretch", sm: "center" }}
        justifyContent="space-between"
      >
        {/* Toggle groups cluster */}
        <Stack direction="row" spacing={2}>
          <ToggleButtonGroup
            exclusive
            value={league}
            onChange={(_, val) => val && setLeague(val)}
            size="small"
          >
            <ToggleButton value="NFL">NFL</ToggleButton>
            <ToggleButton value="CFB">CFB</ToggleButton>
          </ToggleButtonGroup>

          <ToggleButtonGroup
            exclusive
            value={market}
            onChange={(_, val) => val && setMarket(val)}
            size="small"
          >
            <ToggleButton value="Moneyline">Moneyline</ToggleButton>
            <ToggleButton value="Total">O/U</ToggleButton>
          </ToggleButtonGroup>
        </Stack>

        {/* Search bar – full width on mobile, compact on desktop */}
        <TextField
          placeholder="Search games..."
          size="small"
          onChange={(e) => setSearch(e.target.value)}
          value={search}
          fullWidth
          sx={{
            width: { xs: "100%", sm: 260 },
            maxWidth: 340,
          }}
        />
      </Stack>

      {/* Games List with Add buttons */}
      <Stack spacing={2}>
        {filtered.map((game) => (
          <AddableGameCard key={gameKey(game)} game={game} market={market} />
        ))}
      </Stack>
    </Stack>
  );
}

// --------------------------------------------------------------
// Game card JUST for the parlay page
// --------------------------------------------------------------
function AddableGameCard({
  game,
  market,
}: {
  game: Game;
  market: "Moneyline" | "Total";
}) {
  const { addLeg, legs } = useParlay();
  const [teamA, teamB] = game.teams;

  const gameId =
    (game as any).id ??
    (game as any).eventId ??
    `${teamA}-${teamB}-${game.commenceTime}`;
  const sportKey = (game as any).sportKey ?? null;
  const maxLegsReached = legs.length >= 6;

  // ---- MONEYLINE DATA (all books for each team) ----
  let bestA: { book: string; price: number } | null = null;
  let bestB: { book: string; price: number } | null = null;
  const mlOddsA: Record<string, number> = {};
  const mlOddsB: Record<string, number> = {};

  if (market === "Moneyline") {
    const rowsA = sortedForTeam(game.books as any, teamA);
    const rowsB = sortedForTeam(game.books as any, teamB);

    bestA = rowsA[0] ?? null;
    bestB = rowsB[0] ?? null;

    rowsA.forEach((row) => {
      if (typeof row.price === "number") {
        mlOddsA[row.book] = row.price;
      }
    });

    rowsB.forEach((row) => {
      if (typeof row.price === "number") {
        mlOddsB[row.book] = row.price;
      }
    });
  }

  // ---- TOTALS DATA (all books for Over / Under) ----
  let bestOver: any = null;
  let bestUnder: any = null;
  const overOdds: Record<string, number> = {};
  const underOdds: Record<string, number> = {};

  if (market === "Total") {
    const overRows = sortedTotalsSide(game.totals as any, "Over");
    const underRows = sortedTotalsSide(game.totals as any, "Under");

    bestOver = overRows[0] ?? null;
    bestUnder = underRows[0] ?? null;

    overRows.forEach((row) => {
      if (typeof row.price === "number") {
        overOdds[row.book] = row.price;
      }
    });

    underRows.forEach((row) => {
      if (typeof row.price === "number") {
        underOdds[row.book] = row.price;
      }
    });
  }

  const gameLabel = `${teamA} @ ${teamB}`;

  return (
    <Card sx={{ borderRadius: 3, background: "#0F141A" }}>
      <CardContent>
        <Stack spacing={1.5}>
          <Typography variant="h6">{gameLabel}</Typography>

          {/* MONEYLINE: add either team */}
          {market === "Moneyline" && (
            <Stack spacing={1}>
              <SideRow
                label={`${teamA} ML`}
                bestPrice={bestA?.price ?? 0}
                bestBook={bestA?.book ?? "—"}
                disabled={maxLegsReached || !bestA}
                onAdd={() => {
                  if (!bestA) return;
                  addLeg({
                    id: `${gameId}-ML-${teamA}`,
                    gameId,
                    sportKey,
                    description: `${teamA} ML`,
                    marketType: "moneyline",
                    oddsByBook: mlOddsA,
                  });
                }}
              />

              <SideRow
                label={`${teamB} ML`}
                bestPrice={bestB?.price ?? 0}
                bestBook={bestB?.book ?? "—"}
                disabled={maxLegsReached || !bestB}
                onAdd={() => {
                  if (!bestB) return;
                  addLeg({
                    id: `${gameId}-ML-${teamB}`,
                    gameId,
                    sportKey,
                    description: `${teamB} ML`,
                    marketType: "moneyline",
                    oddsByBook: mlOddsB,
                  });
                }}
              />
            </Stack>
          )}

          {/* TOTALS: add Over / Under (include game title in description) */}
          {market === "Total" && (
            <Stack spacing={1}>
              <SideRow
                label={
                  bestOver ? `${gameLabel} · Over ${bestOver.line}` : "Over —"
                }
                bestPrice={bestOver?.price ?? 0}
                bestBook={bestOver?.book ?? "—"}
                disabled={maxLegsReached || !bestOver}
                onAdd={() => {
                  if (!bestOver) return;
                  addLeg({
                    id: `${gameId}-TOTAL-OVER`,
                    gameId,
                    sportKey,
                    description: `${gameLabel} · Over ${bestOver.line}`,
                    marketType: "total",
                    oddsByBook: overOdds,
                  });
                }}
              />

              <SideRow
                label={
                  bestUnder
                    ? `${gameLabel} · Under ${bestUnder.line}`
                    : "Under —"
                }
                bestPrice={bestUnder?.price ?? 0}
                bestBook={bestUnder?.book ?? "—"}
                disabled={maxLegsReached || !bestUnder}
                onAdd={() => {
                  if (!bestUnder) return;
                  addLeg({
                    id: `${gameId}-TOTAL-UNDER`,
                    gameId,
                    sportKey,
                    description: `${gameLabel} · Under ${bestUnder.line}`,
                    marketType: "total",
                    oddsByBook: underOdds,
                  });
                }}
              />
            </Stack>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
}

// Reusable row for each side
function SideRow(props: {
  label: string;
  bestPrice: number;
  bestBook: string;
  disabled?: boolean;
  onAdd: () => void;
}) {
  const { label, bestPrice, bestBook, disabled, onAdd } = props;

  return (
    <Stack direction="row" justifyContent="space-between" alignItems="center">
      <Typography variant="body2" sx={{ opacity: 0.85 }}>
        {label} — {formatAmerican(bestPrice)} ({bestBook})
      </Typography>
      <Button
        variant="contained"
        size="small"
        disabled={disabled}
        onClick={onAdd}
        sx={{ borderRadius: 999 }}
      >
        Add
      </Button>
    </Stack>
  );
}

// --------------------------------------------------------------
// MAXXSLIP — calculates parlay payouts per book (BetMaxx UI)
// --------------------------------------------------------------
function MaxxSlip() {
  const { legs, removeLeg, clear } = useParlay();
  const [stake, setStake] = React.useState<number>(10);

  if (legs.length === 0) {
    return (
      <Card sx={{ borderRadius: 3, background: "#131922", p: 2.5 }}>
        <Typography variant="h5" sx={{ fontWeight: 800, mb: 1.5 }}>
          MaxxSlip
        </Typography>
        <Typography sx={{ opacity: 0.7 }}>
          Your MaxxSlip is empty — add some legs to see the best parlay value
          across books.
        </Typography>
      </Card>
    );
  }

  const toDecimal = (american: number) =>
    american > 0 ? 1 + american / 100 : 1 + 100 / Math.abs(american);

  // all unique books that appear in any leg
  const allBooks = Array.from(
    new Set(legs.flatMap((l) => Object.keys(l.oddsByBook)))
  );

  // books that have odds for EVERY leg (true single-book parlay)
  const booksWithAllLegs = allBooks.filter((book) =>
    legs.every((leg) => typeof leg.oddsByBook[book] === "number")
  );

  // full-coverage rows
  const fullCoverageRows = booksWithAllLegs.map((book) => {
    let decimal = 1;
    legs.forEach((leg) => {
      const price = leg.oddsByBook[book];
      if (typeof price === "number") {
        decimal *= toDecimal(price);
      }
    });
    const payout = decimal * (stake || 0);
    return { book, decimal, payout };
  });

  fullCoverageRows.sort((a, b) => b.payout - a.payout);

  const hasFullCoverage = fullCoverageRows.length > 0;
  const bestPayout = hasFullCoverage ? fullCoverageRows[0].payout : 0;

  const formattedStake =
    Number.isInteger(stake) && stake >= 0
      ? `$${stake.toFixed(0)}`
      : `$${stake.toFixed(2)}`;

  return (
    <Card sx={{ borderRadius: 3, background: "#131922", p: 2.5 }}>
      {/* Header */}
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{ mb: 1.5 }}
      >
        <Typography variant="h5" sx={{ fontWeight: 800 }}>
          MaxxSlip ({legs.length}/6)
        </Typography>
        <Button
          size="small"
          variant="text"
          color="inherit"
          onClick={clear}
          sx={{ opacity: 0.7, "&:hover": { opacity: 1 } }}
        >
          Clear all
        </Button>
      </Stack>

      {/* Legs in slip */}
      <Typography
        variant="subtitle2"
        sx={{
          opacity: 0.8,
          textTransform: "uppercase",
          mb: 1,
          letterSpacing: 0.5,
        }}
      >
        Legs in this slip
      </Typography>

      <List dense disablePadding sx={{ mb: 2.5 }}>
        {legs.map((l) => (
          <SlipLegRow key={l.id} leg={l} onRemove={removeLeg} />
        ))}
      </List>

      <Divider sx={{ mb: 2, borderColor: "rgba(255,255,255,0.08)" }} />

      {/* Stake control + label */}
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{ mb: 1.5 }}
        spacing={2}
      >
        <Typography
          variant="subtitle2"
          sx={{
            opacity: 0.8,
            textTransform: "uppercase",
            letterSpacing: 0.5,
          }}
        >
          Parlay value (ranked)
        </Typography>

        <TextField
          label="Stake"
          variant="outlined"
          size="small"
          type="number"
          value={stake}
          onChange={(e) => {
            const val = Number(e.target.value);
            if (Number.isNaN(val)) {
              setStake(0);
            } else {
              setStake(Math.max(0, val));
            }
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">$</InputAdornment>
            ),
          }}
          sx={{
            width: 130,
            "& .MuiOutlinedInput-root": {
              borderRadius: 999,
              backgroundColor: "rgba(0,0,0,0.35)",
              "& fieldset": {
                borderColor: "rgba(255,255,255,0.14)",
              },
              "&:hover fieldset": {
                borderColor: "rgba(255,255,255,0.4)",
              },
            },
            "& .MuiInputLabel-root": {
              fontSize: 12,
            },
          }}
        />
      </Stack>

      {!hasFullCoverage ? (
        <Typography variant="body2" sx={{ opacity: 0.75 }}>
          No single sportsbook has odds for every leg in this slip yet. Try
          removing a leg or switching markets to see full-book parlay values.
        </Typography>
      ) : (
        <List dense disablePadding>
          {fullCoverageRows.map(({ book, payout }, idx) => {
            const diff = bestPayout - payout;
            return (
              <ListItem
                key={book}
                disableGutters
                sx={{
                  px: 1.75,
                  py: 1,
                  mb: 0.75,
                  borderRadius: 999,
                  bgcolor:
                    idx === 0
                      ? "rgba(255,214,0,0.10)"
                      : "rgba(255,255,255,0.03)",
                  border:
                    idx === 0
                      ? "1px solid rgba(255,214,0,0.35)"
                      : "1px solid transparent",
                  transition: "all .18s ease",
                }}
              >
                <ListItemText
                  primary={book}
                  primaryTypographyProps={{
                    fontWeight: idx === 0 ? 800 : 600,
                  }}
                />
                <Stack
                  alignItems="center"
                  justifyContent="center"
                  sx={{ ml: 2 }}
                >
                  <Typography
                    sx={{
                      fontWeight: idx === 0 ? 800 : 700,
                      color: "primary.main",
                    }}
                  >
                    {formattedStake} pays: ${payout.toFixed(2)}
                  </Typography>
                  {idx > 0 && (
                    <Typography
                      variant="caption"
                      sx={{ opacity: 0.7, fontSize: 11 }}
                    >
                      −${diff.toFixed(2)} vs best
                    </Typography>
                  )}
                  {idx === 0 && (
                    <Typography
                      variant="caption"
                      sx={{ opacity: 0.8, fontSize: 11 }}
                    >
                      Best available payout
                    </Typography>
                  )}
                </Stack>
              </ListItem>
            );
          })}
        </List>
      )}
    </Card>
  );
}

// --------------------------------------------------------------
// SlipLegRow — individual leg row with swipe-to-delete + X icon
// --------------------------------------------------------------
function SlipLegRow({
  leg,
  onRemove,
}: {
  leg: any;
  onRemove: (id: string) => void;
}) {
  const [offsetX, setOffsetX] = React.useState(0);
  const [startX, setStartX] = React.useState<number | null>(null);
  const [isSwiping, setIsSwiping] = React.useState(false);

  const handleTouchStart = (e: React.TouchEvent) => {
    setStartX(e.touches[0].clientX);
    setIsSwiping(false);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (startX == null) return;
    const currentX = e.touches[0].clientX;
    const delta = currentX - startX;

    // Only handle left swipes
    if (delta < 0) {
      setIsSwiping(true);
      setOffsetX(Math.max(delta, -80)); // clamp swipe
    }
  };

  const handleTouchEnd = () => {
    if (offsetX <= -60) {
      onRemove(leg.id);
    } else {
      setOffsetX(0);
    }
    setStartX(null);
    setIsSwiping(false);
  };

  return (
    <ListItem
      disableGutters
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      sx={{
        px: 2,
        py: 1,
        mb: 0.75,
        borderRadius: 2,
        bgcolor: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.08)",
        position: "relative",
        overflow: "hidden",
        transform: `translateX(${offsetX}px)`,
        transition: isSwiping ? "none" : "transform 0.18s ease",
        "&::before": {
          content: '""',
          position: "absolute",
          left: 0,
          top: 6,
          bottom: 6,
          width: 3,
          borderRadius: 999,
          background:
            "linear-gradient(to bottom, rgba(255,214,0,0.85), rgba(255,214,0,0.4))",
        },
      }}
    >
      <ListItemText
        primary={leg.description}
        primaryTypographyProps={{
          fontWeight: 600,
          sx: { ml: 1.25 },
        }}
      />
      <IconButton
        edge="end"
        size="small"
        onClick={() => onRemove(leg.id)}
        sx={{
          ml: 1,
          color: "rgba(255,255,255,0.6)",
          "&:hover": {
            color: "#ff4d4d",
            backgroundColor: "rgba(255,0,0,0.08)",
          },
          transition: "0.15s ease",
        }}
      >
        <CloseIcon sx={{ fontSize: 18 }} />
      </IconButton>
    </ListItem>
  );
}
