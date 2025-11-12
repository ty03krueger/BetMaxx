"use client";

import * as React from "react";
import { Box, Stack, Typography, Link } from "@mui/material";

export default function ResponsibleGamingPage() {
  return (
    <Box sx={{ px: { xs: 2, md: 4 }, py: { xs: 4, md: 6 } }}>
      <Stack spacing={2} sx={{ maxWidth: 880 }}>
        <Typography variant="h4" sx={{ fontWeight: 800 }}>
          Responsible Gaming
        </Typography>
        <Typography variant="body1" sx={{ opacity: 0.9 }}>
          BetMaxx is an odds information platform. We do not accept wagers and are not a sportsbook.
          Our product is intended for informational and entertainment purposes only.
        </Typography>
        <Typography variant="body1" sx={{ opacity: 0.9 }}>
          If you or someone you know has a gambling problem and wants help, call or text{" "}
          <b>1-800-GAMBLER</b>. For additional resources, visit the{" "}
          <Link href="https://www.ncpgambling.org/" target="_blank" rel="noopener noreferrer">
            National Council on Problem Gambling
          </Link>
          .
        </Typography>
        <Typography variant="body1" sx={{ opacity: 0.9 }}>
          You must be <b>21+</b> (or the legal age in your jurisdiction) to use betting services. Always check local laws.
        </Typography>
        <Typography variant="body2" sx={{ opacity: 0.7 }}>
          © {new Date().getFullYear()} BetMaxx. All rights reserved.
        </Typography>
      </Stack>
    </Box>
  );
}
