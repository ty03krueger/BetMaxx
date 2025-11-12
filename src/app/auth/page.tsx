// src/app/auth/page.tsx
"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  Stack,
  TextField,
  Button,
  Typography,
  Alert,
  Divider,
  Card,
  CardContent,
  CircularProgress,
} from "@mui/material";
import { alpha } from "@mui/material/styles";

import { auth, db } from "../../firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";

import { useAuth } from "../providers";

async function ensureUserDoc(uid: string, extra?: Record<string, any>) {
  const ref = doc(db, "users", uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    await setDoc(ref, {
      uid,
      createdAt: serverTimestamp(),
      ...extra,
    });
  }
}

export default function AuthPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [mode, setMode] = React.useState<"signup" | "login">("signup");
  const [email, setEmail] = React.useState("");
  const [pass, setPass] = React.useState("");
  const [displayName, setDisplayName] = React.useState("");
  const [err, setErr] = React.useState<string | null>(null);
  const [busy, setBusy] = React.useState(false);

  const switchMode = () => {
    setErr(null);
    setMode((m) => (m === "signup" ? "login" : "signup"));
  };

  async function handleSignup() {
    setErr(null);
    setBusy(true);
    try {
      const cred = await createUserWithEmailAndPassword(auth, email.trim(), pass);
      if (displayName.trim()) {
        await updateProfile(cred.user, { displayName: displayName.trim() });
      }
      await ensureUserDoc(cred.user.uid, {
        email: cred.user.email,
        displayName: displayName.trim() || cred.user.displayName || null,
      });
      router.push("/");
    } catch (e: any) {
      setErr(e?.message || "Failed to sign up");
    } finally {
      setBusy(false);
    }
  }

  async function handleLogin() {
    setErr(null);
    setBusy(true);
    try {
      await signInWithEmailAndPassword(auth, email.trim(), pass);
      router.push("/");
    } catch (e: any) {
      setErr(e?.message || "Failed to log in");
    } finally {
      setBusy(false);
    }
  }

  async function handleLogout() {
    setErr(null);
    setBusy(true);
    try {
      await signOut(auth);
    } catch (e: any) {
      setErr(e?.message || "Failed to log out");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Box
      sx={{
        // Full-page lounge vibe that matches your brand
        minHeight: "calc(100vh - 64px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        px: { xs: 2, md: 0 },
        // Background: subtle gold glow + dark gradient
        background: `
          radial-gradient(900px 500px at 15% 50%, ${alpha("#FFD600", 0.10)}, transparent 70%),
          linear-gradient(180deg, #0A0E14 0%, #111621 100%)
        `,
      }}
    >
      <Card
        elevation={0}
        sx={{
          width: "100%",
          maxWidth: 520,
          borderRadius: 4,
          // Glass panel look
          backgroundColor: alpha("#FFFFFF", 0.04),
          backdropFilter: "blur(10px)",
          border: `1px solid ${alpha("#FFFFFF", 0.10)}`,
          boxShadow: `0 10px 30px ${alpha("#000", 0.45)}, inset 0 0 0 1px ${alpha(
            "#FFD600",
            0.06
          )}`,
        }}
      >
        <CardContent sx={{ p: { xs: 3, md: 4 } }}>
          <Stack spacing={2.5}>
            {/* Overline + Title */}
            <Stack spacing={0.5} alignItems="center" textAlign="center">
              <Typography
                variant="overline"
                sx={{ letterSpacing: 2, opacity: 0.8 }}
              >
                BetMaxx
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 900, lineHeight: 1.1 }}>
                {user
                  ? "Your Account"
                  : mode === "signup"
                  ? "Find Your Maxx"
                  : "Welcome Back"}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.8, maxWidth: 420 }}>
                {user
                  ? "Manage your profile and preferences."
                  : mode === "signup"
                  ? "One account. Faster odds, cleaner decisions."
                  : "Sign in to pick up right where you left off."}
              </Typography>
            </Stack>

            {/* Gold divider */}
            <Box
              sx={{
                height: 2,
                borderRadius: 999,
                background:
                  "linear-gradient(90deg, rgba(255,214,0,.45), rgba(255,214,0,0) 35%, rgba(255,214,0,.45) 65%, rgba(255,214,0,0))",
                opacity: 0.7,
              }}
            />

            {err && <Alert severity="error">{err}</Alert>}

            {!user ? (
              <>
                {/* Animated-ish mode swap (simple opacity) */}
                <Box
                  key={mode}
                  sx={{
                    transition: "opacity .18s ease",
                    opacity: 1,
                  }}
                >
                  <Stack spacing={1.5}>
                    {mode === "signup" && (
                      <TextField
                        label="Display name (optional)"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        autoComplete="nickname"
                        fullWidth
                        size="medium"
                      />
                    )}

                    <TextField
                      label="Email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      autoComplete="email"
                      fullWidth
                      size="medium"
                    />

                    <TextField
                      label="Password"
                      type="password"
                      value={pass}
                      onChange={(e) => setPass(e.target.value)}
                      autoComplete={mode === "signup" ? "new-password" : "current-password"}
                      fullWidth
                      size="medium"
                    />
                  </Stack>
                </Box>

                <Stack direction={{ xs: "column", sm: "row" }} spacing={1.25} pt={0.5}>
                  {mode === "signup" ? (
                    <Button
                      onClick={handleSignup}
                      variant="contained"
                      disabled={busy || loading}
                      sx={{
                        borderRadius: 999,
                        minWidth: 140,
                        boxShadow: `0 0 0 2px ${alpha("#FFD600", 0.12)} inset`,
                      }}
                      startIcon={
                        busy ? <CircularProgress size={16} sx={{ color: "#0A0E14" }} /> : null
                      }
                    >
                      {busy ? "Creating…" : "Create Account"}
                    </Button>
                  ) : (
                    <Button
                      onClick={handleLogin}
                      variant="contained"
                      disabled={busy || loading}
                      sx={{
                        borderRadius: 999,
                        minWidth: 140,
                        boxShadow: `0 0 0 2px ${alpha("#FFD600", 0.12)} inset`,
                      }}
                      startIcon={
                        busy ? <CircularProgress size={16} sx={{ color: "#0A0E14" }} /> : null
                      }
                    >
                      {busy ? "Signing in…" : "Sign In"}
                    </Button>
                  )}

                  <Button
                    onClick={switchMode}
                    disabled={busy || loading}
                    sx={{
                      borderRadius: 999,
                      px: 2,
                      color: alpha("#fff", 0.9),
                      border: `1px solid ${alpha("#FFFFFF", 0.14)}`,
                      ":hover": { borderColor: alpha("#FFD600", 0.6) },
                    }}
                    variant="outlined"
                  >
                    {mode === "signup" ? "Have an account? Sign in" : "Create account"}
                  </Button>
                </Stack>

                <Divider
                  flexItem
                  sx={{
                    my: 1.5,
                    borderColor: alpha("#FFFFFF", 0.14),
                  }}
                />
                <Typography variant="caption" sx={{ opacity: 0.75 }}>
                  By continuing you agree to our Terms of Use and acknowledge our Responsible
                  Gaming notice in the footer.
                </Typography>
              </>
            ) : (
              <>
                <Typography variant="body1" sx={{ opacity: 0.9 }}>
                  Signed in as <b>{user.email}</b>
                  {user.displayName ? ` — ${user.displayName}` : ""}
                </Typography>

                <Stack direction={{ xs: "column", sm: "row" }} spacing={1.25}>
                  <Button
                    variant="contained"
                    onClick={() => router.push("/")}
                    sx={{ borderRadius: 999 }}
                  >
                    Go to Home
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={handleLogout}
                    disabled={busy}
                    sx={{
                      borderRadius: 999,
                      borderColor: alpha("#FFFFFF", 0.18),
                      ":hover": { borderColor: alpha("#FFD600", 0.6) },
                    }}
                  >
                    Log out
                  </Button>
                </Stack>
              </>
            )}
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}
