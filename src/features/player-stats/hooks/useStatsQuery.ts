import { useCallback, useEffect, useRef, useState } from "react";
import { getHttpErrorMessage } from "../../../api/http-error";

/**
 * Loads `fetcher` whenever it changes (i.e. when its filters change). On
 * refetch the previous data stays on screen, shown dimmed via `refreshing`;
 * a newer request aborts the one in flight. No polling: the stats change
 * once a day.
 */
export function useStatsQuery<T>(
  fetcher: ((signal: AbortSignal) => Promise<T>) | null,
  errorMessage: string,
) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const controllerRef = useRef<AbortController | null>(null);

  const load = useCallback(async () => {
    controllerRef.current?.abort();
    if (!fetcher) {
      setData(null);
      setError(null);
      setRefreshing(false);
      return;
    }

    const controller = new AbortController();
    controllerRef.current = controller;
    setRefreshing(true);

    try {
      const result = await fetcher(controller.signal);
      if (controller.signal.aborted) return;
      setData(result);
      setError(null);
    } catch (err) {
      if (controller.signal.aborted) return;
      setError(getHttpErrorMessage(err, errorMessage));
    } finally {
      if (!controller.signal.aborted) setRefreshing(false);
    }
  }, [fetcher, errorMessage]);

  useEffect(() => {
    void load();
    return () => controllerRef.current?.abort();
  }, [load]);

  return { data, error, refreshing, reload: load };
}
