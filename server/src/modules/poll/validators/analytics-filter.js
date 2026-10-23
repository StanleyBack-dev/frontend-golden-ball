import { HttpError } from "../../../shared/http/http-error.js";

const GRANULARITIES = ["HOUR", "DAY"];
const ISO_INSTANT =
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2}(\.\d+)?)?(Z|[+-]\d{2}:\d{2})$/;

const ALLOWED_PARAMS = new Set(["from", "to", "granularity"]);

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

/**
 * Maps `/api/poll/analytics?...` query params onto the backend's
 * PollAnalyticsFilterInput. Strict allow-list: anything unexpected is a
 * 400 (the backend re-validates everything as well).
 */
export function parseAnalyticsFilter(query) {
  for (const key of Object.keys(query)) {
    if (!ALLOWED_PARAMS.has(key)) {
      throw new HttpError(400, `Parâmetro "${key}" não suportado.`);
    }
  }

  const filter = {
    from: matching(query, "from", ISO_INSTANT),
    to: matching(query, "to", ISO_INSTANT),
    granularity: oneOf(query, "granularity", GRANULARITIES),
  };

  return Object.fromEntries(
    Object.entries(filter).filter(([, value]) => value !== undefined),
  );
}
