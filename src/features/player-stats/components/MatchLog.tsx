import { useState } from "react";
import { ChevronDown } from "lucide-react";
import type { PlayerMatch } from "../../../api/player-stats";
import { formatDecimal } from "../../../shared/utils/format";
import { competitionName, teamName } from "../utils/labels";
import RatingBadge from "./RatingBadge";

const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "2-digit",
  timeZone: "America/Sao_Paulo",
});

// Group games come as "Group Stage - 1" (or "Group A"); knockouts by name.
const ROUND_NAMES: Record<string, string> = {
  Final: "Final",
  "3rd Place Final": "Disputa de 3º lugar",
  "Semi-finals": "Semifinal",
  "Quarter-finals": "Quartas de final",
  "Round of 16": "Oitavas de final",
  "Round of 32": "16 avos de final",
};

function roundName(round: string | null): string {
  if (!round) return "";
  if (ROUND_NAMES[round]) return ROUND_NAMES[round];
  const stage = /^Group Stage - (\d+)$/i.exec(round);
  if (stage) return `Fase de grupos · ${stage[1]}ª rodada`;
  const group = /^Group ([A-Z])/i.exec(round);
  return group ? `Grupo ${group[1].toUpperCase()}` : round;
}

const percent = (part: number, total: number) =>
  total ? `${Math.round((part / total) * 100)}%` : "—";

interface MatchLogProps {
  matches: PlayerMatch[];
}

/** National-team games with a full box score, most recent first. */
export default function MatchLog({ matches }: MatchLogProps) {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <ul className="divide-y divide-white/[0.05]">
      {matches.map((match, index) => {
        const expanded = open === index;
        const details = [
          ["Chutes (no alvo)", `${match.shotsTotal} (${match.shotsOnTarget})`],
          ["Passes certos", `${match.passesSuccessful}/${match.passesTotal}`],
          [
            "Precisão de passe",
            percent(match.passesSuccessful, match.passesTotal),
          ],
          ["Passes decisivos", String(match.keyPasses)],
          [
            "Dribles certos",
            `${match.dribblesSuccessful}/${match.dribblesTotal}`,
          ],
          ["Duelos ganhos", `${match.duelsWon}/${match.duelsTotal}`],
          ["Desarmes", String(match.tackles)],
          ["Interceptações", String(match.interceptions)],
          ["Faltas cometidas", String(match.foulsCommitted)],
          ["Faltas sofridas", String(match.foulsSuffered)],
          ...(match.expectedGoals !== null
            ? [["xG", formatDecimal(match.expectedGoals)]]
            : []),
          ...(match.expectedAssists !== null
            ? [["xA", formatDecimal(match.expectedAssists)]]
            : []),
        ];

        return (
          <li key={`${match.playedAt}-${match.opponent}`}>
            <button
              type="button"
              onClick={() => setOpen(expanded ? null : index)}
              aria-expanded={expanded}
              className="flex w-full items-center gap-3 py-3 text-left"
            >
              <span className="w-12 shrink-0 text-xs tabular-nums text-zinc-500">
                {dateFormatter.format(new Date(match.playedAt))}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium text-white">
                  {match.isHome ? "vs" : "@"} {teamName(match.opponent)}
                  {match.score && (
                    <span className="ml-2 tabular-nums text-zinc-400">
                      {match.score}
                    </span>
                  )}
                </span>
                <span className="block truncate text-xs text-zinc-500">
                  {competitionName(match.competition)} ·{" "}
                  {roundName(match.round)} · {match.minutesPlayed}&apos;
                  {match.isSubstitute && " · saiu do banco"}
                  {match.isCaptain && " · capitão"}
                </span>
              </span>
              <span className="flex shrink-0 items-center gap-2 text-xs tabular-nums text-zinc-300">
                {match.goals > 0 && (
                  <span
                    title="Gols"
                    className="rounded bg-gold-400/15 px-1.5 py-0.5 font-semibold text-gold-200"
                  >
                    {match.goals} G
                  </span>
                )}
                {match.assists > 0 && (
                  <span
                    title="Assistências"
                    className="rounded bg-white/10 px-1.5 py-0.5 font-semibold text-white"
                  >
                    {match.assists} A
                  </span>
                )}
                <RatingBadge rating={match.rating} />
                <ChevronDown
                  className={`h-4 w-4 text-zinc-500 transition-transform ${expanded ? "rotate-180" : ""}`}
                  aria-hidden
                />
              </span>
            </button>

            {expanded && (
              <dl className="mb-3 grid grid-cols-2 gap-x-4 gap-y-1.5 rounded-xl bg-white/[0.03] p-3 text-xs sm:grid-cols-3">
                {details.map(([label, value]) => (
                  <div key={label} className="flex justify-between gap-2">
                    <dt className="text-zinc-500">{label}</dt>
                    <dd className="font-semibold tabular-nums text-white">
                      {value}
                    </dd>
                  </div>
                ))}
              </dl>
            )}
          </li>
        );
      })}
    </ul>
  );
}
