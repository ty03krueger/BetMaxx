"use client";
import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  ToggleButton,
  ToggleButtonGroup,
  TextField,
  InputAdornment,
  IconButton,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";
import { alpha } from "@mui/material/styles";

function AccentX() {
  return (
    <Box
      aria-label="BetMaxx accent X"
      sx={{
        position: "relative",
        width: 16,
        height: 16,
        mx: 0.25,
        display: "inline-block",
      }}
    >
      <Box
        sx={{
          position: "absolute",
          left: "50%",
          top: "50%",
          width: 16,
          height: 2,
          bgcolor: alpha("#FFFFFF", 0.5),
          transform: "translate(-50%, -50%) rotate(45deg)",
          borderRadius: 1,
        }}
      />
      <Box
        sx={{
          position: "absolute",
          left: "50%",
          top: "50%",
          width: 16,
          height: 2,
          bgcolor: "#FFD600",
          boxShadow: "0 0 8px rgba(255,214,0,.35)",
          transform: "translate(-50%, -50%) rotate(-45deg)",
          borderRadius: 1,
        }}
      />
    </Box>
  );
}

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [compact, setCompact] = React.useState(false);

  // Initialize search with existing ?q= if present
  const initialQ = searchParams.get("q") || "";
  const [q, setQ] = React.useState(initialQ);

  React.useEffect(() => {
    const onScroll = () => setCompact(window.scrollY > 6);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const tabs = React.useMemo(
    () => [
      { label: "NFL", href: "/" },
      { label: "CFB", href: "/cfb" },
      { label: "NBA", href: "/nba" },
      { label: "NHL", href: "/nhl" },
      { label: "MLB", href: "/mlb" },
    ],
    []
  );

  const activeHref = React.useMemo(() => {
    for (const t of tabs) {
      if (t.href === "/") {
        if (pathname === "/") return t.href;
      } else if (pathname.startsWith(t.href)) {
        return t.href;
      }
    }
    return "/";
  }, [pathname, tabs]);

  // Helper: update ?q= and dispatch event so pages can react immediately
  const pushQueryAndNotify = React.useCallback(
    (nextQ: string) => {
      // Update URL query param without scroll
      const sp = new URLSearchParams(Array.from(searchParams.entries()));
      if (nextQ) sp.set("q", nextQ);
      else sp.delete("q");
      router.replace(`${pathname}?${sp.toString()}`, { scroll: false });

      // Fire a custom event apps/pages can listen to
      const ev = new CustomEvent("betmaxx:search", { detail: { q: nextQ } });
      window.dispatchEvent(ev);
    },
    [pathname, router, searchParams]
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    pushQueryAndNotify(q.trim());
  };

  const handleClear = () => {
    setQ("");
    pushQueryAndNotify("");
  };

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        backdropFilter: "blur(10px)",
        background:
          "linear-gradient(180deg, rgba(10,14,20,0.78) 0%, rgba(10,14,20,0.55) 100%)",
        borderBottom: `1px solid ${alpha("#FFFFFF", 0.08)}`,
        "&::before": {
          content: '""',
          position: "absolute",
          inset: 0,
          top: -1,
          height: 2,
          background:
            "linear-gradient(90deg, rgba(255,214,0,.32), rgba(255,214,0,0) 35%, rgba(255,214,0,.32) 65%, rgba(255,214,0,0))",
          pointerEvents: "none",
        },
      }}
    >
      <Toolbar
        sx={{
          transition: "min-height .18s ease, padding .18s ease",
          minHeight: compact ? 56 : 68,
          px: { xs: 1.5, sm: 2.5 },
          gap: 2,
        }}
      >
        {/* Wordmark */}
        <Typography
          variant="h6"
          sx={{
            fontWeight: 800,
            letterSpacing: 0.2,
            display: "flex",
            alignItems: "center",
            userSelect: "none",
          }}
        >
          <Box component="span" sx={{ mr: 0.25 }}>
            BetMax
          </Box>
          <AccentX />
        </Typography>

        {/* Center Search */}
        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{
            mx: { xs: 1, md: 3 },
            flex: 1,
            display: "flex",
            justifyContent: "center",
          }}
        >
          <TextField
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search teams, matchups, players…"
            size="small"
            fullWidth
            sx={{
              maxWidth: 560,
              "& .MuiOutlinedInput-root": {
                borderRadius: 999,
                backgroundColor: alpha("#FFFFFF", 0.04),
                "& fieldset": {
                  borderColor: alpha("#FFFFFF", 0.12),
                },
                "&:hover fieldset": {
                  borderColor: alpha("#FFFFFF", 0.2),
                },
                "&.Mui-focused fieldset": {
                  borderColor: alpha("#FFD600", 0.6),
                  boxShadow: `0 0 0 2px ${alpha("#FFD600", 0.15)}`,
                },
              },
              "& input": {
                color: alpha("#fff", 0.9),
              },
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <IconButton
                    aria-label="search"
                    type="submit"
                    size="small"
                    sx={{ color: alpha("#fff", 0.85) }}
                  >
                    <SearchIcon fontSize="small" />
                  </IconButton>
                </InputAdornment>
              ),
              endAdornment: q ? (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="clear search"
                    onClick={handleClear}
                    size="small"
                    sx={{ color: alpha("#fff", 0.7) }}
                  >
                    <ClearIcon fontSize="small" />
                  </IconButton>
                </InputAdornment>
              ) : null,
            }}
          />
        </Box>

        {/* League tabs (route-driven) */}
        <Box sx={{ ml: "auto" }}>
          <ToggleButtonGroup
            exclusive
            value={activeHref}
            size="small"
            sx={{
              backgroundColor: alpha("#FFFFFF", 0.03),
              border: `1px solid ${alpha("#FFFFFF", 0.08)}`,
              borderRadius: 999,
              p: 0.5,
              gap: 0.5,
            }}
          >
            {tabs.map((t) => (
              <ToggleButton
                key={t.href}
                value={t.href}
                disableRipple
                component={Link}
                href={t.href}
                sx={{
                  px: 1.25,
                  py: 0.35,
                  borderRadius: 999,
                  textTransform: "none",
                  color: alpha("#fff", 0.8),
                  border: "none",
                  "&.Mui-selected": {
                    color: "#FFD600",
                    background:
                      "linear-gradient(180deg, rgba(255,214,0,0.18) 0%, rgba(255,214,0,0.10) 100%)",
                    border: `1px solid ${alpha("#FFD600", 0.45)}`,
                    boxShadow:
                      "0 0 0 2px rgba(255,214,0,0.10), inset 0 0 18px rgba(255,214,0,0.15)",
                  },
                  "&:hover": {
                    backgroundColor: alpha("#FFFFFF", 0.06),
                  },
                }}
              >
                {t.label}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
