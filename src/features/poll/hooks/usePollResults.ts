import { useCallback, useEffect, useRef, useState } from "react";
import { getPollResults, type PollResults } from "../../../api/poll";
import { getHttpErrorMessage } from "../../../api/http-error";

const REFRESH_INTERVAL_MS = 15000;

export function usePollResults() {
  const [results, setResults] = useState<PollResults | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const inFlight = useRef(false);

  const refresh = useCallback(async () => {
    if (inFlight.current) return;
    inFlight.current = true;

    try {
      setResults(await getPollResults());
      setError(null);
    } catch (err) {
      setError(
        getHttpErrorMessage(err, "Não foi possível carregar os resultados."),
      );
    } finally {
      inFlight.current = false;
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();

    // Poll only while the tab is visible.
    const interval = window.setInterval(() => {
      if (document.visibilityState === "visible") void refresh();
    }, REFRESH_INTERVAL_MS);
    const onVisible = () => {
      if (document.visibilityState === "visible") void refresh();
    };
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      window.clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [refresh]);

  return { results, error, loading, refresh };
}
