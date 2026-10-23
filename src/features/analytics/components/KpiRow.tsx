import type { PollAnalytics } from "../../../api/poll";
import {
  formatInteger,
  formatPercent,
  formatVotes,
} from "../../../shared/utils/format";
import { rankByVotes } from "../../../shared/utils/ranking";

// Nominees listed in the "states led" tile.
const STATES_WON_TOP = 3;

interface KpiRowProps {
  analytics: PollAnalytics;
  scopeLabel: string;
}

const formatPoints = (value: number) =>
  `${value.toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 })} p.p.`;

export default function KpiRow({ analytics, scopeLabel }: KpiRowProps) {
  const { summary, candidates } = analytics;
  const leader = candidates.find((c) => c.slug === summary.leaderSlug);
  const statesWon = summary.statesWon
    .filter((won) => won.states > 0)
    .sort((a, b) => b.states - a.states);
  const runnerUp = rankByVotes(candidates).find(
    (c) => c.slug !== leader?.slug && c.votes > 0,
  );
  const votedNominees = candidates.filter((c) => c.votes > 0).length;
  const scopeStates =
    summary.statesWon.reduce((sum, s) => sum + s.states, 0) +
    summary.tiedStates +
    summary.statesWithoutVotes;

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
      <Tile label={`Votos · ${scopeLabel}`}>
        <Value>{formatInteger(summary.totalVotes)}</Value>
        <Detail>
          {summary.nationalVotes > 0 &&
          summary.totalVotes !== summary.nationalVotes
            ? `${formatPercent(summary.shareOfNational)} do total nacional`
            : "Total do período"}
        </Detail>
      </Tile>

      <Tile label="Liderança">
        {leader ? (
          <>
            <p className="flex items-center gap-2 text-base font-semibold leading-tight text-white">
              <span
                className="h-2.5 w-2.5 shrink-0 rounded-full"
                style={{ background: leader.color }}
                aria-hidden
              />
              <span className="min-w-0 break-words">{leader.name}</span>
            </p>
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

      <Tile label="Estados liderados">
        <ul className="space-y-1">
          {statesWon.slice(0, STATES_WON_TOP).map((won) => {
            const candidate = candidates.find((c) => c.slug === won.slug);
            return (
              <li
                key={won.slug}
                className="flex items-center gap-2 text-sm text-zinc-200"
              >
                <span
                  className="h-2.5 w-2.5 shrink-0 rounded-full"
                  style={{ background: candidate?.color }}
                  aria-hidden
                />
                <span className="font-semibold tabular-nums text-white">
                  {won.states}
                </span>
                <span className="min-w-0 break-words leading-tight">
                  {candidate?.name}
                </span>
              </li>
            );
          })}
        </ul>
        {statesWon.length === 0 && <Value>—</Value>}
        {(statesWon.length > STATES_WON_TOP || summary.tiedStates > 0) && (
          <Detail>
            {[
              statesWon.length > STATES_WON_TOP &&
                `+${statesWon.length - STATES_WON_TOP} jogador(es)`,
              summary.tiedStates > 0 && `${summary.tiedStates} empatado(s)`,
            ]
              .filter(Boolean)
              .join(" · ")}
          </Detail>
        )}
      </Tile>

      <Tile label="Jogadores votados">
        <Value>
          {votedNominees}/{candidates.length}
        </Value>
        <Detail>
          {runnerUp
            ? `2º lugar: ${runnerUp.name} (${formatPercent(runnerUp.percentage)})`
            : "indicados com ao menos 1 voto"}
        </Detail>
      </Tile>

      <Tile label="Cobertura">
        <Value>
          {scopeStates - summary.statesWithoutVotes}/{scopeStates}
        </Value>
        <Detail>estados com votos no recorte</Detail>
      </Tile>
    </div>
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
