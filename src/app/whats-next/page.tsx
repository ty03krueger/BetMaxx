// src/app/whats-next/page.tsx
"use client";

import * as React from "react";
import {
  Box,
  Stack,
  Typography,
  Card,
  CardContent,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";

export default function WhatsNextPage() {
  return (
    <Box
      sx={{
        maxWidth: 960,
        mx: "auto",
        px: { xs: 2, md: 3 },
        py: { xs: 3, md: 4 },
      }}
    >
      <Stack spacing={3}>
        {/* Header */}
        <Stack spacing={1}>
          <Typography
            variant="overline"
            sx={{ letterSpacing: 2, opacity: 0.8 }}
          >
            BetMaxx
          </Typography>
          <Typography variant="h4" sx={{ fontWeight: 800 }}>
            What&apos;s Next
          </Typography>
          <Typography sx={{ opacity: 0.8, maxWidth: 720 }}>
            BetMaxx is just getting started. This page is a living snapshot of
            where we want to take the product: smarter tools, more markets, and
            a cleaner way to shop odds and build slips.
          </Typography>
        </Stack>

        {/* Near-term card */}
        <Card
          sx={{
            borderRadius: 3,
            background: "#0F141A",
            border: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          <CardContent>
            <Stack spacing={1.5}>
              <Stack direction="row" spacing={1} alignItems="center">
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  Short-Term Roadmap
                </Typography>
                <Chip
                  label="In Progress"
                  size="small"
                  color="primary"
                  sx={{ fontWeight: 600 }}
                />
              </Stack>

              <Typography variant="body2" sx={{ opacity: 0.8 }}>
                Things we&apos;re focused on over the next stretch of updates.
              </Typography>

              <List dense>
                <ListItem disableGutters sx={{ py: 0.75 }}>
                  <ListItemText
                    primary="Smarter parlay builder (MaxxSlip)"
                    secondary="Smoother UI, better mobile layout, and clearer value readouts when you stack legs across books."
                    primaryTypographyProps={{ fontWeight: 600 }}
                    secondaryTypographyProps={{ sx: { opacity: 0.8 } }}
                  />
                </ListItem>
                <ListItem disableGutters sx={{ py: 0.75 }}>
                  <ListItemText
                    primary="Parlay tracking (local)"
                    secondary="Let users save, revisit, and tweak slips they’ve built — not tied to any book, just a clean way to remember combos you like."
                    primaryTypographyProps={{ fontWeight: 600 }}
                    secondaryTypographyProps={{ sx: { opacity: 0.8 } }}
                  />
                </ListItem>
                <ListItem disableGutters sx={{ py: 0.75 }}>
                  <ListItemText
                    primary="Player props coverage"
                    secondary="Extend the odds comparison beyond sides and totals into player props for major markets."
                    primaryTypographyProps={{ fontWeight: 600 }}
                    secondaryTypographyProps={{ sx: { opacity: 0.8 } }}
                  />
                </ListItem>
                <ListItem disableGutters sx={{ py: 0.75 }}>
                  <ListItemText
                    primary="Cleaner navigation & account experience"
                    secondary="Make it easier to move between NFL, CFB, and experimental tools like MaxxSlip from a single, consistent account hub."
                    primaryTypographyProps={{ fontWeight: 600 }}
                    secondaryTypographyProps={{ sx: { opacity: 0.8 } }}
                  />
                </ListItem>
              </List>
            </Stack>
          </CardContent>
        </Card>

        {/* Sports expansion */}
        <Card
          sx={{
            borderRadius: 3,
            background: "#0F141A",
            border: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          <CardContent>
            <Stack spacing={1.5}>
              <Stack direction="row" spacing={1} alignItems="center">
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  More Sports & Markets
                </Typography>
                <Chip
                  label="Planned"
                  size="small"
                  variant="outlined"
                  sx={{ borderRadius: 999 }}
                />
              </Stack>

              <Typography variant="body2" sx={{ opacity: 0.8 }}>
                BetMaxx started with football, but the end goal is to be your
                default place to check odds across multiple sports.
              </Typography>

              <List dense>
                <ListItem disableGutters sx={{ py: 0.75 }}>
                  <ListItemText
                    primary="College Basketball"
                    secondary="Full odds comparison and game pages for CBB once the season is rolling and data looks stable."
                    primaryTypographyProps={{ fontWeight: 600 }}
                    secondaryTypographyProps={{ sx: { opacity: 0.8 } }}
                  />
                </ListItem>
                <ListItem disableGutters sx={{ py: 0.75 }}>
                  <ListItemText
                    primary="NBA"
                    secondary="Sides, totals, and eventually player props in a layout that feels natural for nightly hoops browsing."
                    primaryTypographyProps={{ fontWeight: 600 }}
                    secondaryTypographyProps={{ sx: { opacity: 0.8 } }}
                  />
                </ListItem>
                <ListItem disableGutters sx={{ py: 0.75 }}>
                  <ListItemText
                    primary="Additional leagues over time"
                    secondary="Think MLB, NHL, and other major markets, added once the core experience is polished and fast."
                    primaryTypographyProps={{ fontWeight: 600 }}
                    secondaryTypographyProps={{ sx: { opacity: 0.8 } }}
                  />
                </ListItem>
              </List>
            </Stack>
          </CardContent>
        </Card>

        {/* Intelligence / personalization */}
        <Card
          sx={{
            borderRadius: 3,
            background: "#0F141A",
            border: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          <CardContent>
            <Stack spacing={1.5}>
              <Stack direction="row" spacing={1} alignItems="center">
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  Intelligent Tools & Personalization
                </Typography>
                <Chip
                  label="Future"
                  size="small"
                  variant="outlined"
                  sx={{ borderRadius: 999 }}
                />
              </Stack>

              <Typography variant="body2" sx={{ opacity: 0.8 }}>
                Long term, BetMaxx isn&apos;t just a static odds board — it&apos;s
                meant to feel like a smart layer sitting between you and all the
                books you use.
              </Typography>

              <List dense>
                <ListItem disableGutters sx={{ py: 0.75 }}>
                  <ListItemText
                    primary="Intelligent pick surfacing"
                    secondary="Highlight interesting lines or odds swings based on price movement, implied probabilities, and how different books disagree — without telling you what to bet."
                    primaryTypographyProps={{ fontWeight: 600 }}
                    secondaryTypographyProps={{ sx: { opacity: 0.8 } }}
                  />
                </ListItem>
                <ListItem disableGutters sx={{ py: 0.75 }}>
                  <ListItemText
                    primary="Smarter parlay suggestions"
                    secondary="Show how adding or swapping legs could change your payout on specific books, and surface combos that look especially efficient from a pricing standpoint."
                    primaryTypographyProps={{ fontWeight: 600 }}
                    secondaryTypographyProps={{ sx: { opacity: 0.8 } }}
                  />
                </ListItem>
                <ListItem disableGutters sx={{ py: 0.75 }}>
                  <ListItemText
                    primary="Lightweight tracking & history"
                    secondary="Let users keep a simple history of the games and matchups they check most, so the board and parlay tools feel tailored to how they actually browse."
                    primaryTypographyProps={{ fontWeight: 600 }}
                    secondaryTypographyProps={{ sx: { opacity: 0.8 } }}
                  />
                </ListItem>
                <ListItem disableGutters sx={{ py: 0.75 }}>
                  <ListItemText
                    primary="Alerts & notifications"
                    secondary="Optional alerts when odds cross certain thresholds or when a book becomes clearly best price for a game you’ve been watching."
                    primaryTypographyProps={{ fontWeight: 600 }}
                    secondaryTypographyProps={{ sx: { opacity: 0.8 } }}
                  />
                </ListItem>
              </List>
            </Stack>
          </CardContent>
        </Card>

        {/* Closing note */}
        <Card
          sx={{
            borderRadius: 3,
            background: "linear-gradient(135deg, #111827, #020617)",
            border: "1px solid rgba(148,163,184,0.35)",
          }}
        >
          <CardContent>
            <Stack spacing={1}>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                Built for people who actually bet
              </Typography>
              <Typography sx={{ opacity: 0.85 }}>
                BetMaxx is being shaped by real use: what&apos;s confusing, what&apos;s
                slow, and what actually helps on a Saturday or Sunday when
                there&apos;s a ton on the board. The roadmap will evolve, but the
                theme stays the same: make it easier to see value, compare
                books, and build slips that make sense to you.
              </Typography>
              <Typography sx={{ opacity: 0.7, fontSize: 13 }}>
                If you have ideas or see something that would make your workflow
                better, there&apos;s a good chance it ends up here.
              </Typography>
            </Stack>
          </CardContent>
        </Card>
      </Stack>
    </Box>
  );
}
