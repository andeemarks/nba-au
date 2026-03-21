# Spec: Player Table

## Overview

The player table is the primary UI element. It displays all currently active Australian NBA players with their current season per-game averages, and supports sorting by any stat column.

## Scenarios

### Display

**Given** the page loads successfully and player data is returned
**When** the table renders
**Then** each Australian player appears as a row with: name, team abbreviation, team logo, last game, days since last gamp, GP, MIN, PTS, REB, AST, STL, BLK, FG%, 3P%, FT%

**Given** player data is loading
**When** the fetch is in progress
**Then** a loading skeleton is shown in place of the table rows

**Given** the API returns an error or no players
**When** the table would render
**Then** a user-friendly error message is displayed with a retry option

**Given** no Australian players are found in the current season
**When** the table renders
**Then** an empty state message is shown: "No Australian players found for this season"

### Sorting

**Given** the table is displaying players
**When** the user clicks a sortable column header
**Then** the rows are sorted by that column in descending order and a sort indicator (▼) is shown

**Given** a column is already sorted descending
**When** the user clicks that column header again
**Then** the rows are sorted ascending and the indicator changes to (▲)

**Given** a column is already sorted ascending
**When** the user clicks that column header again
**Then** the rows are sorted descending

**Given** the user has applied a sort
**When** data re-fetches (e.g. SWR revalidation)
**Then** the current sort order is preserved after the new data loads

### Display Details

**Given** a player's stat value is unavailable (e.g. 0 games played, no FG%)
**When** the cell renders
**Then** display "—" rather than 0.000 or NaN

**Given** percentage stats (FG%, 3P%, FT%)
**When** displayed in the table
**Then** they are shown as percentages with 0 decimal places (e.g. 47%)

**Given** the viewport is narrow (mobile)
**When** the table renders
**Then** the table scrolls horizontally and the player name column remains visible (sticky left)