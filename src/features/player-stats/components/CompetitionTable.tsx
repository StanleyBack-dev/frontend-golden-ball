import type {
  CompetitionStats,
  StatLine,
  TeamStats,
} from "../../../api/player-stats";
import { formatDecimal, formatInteger } from "../../../shared/utils/format";
import { CATEGORY_LABELS, competitionName, teamName } from "../utils/labels";
import RatingBadge from "./RatingBadge";

const CATEGORY_STYLES: Record<CompetitionStats["category"], string> = {
  LEAGUE: "bg-sky-500/15 text-sky-300",
  CONTINENTAL: "bg-violet-500/15 text-violet-300",
  DOMESTIC_CUP: "bg-emerald-500/15 text-emerald-300",
  NATIONAL_TEAM: "bg-gold-400/15 text-gold-300",
  OTHER: "bg-white/10 text-zinc-300",
};

interface CompetitionTableProps {
  competitions: CompetitionStats[];
  teams: TeamStats[];
  totals: StatLine;
}

/** Season split by competition, then by club / national team. */
export default function CompetitionTable({
  competitions,
  teams,
  totals,
}: CompetitionTableProps) {
  if (!competitions.length) {
    return (
      <p className="py-6 text-center text-sm text-zinc-500">
        Sem jogos neste recorte.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[36rem] text-sm">
        <thead>
          <tr className="border-b border-white/[0.06] text-[11px] uppercase tracking-wide text-zinc-500">
            <th scope="col" className="py-2 pr-2 text-left font-medium">
              Competição
            </th>
            <Th title="Jogos">J</Th>
            <Th title="Minutos">Min</Th>
            <Th title="Gols">G</Th>
            <Th title="Assistências">A</Th>
            <Th title="Gols por 90 minutos">G/90</Th>
            <Th title="Pênaltis convertidos">Pên</Th>
            <Th title="Entrou no decorrer do jogo">Entrou</Th>
            <Th title="Cartões amarelos / vermelhos">Cart.</Th>
            <Th title="Nota média (jogos com box score)">Nota</Th>
          </tr>
        </thead>
        <tbody>
          {competitions.map((row) => (
            <tr
              key={`${row.competition}-${row.team}`}
              className="border-b border-white/[0.04]"
            >
              <td className="py-2.5 pr-2">
                <span className="block font-medium text-white">
                  {competitionName(row.competition)}
                </span>
                <span className="mt-0.5 flex flex-wrap items-center gap-1.5 text-xs text-zinc-500">
                  <span
                    className={`rounded px-1.5 py-px text-[10px] font-semibold uppercase tracking-wide ${CATEGORY_STYLES[row.category]}`}
                  >
                    {CATEGORY_LABELS[row.category]}
                  </span>
                  {teamName(row.team)}
                </span>
              </td>
              <Td>{row.gamesPlayed}</Td>
              <Td>{formatInteger(row.minutesPlayed)}</Td>
              <Td strong>{row.goals}</Td>
              <Td strong>{row.assists}</Td>
              <Td>{formatDecimal(row.goalsPer90)}</Td>
              <Td>{row.penaltiesScored}</Td>
              <Td>{row.substitutedIn}</Td>
              <Td>
                <Cards yellow={row.yellowCards} red={row.redCards} />
              </Td>
              <Td>
                <RatingBadge rating={row.averageRating} />
              </Td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="text-white">
            <td className="pt-3 pr-2 font-display uppercase tracking-wide">
              Total
            </td>
            <Td>{totals.gamesPlayed}</Td>
            <Td>{formatInteger(totals.minutesPlayed)}</Td>
            <Td strong>{totals.goals}</Td>
            <Td strong>{totals.assists}</Td>
            <Td>{formatDecimal(totals.goalsPer90)}</Td>
            <Td>{totals.penaltiesScored}</Td>
            <Td>—</Td>
            <Td>
              <Cards yellow={totals.yellowCards} red={totals.redCards} />
            </Td>
            <Td>—</Td>
          </tr>
        </tfoot>
      </table>

      {teams.length > 1 && (
        <ul className="mt-5 grid gap-2 sm:grid-cols-2">
          {teams.map((team) => (
            <li
              key={team.team}
              className="flex items-center justify-between gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] px-3 py-2 text-sm"
            >
              <span className="min-w-0 truncate text-zinc-300">
                {teamName(team.team)}
                {team.isNationalTeam && (
                  <span className="ml-1.5 text-xs text-gold-300">seleção</span>
                )}
              </span>
              <span className="shrink-0 tabular-nums text-zinc-400">
                {team.gamesPlayed} J ·{" "}
                <strong className="text-white">{team.goals} G</strong> ·{" "}
                <strong className="text-white">{team.assists} A</strong>
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function Th({ title, children }: { title: string; children: string }) {
  return (
    <th scope="col" title={title} className="px-2 py-2 text-right font-medium">
      {children}
    </th>
  );
}

function Td({
  strong = false,
  children,
}: {
  strong?: boolean;
  children: React.ReactNode;
}) {
  return (
    <td
      className={`px-2 py-2.5 text-right tabular-nums ${strong ? "font-semibold text-white" : "text-zinc-300"}`}
    >
      {children}
    </td>
  );
}

function Cards({ yellow, red }: { yellow: number; red: number }) {
  return (
    <span className="inline-flex items-center gap-1">
      <span className="inline-block h-3 w-2 rounded-[2px] bg-yellow-400" />
      {yellow}
      {red > 0 && (
        <>
          <span className="ml-1 inline-block h-3 w-2 rounded-[2px] bg-red-500" />
          {red}
        </>
      )}
    </span>
  );
}
