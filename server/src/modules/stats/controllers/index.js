import { StatsService } from "../services/stats.service.js";
import { HttpError } from "../../../shared/http/http-error.js";
import { sendError } from "../../../shared/http/error-response.js";
import {
  parseLeaderboardFilter,
  parseNomineeFilter,
  SLUG,
} from "../validators/stats-filter.js";

const statsService = new StatsService();

// The stats tables change once a day (scheduled sync): let the CDN keep each
// filter combination for a while and serve stale copies while refreshing.
const CACHE_CONTROL =
  "public, max-age=300, s-maxage=1800, stale-while-revalidate=3600";

function requestContext(req) {
  return { clientIp: req.ip, requestId: req.requestId };
}

export function getLeaderboardController() {
  return async (req, res) => {
    try {
      const filter = parseLeaderboardFilter(req.query);
      const result = await statsService.getLeaderboard(
        filter,
        requestContext(req),
      );
      res.set("Cache-Control", CACHE_CONTROL);
      res.json(result);
    } catch (error) {
      sendError(res, error);
    }
  };
}

export function getNomineeController() {
  return async (req, res) => {
    try {
      if (!SLUG.test(req.params.slug)) {
        throw new HttpError(400, "Jogador inválido.");
      }
      const filter = parseNomineeFilter(req.query);
      const result = await statsService.getNominee(
        req.params.slug,
        filter,
        requestContext(req),
      );
      res.set("Cache-Control", CACHE_CONTROL);
      res.json(result);
    } catch (error) {
      sendError(res, error);
    }
  };
}
