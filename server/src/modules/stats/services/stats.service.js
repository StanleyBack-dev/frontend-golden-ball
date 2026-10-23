import { executeGraphql } from "../../../shared/http/graphql-client.js";

const NOMINEE_FIELDS = `
  slug
  name
  fullName
  photoUrl
  club
  nationality
  position
  color
`;

const STAT_LINE_FIELDS = `
  gamesPlayed
  minutesPlayed
  goals
  assists
  goalContributions
  penaltiesScored
  yellowCards
  redCards
  goalsPer90
  contributionsPer90
  minutesPerGoal
`;

const MATCH_FIELDS = `
  competition
  round
  playedAt
  team
  opponent
  isHome
  score
  resultDescription
  position
  isSubstitute
  isCaptain
  minutesPlayed
  rating
  goals
  assists
  shotsTotal
  shotsOnTarget
  passesTotal
  passesSuccessful
  keyPasses
  dribblesTotal
  dribblesSuccessful
  duelsTotal
  duelsWon
  tackles
  interceptions
  foulsCommitted
  foulsSuffered
  yellowCards
  redCards
  expectedGoals
  expectedAssists
`;

export class StatsService {
  async getLeaderboard(filter, { clientIp, requestId }) {
    const query = `
      query PlayerStatsLeaderboard($filter: PlayerStatsLeaderboardFilterInput) {
        playerStatsLeaderboard(filter: $filter) {
          success
          message
          code
          data {
            clubSeason
            scope
            dataUpdatedAt
            dataComplete
            rows {
              rank
              nominee { ${NOMINEE_FIELDS} }
              ${STAT_LINE_FIELDS}
              averageRating
              competitionsPlayed
            }
            competitions { competition category nominees }
          }
        }
      }
    `;

    const data = await executeGraphql({
      query,
      variables: { filter },
      clientIp,
      requestId,
    });
    return data.playerStatsLeaderboard;
  }

  async getNominee(slug, filter, { clientIp, requestId }) {
    const query = `
      query NomineeSeasonStats($slug: String!, $filter: PlayerStatsFilterInput) {
        nomineeSeasonStats(slug: $slug, filter: $filter) {
          success
          message
          code
          data {
            nominee { ${NOMINEE_FIELDS} }
            clubSeason
            scope
            dataUpdatedAt
            dataComplete
            averageRating
            totals { ${STAT_LINE_FIELDS} }
            competitions {
              competition
              category
              team
              season
              ${STAT_LINE_FIELDS}
              substitutedIn
              substitutedOut
              averageRating
            }
            teams { team isNationalTeam ${STAT_LINE_FIELDS} }
            matchTotals {
              matches
              averageRating
              shotsTotal
              shotsOnTarget
              keyPasses
              passAccuracy
              dribbleSuccess
              duelsWonRate
              tackles
              interceptions
            }
            matches { ${MATCH_FIELDS} }
          }
        }
      }
    `;

    const data = await executeGraphql({
      query,
      variables: { slug, filter },
      clientIp,
      requestId,
    });
    return data.nomineeSeasonStats;
  }
}
