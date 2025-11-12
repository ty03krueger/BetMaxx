"use client";
import * as React from "react";
import {
  Card,
  CardActionArea,
  CardContent,
  Stack,
  Typography,
  Box,
  Divider,
  Chip,
  Button, // ← added
} from "@mui/material";
import { keyframes } from "@mui/system";
import type { Game } from "../data/mockOdds";
import { bestForTeam, bestTotalsSide, formatAmerican } from "../utils/odds";

// NEW: auth + firestore helper
import { useRouter } from "next/navigation";
import { useAuth } from "../providers";
import { addSavedLine } from "../../lib/userData";

type Props = {
  game: Game;
  onOpen: (game: Game) => void;
  market: "Moneyline" | "Total";
};

const kickoffText = (iso: string) =>
  new Date(iso).toLocaleString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

const edgeSheen = keyframes`
  from { opacity: 0; transform: translateX(-10%); }
  to   { opacity: .25; transform: translateX(110%); }
`;

export default function GameCard({ game, onOpen, market }: Props) {
  const [teamA, teamB] = game.teams;

  // NEW: for Save Line
  const router = useRouter();
  const { user } = useAuth();

  let leftTitle = "";
  let leftSub = "";
  let rightTitle = "";
  let rightSub = "";

  let leftNumeric = 0;
  let rightNumeric = 0;

  if (market === "Moneyline") {
    const bestA = bestForTeam(game.books, teamA);
    const bestB = bestForTeam(game.books, teamB);

    leftTitle = bestA ? `${teamA} ${formatAmerican(bestA.price)}` : `${teamA} —`;
    leftSub = bestA ? bestA.book : "";
    rightTitle = bestB ? `${teamB} ${formatAmerican(bestB.price)}` : `${teamB} —`;
    rightSub = bestB ? bestB.book : "";

    leftNumeric = bestA?.price ?? Number.NEGATIVE_INFINITY;
    rightNumeric = bestB?.price ?? Number.NEGATIVE_INFINITY;
  } else {
    const bestOver = bestTotalsSide(game.totals, "Over");
    const bestUnder = bestTotalsSide(game.totals, "Under");

    leftTitle = bestOver
      ? `Over ${bestOver.line} ${formatAmerican(bestOver.price)}`
      : `Over —`;
    leftSub = bestOver ? bestOver.book : "";

    rightTitle = bestUnder
      ? `Under ${bestUnder.line} ${formatAmerican(bestUnder.price)}`
      : `Under —`;
    rightSub = bestUnder ? bestUnder.book : "";

    leftNumeric = bestOver?.price ?? Number.NEGATIVE_INFINITY;
    rightNumeric = bestUnder?.price ?? Number.NEGATIVE_INFINITY;
  }

  const leftIsBest = leftNumeric > rightNumeric;

  // NEW: minimal Save Line handler
  const handleSaveLine = async (e: React.MouseEvent) => {
    e.stopPropagation(); // don’t trigger onOpen
    if (!user) {
      router.push("/auth");
      return;
    }

    // Build a stable-ish id; fall back if your mock Game lacks eventId
    const eventId =
      (game as any).eventId ??
      (game as any).id ??
      `${teamA}-${teamB}-${game.commenceTime}`;

    const rawLeague = String((game as any).league ?? (game as any).sportKey ?? "");
    const league =
      rawLeague.toUpperCase().includes("NCAA") || rawLeague.toUpperCase() === "NCAAF"
        ? "CFB"
        : rawLeague.toUpperCase() || "NFL";

    try {
      await addSavedLine(user.uid, {
        id: `${eventId}-${market === "Moneyline" ? "ML" : "TOTAL"}`,
        league,
        label: `${teamA} @ ${teamB} — ${market === "Moneyline" ? "ML" : "Total"}`,
      });
      // Keep feedback simple for step 1
      // eslint-disable-next-line no-alert
      alert("Saved! Check your Account → Saved Lines.");
    } catch (err: any) {
      // eslint-disable-next-line no-alert
      alert(err?.message || "Failed to save line");
    }
  };

  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: 3,
        overflow: "hidden",
        border: "1px solid rgba(255,255,255,0.08)",
        background:
          "linear-gradient(180deg, rgba(17,24,33,1) 0%, rgba(13,17,24,1) 100%)",
        position: "relative",
        transition: "transform .18s ease, box-shadow .18s ease, border-color .18s ease",
        "&:hover": {
          transform: "translateY(-2px)",
          borderColor: "rgba(255,214,0,0.22)",
          boxShadow:
            "0 10px 28px rgba(0,0,0,0.45), 0 0 24px rgba(255,214,0,0.12)",
        },
      }}
    >
      <CardActionArea
        onClick={() => onOpen(game)}
        sx={{
          position: "relative",
          "&::after": {
            content: '""',
            position: "absolute",
            top: 0,
            bottom: 0,
            left: 0,
            width: "30%",
            pointerEvents: "none",
            background:
              "linear-gradient(90deg, rgba(255,214,0,0.00) 0%, rgba(255,214,0,0.18) 50%, rgba(255,214,0,0.00) 100%)",
            opacity: 0,
          },
          "&:hover::after": {
            animation: `${edgeSheen} .9s ease-out 1`,
          },
        }}
      >
        <CardContent sx={{ p: { xs: 1.5, sm: 2 } }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
            <Stack spacing={0.25}>
              <Typography variant="subtitle2" color="text.secondary">
                {kickoffText(game.commenceTime)}
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 800, lineHeight: 1.15 }}>
                {teamA} <Typography component="span" sx={{ opacity: 0.6 }}>@</Typography> {teamB}
              </Typography>
            </Stack>

            <Box
              sx={{
                px: 1,
                py: 0.25,
                borderRadius: 999,
                fontSize: 12,
                fontWeight: 700,
                bgcolor: "rgba(255,214,0,0.12)",
                color: "primary.main",
                border: "1px solid rgba(255,214,0,0.25)",
              }}
            >
              {market === "Moneyline" ? "Moneyline" : "Total"}
            </Box>
          </Stack>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "1fr 14px 1fr",
              alignItems: "stretch",
              gap: 1.25,
            }}
          >
            {/* LEFT SIDE */}
            <Box
              sx={{
                px: 1.25,
                py: 1,
                borderRadius: 2,
                background: "rgba(255,255,255,0.03)",
                border: leftIsBest
                  ? "1px solid rgba(255,214,0,0.25)"
                  : "1px solid rgba(255,255,255,0.06)",
                position: "relative",
              }}
            >
              <Typography
                sx={{
                  fontWeight: 800,
                  fontSize: 16,
                  color: "text.primary",
                  mb: 0.25,
                }}
              >
                {leftTitle}
              </Typography>
              <Typography
                variant="caption"
                sx={{ opacity: 0.75, letterSpacing: 0.2 }}
              >
                {leftSub}
              </Typography>
              {leftIsBest && (
                <Chip
                  label="Max"
                  size="small"
                  sx={{
                    position: "absolute",
                    top: 6,
                    right: 6,
                    fontSize: 10,
                    height: 18,
                    bgcolor: "rgba(255,214,0,0.08)",
                    color: "primary.main",
                    border: "1px solid rgba(255,214,0,0.4)",
                    fontWeight: 700,
                  }}
                />
              )}
            </Box>

            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                opacity: 0.2,
              }}
            >
              <Divider
                orientation="vertical"
                flexItem
                sx={{ borderColor: "rgba(255,255,255,0.12)" }}
              />
            </Box>

            {/* RIGHT SIDE */}
            <Box
              sx={{
                px: 1.25,
                py: 1,
                borderRadius: 2,
                background: "rgba(255,255,255,0.03)",
                border: !leftIsBest
                  ? "1px solid rgba(255,214,0,0.25)"
                  : "1px solid rgba(255,255,255,0.06)",
                position: "relative",
                textAlign: "right",
              }}
            >
              <Typography
                sx={{
                  fontWeight: 800,
                  fontSize: 16,
                  color: "text.primary",
                  mb: 0.25,
                }}
              >
                {rightTitle}
              </Typography>
              <Typography
                variant="caption"
                sx={{ opacity: 0.75, letterSpacing: 0.2 }}
              >
                {rightSub}
              </Typography>
              {!leftIsBest && (
                <Chip
                  label="Max"
                  size="small"
                  sx={{
                    position: "absolute",
                    top: 6,
                    left: 6,
                    fontSize: 10,
                    height: 18,
                    bgcolor: "rgba(255,214,0,0.08)",
                    color: "primary.main",
                    border: "1px solid rgba(255,214,0,0.4)",
                    fontWeight: 700,
                  }}
                />
              )}
            </Box>
          </Box>

          {/* NEW: Action row (doesn't interfere with the clickable card) */}
          <Box sx={{ mt: 1.25, display: "flex", justifyContent: "flex-end" }}>
            <Button
              variant="outlined"
              size="small"
              onClick={handleSaveLine}
              sx={{ borderRadius: 999 }}
            >
              Save line
            </Button>
          </Box>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}
