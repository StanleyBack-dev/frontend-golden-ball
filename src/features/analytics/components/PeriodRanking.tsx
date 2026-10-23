import type { CandidateResult } from "../../../api/poll";
import { formatPercent, formatVotes } from "../../../shared/utils/format";
import { rankByVotes } from "../../../shared/utils/ranking";

const TOP = 10;

interface PeriodRankingProps {
  candidates: CandidateResult[];
}

/** The most voted nominees within the selected period. */
export default function PeriodRanking({ candidates }: PeriodRankingProps) {
  const ranked = rankByVotes(candidates)
    .filter((c) => c.votes > 0)
    .slice(0, TOP);
  const top = ranked[0]?.percentage || 1;

  if (!ranked.length) {
    return (
      <p className="py-10 text-center text-sm text-zinc-500">
        Nenhum voto neste período.
      </p>
    );
  }

  return (
    <ol className="space-y-3">
      {ranked.map((candidate, index) => (
        <li key={candidate.slug}>
          <div className="mb-1 flex items-baseline justify-between gap-2 text-sm">
            <span className="min-w-0 truncate text-zinc-200">
              <span className="mr-2 font-display tabular-nums text-zinc-500">
                {index + 1}
              </span>
              {candidate.name}
            </span>
            <span className="shrink-0 tabular-nums text-zinc-400">
              <strong className="text-white">
                {formatPercent(candidate.percentage)}
              </strong>{" "}
              · {formatVotes(candidate.votes)}
            </span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
            <div
              className="h-full rounded-full"
              style={{
                width: `${(candidate.percentage / top) * 100}%`,
                background: candidate.color,
              }}
            />
          </div>
        </li>
      ))}
    </ol>
  );
}
