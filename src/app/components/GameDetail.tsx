// src/app/components/GameDetail.tsx
"use client";
import * as React from "react";
import {
  Modal,
  Box,
  IconButton,
  Typography,
  Stack,
  List,
  ListItem,
  ListItemText,
  Chip,
  Divider,
  Button,
  ButtonGroup,
  Tooltip,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { keyframes } from "@mui/system";

import type { Game } from "../api/odds/route";
import {
  sortedForTeam,
  formatAmerican,
  bestForTeam,
  sortedTotalsSide,
  bestTotalsSide,
} from "../utils/odds";

import { useBooks } from "../contexts/BookProvider";
import { db } from "../../firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

const scaleIn = keyframes`
  from { transform: translate(-50%, -50%) scale(0.96); opacity: 0; }
  to   { transform: translate(-50%, -50%) scale(1.00); opacity: 1; }
`;

const ringOnce = keyframes`
  0%   { box-shadow: 0 0 0 0 rgba(255,214,0,.35); }
  100% { box-shadow: 0 0 0 14px rgba(255,214,0,0); }
`;

type Market = "Moneyline" | "Total";
type DetailView = "all" | "ml" | "ou";
type BookMode = "all" | "mine";

type Props = {
  game: Game | null;
  open: boolean;
  onClose: () => void;
  market: Market;
  detailView?: DetailView;
};

/**
 * Canonical URLs keyed by a normalized sportsbook key.
 * Keys are *sluggy*: lowercased, no spaces, no "sportsbook" word.
 */
const BOOK_URLS: Record<string, string> = {
  draftkings: "https://sportsbook.draftkings.com",
  fanduel: "https://sportsbook.fanduel.com",
  betmgm: "https://sports.az.betmgm.com/en/sports",
  caesars: "https://www.caesars.com/sportsbook",
  espnbet: "https://espnbet.com",
  fanatics: "https://sportsbook.fanatics.com",
  bet365: "https://www.bet365.com",
  hardrockbet: "https://www.hardrock.bet",

  // You can leave the old ones here or delete them – they simply won't be hit
  betonlineag: "https://www.betonline.ag/sportsbook",
  betrivers: "https://www.betrivers.com",
  betus: "https://www.betus.com.pa/sportsbook",
  bovada: "https://www.bovada.lv/sports",
  williamhill_us: "https://www.caesars.com/sportsbook",
  lowvig: "https://www.lowvig.ag",
  mybookieag: "https://mybookie.ag/sportsbook",
  ballybet: "https://www.ballybet.com",
  betanysports: "https://www.betanysports.eu",
  betparx: "https://www.pa.betparx.com",
  fliff: "https://www.fliff.com",
  rebet: "https://www.rebet.com",
};

/**
 * Normalize the book label coming from the API/title into a key
 * that matches BOOK_URLS:
 *
 *  - lowercase
 *  - remove "sportsbook"
 *  - strip non-alphanumeric
 *  - remove spaces
 *
 * Examples:
 *  "DraftKings"           -> "draftkings"
 *  "FanDuel"              -> "fanduel"
 *  "BetMGM"               -> "betmgm"
 *  "Caesars Sportsbook"   -> "caesars"
 *  "ESPN BET"             -> "espnbet"
 *  "Fanatics Sportsbook"  -> "fanatics"
 *  "Hard Rock Bet"        -> "hardrockbet"
 */
function normalizeBookKey(raw: string): string {
  return raw
    .toLowerCase()
    .replace(/sportsbook/g, "")
    .replace(/\s+/g, "")
    .replace(/[^a-z0-9]/g, "");
}

export default function GameDetail({
  game,
  open,
  onClose,
  market,
  detailView,
}: Props) {
  if (!game) return null;

  const view: DetailView = detailView ?? (market === "Total" ? "ou" : "ml");
  const [teamA, teamB] = game.teams;

  const [bookMode, setBookMode] = React.useState<BookMode>("all");

  const { preferredBooks } = useBooks();
  const preferredSet = React.useMemo(
    () => new Set(preferredBooks.map((b) => b.toLowerCase().trim())),
    [preferredBooks]
  );

  function BestChip({ label }: { label: string }) {
    return (
      <Chip
        label={label}
        variant="outlined"
        sx={{
          position: "relative",
          "&::after": {
            content: '""',
            position: "absolute",
            inset: -2,
            borderRadius: 999,
            animation: `${ringOnce} 900ms ease-out 1`,
            pointerEvents: "none",
          },
        }}
      />
    );
  }

  const mlRowsA = React.useMemo(
    () => sortedForTeam(game.books, teamA),
    [game.books, teamA]
  );
  const mlRowsB = React.useMemo(
    () => sortedForTeam(game.books, teamB),
    [game.books, teamB]
  );
  const overRows = React.useMemo(
    () => sortedTotalsSide(game.totals, "Over"),
    [game.totals]
  );
  const underRows = React.useMemo(
    () => sortedTotalsSide(game.totals, "Under"),
    [game.totals]
  );

  function rowsForMode<T extends { book: string }>(rows: T[]): T[] {
    if (bookMode === "all") return rows;
    if (!rows.length) return rows;

    const [best, ...rest] = rows;
    const filteredPreferred = rest.filter((r) =>
      preferredSet.has(r.book.toLowerCase().trim())
    );
    return [best, ...filteredPreferred];
  }

  const kickoffText = new Date(game.commenceTime).toLocaleString();

  React.useEffect(() => {
    if (!open || !game) return;

    const sportKey =
      (game as any).sportKey ||
      (game as any).league ||
      (game as any).sport ||
      "";
    const eventId =
      (game as any).eventId ||
      (game as any).id ||
      (game as any).gameId ||
      "";

    addDoc(collection(db, "gameViews"), {
      sportKey,
      eventId,
      teams: game.teams || [],
      commenceTime: (game as any).commenceTime ?? null,
      source: "game_detail_modal",
      createdAt: serverTimestamp(),
    }).catch((e) => {
      console.error("Failed to log game view", e);
    });
  }, [open, game]);

  async function handleBookClick(options: {
    book: string;
    market: "ml" | "total";
    side: string;
    line?: number;
    price?: number;
  }) {
    const rawLabel = options.book || "";
    const normKey = normalizeBookKey(rawLabel); // 🔑 use normalized label for URL + logging

    const url = BOOK_URLS[normKey];

    const sportKey =
      (game as any).sportKey ||
      (game as any).league ||
      (game as any).sport ||
      "";
    const eventId =
      (game as any).eventId ||
      (game as any).id ||
      (game as any).gameId ||
      "";

    try {
      await addDoc(collection(db, "outboundClicks"), {
        bookKey: normKey,
        rawBookLabel: rawLabel,
        sportKey,
        eventId,
        market: options.market,
        side: options.side,
        line: options.line ?? null,
        price: options.price ?? null,
        source: "game_detail_modal",
        createdAt: serverTimestamp(),
      });
    } catch (e) {
      console.error("Failed to log outbound click", e);
    }

    if (url) {
      try {
        window.open(url, "_blank", "noopener,noreferrer");
      } catch (e) {
        console.error("Failed to open sportsbook URL", e);
      }
    } else {
      console.warn("No URL mapped for book:", rawLabel, "->", normKey);
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      slotProps={{
        backdrop: {
          sx: {
            backgroundColor: "rgba(7,10,14,0.55)",
            backdropFilter: "blur(8px)",
            WebkitBackdropFilter: "blur(8px)",
            position: "fixed",
            inset: 0,
            "&::before": {
              content: '""',
              position: "absolute",
              inset: 0,
              pointerEvents: "none",
              background: `
                radial-gradient(60% 50% at 12% 50%, rgba(255,214,0,0.14) 0%, rgba(255,214,0,0.00) 60%),
                radial-gradient(60% 50% at 88% 50%, rgba(255,214,0,0.14) 0%, rgba(255,214,0,0.00) 60%)
              `,
              opacity: 1,
            },
            "&::after": {
              content: '""',
              position: "absolute",
              inset: 0,
              pointerEvents: "none",
              background:
                "linear-gradient(-12deg, rgba(255,214,0,0.10) 0%, rgba(255,214,0,0.05) 12%, rgba(255,214,0,0.00) 28%)",
              maskImage:
                "linear-gradient(to bottom, rgba(0,0,0,0.25), rgba(0,0,0,1) 40%, rgba(0,0,0,1) 70%, rgba(0,0,0,0.25))",
            },
          },
        },
      }}
    >
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: { xs: "92%", sm: 480, md: 540 },
          maxHeight: "80vh",
          bgcolor: "background.paper",
          borderRadius: 3,
          p: 3,
          boxShadow:
            "0 18px 60px rgba(0,0,0,0.55), 0 0 60px rgba(255,214,0,0.15)",
          border: "1px solid rgba(255,255,255,0.08)",
          overflowY: "auto",
          animation: `${scaleIn} 240ms cubic-bezier(.2,.8,.2,1)`,
        }}
      >
        {/* Header */}
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          sx={{ mb: 0.5 }}
        >
          <Typography variant="h6" sx={{ fontWeight: 800 }}>
            {teamA} @ {teamB}
          </Typography>
          <IconButton onClick={onClose} aria-label="Close detail">
            <CloseIcon />
          </IconButton>
        </Stack>

        <Typography variant="body2" color="text.secondary">
          {kickoffText}
        </Typography>

        {/* Book mode toggle – centered on mobile */}
        <Stack
          direction="row"
          justifyContent={{ xs: "center", sm: "flex-end" }}
          sx={{ mt: 1, mb: 2 }}
        >
          <ButtonGroup size="small">
            <Button
              variant={bookMode === "all" ? "contained" : "outlined"}
              onClick={() => setBookMode("all")}
            >
              All books
            </Button>
            <Button
              variant={bookMode === "mine" ? "contained" : "outlined"}
              onClick={() => setBookMode("mine")}
            >
              My books
            </Button>
          </ButtonGroup>
        </Stack>

        {/* ───────────── Moneyline (all + ml) ───────────── */}
        {(view === "all" || view === "ml") && (
          <Stack spacing={2.5} sx={{ mb: view === "all" ? 2 : 0 }}>
            {/* Team A */}
            <Box>
              <Stack
                direction={{ xs: "column", sm: "row" }}
                alignItems={{ xs: "flex-start", sm: "center" }}
                justifyContent="space-between"
                spacing={{ xs: 0.75, sm: 0 }}
                sx={{ mb: 1 }}
              >
                <Chip label={`${teamA} Moneyline`} color="primary" />
                {/* hide best chip on mobile to avoid horizontal scroll */}
                {(() => {
                  const best = bestForTeam(game.books, teamA);
                  return best ? (
                    <Box sx={{ display: { xs: "none", sm: "block" } }}>
                      <BestChip
                        label={`Best: ${formatAmerican(
                          best.price
                        )} · ${best.book}`}
                      />
                    </Box>
                  ) : null;
                })()}
              </Stack>

              <List dense disablePadding>
                {rowsForMode(mlRowsA).map((row, idx) => {
                  const isPreferred = preferredSet.has(
                    row.book.toLowerCase().trim()
                  );

                  const listItem = (
                    <ListItem
                      disableGutters
                      onClick={() =>
                        handleBookClick({
                          book: row.book,
                          market: "ml",
                          side: "teamA",
                          price: row.price,
                        })
                      }
                      sx={{
                        px: 1.25,
                        py: 1,
                        mb: 0.75,
                        borderRadius: 2,
                        cursor: "pointer",
                        bgcolor:
                          idx === 0
                            ? "rgba(255,214,0,0.10)"
                            : "rgba(255,255,255,0.03)",
                        border:
                          isPreferred && idx !== 0
                            ? "1px solid rgba(255,214,0,0.35)"
                            : "1px solid transparent",
                        transition: "all .18s ease",
                        "&:hover": {
                          bgcolor:
                            idx === 0
                              ? "rgba(255,214,0,0.15)"
                              : "rgba(255,255,255,0.06)",
                          transform: "translateY(-1px)",
                        },
                      }}
                      secondaryAction={
                        <Typography
                          sx={{
                            fontWeight:
                              idx === 0 ? 800 : isPreferred ? 700 : 500,
                            color: "primary.main",
                          }}
                        >
                          {formatAmerican(row.price)}
                        </Typography>
                      }
                    >
                      <ListItemText
                        primary={row.book}
                        primaryTypographyProps={{
                          fontWeight:
                            idx === 0 ? 800 : isPreferred ? 700 : 500,
                        }}
                      />
                    </ListItem>
                  );

                  return (
                    <Tooltip
                      key={`${row.book}-A-${idx}`}
                      title={`Click to visit ${row.book}`}
                      placement="top"
                      arrow
                      enterDelay={500}
                    >
                      {listItem}
                    </Tooltip>
                  );
                })}
              </List>
            </Box>

            <Divider sx={{ borderColor: "rgba(255,255,255,0.08)" }} />

            {/* Team B */}
            <Box>
              <Stack
                direction={{ xs: "column", sm: "row" }}
                alignItems={{ xs: "flex-start", sm: "center" }}
                justifyContent="space-between"
                spacing={{ xs: 0.75, sm: 0 }}
                sx={{ mb: 1 }}
              >
                <Chip label={`${teamB} Moneyline`} color="primary" />
                {(() => {
                  const best = bestForTeam(game.books, teamB);
                  return best ? (
                    <Box sx={{ display: { xs: "none", sm: "block" } }}>
                      <BestChip
                        label={`Best: ${formatAmerican(
                          best.price
                        )} · ${best.book}`}
                      />
                    </Box>
                  ) : null;
                })()}
              </Stack>

              <List dense disablePadding>
                {rowsForMode(mlRowsB).map((row, idx) => {
                  const isPreferred = preferredSet.has(
                    row.book.toLowerCase().trim()
                  );

                  const listItem = (
                    <ListItem
                      disableGutters
                      onClick={() =>
                        handleBookClick({
                          book: row.book,
                          market: "ml",
                          side: "teamB",
                          price: row.price,
                        })
                      }
                      sx={{
                        px: 1.25,
                        py: 1,
                        mb: 0.75,
                        borderRadius: 2,
                        cursor: "pointer",
                        bgcolor:
                          idx === 0
                            ? "rgba(255,214,0,0.10)"
                            : "rgba(255,255,255,0.03)",
                        border:
                          isPreferred && idx !== 0
                            ? "1px solid rgba(255,214,0,0.35)"
                            : "1px solid transparent",
                        transition: "all .18s ease",
                        "&:hover": {
                          bgcolor:
                            idx === 0
                              ? "rgba(255,214,0,0.15)"
                              : "rgba(255,255,255,0.06)",
                          transform: "translateY(-1px)",
                        },
                      }}
                      secondaryAction={
                        <Typography
                          sx={{
                            fontWeight:
                              idx === 0 ? 800 : isPreferred ? 700 : 500,
                            color: "primary.main",
                          }}
                        >
                          {formatAmerican(row.price)}
                        </Typography>
                      }
                    >
                      <ListItemText
                        primary={row.book}
                        primaryTypographyProps={{
                          fontWeight:
                            idx === 0 ? 800 : isPreferred ? 700 : 500,
                        }}
                      />
                    </ListItem>
                  );

                  return (
                    <Tooltip
                      key={`${row.book}-B-${idx}`}
                      title={`Click to visit ${row.book}`}
                      placement="top"
                      arrow
                      enterDelay={500}
                    >
                      {listItem}
                    </Tooltip>
                  );
                })}
              </List>
            </Box>
          </Stack>
        )}

        {view === "all" && (
          <Divider sx={{ borderColor: "rgba(255,255,255,0.12)", my: 2 }} />
        )}

        {/* ───────────── Totals (all + ou) ───────────── */}
        {(view === "all" || view === "ou") && (
          <Stack spacing={2.5} sx={{ mb: view === "all" ? 2 : 0 }}>
            {/* Over */}
            <Box>
              <Stack
                direction={{ xs: "column", sm: "row" }}
                alignItems={{ xs: "flex-start", sm: "center" }}
                justifyContent="space-between"
                spacing={{ xs: 0.75, sm: 0 }}
                sx={{ mb: 1 }}
              >
                <Chip label="Over" color="primary" />
                {(() => {
                  const best = bestTotalsSide(game.totals, "Over");
                  return best ? (
                    <Box sx={{ display: { xs: "none", sm: "block" } }}>
                      <BestChip
                        label={`Best: O ${best.line} ${formatAmerican(
                          best.price
                        )} · ${best.book}`}
                      />
                    </Box>
                  ) : null;
                })()}
              </Stack>

              <List dense disablePadding>
                {rowsForMode(overRows).map((row, idx) => {
                  const isPreferred = preferredSet.has(
                    row.book.toLowerCase().trim()
                  );

                  const listItem = (
                    <ListItem
                      disableGutters
                      onClick={() =>
                        handleBookClick({
                          book: row.book,
                          market: "total",
                          side: "over",
                          line: row.line,
                          price: row.price,
                        })
                      }
                      sx={{
                        px: 1.25,
                        py: 1,
                        mb: 0.75,
                        borderRadius: 2,
                        cursor: "pointer",
                        bgcolor:
                          idx === 0
                            ? "rgba(255,214,0,0.10)"
                            : "rgba(255,255,255,0.03)",
                        border:
                          isPreferred && idx !== 0
                            ? "1px solid rgba(255,214,0,0.35)"
                            : "1px solid transparent",
                        transition: "all .18s ease",
                        "&:hover": {
                          bgcolor:
                            idx === 0
                              ? "rgba(255,214,0,0.15)"
                              : "rgba(255,255,255,0.06)",
                        },
                      }}
                      secondaryAction={
                        <Typography
                          sx={{
                            fontWeight:
                              idx === 0 ? 800 : isPreferred ? 700 : 500,
                            color: "primary.main",
                          }}
                        >
                          O {row.line} {formatAmerican(row.price)}
                        </Typography>
                      }
                    >
                      <ListItemText
                        primary={row.book}
                        primaryTypographyProps={{
                          fontWeight:
                            idx === 0 ? 800 : isPreferred ? 700 : 500,
                        }}
                      />
                    </ListItem>
                  );

                  return (
                    <Tooltip
                      key={`${row.book}-O-${idx}`}
                      title={`Click to visit ${row.book}`}
                      placement="top"
                      arrow
                      enterDelay={500}
                    >
                      {listItem}
                    </Tooltip>
                  );
                })}
              </List>
            </Box>

            <Divider sx={{ borderColor: "rgba(255,255,255,0.08)" }} />

            {/* Under */}
            <Box>
              <Stack
                direction={{ xs: "column", sm: "row" }}
                alignItems={{ xs: "flex-start", sm: "center" }}
                justifyContent="space-between"
                spacing={{ xs: 0.75, sm: 0 }}
                sx={{ mb: 1 }}
              >
                <Chip label="Under" color="primary" />
                {(() => {
                  const best = bestTotalsSide(game.totals, "Under");
                  return best ? (
                    <Box sx={{ display: { xs: "none", sm: "block" } }}>
                      <BestChip
                        label={`Best: U ${best.line} ${formatAmerican(
                          best.price
                        )} · ${best.book}`}
                      />
                    </Box>
                  ) : null;
                })()}
              </Stack>

              <List dense disablePadding>
                {rowsForMode(underRows).map((row, idx) => {
                  const isPreferred = preferredSet.has(
                    row.book.toLowerCase().trim()
                  );

                  const listItem = (
                    <ListItem
                      disableGutters
                      onClick={() =>
                        handleBookClick({
                          book: row.book,
                          market: "total",
                          side: "under",
                          line: row.line,
                          price: row.price,
                        })
                      }
                      sx={{
                        px: 1.25,
                        py: 1,
                        mb: 0.75,
                        borderRadius: 2,
                        cursor: "pointer",
                        bgcolor:
                          idx === 0
                            ? "rgba(255,214,0,0.10)"
                            : "rgba(255,255,255,0.03)",
                        border:
                          isPreferred && idx !== 0
                            ? "1px solid rgba(255,214,0,0.35)"
                            : "1px solid transparent",
                        transition: "all .18s ease",
                        "&:hover": {
                          bgcolor:
                            idx === 0
                              ? "rgba(255,214,0,0.15)"
                              : "rgba(255,255,255,0.06)",
                        },
                      }}
                      secondaryAction={
                        <Typography
                          sx={{
                            fontWeight:
                              idx === 0 ? 800 : isPreferred ? 700 : 500,
                            color: "primary.main",
                          }}
                        >
                          U {row.line} {formatAmerican(row.price)}
                        </Typography>
                      }
                    >
                      <ListItemText
                        primary={row.book}
                        primaryTypographyProps={{
                          fontWeight:
                            idx === 0 ? 800 : isPreferred ? 700 : 500,
                        }}
                      />
                    </ListItem>
                  );

                  return (
                    <Tooltip
                      key={`${row.book}-U-${idx}`}
                      title={`Click to visit ${row.book}`}
                      placement="top"
                      arrow
                      enterDelay={500}
                    >
                      {listItem}
                    </Tooltip>
                  );
                })}
              </List>
            </Box>
          </Stack>
        )}

        {/* Anytime TD placeholder */}
        {view === "all" && (
          <>
            <Divider
              sx={{ borderColor: "rgba(255,255,255,0.12)", my: 2 }}
            />
            <Box sx={{ mb: 0.5 }}>
              <Typography
                variant="subtitle1"
                sx={{ fontWeight: 700, mb: 1 }}
              >
                Anytime Touchdown
              </Typography>
              <Typography
                variant="body2"
                sx={{ opacity: 0.85, mb: 1 }}
              >
                Best-price view coming soon.
              </Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap">
                <Chip label="Loading…" variant="outlined" />
                <Chip label="Loading…" variant="outlined" />
                <Chip label="Loading…" variant="outlined" />
              </Stack>
            </Box>
          </>
        )}
      </Box>
    </Modal>
  );
}
