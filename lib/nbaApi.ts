import type { PlayerWithStats, PlayerStats, LastGameInfo } from "./types";

const AUSTRALIAN_IDS = new Set([
  "4869342", // Dyson Daniels    – ATL
  "3146557", // Jock Landale     – ATL
  "4871145", // Josh Giddey      – CHI
  "5091709", // Lachlan Olbrich  – CHI
  "4432811", // Josh Green       – CHA
  "3907498", // Matisse Thybulle – POR
  "2968436", // Joe Ingles       – MIN
  "5157066", // Johnny Furphy    – IND
  "5023693", // Tyrese Proctor   – CLE
]);

const cache = new Map<string, { data: PlayerWithStats[]; expiresAt: number }>();
const CACHE_TTL_MS = 5 * 60 * 1000;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function espnGet(url: string): Promise<any> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`ESPN ${res.status}: ${url}`);
  return res.json();
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getStat(data: any, name: string): number | null {
  if (!data?.splits?.categories) return null;
  for (const cat of data.splits.categories)
    for (const s of cat.stats)
      if (s.name === name) return s.value ?? null;
  return null;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function pct(data: any, name: string): number | null {
  const v = getStat(data, name);
  return v !== null ? v / 100 : null;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function parseSummary(summary: any, playerTeamId: string): LastGameInfo | null {
  const comp = summary?.header?.competitions?.[0];
  if (!comp) return null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const playerTeam = comp.competitors.find((c: any) => String(c.team?.id) === String(playerTeamId));
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const opponent = comp.competitors.find((c: any) => String(c.team?.id) !== String(playerTeamId));
  return {
    date: comp.date,
    opponentAbbr: opponent?.team?.abbreviation ?? "???",
    playerTeamScore: parseInt(playerTeam?.score ?? "0", 10),
    opponentScore: parseInt(opponent?.score ?? "0", 10),
    playerTeamWon: playerTeam?.winner === true,
    completed: comp.status?.type?.completed === true,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function fetchGameSummary(event: any, teamId: string): Promise<{ info: LastGameInfo | null; stats: any } | null> {
  const eventId = event.event?.["$ref"]?.match(/\/events\/(\d+)/)?.[1];
  if (!eventId) return null;
  const statsRef = event.statistics?.["$ref"];
  const [summary, gameStats] = await Promise.all([
    espnGet(`https://site.api.espn.com/apis/site/v2/sports/basketball/nba/summary?event=${eventId}`),
    statsRef ? espnGet(statsRef).catch(() => null) : Promise.resolve(null),
  ]);
  return { info: parseSummary(summary, teamId), stats: gameStats };
}

async function fetchRecentGames(athleteId: string, espnSeason: number, count = 5): Promise<{ info: LastGameInfo | null; stats: any }[]> {
  const log = await espnGet(
    `https://sports.core.api.espn.com/v2/sports/basketball/leagues/nba/athletes/${athleteId}/eventlog?limit=100&season=${espnSeason}`
  );
  const items = log.events?.items ?? [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const played = [...items].reverse().filter((e: any) => e.played === true).slice(0, count + 1);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const results = await Promise.all(played.map((e: any) => fetchGameSummary(e, e.teamId).catch(() => null)));
  return results.filter((r): r is { info: LastGameInfo | null; stats: any } => r !== null);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function parseGameStats(data: any): PlayerStats {
  return {
    min: getStat(data, "minutes"),
    pts: getStat(data, "points"),
    reb: getStat(data, "rebounds"),
    ast: getStat(data, "assists"),
    stl: getStat(data, "steals"),
    blk: getStat(data, "blocks"),
    fgPct: pct(data, "fieldGoalPct"),
    fg3Pct: pct(data, "threePointPct"),
    ftPct: pct(data, "freeThrowPct"),
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function buildPlayer(player: any, stats: any, recentGames: { info: LastGameInfo | null; stats: any }[]): PlayerWithStats {
  const completedGames = recentGames.filter((g) => g?.info?.completed === true);
  const lastGame = recentGames[0] ?? null;
  return {
    id: parseInt(player.id, 10),
    name: `${player.firstName} ${player.lastName}`,
    team: player.teamAbbr,
    lastGame: lastGame?.info?.date ?? null,
    lastGameInfo: lastGame?.info ?? null,
    lastGameStats: lastGame?.stats ? parseGameStats(lastGame.stats) : null,
    lastFive: completedGames.slice(0, 5).map((g) => g?.info?.playerTeamWon ?? null),
    stats: {
      min: getStat(stats, "avgMinutes"),
      pts: getStat(stats, "avgPoints"),
      reb: getStat(stats, "avgRebounds"),
      ast: getStat(stats, "avgAssists"),
      stl: getStat(stats, "avgSteals"),
      blk: getStat(stats, "avgBlocks"),
      fgPct: pct(stats, "fieldGoalPct"),
      fg3Pct: pct(stats, "threePointPct"),
      ftPct: pct(stats, "freeThrowPct"),
    },
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function fetchAustralians(teams: any[]): Promise<any[]> {
  const rosters = await Promise.all(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    teams.map((team) =>
      espnGet(`https://site.api.espn.com/apis/site/v2/sports/basketball/nba/teams/${team.id}/roster`)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .then((d: any) => (d.athletes || []).map((p: any) => ({ ...p, teamAbbr: team.abbreviation })))
        .catch(() => [])
    )
  );
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return rosters.flat().filter((p: any) => AUSTRALIAN_IDS.has(p.id));
}

async function fetchAllPlayers(season: string): Promise<PlayerWithStats[]> {
  const espnSeason = parseInt(season.split("-")[0], 10) + 1;

  const teamsData = await espnGet("https://site.api.espn.com/apis/site/v2/sports/basketball/nba/teams");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const teams = teamsData.sports[0].leagues[0].teams.map((t: any) => t.team);

  const australians = await fetchAustralians(teams);
  if (australians.length === 0) return [];

  const [statsResults, recentGamesResults] = await Promise.all([
    Promise.all(australians.map((p) =>
      espnGet(
        `https://sports.core.api.espn.com/v2/sports/basketball/leagues/nba/seasons/${espnSeason}/types/2/athletes/${p.id}/statistics/0`
      ).catch(() => null)
    )),
    Promise.all(australians.map((p) =>
      fetchRecentGames(p.id, espnSeason).catch(() => [])
    )),
  ]);

  return australians.map((p, i) => buildPlayer(p, statsResults[i], recentGamesResults[i] ?? []));
}

export async function fetchAustralianPlayers(season: string): Promise<PlayerWithStats[]> {
  const cached = cache.get(season);
  if (cached && cached.expiresAt > Date.now()) return cached.data;

  const players = await fetchAllPlayers(season);
  cache.set(season, { data: players, expiresAt: Date.now() + CACHE_TTL_MS });
  return players;
}
