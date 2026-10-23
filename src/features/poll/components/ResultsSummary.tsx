import { useState } from "react";
import { ChevronDown, Crown, Trophy } from "lucide-react";
import type { CandidateResult, PollResults } from "../../../api/poll";
import {
  formatInteger,
  formatPercent,
  formatTime,
  formatVotes,
} from "../../../shared/utils/format";
import { rankByVotes } from "../../../shared/utils/ranking";
import CandidatePhoto from "./CandidatePhoto";

interface ResultsSummaryProps {
  results: PollResults;
}

const PODIUM_SIZE = 3;
// Rows shown below the podium before "show all".
const COLLAPSED_ROWS = 7;
const MEDALS = [
  {
    label: "1º",
    badge: "bg-gold-gradient text-ink-950",
    frame: "border-gold-400/60 shadow-glow",
  },
  {
    label: "2º",
    badge: "bg-gradient-to-br from-zinc-100 to-zinc-400 text-ink-950",
    frame: "border-zinc-300/30",
  },
  {
    label: "3º",
    badge: "bg-gradient-to-br from-orange-300 to-orange-700 text-ink-950",
    frame: "border-orange-400/30",
  },
] as const;

export default function ResultsSummary({ results }: ResultsSummaryProps) {
  const [expanded, setExpanded] = useState(false);
  const { totalVotes } = results;
  const ranked = rankByVotes(results.candidates);
  // Only nominees with votes earn a podium spot.
  const podium = ranked
    .filter((candidate) => candidate.votes > 0)
    .slice(0, PODIUM_SIZE);
  const rest = ranked.slice(podium.length);
  const visibleRest = expanded ? rest : rest.slice(0, COLLAPSED_ROWS);
  const topPercentage = ranked[0]?.percentage || 1;

  return (
    <div className="card p-4 sm:p-6">
      {podium.length > 0 ? (
        <ol className="grid grid-cols-1 items-end gap-4 sm:grid-cols-3">
          {podium.map((candidate, index) => (
            <PodiumCard
              key={candidate.slug}
              candidate={candidate}
              place={index}
            />
          ))}
        </ol>
      ) : (
        <p className="flex items-center gap-3 rounded-xl border border-gold-400/20 bg-gold-400/5 p-4 text-sm text-gold-200">
          <Trophy className="h-5 w-5 shrink-0 text-gold-400" aria-hidden />
          Ainda não há votos. Seja o primeiro a escolher o seu Bola de Ouro!
        </p>
      )}

      <ol className="mt-6 divide-y divide-white/[0.06]">
        {visibleRest.map((candidate, index) => (
          <RankingRow
            key={candidate.slug}
            candidate={candidate}
            position={totalVotes ? podium.length + index + 1 : null}
            widthPercent={
              totalVotes ? (candidate.percentage / topPercentage) * 100 : 0
            }
          />
        ))}
      </ol>

      {rest.length > COLLAPSED_ROWS && (
        <button
          type="button"
          onClick={() => setExpanded((value) => !value)}
          aria-expanded={expanded}
          className="mx-auto mt-4 flex items-center gap-1.5 rounded-full border border-white/10 px-4 py-2 font-display text-sm uppercase tracking-wider text-zinc-300 transition hover:border-gold-400/50 hover:text-gold-200"
        >
          {expanded
            ? "Mostrar menos"
            : `Ver todos os ${results.candidates.length} indicados`}
          <ChevronDown
            className={`h-4 w-4 transition-transform ${expanded ? "rotate-180" : ""}`}
            aria-hidden
          />
        </button>
      )}

      <div className="mt-5 flex flex-wrap items-center justify-between gap-2 border-t border-white/[0.06] pt-4 text-xs text-zinc-500">
        <span className="tabular-nums">
          Total:{" "}
          <strong className="text-zinc-200">{formatInteger(totalVotes)}</strong>{" "}
          {totalVotes === 1 ? "voto" : "votos"}
        </span>
        <span className="flex items-center gap-1.5">
          <span className="relative flex h-2 w-2">
            {results.votingOpen && (
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-ember-500 opacity-75" />
            )}
            <span
              className={`relative inline-flex h-2 w-2 rounded-full ${results.votingOpen ? "bg-ember-500" : "bg-zinc-600"}`}
            />
          </span>
          {results.votingOpen ? "Ao vivo" : "Encerrada"} · atualizado às{" "}
          {formatTime(results.updatedAt)}
        </span>
      </div>
    </div>
  );
}

function PodiumCard({
  candidate,
  place,
}: {
  candidate: CandidateResult;
  place: number;
}) {
  const medal = MEDALS[place];
  // The winner sits in the middle and stands taller on wide screens.
  const order = ["sm:order-2", "sm:order-1", "sm:order-3"][place];
  const height = place === 0 ? "h-72 sm:h-96" : "h-64 sm:h-80";

  return (
    <li
      className={`relative overflow-hidden rounded-2xl border bg-ink-800 ${medal.frame} ${order} ${height}`}
    >
      {candidate.photoUrl ? (
        <img
          src={candidate.photoUrl}
          alt={`Foto de ${candidate.fullName}`}
          className="absolute inset-0 h-full w-full object-cover object-top"
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center">
          <CandidatePhoto
            candidate={candidate}
            className="h-24 w-24 text-3xl"
          />
        </div>
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/50 to-transparent" />

      <span
        className={`absolute left-3 top-3 flex h-9 w-9 items-center justify-center rounded-full font-display text-sm font-bold ring-2 ring-ink-950 ${medal.badge}`}
      >
        {place === 0 ? (
          <Crown className="h-4 w-4" aria-label="1º" />
        ) : (
          medal.label
        )}
      </span>

      <div className="absolute inset-x-0 bottom-0 p-4">
        <p className="truncate font-display text-2xl font-semibold uppercase leading-tight text-white">
          {candidate.fullName}
        </p>
        <p className="truncate text-xs text-zinc-300">
          {candidate.club} · {candidate.nationality}
        </p>
        <div className="mt-2 flex items-baseline justify-between gap-2">
          <span
            className={`font-display text-4xl font-bold tabular-nums ${place === 0 ? "text-gold-gradient" : "text-white"}`}
          >
            {formatPercent(candidate.percentage)}
          </span>
          <span className="text-xs tabular-nums text-zinc-400">
            {formatVotes(candidate.votes)}
          </span>
        </div>
      </div>
    </li>
  );
}

function RankingRow({
  candidate,
  position,
  widthPercent,
}: {
  candidate: CandidateResult;
  position: number | null;
  widthPercent: number;
}) {
  return (
    <li className="grid grid-cols-[2rem_2.75rem_minmax(0,1fr)_auto] items-center gap-3 py-2.5">
      <span className="text-right font-display text-sm tabular-nums text-zinc-500">
        {position ? `${position}º` : ""}
      </span>
      <CandidatePhoto candidate={candidate} className="h-11 w-11 text-xs" />
      <div className="min-w-0">
        <p className="flex items-baseline gap-2 text-sm">
          <span className="truncate font-medium text-white">
            {candidate.fullName}
          </span>
          <span className="hidden truncate text-xs text-zinc-500 sm:inline">
            {candidate.club}
          </span>
        </p>
        <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-white/[0.06]">
          <div
            className="h-full rounded-full bg-gradient-to-r from-gold-400 to-ember-500 transition-[width] duration-700"
            style={{ width: `${widthPercent}%` }}
          />
        </div>
      </div>
      <span className="text-right tabular-nums">
        <span className="font-display text-lg font-semibold text-white">
          {formatPercent(candidate.percentage)}
        </span>
        <span className="block text-[11px] text-zinc-500">
          {formatInteger(candidate.votes)}
        </span>
      </span>
    </li>
  );
}
