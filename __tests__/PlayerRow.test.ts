import {
  daysSinceLastGame,
  formatPct,
  formatStat,
  lgCls,
  seasonCls,
} from "@/components/PlayerRow";

// Fix "now" to 2026-03-22T12:00:00 AEST (= 2026-03-22T02:00:00Z)
const FIXED_NOW = new Date("2026-03-22T02:00:00Z").getTime();

beforeEach(() => {
  jest.spyOn(Date, "now").mockReturnValue(FIXED_NOW);
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe("daysSinceLastGame", () => {
  it("returns — for null", () => {
    expect(daysSinceLastGame(null)).toBe("—");
  });

  it("returns Today when the game was today (AEST)", () => {
    expect(daysSinceLastGame("2026-03-22")).toBe("Today");
  });

  it("returns Yesterday when the game was yesterday (AEST)", () => {
    expect(daysSinceLastGame("2026-03-21")).toBe("Yesterday");
  });

  it("returns N days ago for older games", () => {
    expect(daysSinceLastGame("2026-03-17")).toBe("5 days ago");
  });
});

describe("formatPct", () => {
  it("returns — for null", () => {
    expect(formatPct(null)).toBe("—");
  });

  it("formats a decimal as a percentage with one decimal place", () => {
    expect(formatPct(0.456)).toBe("45.6%");
  });

  it("formats 0 correctly", () => {
    expect(formatPct(0)).toBe("0.0%");
  });

  it("formats 1 correctly", () => {
    expect(formatPct(1)).toBe("100.0%");
  });
});

describe("formatStat", () => {
  it("returns — for null", () => {
    expect(formatStat(null)).toBe("—");
  });

  it("formats a number to one decimal place", () => {
    expect(formatStat(12.345)).toBe("12.3");
  });

  it("rounds correctly", () => {
    expect(formatStat(12.36)).toBe("12.4");
  });

  it("formats 0 correctly", () => {
    expect(formatStat(0)).toBe("0.0");
  });
});

describe("lgCls", () => {
  it("returns emerald highlight when value equals best", () => {
    expect(lgCls(10, 10)).toBe("text-emerald-500 font-semibold");
  });

  it("returns default when value does not equal best", () => {
    expect(lgCls(10, 20)).toBe("text-gray-700");
  });

  it("returns default when value is null", () => {
    expect(lgCls(null, 10)).toBe("text-gray-700");
  });

  it("returns default when both are null", () => {
    expect(lgCls(null, null)).toBe("text-gray-700");
  });
});

describe("seasonCls", () => {
  it("returns amber highlight when value equals best", () => {
    expect(seasonCls(10, 10)).toBe("text-xs text-amber-500 font-semibold");
  });

  it("returns default when value does not equal best", () => {
    expect(seasonCls(10, 20)).toBe("text-xs text-gray-400");
  });

  it("returns default when value is null", () => {
    expect(seasonCls(null, 10)).toBe("text-xs text-gray-400");
  });

  it("returns default when both are null", () => {
    expect(seasonCls(null, null)).toBe("text-xs text-gray-400");
  });
});
