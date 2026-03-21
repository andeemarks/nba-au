"use client";

import type { PlayerWithStats, SortColumn, SortState } from "@/lib/types";
import { computeBest } from "@/lib/tableHelpers";
import TableHeader from "./TableHeader";
import PlayerRow from "./PlayerRow";

type Props = {
  players: PlayerWithStats[];
  sortState: SortState;
  onSort: (column: SortColumn) => void;
};

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
