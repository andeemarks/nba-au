# Tasks: Australian NBA Players Stats Viewer

## 1. Project Scaffolding

- [x] Initialise Next.js 14 project with TypeScript and App Router (`npx create-next-app@latest`)
- [x] Install and configure Tailwind CSS
- [x] Install SWR (`npm install swr`)
- [x] Set up tslint config (per project convention)
- [x] Create base directory structure: `app/`, `components/`, `lib/`
- [x] Add `.env.example` with any required env vars (none currently, but placeholder for future API key)

## 2. Types and NBA API Client

- [x] Define shared types in `lib/types.ts`:
  - `PlayerStats` (pts, reb, ast, stl, blk, fgPct, fg3Pct, ftPct, min, gamesPlayed)
  - `Player` (id, name, team, position, age)
  - `PlayerWithStats` (Player & { stats: PlayerStats })
  - `SortState` (column, direction)
- [x] Implement `lib/nbaApi.ts`:
  - `fetchAustralianPlayers(season: string): Promise<PlayerWithStats[]>`
  - Fetches `leaguedashplayerstats` with required headers
  - Zips NBA API header/row format into typed objects
  - Filters to `COUNTRY === "Australia"`

## 3. API Route

- [x] Create `app/api/players/route.ts`:
  - Accepts optional `?season=` query param (defaults to current season)
  - Calls `fetchAustralianPlayers()` from `lib/nbaApi.ts`
  - Returns 200 JSON on success, 502 on upstream error
  - Sets `Cache-Control: public, max-age=300`
- [ ] Manually test the route returns correct data in development

## 4. Player Table Components

- [x] Create `components/PlayerTable.tsx`:
  - Accepts `players: PlayerWithStats[]` and `sortState`/`onSort` props
  - Renders `<TableHeader>` and player rows
  - Sticky first column (player name) for mobile scroll
- [x] Create `components/TableHeader.tsx`:
  - Renders sortable column headers
  - Shows ▲/▼ indicator for active sort column
  - Calls `onSort` with column key on click
- [x] Create `components/PlayerRow.tsx`:
  - Renders a single player's data row
  - Formats percentages to 1 decimal place
  - Shows "—" for null stat values
- [x] Create `components/LoadingState.tsx`:
  - Skeleton rows matching the table structure
- [x] Create `components/ErrorState.tsx`:
  - Error message + retry button

## 5. Page Assembly

- [x] Implement `app/page.tsx`:
  - Uses SWR to fetch `/api/players`
  - Manages `SortState` with `useState`
  - Sorts the player array client-side before passing to `PlayerTable`
  - Renders header, loading/error/table states appropriately
- [x] Style the page with Tailwind: dark header, alternating row shading, responsive layout
- [x] Add season badge/label to the page header (e.g. "2024-25 Season")

## 6. Testing

- [x] Write Jest unit tests for `lib/nbaApi.ts`:
  - Correct header/row zipping
  - Country filtering
  - Null stat handling
- [x] Write Jest unit tests for sort logic (ascending/descending, column switching)
- [x] Write Playwright e2e test:
  - Page loads and table is visible
  - Clicking a column header sorts the rows
  - Error state renders on API failure (mock the route)

## 7. Polish and Review

- [ ] Verify all current Australian NBA players appear (cross-check manually)
- [x] Ensure no method has more than 30 lines of code
- [x] Check mobile layout (horizontal scroll, sticky name column)
- [ ] Run tslint and fix any issues
- [ ] Run full test suite and confirm passing
- [ ] Review loading and error states with intentional API failures
