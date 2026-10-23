import type { PollAnalytics } from "../../../api/poll";
import {
  formatInteger,
  formatPercent,
  formatVotes,
} from "../../../shared/utils/format";
import { rankByVotes } from "../../../shared/utils/ranking";

interface KpiRowProps {
  analytics: PollAnalytics;
  periodLabel: string;
}

const formatPoints = (value: number) =>
  `${value.toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 })} p.p.`;

export default function KpiRow({ analytics, periodLabel }: KpiRowProps) {
  const { summary, candidates } = analytics;
  const leader = candidates.find((c) => c.slug === summary.leaderSlug);
  const runnerUp = rankByVotes(candidates).find(
    (c) => c.slug !== leader?.slug && c.votes > 0,
  );
  const wholePoll = summary.totalVotes === summary.overallVotes;

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      <Tile label={`Votos · ${periodLabel}`}>
        <Value>{formatInteger(summary.totalVotes)}</Value>
        <Detail>
          {wholePoll
            ? "Desde a abertura da votação"
            : `${formatPercent(summary.shareOfOverall)} de ${formatInteger(summary.overallVotes)} no total`}
        </Detail>
      </Tile>

      <Tile label="Liderança no período">
        {leader ? (
          <>
            <NomineeName color={leader.color} name={leader.name} />
            <Detail>
              +{formatPoints(summary.marginPoints)} ·{" "}
              {formatVotes(summary.marginVotes)}
            </Detail>
          </>
        ) : (
          <>
            <Value>{summary.totalVotes ? "Empate" : "—"}</Value>
            <Detail>
              {summary.totalVotes ? "Mesma votação" : "Sem votos"}
            </Detail>
          </>
        )}
      </Tile>

      <Tile label="2º lugar">
        {runnerUp ? (
          <>
            <NomineeName color={runnerUp.color} name={runnerUp.name} />
            <Detail>
              {formatPercent(runnerUp.percentage)} ·{" "}
              {formatVotes(runnerUp.votes)}
            </Detail>
          </>
        ) : (
          <>
            <Value>—</Value>
            <Detail>Ainda sem segundo colocado</Detail>
          </>
        )}
      </Tile>

      <Tile label="Jogadores votados">
        <Value>
          {summary.nomineesWithVotes}/{candidates.length}
        </Value>
        <Detail>indicados com ao menos 1 voto no período</Detail>
      </Tile>
    </div>
  );
}

function NomineeName({ color, name }: { color: string; name: string }) {
  return (
    <p className="flex items-center gap-2 text-base font-semibold leading-tight text-white">
      <span
        className="h-2.5 w-2.5 shrink-0 rounded-full"
        style={{ background: color }}
        aria-hidden
      />
      <span className="min-w-0 break-words">{name}</span>
    </p>
  );
}

function Tile({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="card min-w-0 rounded-xl p-4">
      <p className="mb-2 truncate text-xs font-medium text-zinc-400">{label}</p>
      {children}
    </div>
  );
}

function Value({ children }: { children: React.ReactNode }) {
  return (
    <p className="font-display text-3xl font-semibold leading-tight text-white">
      {children}
    </p>
  );
}

function Detail({ children }: { children: React.ReactNode }) {
  return <p className="mt-1 text-xs text-zinc-400">{children}</p>;
}
