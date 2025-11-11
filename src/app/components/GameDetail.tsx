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
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import type { Game } from "../data/mockOdds";
import {
  sortedForTeam,
  formatAmerican,
  bestForTeam,
  sortedTotalsSide,
  bestTotalsSide,
} from "../utils/odds";
import { keyframes } from "@mui/system";

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

type Props = {
  game: Game | null;
  open: boolean;
  onClose: () => void;
  market: Market;
  /** NEW: which list opened the modal; controls which sections render */
  detailView?: DetailView;
};

export default function GameDetail({
  game,
  open,
  onClose,
  market,
  detailView,
}: Props) {
  if (!game) return null;

  // derive active view:
  // - if parent passes detailView, use it
  // - otherwise fall back to market (backward-compatible)
  const view: DetailView = detailView ?? (market === "Total" ? "ou" : "ml");

  const [teamA, teamB] = game.teams;

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

            // ✅ Static gold vignette (instant)
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

            // ✅ Static diagonal gold decal
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

        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {new Date(game.commenceTime).toLocaleString()}
        </Typography>

        {/* ───────────────────────── Moneyline (all + ml) ───────────────────────── */}
        {(view === "all" || view === "ml") && (
          <Stack spacing={2.5} sx={{ mb: view === "all" ? 2 : 0 }}>
            {/* Team A */}
            <Box>
              <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                sx={{ mb: 1 }}
              >
                <Chip label={`${teamA} Moneyline`} color="primary" />
                {(() => {
                  const best = bestForTeam(game.books, teamA);
                  return best ? (
                    <BestChip
                      label={`Best: ${formatAmerican(best.price)} · ${best.book}`}
                    />
                  ) : null;
                })()}
              </Stack>

              <List dense disablePadding>
                {sortedForTeam(game.books, teamA).map((row, idx) => (
                  <ListItem
                    key={`${row.book}-A-${idx}`}
                    disableGutters
                    sx={{
                      px: 1.25,
                      py: 1,
                      mb: 0.75,
                      borderRadius: 2,
                      bgcolor:
                        idx === 0
                          ? "rgba(255,214,0,0.10)"
                          : "rgba(255,255,255,0.03)",
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
                          fontWeight: idx === 0 ? 800 : 500,
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
                        fontWeight: idx === 0 ? 800 : 500,
                      }}
                    />
                  </ListItem>
                ))}
              </List>
            </Box>

            <Divider sx={{ borderColor: "rgba(255,255,255,0.08)" }} />

            {/* Team B */}
            <Box>
              <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                sx={{ mb: 1 }}
              >
                <Chip label={`${teamB} Moneyline`} color="primary" />
                {(() => {
                  const best = bestForTeam(game.books, teamB);
                  return best ? (
                    <BestChip
                      label={`Best: ${formatAmerican(best.price)} · ${best.book}`}
                    />
                  ) : null;
                })()}
              </Stack>

              <List dense disablePadding>
                {sortedForTeam(game.books, teamB).map((row, idx) => (
                  <ListItem
                    key={`${row.book}-B-${idx}`}
                    disableGutters
                    sx={{
                      px: 1.25,
                      py: 1,
                      mb: 0.75,
                      borderRadius: 2,
                      bgcolor:
                        idx === 0
                          ? "rgba(255,214,0,0.10)"
                          : "rgba(255,255,255,0.03)",
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
                          fontWeight: idx === 0 ? 800 : 500,
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
                        fontWeight: idx === 0 ? 800 : 500,
                      }}
                    />
                  </ListItem>
                ))}
              </List>
            </Box>
          </Stack>
        )}

        {/* Divider between ML and Totals only when showing both (view === "all") */}
        {view === "all" && <Divider sx={{ borderColor: "rgba(255,255,255,0.12)", my: 2 }} />}

        {/* ───────────────────────── Totals (all + ou) ─────────────────────────── */}
        {(view === "all" || view === "ou") && (
          <Stack spacing={2.5} sx={{ mb: view === "all" ? 2 : 0 }}>
            {/* Over */}
            <Box>
              <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                sx={{ mb: 1 }}
              >
                <Chip label="Over" color="primary" />
                {(() => {
                  const best = bestTotalsSide(game.totals, "Over");
                  return best ? (
                    <BestChip
                      label={`Best: O ${best.line} ${formatAmerican(
                        best.price
                      )} · ${best.book}`}
                    />
                  ) : null;
                })()}
              </Stack>

              <List dense disablePadding>
                {sortedTotalsSide(game.totals, "Over").map((row, idx) => (
                  <ListItem
                    key={`${row.book}-O-${idx}`}
                    disableGutters
                    sx={{
                      px: 1.25,
                      py: 1,
                      mb: 0.75,
                      borderRadius: 2,
                      bgcolor:
                        idx === 0
                          ? "rgba(255,214,0,0.10)"
                          : "rgba(255,255,255,0.03)",
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
                          fontWeight: idx === 0 ? 800 : 500,
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
                        fontWeight: idx === 0 ? 800 : 500,
                      }}
                    />
                  </ListItem>
                ))}
              </List>
            </Box>

            <Divider sx={{ borderColor: "rgba(255,255,255,0.08)" }} />

            {/* Under */}
            <Box>
              <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                sx={{ mb: 1 }}
              >
                <Chip label="Under" color="primary" />
                {(() => {
                  const best = bestTotalsSide(game.totals, "Under");
                  return best ? (
                    <BestChip
                      label={`Best: U ${best.line} ${formatAmerican(
                        best.price
                      )} · ${best.book}`}
                    />
                  ) : null;
                })()}
              </Stack>

              <List dense disablePadding>
                {sortedTotalsSide(game.totals, "Under").map((row, idx) => (
                  <ListItem
                    key={`${row.book}-U-${idx}`}
                    disableGutters
                    sx={{
                      px: 1.25,
                      py: 1,
                      mb: 0.75,
                      borderRadius: 2,
                      bgcolor:
                        idx === 0
                          ? "rgba(255,214,0,0.10)"
                          : "rgba(255,255,255,0.03)",
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
                          fontWeight: idx === 0 ? 800 : 500,
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
                        fontWeight: idx === 0 ? 800 : 500,
                      }}
                    />
                  </ListItem>
                ))}
              </List>
            </Box>
          </Stack>
        )}

        {/* ───────────────────────── Anytime TD (placeholder) ───────────────────── */}
        {view === "all" && (
          <>
            <Divider sx={{ borderColor: "rgba(255,255,255,0.12)", my: 2 }} />
            <Box sx={{ mb: 0.5 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>
                Anytime Touchdown
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.85, mb: 1 }}>
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
