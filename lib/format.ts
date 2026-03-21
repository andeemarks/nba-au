const GMT10_OFFSET_MS = 10 * 60 * 60 * 1000;

export function daysSinceLastGame(isoDate: string | null): string {
  if (!isoDate) return "—";
  const nowDay = Math.floor((Date.now() + GMT10_OFFSET_MS) / 86_400_000);
  const gameDay = Math.floor((new Date(isoDate).getTime() + GMT10_OFFSET_MS) / 86_400_000);
  const days = nowDay - gameDay;
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  return `${days} days ago`;
}

export function formatPct(value: number | null): string {
  if (value === null) return "—";
  return `${(value * 100).toFixed(1)}%`;
}

export function formatStat(value: number | null): string {
  if (value === null) return "—";
  return value.toFixed(1);
}

export function formatStatLg(value: number | null): string {
  if (value === null) return "—";
  return Number.isInteger(value) ? String(value) : value.toFixed(1);
}
