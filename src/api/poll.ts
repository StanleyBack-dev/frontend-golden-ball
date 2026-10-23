import { httpClient } from "./httpClient";
import { syncServerClock } from "./server-clock";

/** A Ballon d'Or nominee. */
export interface Candidate {
  slug: string;
  /** Short name as fans know the player ("Vini Jr."). */
  name: string;
  fullName: string;
  /** Optional player photo. */
  photoUrl: string | null;
  /** Club(s) during the season; "A / B" when the player moved mid-season. */
  club: string;
  nationality: string;
  position: string;
  color: string;
}

export interface VoteCounts {
  totalVotes: number;
}

export interface CandidateResult extends Candidate {
  votes: number;
  percentage: number;
}

export interface StateResult extends VoteCounts {
  state: string;
  candidates: Array<{ slug: string; votes: number; percentage: number }>;
}

export interface PollResults extends VoteCounts {
  votingOpen: boolean;
  /** Official closing instant (ISO 8601), the same for every state. */
  votingClosesAt: string;
  updatedAt: string;
  candidates: CandidateResult[];
  states: StateResult[];
}

/** The voter is identified by the Google session cookie, not the payload. */
export interface CastVotePayload {
  candidateSlug: string;
  state: string;
  privacyConsent: true;
  captchaToken?: string;
}

export interface CastVoteResult {
  registered: boolean;
  candidateSlug: string;
  state: string;
  /** When the vote was recorded, per the server (ISO 8601). */
  votedAt: string;
}

export type BrazilianRegion =
  "NORTE" | "NORDESTE" | "CENTRO_OESTE" | "SUDESTE" | "SUL";
export type StateSortField =
  "TOTAL_VOTES" | "STATE" | "MARGIN" | "CANDIDATE_SHARE";
export type SortOrder = "ASC" | "DESC";

export interface AnalyticsFilter {
  region?: BrazilianRegion;
  states?: string[];
  from?: string;
  to?: string;
  leader?: string;
  minVotes?: number;
  sortBy?: StateSortField;
  sortCandidate?: string;
  order?: SortOrder;
}

export interface CandidateShare {
  slug: string;
  votes: number;
  percentage: number;
}

export interface StateAnalytics extends VoteCounts {
  state: string;
  region: BrazilianRegion;
  shareOfSlice: number;
  candidates: CandidateShare[];
  leaderSlug: string | null;
  marginVotes: number;
  marginPoints: number;
}

export interface RegionAnalytics extends VoteCounts {
  region: BrazilianRegion;
  label: string;
  candidates: CandidateShare[];
  leaderSlug: string | null;
  marginPoints: number;
}

export interface TimelinePoint {
  at: string;
  totalVotes: number;
  cumulativeTotal: number;
  candidates: Array<{
    slug: string;
    votes: number;
    cumulativeVotes: number;
    cumulativePercentage: number;
  }>;
}

export interface PollAnalytics {
  summary: VoteCounts & {
    nationalVotes: number;
    shareOfNational: number;
    leaderSlug: string | null;
    marginVotes: number;
    marginPoints: number;
    statesWon: Array<{ slug: string; states: number }>;
    tiedStates: number;
    statesWithoutVotes: number;
  };
  candidates: CandidateResult[];
  regions: RegionAnalytics[];
  states: StateAnalytics[];
  granularity: "HOUR" | "DAY";
  timeline: TimelinePoint[];
  updatedAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  code?: string;
  data: T;
}

export async function getPollResults(): Promise<PollResults> {
  const response =
    await httpClient.get<ApiResponse<PollResults>>("/api/poll/results");
  syncServerClock(response.headers["date"], response.headers["age"]);
  return response.data.data;
}

export async function getPollAnalytics(
  filter: AnalyticsFilter,
  signal?: AbortSignal,
): Promise<PollAnalytics> {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(filter)) {
    if (value === undefined || value === "") continue;
    params.set(key, Array.isArray(value) ? value.join(",") : String(value));
  }
  const query = params.toString();

  const response = await httpClient.get<ApiResponse<PollAnalytics>>(
    `/api/poll/analytics${query ? `?${query}` : ""}`,
    { signal },
  );
  return response.data.data;
}

export async function castVote(
  payload: CastVotePayload,
): Promise<ApiResponse<CastVoteResult>> {
  const response = await httpClient.post<ApiResponse<CastVoteResult>>(
    "/api/poll/votes",
    payload,
  );
  return response.data;
}
