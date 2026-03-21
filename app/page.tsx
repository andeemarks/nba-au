"use client";

import { useState } from "react";
import useSWR from "swr";
import type { PlayersApiResponse, SortColumn, SortState } from "@/lib/types";
import { sortPlayers } from "@/lib/sort";
import PlayerTable from "@/components/PlayerTable";
import LoadingState from "@/components/LoadingState";
import ErrorState from "@/components/ErrorState";

const DEFAULT_SORT: SortState = { column: "lastGame", direction: "desc" };

async function fetcher(url: string): Promise<PlayersApiResponse> {
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch");
  return res.json();
}

export default function PlayersPage() {
  const [sortState, setSortState] = useState<SortState>(DEFAULT_SORT);

  const { data, error, isLoading, mutate } = useSWR<PlayersApiResponse>(
    "/api/players",
    fetcher,
    { revalidateOnFocus: true }
  );

  function handleSort(column: SortColumn) {
    setSortState((prev) => ({
      column,
      direction: prev.column === column && prev.direction === "desc" ? "asc" : "desc",
    }));
  }

  const sortedPlayers = data
    ? sortPlayers(data.players, sortState.column, sortState.direction)
    : [];

  return (
    <main className="mx-auto max-w-7xl px-4 py-10">
      <header className="mb-8">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Australian NBA Players
            </h1>
            <p className="mt-1 text-gray-500">
              Per-game statistics for active Australian players
            </p>
          </div>
          {data && (
            <span className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800">
              {data.season} Season
            </span>
          )}
        </div>
      </header>

      {isLoading && <LoadingState />}

      {error && !isLoading && (
        <ErrorState onRetry={() => mutate()} />
      )}

      {data && !isLoading && sortedPlayers.length === 0 && (
        <div className="rounded-lg border border-gray-200 bg-white px-8 py-16 text-center text-gray-500">
          No Australian players found for this season.
        </div>
      )}

      {data && sortedPlayers.length > 0 && (
        <PlayerTable
          players={sortedPlayers}
          sortState={sortState}
          onSort={handleSort}
        />
      )}

      {data && (
        <p className="mt-4 text-right text-xs text-gray-400">
          Updated {new Date(data.updatedAt).toLocaleTimeString()}
        </p>
      )}
    </main>
  );
}
