#!/usr/bin/env node
// Fetches Australian NBA players + current season stats from ESPN's unofficial API.
// Args: <season>  e.g. "2025-26"
// Outputs: JSON array of PlayerWithStats to stdout.

const https = require("https");

const [, , season] = process.argv;
if (!season) {
  process.stderr.write("Usage: fetch-espn.js <season>\n");
  process.exit(1);
}

// ESPN uses the end year of the season (2025-26 → 2026)
const espnSeason = parseInt(season.split("-")[0], 10) + 1;

// Hardcoded ESPN athlete IDs for current Australian NBA players.
// Update this list when players join or leave the league.
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

function get(url) {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const req = https.get(
      { hostname: u.hostname, path: u.pathname + u.search },
      (res) => {
        let raw = "";
        res.on("data", (c) => { raw += c; });
        res.on("end", () => {
          if (res.statusCode !== 200) {
            reject(new Error(`ESPN ${res.statusCode}: ${url}`));
          } else {
            resolve(JSON.parse(raw));
          }
        });
      }
    );
    req.on("error", reject);
  });
}

function getStat(data, name) {
  if (!data?.splits?.categories) return null;
  for (const cat of data.splits.categories)
    for (const s of cat.stats)
      if (s.name === name) return s.value ?? null;
  return null;
}

function pct(data, name) {
  const v = getStat(data, name);
  return v !== null ? v / 100 : null;
}

function parseSummary(summary, playerTeamId) {
  const comp = summary?.header?.competitions?.[0];
  if (!comp) return null;
  const playerTeam = comp.competitors.find((c) => String(c.team?.id) === String(playerTeamId));
  const opponent = comp.competitors.find((c) => String(c.team?.id) !== String(playerTeamId));
  return {
    date: comp.date,
    opponentAbbr: opponent?.team?.abbreviation ?? "???",
    playerTeamScore: parseInt(playerTeam?.score ?? "0", 10),
    opponentScore: parseInt(opponent?.score ?? "0", 10),
    playerTeamWon: playerTeam?.winner === true,
    completed: comp.status?.type?.completed === true,
  };
}

async function fetchGameSummary(event, teamId) {
  const eventId = event.event?.["$ref"]?.match(/\/events\/(\d+)/)?.[1];
  if (!eventId) return null;
  const statsRef = event.statistics?.["$ref"];
  const [summary, gameStats] = await Promise.all([
    get(`https://site.api.espn.com/apis/site/v2/sports/basketball/nba/summary?event=${eventId}`),
    statsRef ? get(statsRef).catch(() => null) : Promise.resolve(null),
  ]);
  return { info: parseSummary(summary, teamId), stats: gameStats };
}

async function fetchRecentGames(athleteId, count = 6) {
  const log = await get(
    `https://sports.core.api.espn.com/v2/sports/basketball/leagues/nba/athletes/${athleteId}/eventlog?limit=100&season=${espnSeason}`
  );
  const items = log.events?.items ?? [];
  const played = [...items].reverse().filter((e) => e.played === true).slice(0, count);
  const results = await Promise.all(played.map((e) => fetchGameSummary(e, e.teamId).catch(() => null)));
  return results;
}

function parseGameStats(data) {
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

function buildPlayer(player, stats, recentGames) {
  const lastGame = recentGames?.[0] ?? null;
  return {
    id: parseInt(player.id, 10),
    name: `${player.firstName} ${player.lastName}`,
    team: player.teamAbbr,
    lastGame: lastGame?.info?.date ?? null,
    lastGameInfo: lastGame?.info ?? null,
    lastGameStats: lastGame?.stats ? parseGameStats(lastGame.stats) : null,
    lastFive: (recentGames ?? []).filter((g) => g?.info?.completed).slice(0, 5).map((g) => g.info.playerTeamWon),
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

async function fetchAustralians(teams) {
  const rosters = await Promise.all(
    teams.map((team) =>
      get(`https://site.api.espn.com/apis/site/v2/sports/basketball/nba/teams/${team.id}/roster`)
        .then((d) => (d.athletes || []).map((p) => ({ ...p, teamAbbr: team.abbreviation })))
        .catch(() => [])
    )
  );
  return rosters.flat().filter((p) => AUSTRALIAN_IDS.has(p.id));
}

async function main() {
  const teamsData = await get("https://site.api.espn.com/apis/site/v2/sports/basketball/nba/teams");
  const teams = teamsData.sports[0].leagues[0].teams.map((t) => t.team);

  const australians = await fetchAustralians(teams);
  if (australians.length === 0) {
    process.stdout.write(JSON.stringify([]));
    return;
  }

  const [statsResults, recentGamesResults] = await Promise.all([
    Promise.all(australians.map((p) =>
      get(`https://sports.core.api.espn.com/v2/sports/basketball/leagues/nba/seasons/${espnSeason}/types/2/athletes/${p.id}/statistics/0`)
        .catch(() => null)
    )),
    Promise.all(australians.map((p) =>
      fetchRecentGames(p.id).catch(() => null)
    )),
  ]);

  const players = australians.map((p, i) => buildPlayer(p, statsResults[i], recentGamesResults[i]));
  process.stdout.write(JSON.stringify(players));
}

main().catch((err) => {
  process.stderr.write(err.message + "\n");
  process.exit(1);
});
