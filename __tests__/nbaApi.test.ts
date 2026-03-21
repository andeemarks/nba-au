import { execFile } from "child_process";
import { fetchAustralianPlayers } from "@/lib/nbaApi";

jest.mock("child_process");
const mockExecFile = execFile as jest.MockedFunction<typeof execFile>;

function mockScript(output: object) {
  mockExecFile.mockImplementationOnce((_cmd, _args, _opts, cb: any) => {
    cb(null, JSON.stringify(output), "");
    return {} as any;
  });
}

function makePlayer(overrides: Record<string, unknown> = {}) {
  return {
    id: 1,
    name: "Patty Mills",
    team: "BOS",
    lastGame: "2026-03-19T10:00Z",
    lastGameInfo: null,
    lastGameStats: null,
    lastFive: [],
    stats: {
      min: 28.5,
      pts: 11.2,
      reb: 2.1,
      ast: 3.4,
      stl: 0.9,
      blk: 0.2,
      fgPct: 0.423,
      fg3Pct: 0.382,
      ftPct: 0.857,
    },
    ...overrides,
  };
}

beforeEach(() => jest.clearAllMocks());

describe("fetchAustralianPlayers", () => {
  it("returns parsed player data from script output", async () => {
    mockScript([makePlayer()]);
    const result = await fetchAustralianPlayers("2024-25");
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe("Patty Mills");
    expect(result[0].stats.pts).toBe(11.2);
  });

  it("returns empty array when script outputs []", async () => {
    mockScript([]);
    const result = await fetchAustralianPlayers("2023-24");
    expect(result).toEqual([]);
  });

  it("passes null stats through as null", async () => {
    mockScript([makePlayer({ stats: { ...makePlayer().stats, fg3Pct: null } })]);
    const result = await fetchAustralianPlayers("2022-23");
    expect(result[0].stats.fg3Pct).toBeNull();
  });

  it("throws when script exits with error", async () => {
    mockExecFile.mockImplementationOnce((_cmd, _args, _opts, cb: any) => {
      cb(new Error("failed"), "", "ESPN 500: internal error");
      return {} as any;
    });
    await expect(fetchAustralianPlayers("2021-22")).rejects.toThrow("ESPN 500");
  });
});
