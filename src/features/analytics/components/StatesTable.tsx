import { useMemo, useState } from "react";
import { ArrowDown, ArrowUp, ArrowUpDown, Search } from "lucide-react";
import type {
  CandidateResult,
  StateAnalytics,
  StateSortField,
} from "../../../api/poll";
import { BRAZILIAN_STATE_NAMES } from "../../../shared/constants/brazilian-states";
import { formatInteger, formatPercent } from "../../../shared/utils/format";
import { rankByVotes } from "../../../shared/utils/ranking";
import SplitBar from "../../poll/components/SplitBar";
import type { UiFilters } from "../hooks/useAnalyticsFilters";

interface StatesTableProps {
  candidates: CandidateResult[];
  states: StateAnalytics[];
  filters: UiFilters;
  selectedUf: string;
  onSort: (
    patch: Pick<UiFilters, "sortBy" | "sortCandidate" | "order">,
  ) => void;
  onSelect: (uf: string) => void;
}

const normalize = (value: string) =>
  value.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

export default function StatesTable({
  candidates,
  states,
  filters,
  selectedUf,
  onSort,
  onSelect,
}: StatesTableProps) {
  const [search, setSearch] = useState("");

  const visible = useMemo(() => {
    const term = normalize(search.trim());
    if (!term) return states;
    return states.filter(
      (row) =>
        normalize(row.state).includes(term) ||
        normalize(BRAZILIAN_STATE_NAMES[row.state] ?? "").includes(term),
    );
  }, [states, search]);

  const isActive = (sortBy: StateSortField, candidate = "") =>
    filters.sortBy === sortBy &&
    (sortBy !== "CANDIDATE_SHARE" ||
      (filters.sortCandidate || candidates[0]?.slug) === candidate);

  const toggleSort = (sortBy: StateSortField, candidate = "") => {
    const active = isActive(sortBy, candidate);
    onSort({
      sortBy,
      sortCandidate: candidate,
      order: active
        ? filters.order === "DESC"
          ? "ASC"
          : "DESC"
        : sortBy === "STATE"
          ? "ASC"
          : "DESC",
    });
  };

  const SortHeader = ({
    label,
    sortBy,
    candidate = "",
    align = "right",
  }: {
    label: string;
    sortBy: StateSortField;
    candidate?: string;
    align?: "left" | "right";
  }) => {
    const active = isActive(sortBy, candidate);
    const Icon = !active
      ? ArrowUpDown
      : filters.order === "ASC"
        ? ArrowUp
        : ArrowDown;
    return (
      <th
        scope="col"
        aria-sort={
          active
            ? filters.order === "ASC"
              ? "ascending"
              : "descending"
            : "none"
        }
        className={`sticky top-0 bg-ink-850 px-3 py-2 font-medium ${
          align === "right" ? "text-right" : "text-left"
        } ${sortBy === "STATE" ? "left-0 z-20" : "z-10"}`}
      >
        <button
          type="button"
          onClick={() => toggleSort(sortBy, candidate)}
          className={`inline-flex items-center gap-1 whitespace-nowrap hover:text-white ${
            active ? "text-white" : ""
          }`}
        >
          {label}
          <Icon className="h-3 w-3" aria-hidden />
        </button>
      </th>
    );
  };

  return (
    <div className="card">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 px-4 py-3">
        <p className="text-sm font-semibold text-white">
          {visible.length} {visible.length === 1 ? "estado" : "estados"}
        </p>
        <label className="relative block w-full sm:w-56">
          <Search
            className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500"
            aria-hidden
          />
          <span className="sr-only">Buscar estado</span>
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar estado"
            className="w-full rounded-lg border border-white/15 py-1.5 pl-8 pr-3 text-sm outline-none focus:border-gold-400 focus:ring-2 focus:ring-gold-400/20"
          />
        </label>
      </div>

      {/* `relative` keeps absolutely positioned children (sr-only labels)
          inside this scroller; otherwise they widen the whole page. */}
      <div className="relative max-h-[26rem] overflow-auto overscroll-x-contain">
        <table className="w-full min-w-[40rem] text-sm">
          <thead className="text-xs text-zinc-400">
            <tr>
              <SortHeader label="Estado" sortBy="STATE" align="left" />
              <SortHeader label="Votos" sortBy="TOTAL_VOTES" />
              <PlainHeader label="Líder" />
              <PlainHeader label="2º lugar" />
              <SortHeader label="Vantagem" sortBy="MARGIN" />
              <th
                scope="col"
                className="sticky top-0 z-10 hidden bg-ink-850 px-3 py-2 text-left font-medium md:table-cell"
              >
                Distribuição
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {visible.map((row) => {
              const leader = candidates.find((c) => c.slug === row.leaderSlug);
              const selected = row.state === selectedUf;
              const [first, second] = rankByVotes(row.candidates).filter(
                (share) => share.votes > 0,
              );
              return (
                <tr
                  key={row.state}
                  onClick={() => onSelect(selected ? "" : row.state)}
                  className={`cursor-pointer transition ${
                    selected ? "bg-gold-400/10" : "hover:bg-white/5"
                  }`}
                >
                  <td
                    className={`sticky left-0 z-[1] px-3 py-2 ${
                      selected ? "bg-gold-400/10" : "bg-ink-900"
                    }`}
                  >
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelect(selected ? "" : row.state);
                      }}
                      aria-pressed={selected}
                      className="text-left"
                    >
                      <span className="font-semibold text-white">
                        {row.state}
                      </span>{" "}
                      <span className="text-zinc-400">
                        {BRAZILIAN_STATE_NAMES[row.state]}
                      </span>
                    </button>
                  </td>
                  <td className="px-3 py-2 text-right tabular-nums text-white">
                    {formatInteger(row.totalVotes)}
                    <span className="block text-[11px] text-zinc-500">
                      {row.totalVotes ? formatPercent(row.shareOfSlice) : "—"}
                    </span>
                  </td>
                  <NomineeCell share={first} candidates={candidates} />
                  <NomineeCell share={second} candidates={candidates} />
                  <td className="px-3 py-2 text-right">
                    {leader ? (
                      <span className="inline-flex items-center gap-1.5 whitespace-nowrap tabular-nums text-white">
                        <span
                          className="h-2 w-2 rounded-full"
                          style={{ background: leader.color }}
                          aria-hidden
                        />
                        +
                        {row.marginPoints.toLocaleString("pt-BR", {
                          maximumFractionDigits: 1,
                        })}{" "}
                        p.p.
                        <span className="sr-only">para {leader.name}</span>
                      </span>
                    ) : (
                      <span className="text-zinc-500">
                        {row.totalVotes ? "Empate" : "—"}
                      </span>
                    )}
                  </td>
                  <td className="hidden w-40 px-3 py-2 md:table-cell">
                    <SplitBar
                      candidates={candidates}
                      shares={rankByVotes(row.candidates)}
                      total={row.totalVotes}
                      label={row.state}
                    />
                  </td>
                </tr>
              );
            })}
            {visible.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className="px-3 py-8 text-center text-sm text-zinc-500"
                >
                  Nenhum estado corresponde aos filtros.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function PlainHeader({ label }: { label: string }) {
  return (
    <th
      scope="col"
      className="sticky top-0 z-10 whitespace-nowrap bg-ink-850 px-3 py-2 text-left font-medium"
    >
      {label}
    </th>
  );
}

function NomineeCell({
  share,
  candidates,
}: {
  share?: { slug: string; votes: number; percentage: number };
  candidates: CandidateResult[];
}) {
  const candidate = share
    ? candidates.find((c) => c.slug === share.slug)
    : undefined;

  if (!share || !candidate) {
    return <td className="px-3 py-2 text-zinc-500">—</td>;
  }

  return (
    <td className="px-3 py-2">
      <span className="flex items-center gap-1.5 whitespace-nowrap font-medium text-white">
        <span
          className="h-2 w-2 shrink-0 rounded-full"
          style={{ background: candidate.color }}
          aria-hidden
        />
        {candidate.name}
      </span>
      <span className="block text-[11px] tabular-nums text-zinc-500">
        {formatPercent(share.percentage)} · {formatInteger(share.votes)}
      </span>
    </td>
  );
}
