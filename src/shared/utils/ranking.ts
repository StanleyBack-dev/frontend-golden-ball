/**
 * Most voted first. `Array.prototype.sort` is stable, so ties keep the
 * official (alphabetical) order the API returns.
 */
export function rankByVotes<T extends { votes: number }>(items: T[]): T[] {
  return [...items].sort((a, b) => b.votes - a.votes);
}
