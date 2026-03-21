# Design: Australian NBA Players Stats Viewer

## Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                     Browser (SPA)                        │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │              Next.js App (App Router)            │   │
│  │                                                  │   │
│  │  app/                                            │   │
│  │   └── page.tsx          ← single route           │   │
│  │                                                  │   │
│  │  components/                                     │   │
│  │   ├── PlayerTable.tsx   ← sortable table         │   │
│  │   ├── TableHeader.tsx   ← sortable column heads  │   │
│  │   └── LoadingState.tsx  ← skeleton/spinner       │   │
│  │                                                  │   │
│  │  lib/                                            │   │
│  │   ├── nbaApi.ts         ← NBA Stats API client   │   │
│  │   └── types.ts          ← shared types           │   │
│  └─────────────────────────────────────────────────┘   │
│                          │                              │
│                          │ fetch (client-side)          │
│                          ▼                              │
│  ┌─────────────────────────────────────────────────┐   │
│  │         Next.js API Route (proxy layer)          │   │
│  │   app/api/players/route.ts                       │   │
│  │   - Fetches from stats.nba.com (server-side)     │   │
│  │   - Filters players by COUNTRY = "Australia"     │   │
│  │   - Adds Cache-Control header (5 min TTL)        │   │
│  └─────────────────────────────────────────────────┘   │
│                          │                              │
└──────────────────────────┼──────────────────────────────┘
                           │ HTTPS (server-side, avoids CORS)
                           ▼
           ┌──────────────────────────────────────┐
           │         NBA Stats API                 │
           │       stats.nba.com/stats/            │
           │                                      │
           │  leaguedashplayerstats               │
           │    → per-game stats for all players  │
           │    → includes COUNTRY field          │
           └──────────────────────────────────────┘
```

## Data Source

**NBA Stats API** (`stats.nba.com/stats/leaguedashplayerstats`)

This endpoint returns per-game season averages for all active players, including a `COUNTRY` field. The Next.js API route fetches this server-side (bypassing CORS) and filters to `COUNTRY === "Australia"` before returning to the client.

Required request headers (NBA Stats API enforces these):
```
Referer: https://www.nba.com/
User-Agent: Mozilla/5.0 (compatible)
Accept: application/json
```

Key query parameters:
```
Season=2024-25
SeasonType=Regular Season
PerMode=PerGame
```

## API Route Design

```
GET /api/players?season=2024-25

Response:
{
  players: [
    {
      id: number,
      name: string,
      team: string,
      position: string,
      age: number,
      stats: {
        gamesPlayed: number,
        min: number,
        pts: number,
        reb: number,
        ast: number,
        stl: number,
        blk: number,
        fgPct: number,
        fg3Pct: number,
        ftPct: number
      }
    }
  ],
  season: string,
  updatedAt: string   // ISO timestamp
}
```

The route maps the flat NBA API `resultSets` header+rows format into typed objects, filters by country, and returns a clean JSON payload. Response is cached with `Cache-Control: public, max-age=300` (5 minutes).

## NBA API Response Mapping

The NBA Stats API returns data in a column-header / row-array format:
```json
{
  "resultSets": [{
    "headers": ["PLAYER_ID", "PLAYER_NAME", "TEAM_ABBREVIATION", "COUNTRY", "PTS", ...],
    "rowSet": [[203954, "Patty Mills", "BKN", "Australia", 11.2, ...], ...]
  }]
}
```

`lib/nbaApi.ts` will zip headers with row values into typed objects, abstracting this away from the route handler.

## Component Tree

```
page.tsx
└── PlayersPage
    ├── <header> — title, subtitle, season badge
    ├── <LoadingState /> (while fetching)
    ├── <ErrorState />   (on fetch error)
    └── <PlayerTable players={players} />
        ├── <TableHeader onSort={...} sortState={...} />
        │   └── <SortableColumn> × columns
        └── <tbody>
            └── <PlayerRow> × n players
```

## Sorting

Client-side sort state managed with `useState`:
```ts
type SortState = {
  column: keyof PlayerStats | 'name' | 'team'
  direction: 'asc' | 'desc'
}
```

Clicking a column header toggles direction if already sorted by that column, otherwise sorts descending by default. Sorting is performed client-side — no re-fetch needed.

## Styling

Tailwind CSS. Clean, minimal aesthetic. Dark header row, alternating row shading, responsive horizontal scroll on small screens. No external UI component library.

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Data fetching | Native `fetch` + SWR |
| Linting | tslint (per project convention) |
| Testing | Jest (unit), Playwright (e2e) |

## Key Decisions

1. **NBA Stats API as data source** — Authoritative source; includes `COUNTRY` field enabling server-side filtering without a curated static list.
2. **API route as proxy** — Avoids CORS issues; allows setting required `Referer`/`User-Agent` headers server-side; enables response caching.
3. **Country-based filtering** — Filter by `COUNTRY === "Australia"` from the API response; no need to manually maintain a player ID list.
4. **Client-side sort** — Dataset is small (< 30 players); no need for server-side sort.
5. **No database** — Stats sourced live from upstream API; no persistence needed.
6. **SWR for data fetching** — Automatic revalidation and loading/error states with minimal boilerplate.
