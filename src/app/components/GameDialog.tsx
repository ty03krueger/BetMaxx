"use client";

import * as React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Stack,
  Typography,
  Chip,
  Divider,
  Button,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import type { Game } from "../../types"; // <- or wherever your Game type lives

type Props = {
  open: boolean;
  game: Game | null;
  onClose: () => void;
};

export default function GameDialog({ open, game, onClose }: Props) {
  if (!game) return null;

  const [away, home] = game.teams ?? [];
  const kickoff = new Date((game as any).commenceTime).toLocaleString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ pr: 6, fontWeight: 800 }}>
        {away} <Typography component="span" sx={{ opacity: 0.6 }}>@</Typography> {home}
        <IconButton
          onClick={onClose}
          sx={{ position: "absolute", right: 8, top: 8 }}
          aria-label="Close"
          size="small"
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        <Stack spacing={1}>
          <Typography variant="body2" sx={{ opacity: 0.8 }}>
            {kickoff}
          </Typography>
          <Stack direction="row" spacing={1} alignItems="center">
            <Chip size="small" label={(game as any).league?.toUpperCase() || (game as any).sportKey?.toUpperCase() || "GAME"} />
            {(game as any).id && (
              <Chip size="small" variant="outlined" label={`ID: ${(game as any).id || (game as any).eventId}`} />
            )}
          </Stack>

          <Divider sx={{ my: 1.5 }} />

          {/* Minimal odds summary — adjust to taste */}
          <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 0.5 }}>
            Moneyline (best available)
          </Typography>
          {/* You likely already have a helper to compute best ML; keep it simple here */}
          {/* Or show a “View all markets” button that routes to the league page prefiltered with ?game=... */}
          <Button
            variant="contained"
            onClick={onClose}
            sx={{ alignSelf: "flex-start", borderRadius: 999 }}
          >
            Close
          </Button>
        </Stack>
      </DialogContent>
    </Dialog>
  );
}
