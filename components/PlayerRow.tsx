import type { PlayerWithStats } from "@/lib/types";
import type { BestValues } from "@/lib/tableHelpers";
import { daysSince, daysSinceLastGame, formatPct, formatStat, formatStatLg } from "@/lib/format";
import { lgCls } from "@/lib/tableHelpers";

type Props = {
  player: PlayerWithStats;
  isEven: boolean;
  best: BestValues;
};

const BASE_TD = "px-4 py-3 text-right font-mono";

function statCell(
  lg: number | null, season: number | null,
  bestLg: number | null, bestSeason: number | null,
  fmtLg: (v: number | null) => string,
  fmtSeason: (v: number | null) => string = fmtLg,
) {
  const isSeasonBest = season !== null && season === bestSeason;
  const trend = lg !== null && season !== null
    ? lg > season ? "up" : lg < season ? "down" : null
    : null;
  return (
    <div className="relative group/stat">
      <div className="flex items-center justify-end gap-0.5">
        <span className={lgCls(lg, bestLg)}>{fmtLg(lg)}</span>
        {trend === "up" && <span className="text-emerald-500 text-base leading-none">↑</span>}
        {trend === "down" && <span className="text-red-400 text-base leading-none">↓</span>}
      </div>
      {season !== null && (
        <div className={`
          absolute bottom-full right-0 mb-1 px-2 py-1 rounded
          bg-gray-800 text-white text-xs whitespace-nowrap z-30
          opacity-0 group-hover/stat:opacity-100 pointer-events-none
          transition-opacity duration-150
        `}>
          Season avg: <span className={isSeasonBest ? "text-amber-400 font-semibold" : ""}>{fmtSeason(season)}</span>
        </div>
      )}
    </div>
  );
}

export default function PlayerRow({ player, isEven, best }: Props) {
  const { name, team, lastGame, lastGameInfo, lastGameStats, lastFive, stats } = player;
  const rowClass = isEven ? "bg-white" : "bg-gray-50";
  const inactive = daysSince(lastGame) > 7;

  return (
    <tr className={`${rowClass} hover:bg-blue-50 transition-colors${inactive ? " opacity-40" : ""}`}>
      <td className={`px-4 py-3 font-medium text-gray-900 sticky left-0 ${rowClass}`}>
        <div className="flex items-center gap-2">
          <img
            src={`https://a.espncdn.com/i/teamlogos/nba/500/${team.toLowerCase()}.png`}
            alt={team}
            className="h-5 w-5 shrink-0"
          />
          <span>{name}</span>
        </div>
      </td>
      <td className="px-4 py-3 font-mono text-gray-700 whitespace-nowrap">
        {lastGameInfo ? (
          <>
            <div className="flex items-center gap-1.5">
              {lastGameInfo.completed ? (
                <span className={`text-xs font-bold ${lastGameInfo.playerTeamWon
                  ? "text-emerald-600" : "text-red-500"}`}>
                  {lastGameInfo.playerTeamWon ? "W" : "L"}
                </span>
              ) : (
                <span className="text-xs font-bold text-blue-500">LIVE</span>
              )}
              <span>vs {lastGameInfo.opponentAbbr} {lastGameInfo.playerTeamScore}–{lastGameInfo.opponentScore}</span>
            </div>
            <div className="text-xs text-gray-400">{daysSinceLastGame(lastGame)}</div>
          </>
        ) : "—"}
      </td>
      <td className={BASE_TD}>
        {statCell(lastGameStats?.min ?? null, stats.min, null, null, formatStatLg, formatStat)}
      </td>
      <td className={BASE_TD}>
        {statCell(lastGameStats?.pts ?? null, stats.pts, best.lastGame.pts, best.season.pts, formatStatLg, formatStat)}
      </td>
      <td className={BASE_TD}>
        {statCell(lastGameStats?.reb ?? null, stats.reb, best.lastGame.reb, best.season.reb, formatStatLg, formatStat)}
      </td>
      <td className={BASE_TD}>
        {statCell(lastGameStats?.ast ?? null, stats.ast, best.lastGame.ast, best.season.ast, formatStatLg, formatStat)}
      </td>
      <td className={BASE_TD}>
        {statCell(lastGameStats?.stl ?? null, stats.stl, best.lastGame.stl, best.season.stl, formatStatLg, formatStat)}
      </td>
      <td className={BASE_TD}>
        {statCell(lastGameStats?.blk ?? null, stats.blk, best.lastGame.blk, best.season.blk, formatStatLg, formatStat)}
      </td>
      <td className={BASE_TD}>
        {statCell(lastGameStats?.fgPct ?? null, stats.fgPct,
          best.lastGame.fgPct, best.season.fgPct, formatPct)}
      </td>
      <td className={BASE_TD}>
        {statCell(lastGameStats?.fg3Pct ?? null, stats.fg3Pct,
          best.lastGame.fg3Pct, best.season.fg3Pct, formatPct)}
      </td>
      <td className={BASE_TD}>
        {statCell(lastGameStats?.ftPct ?? null, stats.ftPct,
          best.lastGame.ftPct, best.season.ftPct, formatPct)}
      </td>
      <td className="px-4 py-3 font-mono">
        <div className="flex gap-0.5">
          {lastFive.length === 0 ? <span className="text-gray-400">—</span> : [...lastFive].reverse().map((won, i) => (
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
