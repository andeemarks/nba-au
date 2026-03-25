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
  colWidths: number[];
  onColResize: (index: number, newWidth: number) => void;
};

function startResize(e: React.MouseEvent, colIndex: number, currentWidth: number, onColResize: Props["onColResize"]) {
  e.preventDefault();
  const startX = e.clientX;
  const onMove = (ev: MouseEvent) => onColResize(colIndex, currentWidth + ev.clientX - startX);
  const onUp = () => {
    document.removeEventListener("mousemove", onMove);
    document.removeEventListener("mouseup", onUp);
  };
  document.addEventListener("mousemove", onMove);
  document.addEventListener("mouseup", onUp);
}

export default function TableHeader({ sortState, onSort, colWidths, onColResize }: Props) {
  return (
    <thead>
      <tr className="bg-gray-900 text-white">
        {COLUMNS.map(({ key, label }, i) => (
          <th
            key={key}
            onClick={() => onSort(key)}
            className={`
              px-4 py-3 text-left text-sm font-semibold cursor-pointer select-none
              relative overflow-hidden hover:bg-gray-700 transition-colors
              ${key === "name" ? "sticky left-0 z-10 bg-gray-900" : ""}
            `}
          >
            <span className="flex items-center gap-1 whitespace-nowrap">
              {label}
              {sortState.column === key && (
                <span className="text-blue-400">
                  {sortState.direction === "desc" ? "▼" : "▲"}
                </span>
              )}
            </span>
            <div
              className="absolute right-0 top-0 h-full w-1 cursor-col-resize opacity-0 hover:opacity-100 hover:bg-blue-400"
              onClick={(e) => e.stopPropagation()}
              onMouseDown={(e) => { e.stopPropagation(); startResize(e, i, colWidths[i], onColResize); }}
            />
          </th>
        ))}
        <th className="px-4 py-3 text-left text-sm font-semibold relative overflow-hidden">
          <span className="whitespace-nowrap">Last 5</span>
          <div
            className="absolute right-0 top-0 h-full w-1 cursor-col-resize opacity-0 hover:opacity-100 hover:bg-blue-400"
            onMouseDown={(e) => startResize(e, COLUMNS.length, colWidths[COLUMNS.length], onColResize)}
          />
        </th>
      </tr>
    </thead>
  );
}

export { COLUMNS };
