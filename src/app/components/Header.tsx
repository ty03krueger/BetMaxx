// src/app/components/Header.tsx
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
  Button,
  Avatar,
  Menu,
  MenuItem,
  ListItemIcon,
  Divider,
  Tooltip,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import LogoutIcon from "@mui/icons-material/Logout";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import { alpha, useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";

import { useAuth } from "../providers";
import { signOut } from "firebase/auth";
import { auth } from "../../firebase";

// Simple list of NFL team keywords (lowercase) used to decide NFL vs CFB.
// Placeholder v1: if it doesn't look like one of these → treat as CFB.
const NFL_TEAM_KEYWORDS: string[] = [
  "49ers",
  "niners",
  "san francisco 49ers",
  "sf 49ers",
  "cardinals",
  "arizona cardinals",
  "falcons",
  "atlanta falcons",
  "ravens",
  "baltimore ravens",
  "bills",
  "buffalo bills",
  "panthers",
  "carolina panthers",
  "bears",
  "chicago bears",
  "bengals",
  "cincinnati bengals",
  "browns",
  "cleveland browns",
  "cowboys",
  "dallas cowboys",
  "broncos",
  "denver broncos",
  "lions",
  "detroit lions",
  "packers",
  "green bay packers",
  "texans",
  "houston texans",
  "colts",
  "indianapolis colts",
  "jaguars",
  "jacksonville jaguars",
  "chiefs",
  "kansas city chiefs",
  "raiders",
  "las vegas raiders",
  "chargers",
  "los angeles chargers",
  "rams",
  "los angeles rams",
  "dolphins",
  "miami dolphins",
  "vikings",
  "minnesota vikings",
  "patriots",
  "new england patriots",
  "saints",
  "new orleans saints",
  "giants",
  "new york giants",
  "jets",
  "new york jets",
  "eagles",
  "philadelphia eagles",
  "steelers",
  "pittsburgh steelers",
  "seahawks",
  "seattle seahawks",
  "buccaneers",
  "bucs",
  "tampa bay buccaneers",
  "titans",
  "tennessee titans",
  "commanders",
  "washington commanders",
].map((s) => s.toLowerCase());

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [compact, setCompact] = React.useState(false);

  // Auth
  const { user, loading } = useAuth();
  const [menuEl, setMenuEl] = React.useState<null | HTMLElement>(null);
  const menuOpen = Boolean(menuEl);

  // League menu (mobile)
  const [leagueMenuEl, setLeagueMenuEl] = React.useState<null | HTMLElement>(
    null
  );
  const leagueMenuOpen = Boolean(leagueMenuEl);

  // Initialize search with existing ?q= if present
  const initialQ = searchParams.get("q") || "";
  const [q, setQ] = React.useState(initialQ);

  React.useEffect(() => {
    const onScroll = () => setCompact(window.scrollY > 6);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const tabs = React.useMemo(
    () => [
      { label: "NFL", href: "/nfl" },
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

  const activeTab = React.useMemo(
    () => tabs.find((t) => t.href === activeHref) ?? tabs[0],
    [tabs, activeHref]
  );

  // Helper: update ?q= and dispatch event so pages can react immediately
  const pushQueryAndNotify = React.useCallback(
    (nextQ: string) => {
      const sp = new URLSearchParams(Array.from(searchParams.entries()));
      if (nextQ) sp.set("q", nextQ);
      else sp.delete("q");
      router.replace(`${pathname}?${sp.toString()}`, { scroll: false });

      const ev = new CustomEvent("betmaxx:search", { detail: { q: nextQ } });
      window.dispatchEvent(ev);
    },
    [pathname, router, searchParams]
  );

  // 🔍 Smart league inference based on query text
  const inferRouteFromQuery = React.useCallback((query: string): string => {
    const q = query.toLowerCase();

    const looksNFL = NFL_TEAM_KEYWORDS.some((kw) => q.includes(kw));

    // If it matches an NFL team keyword → NFL, otherwise default to CFB.
    return looksNFL ? "/nfl" : "/cfb";
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = q.trim();

    // If empty search, just clear on current page
    if (!trimmed) {
      pushQueryAndNotify("");
      return;
    }

    const targetRoute = inferRouteFromQuery(trimmed);

    // If we're already on the inferred league route, just push query + notify
    if (pathname.startsWith(targetRoute)) {
      pushQueryAndNotify(trimmed);
      return;
    }

    // Otherwise, navigate to the inferred league with ?q= in URL.
    const sp = new URLSearchParams();
    sp.set("q", trimmed);
    router.push(`${targetRoute}?${sp.toString()}`);
  };

  const handleClear = () => {
    setQ("");
    pushQueryAndNotify("");
  };

  // Auth menu handlers
  const handleAvatarClick = (e: React.MouseEvent<HTMLElement>) =>
    setMenuEl(e.currentTarget);
  const handleMenuClose = () => setMenuEl(null);

  const handleGoAccount = () => {
    handleMenuClose();
    router.push("/account");
  };

  const handleSignOut = async () => {
    handleMenuClose();
    try {
      await signOut(auth);
      router.push("/");
    } catch {
      /* optional toast */
    }
  };

  const avatarLabel =
    user?.displayName?.[0]?.toUpperCase() ??
    user?.email?.[0]?.toUpperCase() ??
    "U";

  // League menu handlers (mobile)
  const handleLeagueButtonClick = (e: React.MouseEvent<HTMLElement>) => {
    setLeagueMenuEl(e.currentTarget);
  };

  const handleLeagueMenuClose = () => {
    setLeagueMenuEl(null);
  };

  const handleSelectLeague = (href: string) => {
    setLeagueMenuEl(null);
    router.push(href);
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
        {/* Wordmark → click to go home */}
        <Box
          component={Link}
          href="/"
          aria-label="Go to BetMaxx home"
          prefetch={false}
          sx={{
            textDecoration: "none",
            display: "flex",
            alignItems: "center",
            userSelect: "none",
            color: "inherit",
            "&:hover .bm-word": { opacity: 0.95 },
            cursor: "pointer",
          }}
        >
          <Typography
            variant="overline"
            className="bm-word"
            sx={{ letterSpacing: 2, opacity: 0.8 }}
          >
            BetMaxx
          </Typography>
        </Box>

        {/* Center Search */}
        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{
            mx: { xs: 0.5, sm: 1, md: 3 },
            flex: { xs: 1.4, sm: 1, md: 1 },
            display: "flex",
            justifyContent: "center",
          }}
        >
          <TextField
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={
              isMobile ? "Search" : "Search teams, matchups, players…"
            }
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

        {/* League selection + Auth */}
        <Box
          sx={{
            ml: "auto",
            display: "flex",
            alignItems: "center",
            gap: 1.25,
          }}
        >
          {/* ⬇️ Mobile: league dropdown */}
          <Box sx={{ display: { xs: "flex", sm: "none" } }}>
            <Button
              size="small"
              onClick={handleLeagueButtonClick}
              endIcon={<ArrowDropDownIcon />}
              sx={{
                borderRadius: 999,
                border: `1px solid ${alpha("#FFFFFF", 0.18)}`,
                color: alpha("#FFFFFF", 0.9),
                textTransform: "none",
                px: 1.25,
                minWidth: 0,
                backgroundColor: alpha("#FFFFFF", 0.03),
                "&:hover": {
                  borderColor: alpha("#FFD600", 0.6),
                  backgroundColor: alpha("#FFFFFF", 0.06),
                },
              }}
            >
              {activeTab.label}
            </Button>
            <Menu
              anchorEl={leagueMenuEl}
              open={leagueMenuOpen}
              onClose={handleLeagueMenuClose}
              anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
              transformOrigin={{ vertical: "top", horizontal: "right" }}
            >
              {tabs.map((t) => (
                <MenuItem
                  key={t.href}
                  selected={t.href === activeHref}
                  onClick={() => handleSelectLeague(t.href)}
                >
                  {t.label}
                </MenuItem>
              ))}
            </Menu>
          </Box>

          {/* ⬇️ Desktop / tablet: pill tabs */}
          <ToggleButtonGroup
            exclusive
            value={activeHref}
            size="small"
            sx={{
              display: { xs: "none", sm: "flex" },
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
                sx={
                  {
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
                  } as any
                }
              >
                {t.label}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>

          {/* Auth Area */}
          {!loading && !user && (
            <Button
              component={Link}
              href="/auth"
              variant="outlined"
              size="small"
              sx={{
                borderRadius: 999,
                borderColor: alpha("#FFFFFF", 0.18),
                color: alpha("#FFFFFF", 0.9),
                "&:hover": { borderColor: alpha("#FFD600", 0.6) },
              }}
            >
              Sign in
            </Button>
          )}

          {!loading && user && (
            <>
              <Tooltip title={user.displayName || user.email || "Account"}>
                <IconButton
                  onClick={handleAvatarClick}
                  size="small"
                  sx={{
                    p: 0,
                    ml: 0.25,
                    borderRadius: 999,
                    border: `1px solid ${alpha("#FFFFFF", 0.12)}`,
                  }}
                >
                  <Avatar
                    sx={{
                      width: 30,
                      height: 30,
                      fontSize: 14,
                      bgcolor: alpha("#FFD600", 0.18),
                      color: "#FFD600",
                    }}
                  >
                    {avatarLabel}
                  </Avatar>
                </IconButton>
              </Tooltip>
              <Menu
                anchorEl={menuEl}
                open={menuOpen}
                onClose={handleMenuClose}
                onClick={handleMenuClose}
                transformOrigin={{ horizontal: "right", vertical: "top" }}
                anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
              >
                <MenuItem onClick={handleGoAccount}>
                  <ListItemIcon>
                    <AccountCircleIcon fontSize="small" />
                  </ListItemIcon>
                  Account
                </MenuItem>
                <Divider />
                <MenuItem onClick={handleSignOut}>
                  <ListItemIcon>
                    <LogoutIcon fontSize="small" />
                  </ListItemIcon>
                  Sign out
                </MenuItem>
              </Menu>
            </>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
}
