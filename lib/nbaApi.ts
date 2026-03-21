import { execFile } from "child_process";
import path from "path";
import type { PlayerWithStats } from "./types";

const SCRIPT = path.join(process.cwd(), "scripts", "fetch-espn.js");

const cache = new Map<string, { data: PlayerWithStats[]; expiresAt: number }>();
const CACHE_TTL_MS = 5 * 60 * 1000;

function runScript(season: string): Promise<PlayerWithStats[]> {
  return new Promise((resolve, reject) => {
    execFile("node", [SCRIPT, season], { timeout: 30_000 }, (err, stdout, stderr) => {
      if (err) {
        reject(new Error(stderr || err.message));
      } else {
        resolve(JSON.parse(stdout));
      }
    });
  });
}

export async function fetchAustralianPlayers(season: string): Promise<PlayerWithStats[]> {
  const cached = cache.get(season);
  if (cached && cached.expiresAt > Date.now()) return cached.data;

  const players = await runScript(season);
  cache.set(season, { data: players, expiresAt: Date.now() + CACHE_TTL_MS });
  return players;
}
