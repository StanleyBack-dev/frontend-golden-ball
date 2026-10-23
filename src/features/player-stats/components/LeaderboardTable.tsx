import { ArrowDown, ArrowUp, ChevronRight } from "lucide-react";
import type {
  LeaderboardRow,
  LeaderboardSortField,
  SortOrder,
} from "../../../api/player-stats";
import { formatDecimal, formatInteger } from "../../../shared/utils/format";
import CandidatePhoto from "../../poll/components/CandidatePhoto";
import RatingBadge from "./RatingBadge";

interface Column {
  field: LeaderboardSortField;
  label: string;
  title: string;
  render: (row: LeaderboardRow) => React.ReactNode;
  /** Hidden on narrow screens to keep the table readable. */
  wide?: boolean;
}

const COLUMNS: Column[] = [
  {
    field: "GAMES",
    label: "J",
    title: "Jogos",
    render: (row) => row.gamesPlayed,
  },
  {
    field: "MINUTES",
    label: "Min",
    title: "Minutos jogados",
    render: (row) => formatInteger(row.minutesPlayed),
    wide: true,
  },
  {
    field: "GOALS",
    label: "G",
    title: "Gols",
    render: (row) => row.goals,
  },
  {
    field: "ASSISTS",
    label: "A",
    title: "Assistências",
    render: (row) => row.assists,
  },
  {
    field: "GOAL_CONTRIBUTIONS",
    label: "G+A",
    title: "Gols + assistências",
    render: (row) => row.goalContributions,
    wide: true,
  },
  {
    field: "GOALS_PER_90",
    label: "G/90",
    title: "Gols por 90 minutos",
    render: (row) => formatDecimal(row.goalsPer90),
    wide: true,
  },
  {
    field: "CONTRIBUTIONS_PER_90",
    label: "G+A/90",
    title: "Gols + assistências por 90 minutos",
    render: (row) => formatDecimal(row.contributionsPer90),
    wide: true,
  },
  {
    field: "AVERAGE_RATING",
    label: "Nota",
    title: "Nota média nos jogos da seleção com box score",
    render: (row) => <RatingBadge rating={row.averageRating} />,
  },
];

interface LeaderboardTableProps {
  rows: LeaderboardRow[];
  sortBy: LeaderboardSortField;
  order: SortOrder;
  selectedSlug: string;
  onSort: (sortBy: LeaderboardSortField, order: SortOrder) => void;
  onSelect: (slug: string) => void;
}

export default function LeaderboardTable({
  rows,
  sortBy,
  order,
  selectedSlug,
  onSort,
  onSelect,
}: LeaderboardTableProps) {
  if (!rows.length) {
    return (
      <p className="card p-8 text-center text-sm text-zinc-400">
        Nenhum indicado atende a esses filtros.
      </p>
    );
  }

  return (
    <div className="card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[34rem] text-sm">
          <thead>
            <tr className="border-b border-white/[0.06] text-[11px] uppercase tracking-wide text-zinc-500">
              <th scope="col" className="w-10 px-3 py-3 text-left font-medium">
                #
              </th>
              <th scope="col" className="px-2 py-3 text-left font-medium">
                Jogador
              </th>
              {COLUMNS.map((column) => {
                const active = column.field === sortBy;
                const Arrow = order === "ASC" ? ArrowUp : ArrowDown;
                return (
                  <th
                    key={column.field}
                    scope="col"
                    aria-sort={
                      active
                        ? order === "ASC"
                          ? "ascending"
                          : "descending"
                        : "none"
                    }
                    className={`px-2 py-3 text-right font-medium ${column.wide ? "hidden md:table-cell" : ""}`}
                  >
                    <button
                      type="button"
                      title={column.title}
                      onClick={() =>
                        onSort(
                          column.field,
                          active && order === "DESC" ? "ASC" : "DESC",
                        )
                      }
                      className={`inline-flex items-center gap-0.5 uppercase hover:text-white ${active ? "text-gold-300" : ""}`}
                    >
                      {column.label}
                      {active && <Arrow className="h-3 w-3" aria-hidden />}
                    </button>
                  </th>
                );
              })}
              <th scope="col" className="w-8">
                <span className="sr-only">Abrir</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const selected = row.nominee.slug === selectedSlug;
              return (
                <tr
                  key={row.nominee.slug}
                  onClick={() => onSelect(row.nominee.slug)}
                  className={`cursor-pointer border-b border-white/[0.04] transition last:border-0 ${
                    selected ? "bg-gold-400/[0.08]" : "hover:bg-white/[0.03]"
                  }`}
                >
                  <td className="px-3 py-2.5 font-display tabular-nums text-zinc-500">
                    {row.rank}
                  </td>
                  <td className="px-2 py-2.5">
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        onSelect(row.nominee.slug);
                      }}
                      aria-pressed={selected}
                      className="flex min-w-0 items-center gap-3 text-left"
                    >
                      <CandidatePhoto
                        candidate={row.nominee}
                        className="h-9 w-9 text-xs"
                      />
                      <span className="min-w-0">
                        <span className="block truncate font-medium text-white">
                          {row.nominee.name}
                        </span>
                        <span className="block truncate text-xs text-zinc-500">
                          {row.nominee.club}
                        </span>
                      </span>
                    </button>
                  </td>
                  {COLUMNS.map((column) => (
                    <td
                      key={column.field}
                      className={`px-2 py-2.5 text-right tabular-nums ${
                        column.field === sortBy
                          ? "font-semibold text-white"
                          : "text-zinc-300"
                      } ${column.wide ? "hidden md:table-cell" : ""}`}
                    >
                      {column.render(row)}
                    </td>
                  ))}
                  <td className="pr-3 text-zinc-600">
                    <ChevronRight className="h-4 w-4" aria-hidden />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
