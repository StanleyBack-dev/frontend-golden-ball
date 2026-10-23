import { Loader2, X } from "lucide-react";
import type { NomineeSeasonStats } from "../../../api/player-stats";
import { formatDecimal, formatInteger } from "../../../shared/utils/format";
import CandidatePhoto from "../../poll/components/CandidatePhoto";
import CompetitionTable from "./CompetitionTable";
import MatchLog from "./MatchLog";
import RatingBadge from "./RatingBadge";

interface NomineeStatsPanelProps {
  stats: NomineeSeasonStats | null;
  error: string | null;
  refreshing: boolean;
  onRetry: () => void;
  onClose: () => void;
}

export default function NomineeStatsPanel({
  stats,
  error,
  refreshing,
  onRetry,
  onClose,
}: NomineeStatsPanelProps) {
  if (error) {
    return (
      <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
        {error}{" "}
        <button
          type="button"
          className="font-semibold underline"
          onClick={onRetry}
        >
          Tentar novamente
        </button>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="card flex h-64 items-center justify-center">
        <Loader2
          className="h-6 w-6 animate-spin text-zinc-500"
          aria-label="Carregando jogador"
        />
      </div>
    );
  }

  const { nominee, totals, matchTotals } = stats;

  return (
    <article
      aria-label={`Temporada de ${nominee.fullName}`}
      className={`card overflow-hidden transition-opacity ${refreshing ? "opacity-60" : ""}`}
      aria-busy={refreshing}
    >
      <header
        className="relative flex items-center gap-4 border-b border-white/[0.06] p-4 sm:p-6"
        style={{
          background: `linear-gradient(120deg, ${nominee.color}26, transparent 60%)`,
        }}
      >
        <CandidatePhoto
          candidate={nominee}
          className="h-20 w-20 text-xl sm:h-24 sm:w-24"
        />
        <div className="min-w-0 flex-1">
          <p className="section-title text-[11px]">
            Temporada {stats.clubSeason} + Copa 2026
          </p>
          <h3 className="mt-1 truncate font-display text-2xl font-semibold uppercase tracking-wide text-white sm:text-3xl">
            {nominee.fullName}
          </h3>
          <p className="truncate text-sm text-zinc-400">
            {nominee.club} · {nominee.nationality} · {nominee.position}
          </p>
        </div>
        {stats.averageRating !== null && (
          <div className="hidden text-center sm:block">
            <RatingBadge rating={stats.averageRating} size="lg" />
            <p className="mt-1 text-[10px] uppercase tracking-wide text-zinc-500">
              Nota média
            </p>
          </div>
        )}
        <button
          type="button"
          onClick={onClose}
          aria-label="Fechar jogador"
          className="absolute right-3 top-3 rounded-lg p-1.5 text-zinc-400 hover:bg-white/10 hover:text-white"
        >
          <X className="h-4 w-4" aria-hidden />
        </button>
      </header>

      <div className="space-y-6 p-4 sm:p-6">
        <dl className="grid grid-cols-3 gap-2 sm:grid-cols-6">
          <Stat label="Jogos" value={totals.gamesPlayed} />
          <Stat label="Gols" value={totals.goals} highlight />
          <Stat label="Assistências" value={totals.assists} highlight />
          <Stat label="Minutos" value={formatInteger(totals.minutesPlayed)} />
          <Stat
            label="Min/gol"
            value={
              totals.minutesPerGoal === null
                ? "—"
                : formatInteger(totals.minutesPerGoal)
            }
          />
          <Stat
            label="G+A/90"
            value={formatDecimal(totals.contributionsPer90)}
          />
        </dl>

        <section>
          <h4 className="mb-3 font-display text-lg uppercase tracking-wider text-white">
            Por competição
          </h4>
          <CompetitionTable
            competitions={stats.competitions}
            teams={stats.teams}
            totals={totals}
          />
        </section>

        {matchTotals && (
          <section>
            <h4 className="font-display text-lg uppercase tracking-wider text-white">
              Jogo a jogo na Copa
            </h4>
            <p className="mb-3 text-xs text-zinc-500">
              Box score completo de cada partida · toque para ver os detalhes
            </p>
            <dl className="mb-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
              <Stat
                label="Chutes no alvo"
                value={`${matchTotals.shotsOnTarget}/${matchTotals.shotsTotal}`}
              />
              <Stat
                label="Passes certos"
                value={`${formatDecimal(matchTotals.passAccuracy, 0)}%`}
              />
              <Stat
                label="Dribles certos"
                value={`${formatDecimal(matchTotals.dribbleSuccess, 0)}%`}
              />
              <Stat
                label="Duelos ganhos"
                value={`${formatDecimal(matchTotals.duelsWonRate, 0)}%`}
              />
            </dl>
            <MatchLog matches={stats.matches} />
          </section>
        )}
      </div>
    </article>
  );
}

function Stat({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: React.ReactNode;
  highlight?: boolean;
}) {
  return (
    // Label first in the markup (dt before dd), shown below the value.
    <div className="flex flex-col-reverse rounded-xl border border-white/[0.06] bg-white/[0.02] px-3 py-2.5 text-center">
      <dt className="text-[10px] uppercase tracking-wide text-zinc-500">
        {label}
      </dt>
      <dd
        className={`font-display text-2xl font-semibold tabular-nums ${highlight ? "text-gold-gradient" : "text-white"}`}
      >
        {value}
      </dd>
    </div>
  );
}
