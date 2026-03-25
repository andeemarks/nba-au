export type PlayerStats = {
  min: number | null;
  pts: number | null;
  reb: number | null;
  ast: number | null;
  stl: number | null;
  blk: number | null;
  fgPct: number | null;
  fg3Pct: number | null;
  ftPct: number | null;
};

export type LastGameInfo = {
  date: string;
  opponentAbbr: string;
  playerTeamScore: number;
  opponentScore: number;
  playerTeamWon: boolean;
  completed: boolean;
};

export type Player = {
  id: number;
  name: string;
  team: string;
  lastGame: string | null;
  lastGameInfo: LastGameInfo | null;
  lastGameStats: PlayerStats | null;
  lastFive: (boolean | null)[];
};

export type PlayerWithStats = Player & { stats: PlayerStats };

export type SortColumn = keyof PlayerStats | "name" | "lastGame";

export type SortDirection = "asc" | "desc";

export type SortState = {
  column: SortColumn;
  direction: SortDirection;
};

export type PlayersApiResponse = {
  players: PlayerWithStats[];
  season: string;
  updatedAt: string;
};
