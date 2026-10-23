import { executeGraphql } from "../../../shared/http/graphql-client.js";

const CANDIDATE_FIELDS = `
  slug
  name
  fullName
  photoUrl
  club
  nationality
  position
  color
`;

export class PollService {
  async getCandidates({ clientIp, requestId }) {
    const query = `
      query Candidates {
        candidates {
          success
          message
          code
          data { ${CANDIDATE_FIELDS} }
        }
      }
    `;

    const data = await executeGraphql({ query, clientIp, requestId });
    return data.candidates;
  }

  async getResults({ clientIp, requestId }) {
    const query = `
      query PollResults {
        pollResults {
          success
          message
          code
          data {
            totalVotes
            votingOpen
            votingClosesAt
            updatedAt
            candidates {
              ${CANDIDATE_FIELDS}
              votes
              percentage
            }
          }
        }
      }
    `;

    const data = await executeGraphql({ query, clientIp, requestId });
    return data.pollResults;
  }

  async getAnalytics(filter, { clientIp, requestId }) {
    const query = `
      query PollAnalytics($filter: PollAnalyticsFilterInput) {
        pollAnalytics(filter: $filter) {
          success
          message
          code
          data {
            summary {
              totalVotes
              overallVotes
              shareOfOverall
              leaderSlug
              marginVotes
              marginPoints
              nomineesWithVotes
            }
            candidates {
              ${CANDIDATE_FIELDS}
              votes
              percentage
            }
            granularity
            timeline {
              at
              totalVotes
              cumulativeTotal
              candidates { slug votes cumulativeVotes cumulativePercentage }
            }
            updatedAt
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
    return data.pollAnalytics;
  }

  async castVote(input, { clientIp, requestId, sessionToken }) {
    const mutation = `
      mutation CastVote($input: CastVoteInputDto!) {
        castVote(input: $input) {
          success
          message
          code
          data {
            registered
            candidateSlug
            votedAt
          }
        }
      }
    `;

    const data = await executeGraphql({
      query: mutation,
      variables: { input },
      clientIp,
      requestId,
      sessionToken,
    });
    return data.castVote;
  }
}
