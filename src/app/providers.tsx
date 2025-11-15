// src/app/providers.tsx
"use client";

import * as React from "react";
import { ThemeProvider } from "@mui/material/styles";
import { CssBaseline, Container } from "@mui/material";
import theme from "./theme";
import Header from "./components/Header";

import { onAuthStateChanged, User } from "firebase/auth";
import { auth, db } from "../firebase"; // ✅ auth + db from firebase

// Firestore helpers for usage tracking
import { doc, setDoc, serverTimestamp, increment } from "firebase/firestore";

// Shared modal provider
import GameDialogProvider from "./components/GameDialogProvider";

// 🔹 Books provider (preferred sportsbooks, per user)
import { BooksProvider } from "../app/contexts/BookProvider";

// --- Auth Context ---
type AuthCtx = { user: User | null; loading: boolean };
export const AuthContext = React.createContext<AuthCtx>({
  user: null,
  loading: true,
});
export const useAuth = () => React.useContext(AuthContext);

// --- Providers Wrapper ---
export default function Providers({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<User | null>(null);
  const [loading, setLoading] = React.useState(true);

  // 🔐 Auth listener
  React.useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u || null);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  // 🔹 Track basic usage per *signed-in* user: totalVisits + lastActiveAt
  React.useEffect(() => {
    if (loading) return;
    if (!user) return;

    const ref = doc(db, "users", user.uid);

    setDoc(
      ref,
      {
        stats: {
          lastActiveAt: serverTimestamp(),
        },
        "stats.totalVisits": increment(1),
      } as any,
      { merge: true }
    ).catch((e) => {
      console.error("Failed to update user usage stats", e);
    });
  }, [user?.uid, loading]);

  // 🔹 Track anonymous usage (visitors who are NOT signed in)
  React.useEffect(() => {
    if (loading) return;
    if (user) return; // only run for non-authenticated visitors
    if (typeof window === "undefined") return;

    try {
      // Stable anonymous id stored in localStorage
      let anonId = window.localStorage.getItem("betmaxx:anonId");
      if (!anonId) {
        if ("crypto" in window && "randomUUID" in window.crypto) {
          anonId = (window.crypto as any).randomUUID();
        } else {
          anonId = Math.random().toString(36).slice(2);
        }
        // ensure it matches the rules: docId.matches("anon_.*")
        anonId = `anon_${anonId}`;
        window.localStorage.setItem("betmaxx:anonId", anonId);
      } else if (!anonId.startsWith("anon_")) {
        // normalize any old stored value
        anonId = `anon_${anonId}`;
        window.localStorage.setItem("betmaxx:anonId", anonId);
      }

      const userAgent =
        typeof navigator !== "undefined" ? navigator.userAgent : null;

      // 🔴 IMPORTANT: collection + docId must match security rules
      const ref = doc(db, "anonymousUsage", anonId);

      // 🔴 IMPORTANT: only these top-level fields are allowed by rules:
      // userAgent, ipHash, counts, createdAt, lastActiveAt
      setDoc(
        ref,
        {
          userAgent,
          ipHash: null, // placeholder; we aren't storing real IP
          createdAt: serverTimestamp(),
          lastActiveAt: serverTimestamp(),
          counts: {
            totalVisits: increment(1),
          },
        },
        { merge: true }
      ).catch((e) => {
        console.error("Failed to update anonymous usage stats", e);
      });
    } catch (e) {
      console.error("Anonymous usage tracking error", e);
    }
  }, [user, loading]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthContext.Provider value={{ user, loading }}>
        {/* 🔹 Per-user preferred books context */}
        <BooksProvider user={user}>
          {/* 🔹 Wrap Header (uses useSearchParams) in Suspense so Next is happy */}
          <React.Suspense fallback={null}>
            <Header />
          </React.Suspense>

          {/* Shared GameDetail modal + page content */}
          <GameDialogProvider>
            <Container maxWidth="lg" sx={{ py: 4 }}>
              {children}
            </Container>
          </GameDialogProvider>
        </BooksProvider>
      </AuthContext.Provider>
    </ThemeProvider>
  );
}
