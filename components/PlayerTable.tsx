"use client";

import type { PlayerWithStats, PlayerStats, SortColumn, SortState } from "@/lib/types";
import TableHeader from "./TableHeader";
import PlayerRow from "./PlayerRow";

type Props = {
  players: PlayerWithStats[];
  sortState: SortState;
  onSort: (column: SortColumn) => void;
};

const STAT_KEYS = ["min", "pts", "reb", "ast", "stl", "blk", "fgPct", "fg3Pct", "ftPct"] as const;

type StatBests = { [K in keyof PlayerStats]: number | null };
export type BestValues = { season: StatBests; lastGame: StatBests };

function computeBest(players: PlayerWithStats[]): BestValues {
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

export default function PlayerTable({ players, sortState, onSort }: Props) {
  const best = computeBest(players);

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
      <table className="min-w-full text-sm">
        <TableHeader sortState={sortState} onSort={onSort} />
        <tbody className="divide-y divide-gray-100">
          {players.map((player, index) => (
            <PlayerRow key={player.id} player={player} isEven={index % 2 === 0} best={best} />
          ))}
        </tbody>
      </table>
    </div>
  );
}
