import { sortPlayers } from "@/lib/sort";
import type { PlayerWithStats } from "@/lib/types";

function makePlayer(overrides: Partial<PlayerWithStats> & { id: number; name: string }): PlayerWithStats {
  return {
    id: overrides.id,
    name: overrides.name,
    team: overrides.team ?? "TST",
    lastGame: overrides.lastGame ?? null,
    lastGameInfo: overrides.lastGameInfo ?? null,
    lastGameStats: overrides.lastGameStats ?? null,
    lastFive: overrides.lastFive ?? [],
    stats: {
      min: overrides.stats?.min ?? 30,
      pts: overrides.stats?.pts ?? 10,
      reb: overrides.stats?.reb ?? 5,
      ast: overrides.stats?.ast ?? 3,
      stl: overrides.stats?.stl ?? 1,
      blk: overrides.stats?.blk ?? 0.5,
      fgPct: overrides.stats?.fgPct ?? 0.45,
      fg3Pct: overrides.stats?.fg3Pct ?? 0.35,
      ftPct: overrides.stats?.ftPct ?? 0.8,
      ...overrides.stats,
    },
  };
}

const mkStats = (pts: number): PlayerWithStats["lastGameStats"] => ({
  min: 30, pts, reb: 5, ast: 3, stl: 1, blk: 0.5, fgPct: 0.45, fg3Pct: 0.35, ftPct: 0.8,
});

const players: PlayerWithStats[] = [
  makePlayer({ id: 1, name: "Patty Mills", lastGameStats: mkStats(11.2) }),
  makePlayer({ id: 2, name: "Ben Simmons", lastGameStats: mkStats(6.5) }),
  makePlayer({ id: 3, name: "Joe Ingles", lastGameStats: mkStats(9.0) }),
];

describe("sortPlayers", () => {
  it("sorts by stat column descending", () => {
    const sorted = sortPlayers(players, "pts", "desc");
    expect(sorted.map((p) => p.id)).toEqual([1, 3, 2]);
  });

  it("sorts by stat column ascending", () => {
    const sorted = sortPlayers(players, "pts", "asc");
    expect(sorted.map((p) => p.id)).toEqual([2, 3, 1]);
  });

  it("sorts by name alphabetically ascending", () => {
    const sorted = sortPlayers(players, "name", "asc");
    expect(sorted[0].name).toBe("Ben Simmons");
    expect(sorted[2].name).toBe("Patty Mills");
  });

  it("sorts by name alphabetically descending", () => {
    const sorted = sortPlayers(players, "name", "desc");
    expect(sorted[0].name).toBe("Patty Mills");
  });

  it("places null stats at the end regardless of direction", () => {
    const withNull = [
      makePlayer({ id: 4, name: "Null Player", lastGameStats: null }),
      ...players,
    ];
    const descSorted = sortPlayers(withNull, "pts", "desc");
    expect(descSorted[descSorted.length - 1].id).toBe(4);

    const ascSorted = sortPlayers(withNull, "pts", "asc");
    expect(ascSorted[ascSorted.length - 1].id).toBe(4);
  });

  it("sorts by lastGame date descending", () => {
    const withDates = [
      makePlayer({ id: 1, name: "Patty Mills", lastGame: "2026-03-20" }),
      makePlayer({ id: 2, name: "Ben Simmons", lastGame: "2026-03-22" }),
      makePlayer({ id: 3, name: "Joe Ingles", lastGame: "2026-03-18" }),
    ];
    const sorted = sortPlayers(withDates, "lastGame", "desc");
    expect(sorted.map((p) => p.id)).toEqual([2, 1, 3]);
  });

  it("sorts by lastGame date ascending", () => {
    const withDates = [
      makePlayer({ id: 1, name: "Patty Mills", lastGame: "2026-03-20" }),
      makePlayer({ id: 2, name: "Ben Simmons", lastGame: "2026-03-22" }),
      makePlayer({ id: 3, name: "Joe Ingles", lastGame: "2026-03-18" }),
    ];
    const sorted = sortPlayers(withDates, "lastGame", "asc");
    expect(sorted.map((p) => p.id)).toEqual([3, 1, 2]);
  });

  it("treats two null values as equal", () => {
    const withNulls = [
      makePlayer({ id: 1, name: "Patty Mills", lastGame: null }),
      makePlayer({ id: 2, name: "Ben Simmons", lastGame: null }),
    ];
    const sorted = sortPlayers(withNulls, "lastGame", "desc");
    expect(sorted.map((p) => p.id)).toEqual([1, 2]);
  });

  it("does not mutate the original array", () => {
    const original = [...players];
    sortPlayers(players, "pts", "asc");
    expect(players).toEqual(original);
  });
});
