import { RotateCcw } from "lucide-react";
import {
  GRANULARITY_OPTIONS,
  PERIOD_OPTIONS,
  type UiFilters,
} from "../hooks/useAnalyticsFilters";

interface AnalyticsFiltersProps {
  filters: UiFilters;
  isFiltered: boolean;
  onChange: (patch: Partial<UiFilters>) => void;
  onReset: () => void;
}

const selectClass = "field py-2 text-sm";

export default function AnalyticsFilters({
  filters,
  isFiltered,
  onChange,
  onReset,
}: AnalyticsFiltersProps) {
  return (
    <div className="card grid grid-cols-2 gap-3 p-4 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] sm:items-end">
      <Filter label="Período">
        <select
          value={filters.period}
          onChange={(e) =>
            onChange({ period: e.target.value as UiFilters["period"] })
          }
          className={selectClass}
        >
          {PERIOD_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </Filter>

      <Filter label="Evolução">
        <select
          value={filters.granularity}
          onChange={(e) =>
            onChange({
              granularity: e.target.value as UiFilters["granularity"],
            })
          }
          className={selectClass}
        >
          {GRANULARITY_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </Filter>

      <button
        type="button"
        onClick={onReset}
        disabled={!isFiltered}
        className="col-span-2 flex items-center justify-center gap-1.5 rounded-lg px-2.5 py-2 text-sm font-medium text-zinc-300 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40 sm:col-span-1"
      >
        <RotateCcw className="h-3.5 w-3.5" aria-hidden />
        Limpar
      </button>
    </div>
  );
}

function Filter({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block min-w-0">
      <span className="mb-1 block text-[11px] font-medium uppercase tracking-wide text-zinc-400">
        {label}
      </span>
      {children}
    </label>
  );
}
