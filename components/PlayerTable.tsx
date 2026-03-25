"use client";

import { useState } from "react";
import type { PlayerWithStats, SortColumn, SortState } from "@/lib/types";
import { computeBest } from "@/lib/tableHelpers";
import TableHeader from "./TableHeader";
import PlayerRow from "./PlayerRow";

// Initial widths (px) for: Player, Last Game, MIN, PTS, REB, AST, STL, BLK, FG%, 3P%, FT%, Last 5
const INITIAL_WIDTHS = [160, 160, 72, 72, 72, 72, 72, 72, 80, 80, 80, 80];

type Props = {
  players: PlayerWithStats[];
  sortState: SortState;
  onSort: (column: SortColumn) => void;
};

export default function PlayerTable({ players, sortState, onSort }: Props) {
  const best = computeBest(players);
  const [colWidths, setColWidths] = useState(INITIAL_WIDTHS);

  function handleResize(index: number, newWidth: number) {
    setColWidths((prev) => prev.map((w, i) => (i === index ? Math.max(40, newWidth) : w)));
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
      <table
        className="text-sm"
        style={{ tableLayout: "fixed", width: colWidths.reduce((a, b) => a + b, 0) }}
      >
        <colgroup>
          {colWidths.map((w, i) => <col key={i} style={{ width: w }} />)}
        </colgroup>
        <TableHeader sortState={sortState} onSort={onSort} colWidths={colWidths} onColResize={handleResize} />
        <tbody className="divide-y divide-gray-100">
          {players.map((player, index) => (
            <PlayerRow key={player.id} player={player} isEven={index % 2 === 0} best={best} />
          ))}
        </tbody>
      </table>
    </div>
  );
}
