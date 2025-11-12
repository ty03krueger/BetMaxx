// src/app/utils/isFinal.ts
// Trust feed flags if present; otherwise fall back to time-based cutoff by league.

let logCount = 0; // limit console noise

const HOURS = 60 * 60 * 1000;
const LEAGUE_CUTOFF_MS: Record<string, number> = {
  NFL: 5 * HOURS,       // most games finish < 4h; add buffer
  CFB: 6 * HOURS,     // college can run longer
  NCAAF: 5.5 * HOURS,
  NBA: 3 * HOURS,
  NHL: 3 * HOURS,
  MLB: 4 * HOURS,
  // default below will catch everything else
};

export function isFinal(e: any): boolean {
  // ---- 1) log a few samples so we can see the shape while developing
  if (logCount < 8) {
    console.log("🔍 isFinal check", {
      eventId: e.eventId || e.id,
      status: e.status,
      game_status: e.game_status,
      match_status: e.match_status,
      completed: e.completed,
      commenceTime: e.commenceTime,
      league: e.league,
    });
    logCount++;
  }

  // ---- 2) direct “final” booleans / strings if they ever appear
  if (e.completed === true || e.isCompleted === true || e.is_final === true) return true;

  const raw =
    e.status ??
    e.game_status ??
    e.match_status ??
    e.gameState ??
    e.state ??
    e.stage ??
    e?.sport_event_status?.status ??
    "";

  const s = String(raw).toLowerCase().replace(/\s+/g, "_");
  if (
    s === "final" ||
    s === "finished" ||
    s === "complete" ||
    s === "completed" ||
    s === "ended" ||
    s === "ft" ||
    s === "full_time" ||
    s === "postgame" ||
    s === "closed" ||
    s === "status_final"
  ) {
    return true;
  }

  // ---- 3) fallback: use commenceTime + a conservative league cutoff
  // your objects have: commenceTime: "2025-11-10T11:15:00Z", league: "NFL"
  const startMs = Date.parse(e.commenceTime ?? e.start_time ?? e.start ?? "");
  if (Number.isFinite(startMs)) {
    const league = String(e.league ?? "").toUpperCase();
    const cutoff =
      (league && LEAGUE_CUTOFF_MS[league]) ? LEAGUE_CUTOFF_MS[league] : 4.5 * HOURS;
    if (Date.now() - startMs > cutoff) return true;
  }

  // otherwise, treat as not final
  return false;
}
