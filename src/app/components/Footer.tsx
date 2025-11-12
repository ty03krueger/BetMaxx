"use client";

import * as React from "react";
import NextLink from "next/link";
import { Box, Stack, Typography, Link } from "@mui/material";

export default function Footer() {
  return (
    <Box
      component="footer"
      sx={{
        mt: 8,
        borderTop: "1px solid",
        borderColor: "divider",
        px: { xs: 2, md: 4 },
        py: 2,
        bgcolor: "transparent",
      }}
    >
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={{ xs: 1, sm: 2 }}
        alignItems={{ xs: "flex-start", sm: "center" }}
        justifyContent="space-between"
      >
        <Typography variant="caption" sx={{ opacity: 0.75 }}>
          Gambling problem? Call or text <b>1-800-GAMBLER</b>. BetMaxx provides odds information only;
          no bets are placed or handled on this site. <b>21+</b> where applicable. Play responsibly.
        </Typography>

        <Stack direction="row" spacing={2}>
          <Link component={NextLink} href="/responsible-gaming" underline="hover" variant="caption">
            Responsible Gaming
          </Link>
          <Link component={NextLink} href="/terms" underline="hover" variant="caption">
            Terms
          </Link>
          <Link component={NextLink} href="/privacy" underline="hover" variant="caption">
            Privacy
          </Link>
        </Stack>
      </Stack>
    </Box>
  );
}
