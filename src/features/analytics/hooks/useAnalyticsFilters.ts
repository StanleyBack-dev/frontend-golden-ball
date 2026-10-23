import { useCallback, useEffect, useState } from "react";
import type { AnalyticsFilter } from "../../../api/poll";
import { serverNow } from "../../../api/server-clock";

export const PERIOD_OPTIONS = [
  { value: "all", label: "Todo o período", hours: null },
  { value: "7d", label: "Últimos 7 dias", hours: 24 * 7 },
  { value: "24h", label: "Últimas 24 horas", hours: 24 },
  { value: "6h", label: "Últimas 6 horas", hours: 6 },
  { value: "1h", label: "Última hora", hours: 1 },
] as const;

export type PeriodKey = (typeof PERIOD_OPTIONS)[number]["value"];

export const GRANULARITY_OPTIONS = [
  { value: "", label: "Automático" },
  { value: "HOUR", label: "Por hora" },
  { value: "DAY", label: "Por dia" },
] as const;

export type GranularityKey = (typeof GRANULARITY_OPTIONS)[number]["value"];

export interface UiFilters {
  period: PeriodKey;
  granularity: GranularityKey;
}

export const DEFAULT_FILTERS: UiFilters = { period: "all", granularity: "" };

// Short Portuguese keys so shared links stay readable.
const URL_KEYS = { period: "periodo", granularity: "escala" } as const;

function readFromUrl(): UiFilters {
  const params = new URLSearchParams(window.location.search);
  const period = params.get(URL_KEYS.period) as PeriodKey;
  const granularity = (
    params.get(URL_KEYS.granularity) ?? ""
  ).toUpperCase() as GranularityKey;

  return {
    period: PERIOD_OPTIONS.some((p) => p.value === period) ? period : "all",
    granularity: GRANULARITY_OPTIONS.some((g) => g.value === granularity)
      ? granularity
      : "",
  };
}

function writeToUrl(filters: UiFilters) {
  const params = new URLSearchParams(window.location.search);
  params.delete(URL_KEYS.period);
  params.delete(URL_KEYS.granularity);

  if (filters.period !== "all") params.set(URL_KEYS.period, filters.period);
  if (filters.granularity) {
    params.set(URL_KEYS.granularity, filters.granularity.toLowerCase());
  }

  const query = params.toString();
  window.history.replaceState(
    null,
    "",
    `${window.location.pathname}${query ? `?${query}` : ""}${window.location.hash}`,
  );
}

/** Converts UI filters into the API filter (period → absolute `from`). */
export function toApiFilter(filters: UiFilters): AnalyticsFilter {
  const hours = PERIOD_OPTIONS.find((p) => p.value === filters.period)?.hours;
  // Rounded to the hour: data is hourly anyway, and a stable URL lets the CDN
  // serve the same response to everyone for the rest of the hour.
  const from = hours
    ? new Date(
        Math.floor((serverNow() - hours * 3_600_000) / 3_600_000) * 3_600_000,
      ).toISOString()
    : undefined;

  return { from, granularity: filters.granularity || undefined };
}

export function useAnalyticsFilters() {
  const [filters, setFilters] = useState<UiFilters>(readFromUrl);

  useEffect(() => {
    writeToUrl(filters);
  }, [filters]);

  const update = useCallback((patch: Partial<UiFilters>) => {
    setFilters((current) => ({ ...current, ...patch }));
  }, []);

  const reset = useCallback(() => setFilters(DEFAULT_FILTERS), []);

  const isFiltered = filters.period !== "all" || Boolean(filters.granularity);

  return { filters, update, reset, isFiltered };
}
