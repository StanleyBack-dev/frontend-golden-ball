import { useCallback, useEffect, useState } from "react";
import type {
  LeaderboardFilter,
  LeaderboardSortField,
  SortOrder,
  StatsFilter,
  StatsScope,
} from "../../../api/player-stats";
import {
  MIN_MINUTES_OPTIONS,
  POSITION_OPTIONS,
  SCOPE_OPTIONS,
  SORT_LABELS,
} from "../utils/labels";

export interface StatsUiFilters {
  scope: StatsScope;
  competition: string;
  position: string;
  minMinutes: number;
  sortBy: LeaderboardSortField;
  order: SortOrder;
  /** Nominee open in the detail panel. */
  nominee: string;
}

export const DEFAULT_STATS_FILTERS: StatsUiFilters = {
  scope: "ALL",
  competition: "",
  position: "",
  minMinutes: 0,
  sortBy: "GOALS",
  order: "DESC",
  nominee: "",
};

// Short Portuguese keys so shared links stay readable.
const URL_KEYS = {
  scope: "escopo",
  competition: "comp",
  position: "pos",
  minMinutes: "min",
  sortBy: "stat",
  order: "sentido",
  nominee: "jogador",
} as const;

function readFromUrl(): StatsUiFilters {
  const params = new URLSearchParams(window.location.search);
  const get = (key: keyof typeof URL_KEYS) => params.get(URL_KEYS[key]) ?? "";

  const scope = get("scope").toUpperCase() as StatsScope;
  const sortBy = get("sortBy").toUpperCase() as LeaderboardSortField;
  const minMinutes = Number(get("minMinutes"));
  const competition = get("competition");
  const position = get("position");

  return {
    scope: SCOPE_OPTIONS.some((s) => s.value === scope) ? scope : "ALL",
    competition: competition.length <= 100 ? competition : "",
    position: (POSITION_OPTIONS as readonly string[]).includes(position)
      ? position
      : "",
    minMinutes: MIN_MINUTES_OPTIONS.some((m) => m.value === minMinutes)
      ? minMinutes
      : 0,
    sortBy: sortBy in SORT_LABELS ? sortBy : DEFAULT_STATS_FILTERS.sortBy,
    order: get("order") === "asc" ? "ASC" : "DESC",
    nominee: /^[a-z0-9-]{1,40}$/.test(get("nominee")) ? get("nominee") : "",
  };
}

function writeToUrl(filters: StatsUiFilters) {
  const params = new URLSearchParams(window.location.search);
  for (const key of Object.values(URL_KEYS)) params.delete(key);

  if (filters.scope !== "ALL") {
    params.set(URL_KEYS.scope, filters.scope.toLowerCase());
  }
  if (filters.competition)
    params.set(URL_KEYS.competition, filters.competition);
  if (filters.position) params.set(URL_KEYS.position, filters.position);
  if (filters.minMinutes) {
    params.set(URL_KEYS.minMinutes, String(filters.minMinutes));
  }
  if (filters.sortBy !== DEFAULT_STATS_FILTERS.sortBy) {
    params.set(URL_KEYS.sortBy, filters.sortBy.toLowerCase());
  }
  if (filters.order !== DEFAULT_STATS_FILTERS.order) {
    params.set(URL_KEYS.order, filters.order.toLowerCase());
  }
  if (filters.nominee) params.set(URL_KEYS.nominee, filters.nominee);

  const query = params.toString();
  window.history.replaceState(
    null,
    "",
    `${window.location.pathname}${query ? `?${query}` : ""}${window.location.hash}`,
  );
}

export function toStatsFilter(
  filters: Pick<StatsUiFilters, "scope" | "competition">,
): StatsFilter {
  return {
    scope: filters.scope === "ALL" ? undefined : filters.scope,
    competition: filters.competition || undefined,
  };
}

export function toLeaderboardFilter(
  filters: Omit<StatsUiFilters, "nominee">,
): LeaderboardFilter {
  return {
    ...toStatsFilter(filters),
    position: filters.position || undefined,
    minMinutes: filters.minMinutes || undefined,
    sortBy: filters.sortBy,
    order: filters.order,
  };
}

export function usePlayerStatsFilters() {
  const [filters, setFilters] = useState<StatsUiFilters>(readFromUrl);

  useEffect(() => {
    writeToUrl(filters);
  }, [filters]);

  const update = useCallback((patch: Partial<StatsUiFilters>) => {
    setFilters((current) => ({ ...current, ...patch }));
  }, []);

  /** Clears the filters but keeps the open nominee. */
  const reset = useCallback(
    () =>
      setFilters((current) => ({
        ...DEFAULT_STATS_FILTERS,
        nominee: current.nominee,
      })),
    [],
  );

  const isFiltered =
    filters.scope !== "ALL" ||
    Boolean(filters.competition) ||
    Boolean(filters.position) ||
    filters.minMinutes > 0;

  return { filters, update, reset, isFiltered };
}
