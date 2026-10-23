import { httpClient } from "./httpClient";
import type { ApiResponse, Candidate } from "./poll";

export type StatsScope =
  "ALL" | "CLUB" | "LEAGUE" | "DOMESTIC_CUP" | "CONTINENTAL" | "NATIONAL_TEAM";

export type CompetitionCategory =
  "LEAGUE" | "DOMESTIC_CUP" | "CONTINENTAL" | "NATIONAL_TEAM" | "OTHER";

export type LeaderboardSortField =
  | "GOALS"
  | "ASSISTS"
  | "GOAL_CONTRIBUTIONS"
  | "GAMES"
  | "MINUTES"
  | "GOALS_PER_90"
  | "CONTRIBUTIONS_PER_90"
  | "AVERAGE_RATING";

export type SortOrder = "ASC" | "DESC";

export interface StatLine {
  gamesPlayed: number;
  minutesPlayed: number;
  goals: number;
  assists: number;
  goalContributions: number;
  penaltiesScored: number;
  yellowCards: number;
  redCards: number;
  goalsPer90: number;
  contributionsPer90: number;
  /** null when the player didn't score. */
  minutesPerGoal: number | null;
}

export interface StatsFilter {
  scope?: StatsScope;
  competition?: string;
}

export interface LeaderboardFilter extends StatsFilter {
  position?: string;
  minMinutes?: number;
  sortBy?: LeaderboardSortField;
  order?: SortOrder;
}

export interface LeaderboardRow extends StatLine {
  rank: number;
  nominee: Candidate;
  /** Mean match rating (national-team box scores only). */
  averageRating: number | null;
  competitionsPlayed: number;
}

export interface CompetitionOption {
  competition: string;
  category: CompetitionCategory;
  nominees: number;
}

export interface PlayerStatsLeaderboard {
  clubSeason: string;
  scope: StatsScope;
  rows: LeaderboardRow[];
  competitions: CompetitionOption[];
  /** Last sync that wrote data (ISO 8601); null before the first one. */
  dataUpdatedAt: string | null;
  /** False while the daily sync is still filling in data. */
  dataComplete: boolean;
}

export interface CompetitionStats extends StatLine {
  competition: string;
  category: CompetitionCategory;
  team: string;
  season: string;
  substitutedIn: number;
  substitutedOut: number;
  averageRating: number | null;
}

export interface TeamStats extends StatLine {
  team: string;
  isNationalTeam: boolean;
}

export interface PlayerMatch {
  competition: string;
  round: string | null;
  playedAt: string;
  team: string;
  opponent: string;
  isHome: boolean;
  /** Home team first ("2 - 1"). */
  score: string | null;
  resultDescription: string | null;
  position: string | null;
  isSubstitute: boolean;
  isCaptain: boolean;
  minutesPlayed: number;
  rating: number | null;
  goals: number;
  assists: number;
  shotsTotal: number;
  shotsOnTarget: number;
  passesTotal: number;
  passesSuccessful: number;
  keyPasses: number;
  dribblesTotal: number;
  dribblesSuccessful: number;
  duelsTotal: number;
  duelsWon: number;
  tackles: number;
  interceptions: number;
  foulsCommitted: number;
  foulsSuffered: number;
  yellowCards: number;
  redCards: number;
  expectedGoals: number | null;
  expectedAssists: number | null;
}

export interface MatchTotals {
  matches: number;
  averageRating: number | null;
  shotsTotal: number;
  shotsOnTarget: number;
  keyPasses: number;
  passAccuracy: number;
  dribbleSuccess: number;
  duelsWonRate: number;
  tackles: number;
  interceptions: number;
}

export interface NomineeSeasonStats {
  nominee: Candidate;
  clubSeason: string;
  scope: StatsScope;
  totals: StatLine;
  averageRating: number | null;
  competitions: CompetitionStats[];
  teams: TeamStats[];
  matches: PlayerMatch[];
  matchTotals: MatchTotals | null;
  dataUpdatedAt: string | null;
  /** False while the daily sync is still filling in data. */
  dataComplete: boolean;
}

function toQuery(filter: object): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(filter)) {
    if (value === undefined || value === "") continue;
    params.set(key, String(value));
  }
  const query = params.toString();
  return query ? `?${query}` : "";
}

export async function getStatsLeaderboard(
  filter: LeaderboardFilter,
  signal?: AbortSignal,
): Promise<PlayerStatsLeaderboard> {
  const response = await httpClient.get<ApiResponse<PlayerStatsLeaderboard>>(
    `/api/stats/leaderboard${toQuery(filter)}`,
    { signal },
  );
  return response.data.data;
}

export async function getNomineeStats(
  slug: string,
  filter: StatsFilter,
  signal?: AbortSignal,
): Promise<NomineeSeasonStats> {
  const response = await httpClient.get<ApiResponse<NomineeSeasonStats>>(
    `/api/stats/nominees/${encodeURIComponent(slug)}${toQuery(filter)}`,
    { signal },
  );
  return response.data.data;
}
