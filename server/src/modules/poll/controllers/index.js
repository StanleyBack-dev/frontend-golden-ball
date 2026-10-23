import { PollService } from "../services/poll.service.js";
import { HttpError } from "../../../shared/http/http-error.js";
import { sendError } from "../../../shared/http/error-response.js";
import { parseAnalyticsFilter } from "../validators/analytics-filter.js";
import {
  clearSessionCookie,
  readSessionToken,
} from "../../../shared/http/session-cookie.js";

const pollService = new PollService();

function requestContext(req) {
  return { clientIp: req.ip, requestId: req.requestId };
}

// Only these fields, with these types, are forwarded upstream. The voter is
// identified by the session cookie, never by the request body.
function pickVoteInput(body) {
  const input = {
    candidateSlug: body?.candidateSlug,
    privacyConsent: body?.privacyConsent,
    captchaToken: body?.captchaToken || undefined,
  };

  const isValid =
    typeof input.candidateSlug === "string" &&
    input.candidateSlug.length > 0 &&
    input.candidateSlug.length <= 40 &&
    input.privacyConsent === true &&
    (input.captchaToken === undefined ||
      (typeof input.captchaToken === "string" &&
        input.captchaToken.length <= 2048));

  if (!isValid) {
    throw new HttpError(400, "Dados do voto inválidos.");
  }

  return input;
}

export function getCandidatesController() {
  return async (req, res) => {
    try {
      const result = await pollService.getCandidates(requestContext(req));
      // Static for the whole poll: let the CDN serve it.
      res.set("Cache-Control", "public, max-age=300, s-maxage=3600");
      res.json(result);
    } catch (error) {
      sendError(res, error);
    }
  };
}

export function getResultsController() {
  return async (req, res) => {
    try {
      const result = await pollService.getResults(requestContext(req));
      // A few seconds of CDN caching absorbs polling spikes from every open
      // page without making the numbers feel stale.
      res.set(
        "Cache-Control",
        "public, max-age=5, s-maxage=5, stale-while-revalidate=10",
      );
      res.json(result);
    } catch (error) {
      sendError(res, error);
    }
  };
}

export function getAnalyticsController() {
  return async (req, res) => {
    try {
      const filter = parseAnalyticsFilter(req.query);
      const result = await pollService.getAnalytics(
        filter,
        requestContext(req),
      );
      // Cached per full URL (filters included) at the CDN.
      res.set(
        "Cache-Control",
        "public, max-age=10, s-maxage=10, stale-while-revalidate=20",
      );
      res.json(result);
    } catch (error) {
      sendError(res, error);
    }
  };
}

export function castVoteController() {
  return async (req, res) => {
    res.set("Cache-Control", "no-store");
    try {
      const sessionToken = readSessionToken(req);
      if (!sessionToken) {
        throw new HttpError(401, "Entre com sua conta Google para votar.", {
          code: "AUTH_REQUIRED",
        });
      }

      const result = await pollService.castVote(pickVoteInput(req.body), {
        ...requestContext(req),
        sessionToken,
      });
      res.status(201).json(result);
    } catch (error) {
      // The session expired or was revoked: drop the dead cookie.
      if (error instanceof HttpError && error.code === "AUTH_REQUIRED") {
        clearSessionCookie(res);
      }
      sendError(res, error);
    }
  };
}
