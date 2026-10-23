import { Loader2 } from "lucide-react";
import { formatTime } from "../../../shared/utils/format";
import {
  PERIOD_OPTIONS,
  useAnalyticsFilters,
} from "../hooks/useAnalyticsFilters";
import { usePollAnalytics } from "../hooks/usePollAnalytics";
import AnalyticsFilters from "./AnalyticsFilters";
import KpiRow from "./KpiRow";
import PeriodRanking from "./PeriodRanking";
import TimelineChart from "./TimelineChart";

interface AnalyticsSectionProps {
  /** Bumped after a vote so the analysis refreshes right away. */
  refreshKey: number;
}

export default function AnalyticsSection({
  refreshKey,
}: AnalyticsSectionProps) {
  const { filters, update, reset, isFiltered } = useAnalyticsFilters();
  const { data, error, refreshing, reload } = usePollAnalytics(
    filters,
    refreshKey,
  );

  const periodLabel = PERIOD_OPTIONS.find(
    (option) => option.value === filters.period,
  )!.label;

  return (
    <section aria-labelledby="analytics-heading" className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <p className="section-title">Raio-X da votação</p>
          <h2
            id="analytics-heading"
            className="mt-1 font-display text-3xl font-semibold uppercase tracking-wide text-white sm:text-4xl"
          >
            Análise por período
          </h2>
          <p className="mt-1 text-xs text-zinc-500">
            Período: <strong className="text-zinc-300">{periodLabel}</strong>
            {data && <> · atualizado às {formatTime(data.updatedAt)}</>}
          </p>
        </div>
        {refreshing && (
          <Loader2
            className="h-4 w-4 animate-spin text-gold-400"
            aria-label="Atualizando"
          />
        )}
      </div>

      <AnalyticsFilters
        filters={filters}
        isFiltered={isFiltered}
        onChange={update}
        onReset={reset}
      />

      {error && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
          {error}{" "}
          <button
            type="button"
            className="font-semibold underline"
            onClick={() => void reload()}
          >
            Tentar novamente
          </button>
        </div>
      )}

      {!data && !error && (
        <div className="card flex h-48 items-center justify-center">
          <Loader2
            className="h-6 w-6 animate-spin text-zinc-500"
            aria-label="Carregando análise"
          />
        </div>
      )}

      {data && (
        <div
          className={`space-y-4 transition-opacity ${refreshing ? "opacity-60" : ""}`}
          aria-busy={refreshing}
        >
          <KpiRow analytics={data} periodLabel={periodLabel} />

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
            <Card
              className="lg:col-span-3"
              title="Evolução dos votos"
              subtitle={`Top 5 · acumulado por ${data.granularity === "HOUR" ? "hora" : "dia"} · horário de Brasília`}
            >
              <TimelineChart
                candidates={data.candidates}
                timeline={data.timeline}
                granularity={data.granularity}
              />
            </Card>

            <Card
              className="lg:col-span-2"
              title="Mais votados no período"
              subtitle="Top 10 · percentual dos votos do período"
            >
              <PeriodRanking candidates={data.candidates} />
            </Card>
          </div>
        </div>
      )}
    </section>
  );
}

function Card({
  title,
  subtitle,
  className = "",
  children,
}: {
  title: string;
  subtitle?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={`card min-w-0 p-4 sm:p-5 ${className}`}>
      <h3 className="font-display text-lg uppercase tracking-wider text-white">
        {title}
      </h3>
      {subtitle && <p className="mb-4 text-xs text-zinc-400">{subtitle}</p>}
      {children}
    </div>
  );
}
