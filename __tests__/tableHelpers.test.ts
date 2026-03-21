import { computeBest } from "@/lib/tableHelpers";
import type { PlayerWithStats } from "@/lib/types";

function makePlayer(id: number, stats: Partial<PlayerWithStats["stats"]>, lastGameStats: Partial<PlayerWithStats["stats"]> | null = null): PlayerWithStats {
  const fullStats: PlayerWithStats["stats"] = {
    min: null, pts: null, reb: null, ast: null,
    stl: null, blk: null, fgPct: null, fg3Pct: null, ftPct: null,
    ...stats,
  };
  return {
    id,
    name: `Player ${id}`,
    team: "TST",
    lastGame: null,
    lastGameInfo: null,
    lastGameStats: lastGameStats ? { min: null, pts: null, reb: null, ast: null, stl: null, blk: null, fgPct: null, fg3Pct: null, ftPct: null, ...lastGameStats } : null,
    lastFive: [],
    stats: fullStats,
  };
}

describe("computeBest", () => {
  it("returns all nulls for an empty player list", () => {
    const best = computeBest([]);
    expect(best.season.pts).toBeNull();
    expect(best.lastGame.pts).toBeNull();
  });

  it("returns the single player's stats as best when only one player", () => {
    const best = computeBest([makePlayer(1, { pts: 20, reb: 5 })]);
    expect(best.season.pts).toBe(20);
    expect(best.season.reb).toBe(5);
  });

  it("finds the maximum season stat across multiple players", () => {
    const players = [
      makePlayer(1, { pts: 10 }),
      makePlayer(2, { pts: 25 }),
      makePlayer(3, { pts: 18 }),
    ];
    expect(computeBest(players).season.pts).toBe(25);
  });

  it("finds the maximum last game stat across multiple players", () => {
    const players = [
      makePlayer(1, {}, { pts: 30 }),
      makePlayer(2, {}, { pts: 12 }),
      makePlayer(3, {}, { pts: 22 }),
    ];
    expect(computeBest(players).lastGame.pts).toBe(30);
  });

  it("returns null for a stat when all players have null for it", () => {
    const players = [
      makePlayer(1, { pts: null }),
      makePlayer(2, { pts: null }),
    ];
    expect(computeBest(players).season.pts).toBeNull();
  });

  it("ignores null values when finding the max", () => {
    const players = [
      makePlayer(1, { pts: null }),
      makePlayer(2, { pts: 15 }),
    ];
    expect(computeBest(players).season.pts).toBe(15);
  });

  it("returns null for lastGame stats when all lastGameStats are null", () => {
    const players = [makePlayer(1, { pts: 20 }), makePlayer(2, { pts: 10 })];
    expect(computeBest(players).lastGame.pts).toBeNull();
  });

  it("computes best independently for each stat key", () => {
    const players = [
      makePlayer(1, { pts: 30, reb: 3 }),
      makePlayer(2, { pts: 10, reb: 12 }),
    ];
    const best = computeBest(players).season;
    expect(best.pts).toBe(30);
    expect(best.reb).toBe(12);
  });
});
