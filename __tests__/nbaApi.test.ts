import { fetchAustralianPlayers } from "@/lib/nbaApi";

const MOCK_TEAMS = {
  sports: [{ leagues: [{ teams: [{ team: { id: "1", abbreviation: "ATL" } }] }] }],
};

const MOCK_ROSTER = {
  athletes: [{ id: "4869342", firstName: "Dyson", lastName: "Daniels" }],
};

const MOCK_STATS = {
  splits: {
    categories: [{
      stats: [
        { name: "avgPoints", value: 12.5 },
        { name: "avgRebounds", value: 3.2 },
        { name: "avgAssists", value: 4.1 },
        { name: "avgSteals", value: 1.1 },
        { name: "avgBlocks", value: 0.3 },
        { name: "avgMinutes", value: 29.0 },
        { name: "fieldGoalPct", value: 45.2 },
        { name: "threePointPct", value: 38.1 },
        { name: "freeThrowPct", value: 82.0 },
      ],
    }],
  },
};

const MOCK_EVENTLOG = { events: { items: [] } };

type FetchHandlers = Record<string, object | null>;

function mockFetch(overrides: FetchHandlers = {}) {
  const handlers: FetchHandlers = {
    "/nba/teams": MOCK_TEAMS,
    "/teams/1/roster": MOCK_ROSTER,
    "/statistics/0": MOCK_STATS,
    "/eventlog": MOCK_EVENTLOG,
    ...overrides,
  };

  global.fetch = jest.fn((url: string) => {
    const sorted = Object.entries(handlers).sort((a, b) => b[0].length - a[0].length);
    for (const [pattern, body] of sorted) {
      if (url.includes(pattern)) {
        if (body === null) {
          return Promise.resolve({ ok: false, status: 500, json: async () => ({}) } as Response);
        }
        return Promise.resolve({ ok: true, json: async () => body } as Response);
      }
    }
    return Promise.resolve({ ok: false, status: 404, json: async () => ({}) } as Response);
  }) as jest.Mock;
}

// Use unique seasons per test to avoid hitting the module-level in-memory cache
let seasonYear = 1990;
function nextSeason() {
  const y = seasonYear++;
  return `${y}-${String(y + 1).slice(-2)}`;
}

beforeEach(() => jest.clearAllMocks());

describe("fetchAustralianPlayers", () => {
  it("returns parsed player data from ESPN", async () => {
    mockFetch();
    const result = await fetchAustralianPlayers(nextSeason());
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe("Dyson Daniels");
    expect(result[0].team).toBe("ATL");
    expect(result[0].stats.pts).toBe(12.5);
    expect(result[0].lastFive).toEqual([]);
  });

  it("returns empty array when no Australians on any roster", async () => {
    mockFetch({ "/teams/1/roster": { athletes: [] } });
    const result = await fetchAustralianPlayers(nextSeason());
    expect(result).toEqual([]);
  });

  it("returns null stats when statistics endpoint fails", async () => {
    mockFetch({ "/statistics/0": null });
    const result = await fetchAustralianPlayers(nextSeason());
    expect(result[0].stats.pts).toBeNull();
  });

  it("throws when ESPN teams endpoint returns an error", async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({ ok: false, status: 500, json: async () => ({}) } as Response)
    ) as jest.Mock;
    await expect(fetchAustralianPlayers(nextSeason())).rejects.toThrow("ESPN 500");
  });

  it("returns cached data on repeated calls with the same season", async () => {
    mockFetch();
    const season = nextSeason();
    await fetchAustralianPlayers(season);
    const callCount = (global.fetch as jest.Mock).mock.calls.length;
    await fetchAustralianPlayers(season);
    expect((global.fetch as jest.Mock).mock.calls.length).toBe(callCount);
  });
});
