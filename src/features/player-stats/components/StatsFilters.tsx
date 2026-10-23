import { RotateCcw } from "lucide-react";
import type { CompetitionOption } from "../../../api/player-stats";
import type { StatsUiFilters } from "../hooks/usePlayerStatsFilters";
import {
  CATEGORY_LABELS,
  competitionName,
  MIN_MINUTES_OPTIONS,
  POSITION_OPTIONS,
  SCOPE_OPTIONS,
} from "../utils/labels";

interface StatsFiltersProps {
  filters: StatsUiFilters;
  competitions: CompetitionOption[];
  isFiltered: boolean;
  onChange: (patch: Partial<StatsUiFilters>) => void;
  onReset: () => void;
}

const selectClass = "field py-2 text-sm";

export default function StatsFilters({
  filters,
  competitions,
  isFiltered,
  onChange,
  onReset,
}: StatsFiltersProps) {
  // Only the competitions inside the chosen scope.
  const competitionOptions = competitions.filter((option) => {
    switch (filters.scope) {
      case "ALL":
        return true;
      case "CLUB":
        return option.category !== "NATIONAL_TEAM";
      default:
        return option.category === filters.scope;
    }
  });

  return (
    <div className="card space-y-4 p-4">
      <div
        className="-mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1"
        role="tablist"
        aria-label="Competições"
      >
        {SCOPE_OPTIONS.map((option) => {
          const active = filters.scope === option.value;
          return (
            <button
              key={option.value}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() =>
                // A competition outside the new scope would match nothing.
                onChange({ scope: option.value, competition: "" })
              }
              className={`shrink-0 rounded-full px-3.5 py-1.5 text-sm font-medium transition ${
                active
                  ? "bg-gold-gradient text-ink-950"
                  : "border border-white/10 text-zinc-300 hover:border-gold-400/50 hover:text-white"
              }`}
            >
              {option.label}
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-[repeat(3,minmax(0,1fr))_auto] lg:items-end">
        <Filter label="Competição" className="col-span-2 lg:col-span-1">
          <select
            value={filters.competition}
            onChange={(e) => onChange({ competition: e.target.value })}
            className={selectClass}
          >
            <option value="">Todas do recorte</option>
            {competitionOptions.map((option) => (
              <option key={option.competition} value={option.competition}>
                {competitionName(option.competition)} ·{" "}
                {CATEGORY_LABELS[option.category]} ({option.nominees})
              </option>
            ))}
          </select>
        </Filter>

        <Filter label="Posição">
          <select
            value={filters.position}
            onChange={(e) => onChange({ position: e.target.value })}
            className={selectClass}
          >
            <option value="">Todas</option>
            {POSITION_OPTIONS.map((position) => (
              <option key={position} value={position}>
                {position}
              </option>
            ))}
          </select>
        </Filter>

        <Filter label="Minutagem">
          <select
            value={filters.minMinutes}
            onChange={(e) => onChange({ minMinutes: Number(e.target.value) })}
            className={selectClass}
          >
            {MIN_MINUTES_OPTIONS.map((option) => (
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
          className="col-span-2 flex items-center justify-center gap-1.5 rounded-lg px-2.5 py-2 text-sm font-medium text-zinc-300 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40 lg:col-span-1"
        >
          <RotateCcw className="h-3.5 w-3.5" aria-hidden />
          Limpar
        </button>
      </div>
    </div>
  );
}

function Filter({
  label,
  className = "",
  children,
}: {
  label: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <label className={`block min-w-0 ${className}`}>
      <span className="mb-1 block text-[11px] font-medium uppercase tracking-wide text-zinc-400">
        {label}
      </span>
      {children}
    </label>
  );
}
