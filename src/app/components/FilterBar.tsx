// components/FilterBar.tsx
"use client";
import { ToggleButton, ToggleButtonGroup } from "@mui/material";

export type View = "all" | "ml" | "ou";

export default function FilterBar({
  value,
  onChange,
}: {
  value: View;
  onChange: (v: View) => void;
}) {
  return (
    <ToggleButtonGroup
      exclusive
      value={value}
      onChange={(_, v) => v && onChange(v)}
      size="small"
      sx={{ bgcolor: "transparent" }}
      aria-label="Market filter"
    >
      <ToggleButton value="all" aria-label="All Games">All Games</ToggleButton>
      <ToggleButton value="ml" aria-label="Moneyline">ML</ToggleButton>
      <ToggleButton value="ou" aria-label="Over/Under">O/U</ToggleButton>
    </ToggleButtonGroup>
  );
}
