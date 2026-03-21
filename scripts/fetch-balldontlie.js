#!/usr/bin/env node
// Runs as a child process to avoid Next.js TLS fingerprinting issues.
// Args: <season-year> <api-key>
// Outputs: JSON to stdout, error message to stderr with non-zero exit code.

const https = require("https");

const [, , season, apiKey] = process.argv;

if (!season || !apiKey) {
  process.stderr.write("Usage: fetch-balldontlie.js <season> <apiKey>\n");
  process.exit(1);
}

function get(path) {
  return new Promise((resolve, reject) => {
    const req = https.get(
      { hostname: "api.balldontlie.io", path: `/v1${path}`, headers: { Authorization: apiKey } },
      (res) => {
        let raw = "";
        res.on("data", (c) => { raw += c; });
        res.on("end", () => {
          if (res.statusCode !== 200) {
            reject(new Error(`BallDontLie returned ${res.statusCode}: ${raw}`));
          } else {
            resolve(JSON.parse(raw));
          }
        });
      }
    );
    req.on("error", reject);
  });
}

async function main() {
  const playerData = await get("/players?country=Australia&per_page=25");
  const players = playerData.data;

  if (players.length === 0) {
    process.stdout.write(JSON.stringify([]));
    return;
  }

  const idParams = players.map((p) => `player_ids[]=${p.id}`).join("&");
  const avgData = await get(`/season_averages?season=${season}&${idParams}`);

  process.stdout.write(JSON.stringify({ players, averages: avgData.data }));
}

main().catch((err) => {
  process.stderr.write(err.message + "\n");
  process.exit(1);
});
