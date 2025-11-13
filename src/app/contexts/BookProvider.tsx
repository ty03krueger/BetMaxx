// src/app/contexts/BookProvider.tsx
"use client";

import * as React from "react";
import type { User } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../firebase";

type BooksContextValue = {
  preferredBooks: string[];
  setPreferredBooks: (books: string[]) => void;
};

const BooksContext = React.createContext<BooksContextValue | undefined>(
  undefined
);

type BooksProviderProps = {
  user: User | null;
  children: React.ReactNode;
};

/**
 * BookProvider
 *
 * Per-user source of truth for preferred sportsbooks.
 * - Tied to the current Firebase user.
 * - On user change, it loads favorites.books from Firestore.
 * - Caches per-user values in localStorage as "betmaxx:books:<uid>".
 * - Also mirrors to a legacy global key "betmaxx:books" so older code can still read it.
 * - Listens for "betmaxx:books:update" and applies it for the current user.
 * - When logged out, clears preferences in context (no guest carryover).
 */
export function BooksProvider({ user, children }: BooksProviderProps) {
  const [preferredBooks, setPreferredBooksState] = React.useState<string[]>([]);

  // Hydrate whenever the authenticated user changes
  React.useEffect(() => {
    let cancelled = false;

    async function hydrateForUser() {
      const uid = user?.uid;

      // Logged out → clear preferences entirely (no guest carryover in context)
      if (!uid) {
        setPreferredBooksState([]);
        return;
      }

      if (typeof window === "undefined") return;

      const perUserKey = `betmaxx:books:${uid}`;
      const globalKey = "betmaxx:books";

      // 1) Fast path: per-user cache, then fallback to legacy global cache
      try {
        const rawPerUser = window.localStorage.getItem(perUserKey);
        if (rawPerUser) {
          const parsed = JSON.parse(rawPerUser);
          if (!cancelled && Array.isArray(parsed)) {
            setPreferredBooksState(parsed);
          }
        } else {
          // fallback to global (for older sessions)
          const rawGlobal = window.localStorage.getItem(globalKey);
          if (rawGlobal) {
            const parsed = JSON.parse(rawGlobal);
            if (!cancelled && Array.isArray(parsed)) {
              setPreferredBooksState(parsed);
              // migrate into per-user key
              window.localStorage.setItem(perUserKey, JSON.stringify(parsed));
            }
          } else if (!cancelled) {
            // nothing cached yet for this user
            setPreferredBooksState([]);
          }
        }
      } catch (e) {
        console.error("Failed to read cached books from localStorage", e);
      }

      // 2) Authoritative: Firestore favorites.books
      try {
        const ref = doc(db, "users", uid);
        const snap = await getDoc(ref);
        if (!snap.exists() || cancelled) return;

        const data = snap.data() as any;
        const favBooks: unknown = data?.favorites?.books;

        if (Array.isArray(favBooks)) {
          const cleaned = favBooks
            .filter((b) => typeof b === "string")
            .map((b) => (b as string).trim())
            .filter(Boolean);

          if (!cancelled) {
            setPreferredBooksState(cleaned);
          }

          try {
            window.localStorage.setItem(perUserKey, JSON.stringify(cleaned));
            // mirror into legacy global key for any non-context code
            window.localStorage.setItem(globalKey, JSON.stringify(cleaned));
          } catch (e) {
            console.error("Failed to cache books in localStorage", e);
          }
        }
      } catch (e) {
        console.error("Failed to load favorites.books from Firestore", e);
        if (!cancelled) {
          // keep whatever we already had from cache
        }
      }
    }

    hydrateForUser();

    return () => {
      cancelled = true;
    };
  }, [user?.uid]);

  // Listen for broadcast updates from Account page or other tabs
  React.useEffect(() => {
    if (typeof window === "undefined") return;

    const handler = (event: Event) => {
      const currentUid = user?.uid;

      // If no user is logged in, ignore updates completely
      if (!currentUid) return;

      const custom = event as CustomEvent<{ books?: string[]; uid?: string }>;
      const next = custom.detail?.books;
      const eventUid = custom.detail?.uid;

      // If this event is explicitly for another user, ignore it
      if (eventUid && eventUid !== currentUid) return;
      if (!next || !Array.isArray(next)) return;

      setPreferredBooksState(next);

      const perUserKey = `betmaxx:books:${currentUid}`;
      const globalKey = "betmaxx:books";

      try {
        window.localStorage.setItem(perUserKey, JSON.stringify(next));
        // keep legacy global in sync
        window.localStorage.setItem(globalKey, JSON.stringify(next));
      } catch (e) {
        console.error("Failed to cache books in localStorage (event)", e);
      }
    };

    window.addEventListener(
      "betmaxx:books:update",
      handler as EventListener
    );

    return () => {
      window.removeEventListener(
        "betmaxx:books:update",
        handler as EventListener
      );
    };
  }, [user?.uid]);

  // Canonical setter from inside the app (if ever needed)
  const setPreferredBooks = React.useCallback(
    (next: string[]) => {
      setPreferredBooksState(next);

      if (typeof window === "undefined") return;

      const currentUid = user?.uid;
      const globalKey = "betmaxx:books";

      if (currentUid) {
        try {
          window.localStorage.setItem(
            `betmaxx:books:${currentUid}`,
            JSON.stringify(next)
          );
        } catch (e) {
          console.error(
            "Failed to cache books in localStorage (setter)",
            e
          );
        }
      }

      // keep legacy global in sync for any older code paths
      try {
        window.localStorage.setItem(globalKey, JSON.stringify(next));
      } catch (e) {
        console.error(
          "Failed to cache global betmaxx:books in localStorage (setter)",
          e
        );
      }

      try {
        const ev = new CustomEvent("betmaxx:books:update", {
          detail: { books: next, uid: currentUid ?? undefined },
        });
        window.dispatchEvent(ev);
      } catch (e) {
        console.error("Failed to dispatch betmaxx:books:update event", e);
      }
    },
    [user?.uid]
  );

  const value = React.useMemo(
    () => ({
      preferredBooks,
      setPreferredBooks,
    }),
    [preferredBooks, setPreferredBooks]
  );

  return (
    <BooksContext.Provider value={value}>{children}</BooksContext.Provider>
  );
}

// Hook to use in any odds page / modal
export function useBooks() {
  const ctx = React.useContext(BooksContext);
  if (!ctx) {
    throw new Error("useBooks must be used within a BooksProvider");
  }
  return ctx;
}
