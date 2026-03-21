import type { PlayerWithStats } from "@/lib/types";
import type { BestValues } from "./PlayerTable";

type Props = {
  player: PlayerWithStats;
  isEven: boolean;
  best: BestValues;
};

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

const BASE_TD = "px-4 py-3 text-right font-mono";

export function lgCls(v: number | null, best: number | null) {
  return v !== null && v === best ? "text-emerald-500 font-semibold" : "text-gray-700";
}

export function seasonCls(v: number | null, best: number | null) {
  return `text-xs ${v !== null && v === best ? "text-amber-500 font-semibold" : "text-gray-400"}`;
}

function statCell(lg: number | null, season: number | null, bestLg: number | null, bestSeason: number | null, fmt: (v: number | null) => string) {
  return (
    <>
      <div className={lgCls(lg, bestLg)}>{fmt(lg)}</div>
      <div className={seasonCls(season, bestSeason)}>{fmt(season)}</div>
    </>
  );
}

export default function PlayerRow({ player, isEven, best }: Props) {
  const { name, team, lastGame, lastGameInfo, lastGameStats, lastFive, stats } = player;
  const rowClass = isEven ? "bg-white" : "bg-gray-50";

  return (
    <tr className={`${rowClass} hover:bg-blue-50 transition-colors`}>
      <td className={`px-4 py-3 font-medium text-gray-900 sticky left-0 ${rowClass}`}>
        <div>{name}</div>
        <div className="text-xs text-gray-500">{team}</div>
      </td>
      <td className="px-4 py-3 font-mono text-gray-700 whitespace-nowrap">
        {lastGameInfo ? (
          <>
            <div className="flex items-center gap-1.5">
              <span className={`text-xs font-bold ${lastGameInfo.playerTeamWon ? "text-emerald-600" : "text-red-500"}`}>
                {lastGameInfo.playerTeamWon ? "W" : "L"}
              </span>
              <span>vs {lastGameInfo.opponentAbbr} {lastGameInfo.playerTeamScore}–{lastGameInfo.opponentScore}</span>
            </div>
            <div className="text-xs text-gray-400">{daysSinceLastGame(lastGame)}</div>
          </>
        ) : "—"}
      </td>
      <td className={BASE_TD}>{statCell(lastGameStats?.min ?? null, stats.min, null, null, formatStat)}</td>
      <td className={BASE_TD}>{statCell(lastGameStats?.pts ?? null, stats.pts, best.lastGame.pts, best.season.pts, formatStat)}</td>
      <td className={BASE_TD}>{statCell(lastGameStats?.reb ?? null, stats.reb, best.lastGame.reb, best.season.reb, formatStat)}</td>
      <td className={BASE_TD}>{statCell(lastGameStats?.ast ?? null, stats.ast, best.lastGame.ast, best.season.ast, formatStat)}</td>
      <td className={BASE_TD}>{statCell(lastGameStats?.stl ?? null, stats.stl, best.lastGame.stl, best.season.stl, formatStat)}</td>
      <td className={BASE_TD}>{statCell(lastGameStats?.blk ?? null, stats.blk, best.lastGame.blk, best.season.blk, formatStat)}</td>
      <td className={BASE_TD}>{statCell(lastGameStats?.fgPct ?? null, stats.fgPct, best.lastGame.fgPct, best.season.fgPct, formatPct)}</td>
      <td className={BASE_TD}>{statCell(lastGameStats?.fg3Pct ?? null, stats.fg3Pct, best.lastGame.fg3Pct, best.season.fg3Pct, formatPct)}</td>
      <td className={BASE_TD}>{statCell(lastGameStats?.ftPct ?? null, stats.ftPct, best.lastGame.ftPct, best.season.ftPct, formatPct)}</td>
      <td className="px-4 py-3 font-mono">
        <div className="flex gap-0.5">
          {lastFive.length === 0 ? <span className="text-gray-400">—</span> : lastFive.map((won, i) => (
            <span
              key={i}
              className={`text-xs font-bold ${won === null ? "text-gray-400" : won ? "text-emerald-600" : "text-red-500"}`}
            >
              {won === null ? "?" : won ? "W" : "L"}
            </span>
          ))}
        </div>
      </td>
    </tr>
  );
}
