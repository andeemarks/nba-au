import { test, expect } from "@playwright/test";

const MOCK_PLAYERS = [
  {
    id: 1,
    name: "Patty Mills",
    team: "BKN",
    lastGame: "2026-03-20",
    lastGameInfo: { date: "2026-03-20", opponentAbbr: "LAL", playerTeamScore: 110, opponentScore: 105,
      playerTeamWon: true },
    lastGameStats: { min: 28, pts: 14, reb: 2, ast: 4, stl: 1, blk: 0, fgPct: 0.5, fg3Pct: 0.4, ftPct: 1.0 },
    lastFive: [true, false, true, true, true],
    stats: { min: 28.5, pts: 11.2, reb: 2.1, ast: 3.4, stl: 1.1, blk: 0.2, fgPct: 0.432, fg3Pct: 0.388, ftPct: 0.891 },
  },
  {
    id: 2,
    name: "Joe Ingles",
    team: "MIL",
    lastGame: "2026-03-19",
    lastGameInfo: { date: "2026-03-19", opponentAbbr: "BOS", playerTeamScore: 98, opponentScore: 112,
      playerTeamWon: false },
    lastGameStats: { min: 22, pts: 11, reb: 4, ast: 5, stl: 1, blk: 0, fgPct: 0.45, fg3Pct: 0.38, ftPct: 0.8 },
    lastFive: [false, true, false, true, false],
    stats: { min: 22.0, pts: 9.0, reb: 3.5, ast: 4.2, stl: 0.9, blk: 0.1, fgPct: 0.41, fg3Pct: 0.37, ftPct: 0.85 },
  },
];

test.beforeEach(async ({ page }) => {
  await page.route("/api/players", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        players: MOCK_PLAYERS,
        season: "2024-25",
        updatedAt: new Date().toISOString(),
      }),
    })
  );
});

test("page loads and table is visible", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Australian NBA Players" })).toBeVisible();
  await expect(page.getByText("Patty Mills")).toBeVisible();
  await expect(page.getByText("Joe Ingles")).toBeVisible();
});

test("clicking a column header sorts rows", async ({ page }) => {
  await page.goto("/");
  await page.waitForSelector("table");

  // Default sort is pts desc — Patty (11.2) should be first
  const rows = page.locator("tbody tr");
  await expect(rows.first()).toContainText("Patty Mills");

  // Click PTS once for descending, again for ascending — Joe (9.0) should be first
  await page.getByRole("columnheader", { name: /PTS/ }).click();
  await page.getByRole("columnheader", { name: /PTS/ }).click();
  await expect(rows.first()).toContainText("Joe Ingles");
});

test("error state renders on API failure", async ({ page }) => {
  await page.unroute("/api/players");
  await page.route("/api/players", (route) =>
    route.fulfill({ status: 502, body: JSON.stringify({ error: "Failed to fetch player data" }) })
  );

  await page.goto("/");
  await expect(page.getByText("Could not load player data")).toBeVisible();
  await expect(page.getByRole("button", { name: "Retry" })).toBeVisible();
});
