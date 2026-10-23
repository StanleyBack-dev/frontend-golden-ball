import { useCallback, useEffect, useRef } from "react";
import { Info, Loader2 } from "lucide-react";
import {
  getNomineeStats,
  getStatsLeaderboard,
} from "../../../api/player-stats";
import {
  toLeaderboardFilter,
  toStatsFilter,
  usePlayerStatsFilters,
} from "../hooks/usePlayerStatsFilters";
import { useStatsQuery } from "../hooks/useStatsQuery";
import { SORT_LABELS } from "../utils/labels";
import LeaderboardTable from "./LeaderboardTable";
import NomineeStatsPanel from "./NomineeStatsPanel";
import StatsFilters from "./StatsFilters";

const updatedFormatter = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "America/Sao_Paulo",
});

export default function PlayerStatsSection() {
  const { filters, update, reset, isFiltered } = usePlayerStatsFilters();
  const panelRef = useRef<HTMLDivElement>(null);

  const { scope, competition, position, minMinutes, sortBy, order, nominee } =
    filters;

  const fetchLeaderboard = useCallback(
    (signal: AbortSignal) =>
      getStatsLeaderboard(
        toLeaderboardFilter({
          scope,
          competition,
          position,
          minMinutes,
          sortBy,
          order,
        }),
        signal,
      ),
    [scope, competition, position, minMinutes, sortBy, order],
  );
  const leaderboard = useStatsQuery(
    fetchLeaderboard,
    "Não foi possível carregar as estatísticas.",
  );

  const fetchNominee = useCallback(
    (signal: AbortSignal) =>
      getNomineeStats(nominee, toStatsFilter({ scope, competition }), signal),
    [nominee, scope, competition],
  );
  const detail = useStatsQuery(
    nominee ? fetchNominee : null,
    "Não foi possível carregar o jogador.",
  );

  // Bring the panel into view when a player is picked from the table.
  useEffect(() => {
    if (nominee) {
      panelRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [nominee]);

  const data = leaderboard.data;
  const updatedAt = data?.dataUpdatedAt ? new Date(data.dataUpdatedAt) : null;

  return (
    <section aria-labelledby="stats-heading" className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <p className="section-title">Raio-X dos indicados</p>
          <h2
            id="stats-heading"
            className="mt-1 font-display text-3xl font-semibold uppercase tracking-wide text-white sm:text-4xl"
          >
            Números da temporada
          </h2>
          <p className="mt-1 text-xs text-zinc-500">
            Temporada {data?.clubSeason ?? "25/26"} dos clubes + Copa do Mundo
            2026 · ordenado por{" "}
            <strong className="text-zinc-300">
              {SORT_LABELS[sortBy].toLowerCase()}
            </strong>
          </p>
        </div>
        {leaderboard.refreshing && data && (
          <Loader2
            className="h-4 w-4 animate-spin text-gold-400"
            aria-label="Atualizando"
          />
        )}
      </div>

      <StatsFilters
        filters={filters}
        competitions={data?.competitions ?? []}
        isFiltered={isFiltered}
        onChange={update}
        onReset={reset}
      />

      {leaderboard.error && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
          {leaderboard.error}{" "}
          <button
            type="button"
            className="font-semibold underline"
            onClick={() => void leaderboard.reload()}
          >
            Tentar novamente
          </button>
        </div>
      )}

      {!data && !leaderboard.error && (
        <div className="card flex h-48 items-center justify-center">
          <Loader2
            className="h-6 w-6 animate-spin text-zinc-500"
            aria-label="Carregando estatísticas"
          />
        </div>
      )}

      {data && (
        <div
          className={`transition-opacity ${leaderboard.refreshing ? "opacity-60" : ""}`}
          aria-busy={leaderboard.refreshing}
        >
          <LeaderboardTable
            rows={data.rows}
            sortBy={sortBy}
            order={order}
            selectedSlug={nominee}
            onSort={(field, direction) =>
              update({ sortBy: field, order: direction })
            }
            onSelect={(slug) =>
              update({ nominee: slug === nominee ? "" : slug })
            }
          />
        </div>
      )}

      {nominee && (
        <div ref={panelRef} className="scroll-mt-20">
          <NomineeStatsPanel
            stats={detail.data}
            error={detail.error}
            refreshing={detail.refreshing}
            onRetry={() => void detail.reload()}
            onClose={() => update({ nominee: "" })}
          />
        </div>
      )}

      <p className="flex items-start gap-2 text-xs leading-relaxed text-zinc-500">
        <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
        <span>
          Janela da Bola de Ouro encerrada: números finais da temporada dos
          clubes e da Copa do Mundo 2026, com dados da Highlightly
          {updatedAt && (
            <> (atualizados em {updatedFormatter.format(updatedAt)})</>
          )}
          . Notas e números detalhados vêm do box score dos jogos da Copa; nos
          clubes, os totais são por competição.
          {data && !data.dataComplete && (
            <strong className="text-gold-300">
              {" "}
              Carga dos dados em andamento: alguns jogos ainda não foram
              incluídos e entram nas próximas atualizações.
            </strong>
          )}
        </span>
      </p>
    </section>
  );
}
