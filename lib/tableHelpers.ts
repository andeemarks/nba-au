import type { PlayerStats, PlayerWithStats } from "@/lib/types";

const STAT_KEYS = ["min", "pts", "reb", "ast", "stl", "blk", "fgPct", "fg3Pct", "ftPct"] as const;

type StatBests = { [K in keyof PlayerStats]: number | null };
export type BestValues = { season: StatBests; lastGame: StatBests };

export function lgCls(v: number | null, best: number | null): string {
  return v !== null && v === best ? "text-emerald-500 font-semibold" : "text-gray-700";
}

export function seasonCls(v: number | null, best: number | null): string {
  return `text-xs ${v !== null && v === best ? "text-amber-500 font-semibold" : "text-gray-400"}`;
}

export function computeBest(players: PlayerWithStats[]): BestValues {
  function maxPerKey(getter: (p: PlayerWithStats) => PlayerStats | null): StatBests {
    return Object.fromEntries(
      STAT_KEYS.map((k) => {
        const vals = players.map((p) => getter(p)?.[k] ?? null).filter((v): v is number => v !== null);
        return [k, vals.length ? Math.max(...vals) : null];
      })
    ) as StatBests;
  }
  return { season: maxPerKey((p) => p.stats), lastGame: maxPerKey((p) => p.lastGameStats) };
}
