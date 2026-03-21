"use client";

import type { SortColumn, SortState } from "@/lib/types";

type Column = {
  key: SortColumn;
  label: string;
};

const COLUMNS: Column[] = [
  { key: "name", label: "Player" },
  { key: "lastGame", label: "Last Game" },
  { key: "min", label: "MIN" },
  { key: "pts", label: "PTS" },
  { key: "reb", label: "REB" },
  { key: "ast", label: "AST" },
  { key: "stl", label: "STL" },
  { key: "blk", label: "BLK" },
  { key: "fgPct", label: "FG%" },
  { key: "fg3Pct", label: "3P%" },
  { key: "ftPct", label: "FT%" },
];

type Props = {
  sortState: SortState;
  onSort: (column: SortColumn) => void;
};

export default function TableHeader({ sortState, onSort }: Props) {
  return (
    <thead>
      <tr className="bg-gray-900 text-white">
        {COLUMNS.map(({ key, label }) => (
          <th
            key={key}
            onClick={() => onSort(key)}
            className={`
              px-4 py-3 text-left text-sm font-semibold cursor-pointer select-none
              whitespace-nowrap hover:bg-gray-700 transition-colors
              ${key === "name" ? "sticky left-0 z-10 bg-gray-900" : ""}
            `}
          >
            <span className="flex items-center gap-1">
              {label}
              {sortState.column === key && (
                <span className="text-blue-400">
                  {sortState.direction === "desc" ? "▼" : "▲"}
                </span>
              )}
            </span>
          </th>
        ))}
        <th className="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap">
          Last 5
        </th>
      </tr>
    </thead>
  );
}

export { COLUMNS };
