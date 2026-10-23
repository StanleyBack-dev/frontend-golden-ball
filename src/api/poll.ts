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

export interface PollResults extends VoteCounts {
  votingOpen: boolean;
  /** Official closing instant (ISO 8601). */
  votingClosesAt: string;
  updatedAt: string;
  candidates: CandidateResult[];
}

/** The voter is identified by the Google session cookie, not the payload. */
export interface CastVotePayload {
  candidateSlug: string;
  privacyConsent: true;
  captchaToken?: string;
}

export interface CastVoteResult {
  registered: boolean;
  candidateSlug: string;
  /** When the vote was recorded, per the server (ISO 8601). */
  votedAt: string;
}

export type TimelineGranularity = "HOUR" | "DAY";

export interface AnalyticsFilter {
  from?: string;
  to?: string;
  granularity?: TimelineGranularity;
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
    /** Votes since the poll opened, whatever the period. */
    overallVotes: number;
    shareOfOverall: number;
    leaderSlug: string | null;
    marginVotes: number;
    marginPoints: number;
    nomineesWithVotes: number;
  };
  /** Votes and shares within the period. */
  candidates: CandidateResult[];
  granularity: TimelineGranularity;
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
    params.set(key, String(value));
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
