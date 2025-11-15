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

  React.useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u || null);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  // 🔹 Track basic usage per signed-in user: totalVisits + lastActiveAt
  React.useEffect(() => {
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
  }, [user?.uid]);

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
