# NBA AU

A Next.js app that tracks per-game statistics for active Australian NBA players, sourced live from ESPN's unofficial API.

## Overview

The app displays a sortable table of Australian players showing:
- **Last game** result (opponent, score, W/L) and how long ago it was played
- **Last game stats** (pts, reb, ast, stl, blk, min, FG%, 3P%, FT%)
- **Season averages** displayed beneath each last game stat
- **Last 5 games** W/L form, oldest to most recent (left to right)
- Best values per column highlighted in green (last game) and amber (season)

Data is fetched by a Node.js script that calls ESPN's API and is cached server-side for 5 minutes.

## Key Integration Points

- **`scripts/fetch-espn.js`** — Fetches player data from ESPN. Contains a hardcoded list of Australian player IDs that needs updating when players join or leave the league.
- **`app/api/players/route.ts`** — Next.js API route that invokes the fetch script and serves cached JSON to the client.
- **`lib/nbaApi.ts`** — Server-side cache layer (5-minute TTL) wrapping the fetch script.
- **`lib/types.ts`** — Shared TypeScript types for players, stats, and API responses.

## Running the App

```bash
npm install
npm run dev
```

The app will be available at [http://localhost:3000](http://localhost:3000).

## Testing

```bash
# Unit tests
npm test

# Unit tests with coverage
npm test -- --coverage

# End-to-end tests (requires a running dev server)
npm run test:e2e
```

## Linting

```bash
npm run lint
```
