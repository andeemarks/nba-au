# Proposal: Australian NBA Players Stats Viewer

## Summary

Build a Next.js single-page application that surfaces current Australian NBA players alongside their key season and career statistics in a clean, sortable table interface. This is a tool for the personal use of the author only.

## Problem

The author wants a quick, focused view of how Australians are performing across the NBA each season. General NBA sites bury this information, requiring manual team-by-team browsing or repeated player searches.

## Solution

A lightweight Next.js app that:
- Fetches current season stats for a pre-defined set of Australian-born NBA players
- Displays them in a sortable, scannable table
- Updates stats dynamically from a public NBA data API
- Requires no authentication or account creation from the user

## Goals

- Display a table of all currently active Australian NBA players
- Show key per-game statistics: points, rebounds, assists, steals, blocks, field goal %, minutes
- Allow column-based sorting (ascending/descending)
- Indicate each player's current team
- Indicate each player's last game and how many days ago the last game was played
- Load quickly with a clear loading and empty state

## Non-Goals

- User accounts, favourites, or personalisation
- Play-by-play or game-level stats
- Native mobile app
- Live/real-time score updates
- Player profile pages (table only, no drill-down)

## Success Criteria

- All currently rostered Australian NBA players appear in the table
- Stats reflect the current season
- Table is sortable by any stat column
- Page loads and displays data within 3 seconds on a standard connection
- Page updates stats on refresh

## Open Questions

- Which public API will be used as the data source? (BallDontLie v1, nba_api, or another)
- How will "Australian" be determined — by birthplace, nationality flag in API, or a curated static list?
- How frequently should stats refresh — on each page load, or cached with a TTL?