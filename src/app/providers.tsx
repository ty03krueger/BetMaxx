// src/app/providers.tsx
"use client";

import * as React from "react";
import { ThemeProvider } from "@mui/material/styles";
import { CssBaseline, Container } from "@mui/material";
import theme from "./theme";
import Header from "./components/Header";

import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "../firebase"; // ✅ ensure /src/firebase.ts exists

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

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthContext.Provider value={{ user, loading }}>
        {/* 🔹 Per-user preferred books context */}
        <BooksProvider user={user}>
          <Header />
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
