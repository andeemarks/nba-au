# Spec: Data Fetching

## Overview

The app fetches NBA season averages from the NBA Stats API via a Next.js API route proxy. The proxy handles authentication headers, country filtering, response normalisation, and caching.

## Scenarios

### API Route

**Given** a request to `GET /api/players`
**When** the NBA Stats API responds successfully
**Then** the route returns a 200 with a JSON array of Australian players and their stats

**Given** a request to `GET /api/players`
**When** the NBA Stats API is unreachable or returns a non-200 status
**Then** the route returns a 502 with `{ error: "Failed to fetch player data" }`

**Given** the NBA Stats API returns players
**When** the route filters by country
**Then** only players with `COUNTRY === "Australia"` are included in the response

**Given** a successful response
**When** the route sets response headers
**Then** `Cache-Control: public, max-age=300` is set to allow 5-minute edge caching

### Response Normalisation

**Given** the NBA Stats API returns its column-header/row-array format
**When** the route processes the response
**Then** each player row is converted to a typed object with camelCase keys matching the `PlayerWithStats` type

**Given** a player has `null` for any stat field
**When** normalising the response
**Then** that field is set to `null` in the output (not 0 or undefined), so the UI can display "—"

### Client Fetching

**Given** the page mounts
**When** SWR triggers the initial fetch to `/api/players`
**Then** a loading state is shown until the response arrives

**Given** the SWR fetch succeeds
**When** data arrives
**Then** the player table renders with the returned players

**Given** the SWR fetch fails
**When** the error state renders
**Then** a retry button is available that re-triggers the fetch

**Given** the page has been open for more than 5 minutes
**When** the user brings the tab back into focus
**Then** SWR revalidates the data automatically (revalidateOnFocus: true)
