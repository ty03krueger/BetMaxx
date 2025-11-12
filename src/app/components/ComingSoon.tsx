"use client";
import * as React from "react";
import { Stack, Typography, Button } from "@mui/material";
import Link from "next/link";

export default function ComingSoon({
  title,
  blurb = "We’re building this page. Check back soon."
}: { title: string; blurb?: string }) {
  return (
    <Stack spacing={2} alignItems="center" sx={{ py: 8 }}>
      <Typography variant="h3" sx={{ fontWeight: 800, textAlign: "center" }}>
        {title}
      </Typography>
      <Typography variant="subtitle1" sx={{ opacity: 0.8, textAlign: "center", maxWidth: 600 }}>
        {blurb}
      </Typography>
      <Button
        component={Link}
        href="/"
        variant="contained"
        sx={{ borderRadius: 999 }}
        aria-label="Back to home"
      >
        Back to Home
      </Button>
    </Stack>
  );
}
