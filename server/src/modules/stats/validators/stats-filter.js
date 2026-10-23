import { HttpError } from "../../../shared/http/http-error.js";

const SCOPES = [
  "ALL",
  "CLUB",
  "LEAGUE",
  "DOMESTIC_CUP",
  "CONTINENTAL",
  "NATIONAL_TEAM",
];
const SORT_FIELDS = [
  "GOALS",
  "ASSISTS",
  "GOAL_CONTRIBUTIONS",
  "GAMES",
  "MINUTES",
  "GOALS_PER_90",
  "CONTRIBUTIONS_PER_90",
  "AVERAGE_RATING",
];
const ORDERS = ["ASC", "DESC"];
const POSITIONS = ["Atacante", "Meio-campista", "Lateral", "Zagueiro"];
// Competition names as the provider spells them ("UEFA Champions League").
const COMPETITION = /^[\p{L}\p{N} .'&/()-]{1,100}$/u;
export const SLUG = /^[a-z0-9-]{1,40}$/;

function single(query, key) {
  const value = query[key];
  if (value === undefined || value === "") return undefined;
  if (typeof value !== "string") {
    throw new HttpError(400, `Parâmetro "${key}" inválido.`);
  }
  return value;
}

function oneOf(query, key, allowed) {
  const value = single(query, key);
  if (value !== undefined && !allowed.includes(value)) {
    throw new HttpError(400, `Parâmetro "${key}" inválido.`);
  }
  return value;
}

function matching(query, key, pattern) {
  const value = single(query, key);
  if (value !== undefined && !pattern.test(value)) {
    throw new HttpError(400, `Parâmetro "${key}" inválido.`);
  }
  return value;
}

function onlyAllowed(query, allowed) {
  for (const key of Object.keys(query)) {
    if (!allowed.has(key)) {
      throw new HttpError(400, `Parâmetro "${key}" não suportado.`);
    }
  }
}

function compact(filter) {
  return Object.fromEntries(
    Object.entries(filter).filter(([, value]) => value !== undefined),
  );
}

const NOMINEE_PARAMS = new Set(["scope", "competition"]);
const LEADERBOARD_PARAMS = new Set([
  ...NOMINEE_PARAMS,
  "position",
  "minMinutes",
  "sortBy",
  "order",
]);

/**
 * Maps `/api/stats/nominees/:slug?...` onto PlayerStatsFilterInput. Strict
 * allow-list: anything unexpected is a 400 (the backend re-validates too).
 */
export function parseNomineeFilter(query) {
  onlyAllowed(query, NOMINEE_PARAMS);
  return compact({
    scope: oneOf(query, "scope", SCOPES),
    competition: matching(query, "competition", COMPETITION),
  });
}

/** Maps `/api/stats/leaderboard?...` onto the leaderboard filter. */
export function parseLeaderboardFilter(query) {
  onlyAllowed(query, LEADERBOARD_PARAMS);
  const minMinutes = matching(query, "minMinutes", /^\d{1,5}$/);

  return compact({
    scope: oneOf(query, "scope", SCOPES),
    competition: matching(query, "competition", COMPETITION),
    position: oneOf(query, "position", POSITIONS),
    minMinutes: minMinutes ? Number(minMinutes) : undefined,
    sortBy: oneOf(query, "sortBy", SORT_FIELDS),
    order: oneOf(query, "order", ORDERS),
  });
}
