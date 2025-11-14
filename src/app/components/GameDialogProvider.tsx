// src/app/components/GameDialogProvider.tsx
"use client";

import * as React from "react";
import GameDetail from "../components/GameDetail";
import type { Game } from "../api/odds/route";

type DetailView = "all" | "ml" | "ou";
type Market = "Moneyline" | "Total";

type OpenOpts = {
  detailView: DetailView; // "all" | "ml" | "ou"
  market: Market;         // "Moneyline" | "Total"
};

type Ctx = {
  openWithGame: (game: Game, opts: OpenOpts) => void;
  close: () => void;
};

const GameDialogContext = React.createContext<Ctx | null>(null);

export function useGameDialog() {
  const ctx = React.useContext(GameDialogContext);
  if (!ctx) {
    throw new Error("useGameDialog must be used inside <GameDialogProvider>");
  }
  return ctx;
}

export default function GameDialogProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [open, setOpen] = React.useState(false);
  const [game, setGame] = React.useState<Game | null>(null);
  const [detailView, setDetailView] = React.useState<DetailView>("all");
  const [market, setMarket] = React.useState<Market>("Moneyline");

  const openWithGame = React.useCallback((g: Game, opts: OpenOpts) => {
    setGame(g);
    setDetailView(opts.detailView);
    setMarket(opts.market);
    setOpen(true);
  }, []);

  const close = React.useCallback(() => {
    setOpen(false);
    setGame(null);
  }, []);

  const value = React.useMemo(
    () => ({ openWithGame, close }),
    [openWithGame, close]
  );

  return (
    <GameDialogContext.Provider value={value}>
      {children}

      {/* Render the modal only when a game is selected */}
      {game && (
        <GameDetail
          game={game}
          open={open}
          onClose={close}
          market={market}
          detailView={detailView}
        />
      )}
    </GameDialogContext.Provider>
  );
}
