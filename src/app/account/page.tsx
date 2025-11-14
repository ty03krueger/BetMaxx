// src/app/account/page.tsx
"use client";

import * as React from "react";
import Link from "next/link";
import {
  Box,
  Stack,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Chip,
  Divider,
  Avatar,
  IconButton,
  Tooltip,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  InputAdornment,
  Checkbox,
  FormControlLabel,
  ToggleButtonGroup,
  ToggleButton,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import EditIcon from "@mui/icons-material/Edit";
import AddIcon from "@mui/icons-material/Add";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import SportsFootballIcon from "@mui/icons-material/SportsFootball";
import SportsBasketballIcon from "@mui/icons-material/SportsBasketball";
import SportsHockeyIcon from "@mui/icons-material/SportsHockey";
import SportsBaseballIcon from "@mui/icons-material/SportsBaseball";
import SearchIcon from "@mui/icons-material/Search";
import SportsIcon from "@mui/icons-material/Sports";
import ShieldOutlinedIcon from "@mui/icons-material/ShieldOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import type { SavedLine } from "../../lib/userData";

import { useAuth } from "../providers";
import { db } from "../../firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";

import GameDetail from "../components/GameDetail";
import type { Game } from "../api/odds/route";

// 🔹 NEW: useBooks context (shared preferred sportsbooks)
import { useBooks } from "../contexts/BookProvider";

// ---------- Types ----------
type UserDoc = {
  uid: string;
  displayName?: string | null;
  email?: string | null;
  createdAt?: any;
  favorites?: {
    teams?: string[];
    /** IMPORTANT: store sportsbook KEYS (from Odds API), not labels */
    books?: string[];
  };
  savedLines?: Array<{
    id: string;
    league: string;
    label: string; // e.g. "Tampa Bay Buccaneers @ Buffalo Bills – ML"
    price?: string;
    createdAt?: number;
  }>;
};

type View = "all" | "ml" | "ou";
type Market = "Moneyline" | "Total";

// ---------- Helpers ----------
function formatJoined(ts?: any): string {
  if (!ts) return "—";
  try {
    const d =
      typeof ts?.toDate === "function"
        ? ts.toDate()
        : ts?.seconds
        ? new Date(ts.seconds * 1000)
        : new Date(ts);
    return d.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return "—";
  }
}

function GoldDivider() {
  return (
    <Box
      sx={{
        height: 2,
        borderRadius: 999,
        background:
          "linear-gradient(90deg, rgba(255,214,0,.45), rgba(255,214,0,0) 35%, rgba(255,214,0,.45) 65%, rgba(255,214,0,0))",
        opacity: 0.7,
      }}
    />
  );
}

function LeagueIcon({ league }: { league: string }) {
  const L = league.toUpperCase();
  if (L === "NFL") return <SportsFootballIcon fontSize="small" />;
  if (L === "NBA") return <SportsBasketballIcon fontSize="small" />;
  if (L === "NHL") return <SportsHockeyIcon fontSize="small" />;
  if (L === "MLB") return <SportsBaseballIcon fontSize="small" />;
  if (L === "CFB" || L === "NCAAF") return <SportsIcon fontSize="small" />;
  return <ShieldOutlinedIcon fontSize="small" />;
}

function sportKeyForLeague(league: string) {
  const L = league.toUpperCase();
  if (L === "NFL") return "nfl";
  if (L === "CFB" || L === "NCAAF") return "ncaaf";
  if (L === "NBA") return "nba";
  if (L === "NHL") return "nhl";
  if (L === "MLB") return "mlb";
  return "nfl";
}

function inferViewAndMarket(
  ln: NonNullable<UserDoc["savedLines"]>[number]
): {
  view: View;
  market: Market;
} {
  const label = (ln.label || "").toLowerCase();
  if (
    label.startsWith("over") ||
    label.startsWith("under") ||
    label.includes("o/u") ||
    label.includes("total")
  ) {
    return { view: "ou", market: "Total" };
  }
  return { view: "ml", market: "Moneyline" };
}

/** Parse "Away @ Home – …" (supports -, – or — dashes) out of the saved label */
function parseTeamsFromLabel(label: string): { away?: string; home?: string } {
  if (!label) return {};
  const left = label.replace(/\s*[–—-].*$/u, "").trim();
  const parts = left.split("@");
  if (parts.length === 2) {
    return { away: parts[0].trim(), home: parts[1].trim() };
  }
  return {};
}
const norm = (s?: string) =>
  (s || "")
    .toLowerCase()
    .replace(/[\.\,\'’"]/g, "")
    .replace(/\s+/g, " ")
    .trim();

// ---------- SavedLine Mini Card ----------
function SavedLineCard({
  ln,
  game,
  onOpen,
  onRemove,
}: {
  ln: Required<SavedLineEnriched>;
  game: Game | null;
  onOpen: () => void;
  onRemove: () => void;
}) {
  const [away, home] = (game?.teams as string[]) || [];
  const kickoff = game
    ? new Date(game.commenceTime).toLocaleString(undefined, {
        weekday: "short",
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
      })
    : "TBD";

  const marketText =
    ln.label.match(/[–—-]\s*(.*)$/u)?.[1] ?? "Saved Line";

  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: 3,
        overflow: "hidden",
        position: "relative",
        border: "1px solid",
        borderColor: alpha("#FFD600", 0.22),
        background:
          "linear-gradient(180deg, rgba(20,22,27,0.95) 0%, rgba(16,18,22,0.98) 100%)",
        boxShadow: `0 0 0 1px ${alpha(
          "#000",
          0.35
        )} inset, 0 8px 24px ${alpha("#000", 0.35)}`,
      }}
    >
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 3,
          background:
            "linear-gradient(90deg,#FFD600, rgba(255,214,0,0.4))",
        }}
      />
      <CardContent sx={{ p: 1.25 }}>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          alignItems={{ xs: "flex-start", sm: "center" }}
          justifyContent="space-between"
          gap={1}
        >
          <Stack spacing={0.5} sx={{ minWidth: 0 }}>
            <Stack
              direction="row"
              alignItems="center"
              gap={1}
              sx={{ minWidth: 0 }}
            >
              <Box
                sx={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  backgroundColor: "#FFD600",
                  boxShadow: `0 0 0 2px ${alpha("#FFD600", 0.2)}`,
                  flexShrink: 0,
                }}
              />
              <Typography variant="caption" sx={{ opacity: 0.9 }} noWrap>
                {kickoff}
              </Typography>
              <Chip
                size="small"
                label={marketText}
                sx={{
                  ml: 0.5,
                  borderColor: alpha("#FFD600", 0.5),
                  color: "#FFD600",
                }}
                variant="outlined"
              />
              {ln.price && (
                <Chip
                  size="small"
                  label={ln.price}
                  sx={{
                    borderColor: alpha("#FFD600", 0.5),
                    color: "#FFD600",
                  }}
                  variant="outlined"
                />
              )}
            </Stack>

            <Typography
              variant="body2"
              sx={{ fontWeight: 800 }}
              noWrap
              title={
                away && home
                  ? `${away} @ ${home}`
                  : ln.label.replace(/\s*[–—-].*$/u, "").trim()
              }
            >
              {away && home
                ? `${away} @ ${home}`
                : ln.label.replace(/\s*[–—-].*$/u, "").trim()}
            </Typography>
          </Stack>

          <Stack direction="row" alignItems="center" gap={1} flexShrink={0}>
            <Button
              size="small"
              onClick={onOpen}
              sx={{
                borderRadius: 999,
                px: 2,
                fontWeight: 800,
                bgcolor: "#FFD600",
                color: "#111",
                "&:hover": {
                  bgcolor: "#e6c700",
                },
                boxShadow: `0 0 0 2px ${alpha(
                  "#FFD600",
                  0.22
                )} inset`,
              }}
            >
              Open
            </Button>
            <Tooltip title="Remove">
              <IconButton
                size="small"
                onClick={onRemove}
                sx={{
                  borderRadius: 999,
                  border: "1px solid",
                  borderColor: alpha("#FFFFFF", 0.15),
                  "&:hover": {
                    backgroundColor: alpha("#ff4d4d", 0.08),
                    borderColor: alpha("#ff4d4d", 0.5),
                  },
                }}
              >
                <DeleteOutlineIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}

// ---------- Page ----------
type SavedLineEnriched = UserDoc["savedLines"] extends Array<infer U>
  ? U & { _kickoff?: number; _sport?: string }
  : never;

type BoardsMap = Record<string, Game[]>; // sport -> games

/** Odds API sportsbook catalog (US + US2 from your screenshots) */
type Book = { key: string; label: string; region: "us" | "us2"; note?: string };

const BOOK_CATALOG: Book[] = [
  { key: "betonlineag", label: "BetOnline.ag", region: "us" },
  { key: "betmgm", label: "BetMGM", region: "us" },
  { key: "betrivers", label: "BetRivers", region: "us" },
  { key: "betus", label: "BetUS", region: "us" },
  { key: "bovada", label: "Bovada", region: "us" },
  { key: "williamhill_us", label: "Caesars", region: "us" }, // Odds API key maps to Caesars
  { key: "draftkings", label: "DraftKings", region: "us" },
  { key: "fanatics", label: "Fanatics", region: "us" },
  { key: "fanduel", label: "FanDuel", region: "us" },
  { key: "lowvig", label: "LowVig.ag", region: "us" },
  { key: "mybookieag", label: "MyBookie.ag", region: "us" },
  { key: "ballybet", label: "Bally Bet", region: "us2" },
  { key: "betanysports", label: "BetAnything", region: "us2" }, // formerly BetAnySports
  { key: "betparx", label: "betPARX", region: "us2" },
  { key: "espnbet", label: "ESPN BET", region: "us2" },
  { key: "fliff", label: "Fliff", region: "us2" },
  { key: "hardrockbet", label: "Hard Rock Bet", region: "us2" },
  { key: "rebet", label: "ReBet", region: "us2" },
  { key: "bet365", label: "bet365", region: "us2" }, // commonly available on paid plans
];

/** Quick label lookup + graceful fallback */
const BOOK_LABEL_BY_KEY = BOOK_CATALOG.reduce<Record<string, string>>(
  (m, b) => {
    m[b.key] = b.label;
    return m;
  },
  {}
);
const bookLabel = (keyOrLabel: string) =>
  BOOK_LABEL_BY_KEY[keyOrLabel] || keyOrLabel;

// ---------- Component ----------
export default function AccountPage() {
  const { user, loading } = useAuth();
  const [uDoc, setUDoc] = React.useState<UserDoc | null>(null);
  const [fetching, setFetching] = React.useState(true);

  // live boards by sport (e.g., nfl -> Game[])
  const [boards, setBoards] = React.useState<BoardsMap>({});

  // modal state
  const [selectedGame, setSelectedGame] = React.useState<Game | null>(null);
  const [modalOpen, setModalOpen] = React.useState(false);
  const [loadingGame, setLoadingGame] = React.useState(false);
  const [detailView, setDetailView] = React.useState<View>("ml");
  const [market, setMarket] = React.useState<Market>("Moneyline");

  // ----- Favorite Teams modal state -----
  const [favOpen, setFavOpen] = React.useState(false);
  const [favSearch, setFavSearch] = React.useState("");
  const [favLeague, setFavLeague] =
    React.useState<"all" | "nfl" | "ncaaf">("all");
  const [availableTeams, setAvailableTeams] = React.useState<{
    nfl: string[];
    ncaaf: string[];
  }>({ nfl: [], ncaaf: [] });
  const selectedTeams = React.useMemo(
    () => new Set(uDoc?.favorites?.teams || []),
    [uDoc?.favorites?.teams]
  );

  // 🔹 Pull current preferred books from context (per-user, hydrated by BookProvider)
  const { preferredBooks, setPreferredBooks } = useBooks();

  // ----- Favorite Books modal state (store KEYS) -----
  const [booksOpen, setBooksOpen] = React.useState(false);
  const [booksSearch, setBooksSearch] = React.useState("");

  // 🔹 Use context as the source of truth for which keys are selected in the modal
  const selectedBooks = React.useMemo(
    () => new Set(preferredBooks),
    [preferredBooks]
  );

  // fetch user doc
  React.useEffect(() => {
    let alive = true;
    async function run() {
      if (!user) {
        setUDoc(null);
        setFetching(false);
        return;
      }
      setFetching(true);
      try {
        const ref = doc(db, "users", user.uid);
        const snap = await getDoc(ref);
        if (!alive) return;
        if (snap.exists()) {
          setUDoc({ uid: user.uid, ...(snap.data() as any) });
        } else {
          setUDoc({
            uid: user.uid,
            displayName: user.displayName ?? null,
            email: user.email ?? null,
          });
        }
      } catch {
        setUDoc({
          uid: user.uid,
          displayName: user.displayName ?? null,
          email: user.email ?? null,
        });
      } finally {
        if (alive) setFetching(false);
      }
    }
    run();
    return () => {
      alive = false;
    };
  }, [user]);

  // tiny helper to fetch a board & put in state (used by saved lines + favorites)
  const fetchBoard = React.useCallback(
    async (sport: "nfl" | "ncaaf") => {
      try {
        const res = await fetch(
          `/api/odds?sport=${encodeURIComponent(sport)}`,
          { cache: "no-store" }
        );
        const data = await res.json();
        const games: Game[] = Array.isArray(data?.games)
          ? data.games
          : Array.isArray(data)
          ? data
          : [];
        setBoards((prev) => ({ ...prev, [sport]: games }));
        return games;
      } catch {
        setBoards((prev) => ({ ...prev, [sport]: prev[sport] || [] }));
        return boards[sport] || [];
      }
    },
    [boards]
  );

  // fetch boards for any leagues present in saved lines
  React.useEffect(() => {
    (async () => {
      const lines = uDoc?.savedLines || [];
      const sports = Array.from(
        new Set(lines.map((ln) => sportKeyForLeague(ln.league)))
      ) as ("nfl" | "ncaaf" | string)[];
      for (const s of sports) {
        if ((s === "nfl" || s === "ncaaf") && !boards[s])
          await fetchBoard(s as "nfl" | "ncaaf");
      }
    })();
  }, [uDoc?.savedLines?.length, boards, fetchBoard]);

  // also fetch nfl/ncaaf when user has favorite teams (to render upcoming)
  React.useEffect(() => {
    const favTeams = uDoc?.favorites?.teams || [];
    if (favTeams.length === 0) return;
    (async () => {
      if (!boards.nfl) await fetchBoard("nfl");
      if (!boards.ncaaf) await fetchBoard("ncaaf");
    })();
  }, [uDoc?.favorites?.teams?.length, boards.nfl, boards.ncaaf, fetchBoard]);

  // when opening the favorites modal, build the available team lists from current boards
  const openFavModal = async () => {
    setFavOpen(true);
    let nfl = boards.nfl,
      ncaaf = boards.ncaaf;
    if (!nfl) nfl = await fetchBoard("nfl");
    if (!ncaaf) ncaaf = await fetchBoard("ncaaf");
    const uniq = (arr: string[]) =>
      Array.from(new Set(arr)).sort((a, b) => a.localeCompare(b));
    setAvailableTeams({
      nfl: uniq((nfl || []).flatMap((g) => g.teams || [])),
      ncaaf: uniq((ncaaf || []).flatMap((g) => g.teams || [])),
    });
  };

  function findGameForLine(
    ln: NonNullable<UserDoc["savedLines"]>[number]
  ): Game | null {
    const sport = sportKeyForLeague(ln.league);
    const list = boards[sport] || [];
    let found =
      list.find((g: any) => g.eventId === ln.id || g.id === ln.id) ||
      null;
    if (found) return found;
    const { away, home } = parseTeamsFromLabel(ln.label);
    if (!away || !home) return null;
    const awayN = norm(away);
    const homeN = norm(home);
    found =
      list.find((g: any) => {
        const [ga, gh] = Array.isArray(g?.teams) ? g.teams : [];
        const a = norm(ga),
          h = norm(gh);
        return (
          (a === awayN && h === homeN) || (a === homeN && h === awayN)
        );
      }) || null;
    return found;
  }

  const openSavedLine = async (
    ln: NonNullable<UserDoc["savedLines"]>[number]
  ) => {
    setLoadingGame(true);
    try {
      const inferred = inferViewAndMarket(ln);
      setDetailView(inferred.view);
      setMarket(inferred.market);
      const sport = sportKeyForLeague(ln.league) as "nfl" | "ncaaf";
      if (!boards[sport]) await fetchBoard(sport);
      const game = findGameForLine(ln);
      if (!game) {
        alert("We couldn’t find that live game on the feed right now.");
        setSelectedGame(null);
        setModalOpen(false);
        return;
      }
      setSelectedGame(game);
      setModalOpen(true);
    } catch (e) {
      console.error(e);
      setSelectedGame(null);
      setModalOpen(false);
      alert("Couldn't open that game just now. Try again in a moment.");
    } finally {
      setLoadingGame(false);
    }
  };

  const removeSavedLine = async (
    ln: NonNullable<UserDoc["savedLines"]>[number]
  ) => {
    if (!user || !uDoc) return;
    const next = (uDoc.savedLines || []).filter(
      (x) =>
        !(
          x.id === ln.id &&
          x.league === ln.league &&
          x.label === ln.label
        )
    );
    setUDoc({ ...uDoc, savedLines: next });
    try {
      const ref = doc(db, "users", user.uid);
      await updateDoc(ref, { savedLines: next });
    } catch (e) {
      console.error(e);
      setUDoc(uDoc);
      alert("Couldn’t remove that line. Try again.");
    }
  };

  const savedLinesEnriched: Required<
    SavedLineEnriched & { _game?: Game | null }
  >[] = React.useMemo(() => {
    const lines = uDoc?.savedLines || [];
    const out = lines.map((ln) => {
      const sport = sportKeyForLeague(ln.league);
      const g = findGameForLine(ln);
      const kickoff = g
        ? new Date(g.commenceTime).getTime()
        : Number.POSITIVE_INFINITY;
      return {
        ...ln,
        _kickoff: kickoff,
        _sport: sport,
        _game: g ?? null,
      } as any;
    });
    out.sort((a, b) => a._kickoff - b._kickoff);
    return out as any;
  }, [uDoc?.savedLines, boards]);

  // ----- Upcoming (9 days) for favorite teams -----
  const favoriteUpcoming: Game[] = React.useMemo(() => {
    const favs = (uDoc?.favorites?.teams || []).map((t) =>
      t.toLowerCase()
    );
    if (favs.length === 0) return [];
    const now = Date.now();
    const horizon = 9 * 24 * 60 * 60 * 1000;
    const candidates = [...(boards.nfl || []), ...(boards.ncaaf || [])];
    const matchesFav = (g: Game) =>
      (g.teams || []).some((t) =>
        favs.includes((t || "").toLowerCase())
      );
    const within = (g: Game) => {
      const t = Date.parse((g as any).commenceTime || "");
      return (
        Number.isFinite(t) && t >= now && t <= now + horizon
      );
    };
    return candidates
      .filter((g) => within(g) && matchesFav(g))
      .sort(
        (a, b) =>
          Date.parse((a as any).commenceTime) -
          Date.parse((b as any).commenceTime)
      )
      .slice(0, 12);
  }, [uDoc?.favorites?.teams, boards.nfl, boards.ncaaf]);

  // Not signed in
  if (!loading && !user) {
    return (
      <Box
        sx={{
          minHeight: "50vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          px: 2,
        }}
      >
        <Card
          variant="outlined"
          sx={{
            maxWidth: 560,
            width: "100%",
            borderRadius: 4,
            backgroundColor: alpha("#FFFFFF", 0.03),
            border: `1px solid ${alpha("#FFFFFF", 0.1)}`,
            backdropFilter: "blur(8px)",
          }}
        >
          <CardContent>
            <Stack spacing={2} alignItems="center" textAlign="center">
              <Typography
                variant="h5"
                sx={{ fontWeight: 900 }}
              >
                You’re not signed in
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.8 }}>
                Sign in to personalize your board, save lines, and
                track your favorites.
              </Typography>
              <Stack direction="row" spacing={1.5} sx={{ pt: 1 }}>
                <Button
                  component={Link}
                  href="/auth"
                  variant="contained"
                  sx={{ borderRadius: 999 }}
                >
                  Sign In
                </Button>
                <Button
                  component={Link}
                  href="/auth"
                  variant="outlined"
                  sx={{ borderRadius: 999 }}
                >
                  Create Account
                </Button>
              </Stack>
            </Stack>
          </CardContent>
        </Card>
      </Box>
    );
  }

  return (
    <Stack spacing={3}>
      {/* Page Title */}
      <Stack
        spacing={1}
        alignItems="center"
        textAlign="center"
      >
        <Typography
          variant="overline"
          sx={{ letterSpacing: 2, opacity: 0.8 }}
        >
          BetMaxx
        </Typography>
        <Typography
          variant="h4"
          sx={{ fontWeight: 900, lineHeight: 1.1 }}
        >
          Your Account
        </Typography>
        <Typography variant="body2" sx={{ opacity: 0.8 }}>
          Customize your experience. Save what matters. Win smarter.
        </Typography>
      </Stack>

      <GoldDivider />

      <Grid container spacing={2}>
        {/* Profile / Overview */}
        <Grid item xs={12} md={5}>
          <Card
            variant="outlined"
            sx={{
              borderRadius: 4,
              height: "100%",
              backgroundColor: alpha("#FFFFFF", 0.03),
              border: `1px solid ${alpha("#FFFFFF", 0.1)}`,
            }}
          >
            <CardContent>
              <Stack direction="row" spacing={2} alignItems="center">
                <Avatar
                  sx={{
                    width: 64,
                    height: 64,
                    bgcolor: alpha("#FFD600", 0.15),
                    color: "#FFD600",
                    fontWeight: 800,
                  }}
                >
                  {uDoc?.displayName?.charAt(0)?.toUpperCase() ||
                    uDoc?.email?.charAt(0)?.toUpperCase() ||
                    "U"}
                </Avatar>
                <Stack spacing={0.25}>
                  <Typography
                    variant="h6"
                    sx={{ fontWeight: 800 }}
                  >
                    {uDoc?.displayName || "New User"}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.8 }}>
                    {uDoc?.email || "—"}
                  </Typography>
                </Stack>
                <Box sx={{ ml: "auto" }}>
                  <Tooltip title="Edit profile (soon)">
                    <span>
                      <IconButton disabled>
                        <EditIcon />
                      </IconButton>
                    </span>
                  </Tooltip>
                </Box>
              </Stack>

              <Stack
                direction="row"
                spacing={1}
                sx={{ mt: 2, flexWrap: "wrap" }}
              >
                <Chip
                  size="small"
                  label={`Joined: ${formatJoined(
                    uDoc?.createdAt
                  )}`}
                  variant="outlined"
                />
                <Chip
                  size="small"
                  label="Beta Access"
                  variant="outlined"
                />
              </Stack>

              <Divider
                sx={{
                  my: 2,
                  borderColor: alpha("#FFFFFF", 0.14),
                }}
              />

              <Stack spacing={1}>
                <Typography
                  variant="subtitle2"
                  sx={{ opacity: 0.8 }}
                >
                  Quick Links
                </Typography>
                <Stack direction="row" spacing={1}>
                  <Button
                    component={Link}
                    href="/nfl"
                    variant="outlined"
                    size="small"
                    sx={{ borderRadius: 999 }}
                  >
                    NFL Odds
                  </Button>
                  <Button
                    component={Link}
                    href="/cfb"
                    variant="outlined"
                    size="small"
                    sx={{ borderRadius: 999 }}
                  >
                    CFB Odds
                  </Button>
                  <Button
                    component={Link}
                    href="/"
                    variant="outlined"
                    size="small"
                    sx={{ borderRadius: 999 }}
                  >
                    Home
                  </Button>
                </Stack>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Favorites / Saved */}
        <Grid item xs={12} md={7}>
          <Stack spacing={2}>
            {/* Favorite Teams */}
            <Card
              variant="outlined"
              sx={{
                borderRadius: 4,
                backgroundColor: alpha("#FFFFFF", 0.03),
                border: `1px solid ${alpha("#FFFFFF", 0.1)}`,
              }}
            >
              <CardContent>
                <Stack
                  direction="row"
                  alignItems="center"
                  justifyContent="space-between"
                  mb={1}
                >
                  <Stack
                    direction="row"
                    spacing={1}
                    alignItems="center"
                  >
                    <FavoriteBorderIcon fontSize="small" />
                    <Typography
                      variant="h6"
                      sx={{ fontWeight: 800 }}
                    >
                      Favorite Teams
                    </Typography>
                  </Stack>
                  <Stack direction="row" spacing={1}>
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<AddIcon />}
                      sx={{ borderRadius: 999 }}
                      onClick={openFavModal}
                    >
                      Manage
                    </Button>
                  </Stack>
                </Stack>

                {fetching ? (
                  <Typography
                    variant="body2"
                    sx={{ opacity: 0.7 }}
                  >
                    Loading…
                  </Typography>
                ) : (uDoc?.favorites?.teams?.length ?? 0) > 0 ? (
                  <Stack spacing={1.5}>
                    <Stack
                      direction="row"
                      spacing={1}
                      flexWrap="wrap"
                    >
                      {uDoc!.favorites!.teams!.map((t) => (
                        <Chip
                          key={t}
                          label={t}
                          variant="outlined"
                        />
                      ))}
                    </Stack>

                    <Divider
                      sx={{
                        borderColor: alpha("#FFFFFF", 0.14),
                      }}
                    />
                    <Typography
                      variant="subtitle2"
                      sx={{ opacity: 0.8 }}
                    >
                      Upcoming (next 9 days)
                    </Typography>

                    {favoriteUpcoming.length > 0 ? (
                      <Stack spacing={1}>
                        {favoriteUpcoming.map((g) => {
                          const [away, home] = g.teams || [];
                          const when = new Date(
                            (g as any).commenceTime
                          ).toLocaleString(undefined, {
                            weekday: "short",
                            month: "short",
                            day: "numeric",
                            hour: "numeric",
                            minute: "2-digit",
                          });
                          const league =
                            (g as any).league ||
                            (g as any).sportKey ||
                            "";
                          return (
                            <Card
                              key={g.eventId}
                              variant="outlined"
                              sx={{
                                borderRadius: 2,
                                borderColor: alpha(
                                  "#FFD600",
                                  0.2
                                ),
                                background:
                                  "linear-gradient(180deg, rgba(17,20,26,0.9), rgba(14,16,20,0.96))",
                              }}
                            >
                              <CardContent
                                sx={{
                                  py: 1.25,
                                  px: 1.5,
                                }}
                              >
                                <Stack
                                  direction="row"
                                  alignItems="center"
                                  justifyContent="space-between"
                                  gap={2}
                                >
                                  <Stack
                                    spacing={0.25}
                                    sx={{ minWidth: 0 }}
                                  >
                                    <Typography
                                      variant="caption"
                                      sx={{ opacity: 0.8 }}
                                    >
                                      {String(
                                        league
                                      ).toUpperCase()}{" "}
                                      · {when}
                                    </Typography>
                                    <Typography
                                      variant="body2"
                                      sx={{
                                        fontWeight: 800,
                                      }}
                                      noWrap
                                    >
                                      {away} @ {home}
                                    </Typography>
                                  </Stack>
                                  <Button
                                    component={Link}
                                    href={
                                      sportKeyForLeague(
                                        league
                                      ) === "ncaaf"
                                        ? `/cfb?game=${g.eventId}`
                                        : `/nfl?game=${g.eventId}`
                                    }
                                    size="small"
                                    variant="contained"
                                    sx={{
                                      borderRadius: 999,
                                    }}
                                  >
                                    View Odds
                                  </Button>
                                </Stack>
                              </CardContent>
                            </Card>
                          );
                        })}
                      </Stack>
                    ) : (
                      <Typography
                        variant="body2"
                        sx={{ opacity: 0.7 }}
                      >
                        No games found for your teams in the
                        next 9 days.
                      </Typography>
                    )}
                  </Stack>
                ) : (
                  <EmptyNote
                    icon={<StarBorderIcon />}
                    title="No favorites yet"
                    body="Pick teams to surface their games across BetMaxx."
                    ctaText="Browse NFL"
                    ctaHref="/nfl"
                  />
                )}
              </CardContent>
            </Card>

            {/* Saved Lines */}
            <Card
              variant="outlined"
              sx={{
                borderRadius: 4,
                backgroundColor: alpha("#FFFFFF", 0.03),
                border: `1px solid ${alpha("#FFFFFF", 0.1)}`,
              }}
            >
              <CardContent>
                <Stack
                  direction="row"
                  alignItems="center"
                  justifyContent="space-between"
                  mb={1}
                >
                  <Stack
                    direction="row"
                    spacing={1}
                    alignItems="center"
                  >
                    <Typography
                      variant="h6"
                      sx={{ fontWeight: 800 }}
                    >
                      Saved Lines
                    </Typography>
                  </Stack>
                  {loadingGame && (
                    <CircularProgress size={18} />
                  )}
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<AddIcon />}
                    disabled
                    sx={{ borderRadius: 999 }}
                  >
                    Add Line
                  </Button>
                </Stack>

                {fetching ? (
                  <Typography
                    variant="body2"
                    sx={{ opacity: 0.7 }}
                  >
                    Loading…
                  </Typography>
                ) : (uDoc?.savedLines?.length ?? 0) > 0 ? (
                  <Stack spacing={1}>
                    {savedLinesEnriched.map((ln) => (
                      <SavedLineCard
                        key={`${ln.league}:${ln.id}:${ln.label}`}
                        ln={ln as any}
                        game={ln._game || null}
                        onOpen={() => openSavedLine(ln)}
                        onRemove={() => removeSavedLine(ln)}
                      />
                    ))}
                  </Stack>
                ) : (
                  <EmptyNote
                    icon={<SportsFootballIcon />}
                    title="No saved lines yet"
                    body="Save a moneyline or total you’re tracking to find it fast later."
                    ctaText="View Today’s Games"
                    ctaHref="/nfl"
                  />
                )}
              </CardContent>
            </Card>

            {/* Favorite Books */}
            <Card
              variant="outlined"
              sx={{
                borderRadius: 4,
                backgroundColor: alpha("#FFFFFF", 0.03),
                border: `1px solid ${alpha("#FFFFFF", 0.1)}`,
              }}
            >
              <CardContent>
                <Stack
                  direction="row"
                  alignItems="center"
                  justifyContent="space-between"
                  mb={1}
                >
                  <Stack
                    direction="row"
                    spacing={1}
                    alignItems="center"
                  >
                    <ShieldOutlinedIcon fontSize="small" />
                    <Typography
                      variant="h6"
                      sx={{ fontWeight: 800 }}
                    >
                      My Books
                    </Typography>
                  </Stack>
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<AddIcon />}
                    sx={{ borderRadius: 999 }}
                    onClick={() => setBooksOpen(true)}
                  >
                    Manage
                  </Button>
                </Stack>

                {(uDoc?.favorites?.books?.length ?? 0) > 0 ? (
                  <Stack
                    direction="row"
                    spacing={1}
                    flexWrap="wrap"
                  >
                    {uDoc!.favorites!.books!.map((bk) => (
                      <Chip
                        key={bk}
                        label={bookLabel(bk)}
                        variant="outlined"
                      />
                    ))}
                  </Stack>
                ) : (
                  <EmptyNote
                    icon={<ShieldOutlinedIcon />}
                    title="No saved books yet"
                    body="Pick your preferred sportsbooks to highlight their lines first."
                    ctaText="Set Preferences"
                    ctaHref="/account"
                  />
                )}
              </CardContent>
            </Card>
          </Stack>
        </Grid>
      </Grid>

      {/* Saved-line modal */}
      <GameDetail
        game={selectedGame}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        market={market}
        detailView={detailView}
      />

      {/* Favorite Teams Modal */}
      <FavoriteTeamsModal
        open={favOpen}
        onClose={() => setFavOpen(false)}
        league={favLeague}
        onLeagueChange={(v) => setFavLeague(v)}
        search={favSearch}
        onSearch={setFavSearch}
        available={availableTeams}
        selected={selectedTeams}
        onToggleTeam={async (team) => {
          if (!uDoc || !user) return;
          const current = new Set(uDoc.favorites?.teams || []);
          if (current.has(team)) current.delete(team);
          else current.add(team);
          const next = Array.from(current);
          setUDoc({
            ...uDoc,
            favorites: { ...(uDoc.favorites || {}), teams: next },
          });
          try {
            const ref = doc(db, "users", user.uid);
            await updateDoc(ref, {
              favorites: { ...(uDoc.favorites || {}), teams: next },
            });
          } catch (e) {
            console.error(e);
          }
        }}
      />

      {/* Favorite Books Modal (stores KEYS) */}
      <FavoriteBooksModal
        open={booksOpen}
        onClose={() => setBooksOpen(false)}
        search={booksSearch}
        onSearch={setBooksSearch}
        catalog={BOOK_CATALOG}
        selectedKeys={selectedBooks}
        onToggleKey={async (key) => {
          if (!uDoc || !user) return;

          // base off current context value so everything is in sync
          const current = new Set(preferredBooks);
          if (current.has(key)) current.delete(key);
          else current.add(key);
          const next = Array.from(current).sort();

          // update Firestore favorites.books
          const nextFavorites = {
            ...(uDoc.favorites || {}),
            books: next,
          };
          setUDoc({ ...uDoc, favorites: nextFavorites });
          try {
            const ref = doc(db, "users", user.uid);
            await updateDoc(ref, { favorites: nextFavorites });
          } catch (e) {
            console.error(e);
          }

          // update global per-user books via context
          setPreferredBooks(next);

          // 🔁 ALSO persist to localStorage + fire event so odds pages survive hard refresh
          try {
            localStorage.setItem("betmaxx:books", JSON.stringify(next));
          } catch {}
          try {
            window.dispatchEvent(
              new CustomEvent("betmaxx:books:update", {
                detail: { books: next },
              })
            );
          } catch {}
        }}
        onSelectAll={async () => {
          if (!uDoc || !user) return;
          const next = BOOK_CATALOG.map((b) => b.key).sort();

          const nextFavorites = {
            ...(uDoc.favorites || {}),
            books: next,
          };
          setUDoc({ ...uDoc, favorites: nextFavorites });
          try {
            const ref = doc(db, "users", user.uid);
            await updateDoc(ref, { favorites: nextFavorites });
          } catch (e) {
            console.error(e);
          }

          setPreferredBooks(next);

          // persist + broadcast
          try {
            localStorage.setItem("betmaxx:books", JSON.stringify(next));
          } catch {}
          try {
            window.dispatchEvent(
              new CustomEvent("betmaxx:books:update", {
                detail: { books: next },
              })
            );
          } catch {}
        }}
        onClearAll={async () => {
          if (!uDoc || !user) return;
          const next: string[] = [];
          const nextFavorites = {
            ...(uDoc.favorites || {}),
            books: next,
          };
          setUDoc({ ...uDoc, favorites: nextFavorites });
          try {
            const ref = doc(db, "users", user.uid);
            await updateDoc(ref, { favorites: nextFavorites });
          } catch (e) {
            console.error(e);
          }

          setPreferredBooks(next);

          // persist + broadcast
          try {
            localStorage.setItem("betmaxx:books", JSON.stringify(next));
          } catch {}
          try {
            window.dispatchEvent(
              new CustomEvent("betmaxx:books:update", {
                detail: { books: next },
              })
            );
          } catch {}
        }}
      />
    </Stack>
  );
}

// ---------- Favorite Teams Modal ----------
function FavoriteTeamsModal({
  open,
  onClose,
  league,
  onLeagueChange,
  search,
  onSearch,
  available,
  selected,
  onToggleTeam,
}: {
  open: boolean;
  onClose: () => void;
  league: "all" | "nfl" | "ncaaf";
  onLeagueChange: (v: "all" | "nfl" | "ncaaf") => void;
  search: string;
  onSearch: (s: string) => void;
  available: { nfl: string[]; ncaaf: string[] };
  selected: Set<string>;
  onToggleTeam: (team: string) => void | Promise<void>;
}) {
  const all =
    league === "nfl"
      ? available.nfl
      : league === "ncaaf"
      ? available.ncaaf
      : [...available.nfl, ...available.ncaaf];
  const q = search.toLowerCase();
  const filtered = all.filter((t) =>
    t.toLowerCase().includes(q)
  );

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ fontWeight: 800 }}>
        Select Favorite Teams
      </DialogTitle>
      <DialogContent dividers>
        <Stack spacing={1.5}>
          <ToggleButtonGroup
            exclusive
            value={league}
            onChange={(_, v) => v && onLeagueChange(v)}
            size="small"
            sx={{ alignSelf: "flex-start" }}
          >
            <ToggleButton value="all">All</ToggleButton>
            <ToggleButton value="nfl">NFL</ToggleButton>
            <ToggleButton value="ncaaf">CFB</ToggleButton>
          </ToggleButtonGroup>

          <TextField
            value={search}
            onChange={(e) => onSearch(e.target.value)}
            placeholder="Search teams…"
            fullWidth
            size="small"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            }}
          />

          <Box
            sx={{
              maxHeight: 380,
              overflowY: "auto",
              pr: 1,
              "::-webkit-scrollbar": { width: 8 },
              "::-webkit-scrollbar-thumb": {
                background: alpha("#000", 0.2),
                borderRadius: 999,
              },
            }}
          >
            <Stack spacing={0.5}>
              {filtered.length === 0 ? (
                <Typography
                  variant="body2"
                  sx={{ opacity: 0.7 }}
                >
                  No teams match your search.
                </Typography>
              ) : (
                filtered.map((team) => (
                  <FormControlLabel
                    key={team}
                    control={
                      <Checkbox
                        checked={selected.has(team)}
                        onChange={() => onToggleTeam(team)}
                        sx={{ mr: 1 }}
                      />
                    }
                    label={team}
                  />
                ))
              )}
            </Stack>
          </Box>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button
          onClick={onClose}
          variant="contained"
          sx={{ borderRadius: 999 }}
        >
          Done
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// ---------- Favorite Books Modal (keys + labels) ----------
function FavoriteBooksModal({
  open,
  onClose,
  search,
  onSearch,
  catalog,
  selectedKeys,
  onToggleKey,
  onSelectAll,
  onClearAll,
}: {
  open: boolean;
  onClose: () => void;
  search: string;
  onSearch: (s: string) => void;
  catalog: {
    key: string;
    label: string;
    region: "us" | "us2";
    note?: string;
  }[];
  selectedKeys: Set<string>;
  onToggleKey: (key: string) => void | Promise<void>;
  onSelectAll: () => void | Promise<void>;
  onClearAll: () => void | Promise<void>;
}) {
  const q = search.toLowerCase();
  const filtered = catalog.filter(
    (b) =>
      b.label.toLowerCase().includes(q) ||
      b.key.toLowerCase().includes(q)
  );

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ fontWeight: 800 }}>
        Select Your Sportsbooks
      </DialogTitle>
      <DialogContent dividers>
        <Stack spacing={1.5}>
          <TextField
            value={search}
            onChange={(e) => onSearch(e.target.value)}
            placeholder="Search sportsbooks…"
            fullWidth
            size="small"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            }}
          />

          <Stack direction="row" spacing={1}>
            <Button
              size="small"
              variant="outlined"
              onClick={onSelectAll}
              sx={{ borderRadius: 999 }}
            >
              Select All
            </Button>
            <Button
              size="small"
              variant="text"
              onClick={onClearAll}
              sx={{ borderRadius: 999 }}
            >
              Clear
            </Button>
          </Stack>

          <Box
            sx={{
              maxHeight: 380,
              overflowY: "auto",
              pr: 1,
              "::-webkit-scrollbar": { width: 8 },
              "::-webkit-scrollbar-thumb": {
                background: alpha("#000", 0.2),
                borderRadius: 999,
              },
            }}
          >
            <Stack spacing={0.5}>
              {filtered.length === 0 ? (
                <Typography
                  variant="body2"
                  sx={{ opacity: 0.7 }}
                >
                  No sportsbooks match your search.
                </Typography>
              ) : (
                filtered.map((b) => (
                  <FormControlLabel
                    key={b.key}
                    control={
                      <Checkbox
                        checked={selectedKeys.has(b.key)}
                        onChange={() => onToggleKey(b.key)}
                        sx={{ mr: 1 }}
                      />
                    }
                    label={`${b.label}${
                      b.note ? " • " + b.note : ""
                    }`}
                  />
                ))
              )}
            </Stack>
          </Box>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button
          onClick={onClose}
          variant="contained"
          sx={{ borderRadius: 999 }}
        >
          Done
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// ---------- Reusable Empty State ----------
function EmptyNote({
  icon,
  title,
  body,
  ctaText,
  ctaHref,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
  ctaText: string;
  ctaHref: string;
}) {
  return (
    <Stack
      alignItems="center"
      justifyContent="center"
      spacing={1}
      sx={{
        border: "1px dashed",
        borderColor: alpha("#FFFFFF", 0.16),
        borderRadius: 3,
        py: 3,
        px: 2,
        textAlign: "center",
      }}
    >
      <Box sx={{ opacity: 0.8 }}>{icon}</Box>
      <Typography
        variant="subtitle1"
        sx={{ fontWeight: 700 }}
      >
        {title}
      </Typography>
      <Typography
        variant="body2"
        sx={{ opacity: 0.75, maxWidth: 520 }}
      >
        {body}
      </Typography>
      <Button
        component={Link}
        href={ctaHref}
        size="small"
        variant="outlined"
        sx={{ borderRadius: 999, mt: 0.5 }}
      >
        {ctaText}
      </Button>
    </Stack>
  );
}
