import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
import { fetchAustralianPlayers } from "@/lib/nbaApi";
import type { PlayersApiResponse } from "@/lib/types";

function currentSeason(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  // NBA season starts in October; before October use previous year's season
  const startYear = month >= 10 ? year : year - 1;
  return `${startYear}-${String(startYear + 1).slice(-2)}`;
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  const { searchParams } = new URL(request.url);
  const season = searchParams.get("season") ?? currentSeason();

  try {
    const players = await fetchAustralianPlayers(season);
    const body: PlayersApiResponse = {
      players,
      season,
      updatedAt: new Date().toISOString(),
    };

    return NextResponse.json(body, {
      headers: { "Cache-Control": "public, max-age=300" },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    const cause = error instanceof Error && error.cause instanceof Error
      ? error.cause.message
      : String((error as any)?.cause ?? "");
    console.error("Failed to fetch player data:", message, cause);
    return NextResponse.json(
      { error: "Failed to fetch player data", detail: message, cause },
      { status: 502 }
    );
  }
}
