import type { PlayerWithStats, SortColumn, SortDirection } from "./types";

function getValue(player: PlayerWithStats, column: SortColumn): number | string | null {
  if (column === "name") return player.name;
  if (column === "lastGame") return player.lastGame;
  return player.lastGameStats?.[column] ?? null;
}

export function sortPlayers(
  players: PlayerWithStats[],
  column: SortColumn,
  direction: SortDirection
): PlayerWithStats[] {
  return [...players].sort((a, b) => {
    const aVal = getValue(a, column);
    const bVal = getValue(b, column);

    if (aVal === null && bVal === null) return 0;
    if (aVal === null) return 1;
    if (bVal === null) return -1;

    const comparison =
      typeof aVal === "string" && typeof bVal === "string"
        ? aVal.localeCompare(bVal)
        : (aVal as number) - (bVal as number);

    return direction === "desc" ? -comparison : comparison;
  });
}
