import { useMemo } from "react";
import type { CandidateResult, StateAnalytics } from "../../../api/poll";
import { BRAZILIAN_STATE_NAMES } from "../../../shared/constants/brazilian-states";
import { formatPercent, formatVotes } from "../../../shared/utils/format";
import { rankByVotes } from "../../../shared/utils/ranking";
import {
  EMPTY_FILL,
  LEAD_STEPS,
  NEUTRAL_FILL,
  leadFill,
  textOn,
} from "../utils/color";
import { TooltipRow } from "./ChartTooltip";
import { useChartTooltip } from "../hooks/useChartTooltip";

/**
 * Tile-grid cartogram: every state gets the same size (so small states like
 * DF or SE are as readable as AM), placed roughly where it sits on the map.
 */
const TILE_POSITIONS: Record<string, [col: number, row: number]> = {
  RR: [1, 0],
  AP: [3, 0],
  AM: [1, 1],
  PA: [2, 1],
  MA: [3, 1],
  CE: [4, 1],
  RN: [5, 1],
  AC: [0, 2],
  RO: [1, 2],
  TO: [2, 2],
  PI: [3, 2],
  PE: [4, 2],
  PB: [5, 2],
  MT: [1, 3],
  GO: [2, 3],
  DF: [3, 3],
  BA: [4, 3],
  AL: [5, 3],
  MS: [1, 4],
  MG: [2, 4],
  ES: [3, 4],
  SE: [5, 4],
  PR: [1, 5],
  SP: [2, 5],
  RJ: [3, 5],
  SC: [1, 6],
  RS: [1, 7],
};
const COLS = 6;
const ROWS = 8;
// Nominees listed per state in the tooltip.
const TOOLTIP_TOP = 3;

interface BrazilTileMapProps {
  candidates: CandidateResult[];
  states: StateAnalytics[];
  selectedUf: string;
  onSelect: (uf: string) => void;
}

export default function BrazilTileMap({
  candidates,
  states,
  selectedUf,
  onSelect,
}: BrazilTileMapProps) {
  const byUf = useMemo(
    () => new Map(states.map((state) => [state.state, state])),
    [states],
  );
  const bySlug = useMemo(
    () => new Map(candidates.map((candidate) => [candidate.slug, candidate])),
    [candidates],
  );
  // Legend: only nominees that actually lead somewhere, by states led.
  const leaders = useMemo(() => {
    const counts = new Map<string, number>();
    for (const state of states) {
      if (state.leaderSlug) {
        counts.set(state.leaderSlug, (counts.get(state.leaderSlug) ?? 0) + 1);
      }
    }
    return [...counts.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([slug, count]) => ({ candidate: bySlug.get(slug), count }))
      .filter((entry) => entry.candidate);
  }, [states, bySlug]);
  const { tooltip, bind } = useChartTooltip();

  return (
    <div>
      <div
        className="mx-auto grid max-w-[22rem] gap-1"
        style={{
          gridTemplateColumns: `repeat(${COLS}, minmax(0, 1fr))`,
          gridTemplateRows: `repeat(${ROWS}, auto)`,
        }}
      >
        {Object.entries(TILE_POSITIONS).map(([uf, [col, row]]) => {
          const state = byUf.get(uf);
          const inScope = Boolean(state);
          const hasVotes = Boolean(state?.totalVotes);
          const leader = state?.leaderSlug
            ? bySlug.get(state.leaderSlug)
            : undefined;
          const fill = !hasVotes
            ? EMPTY_FILL
            : leader
              ? leadFill(leader.color, state!.marginPoints)
              : NEUTRAL_FILL;
          const selected = uf === selectedUf;

          return (
            <button
              key={uf}
              type="button"
              onClick={() => onSelect(selected ? "" : uf)}
              aria-pressed={selected}
              aria-label={
                state
                  ? `${BRAZILIAN_STATE_NAMES[uf]}: ${formatVotes(state.totalVotes)}${
                      leader ? `, liderado por ${leader.name}` : ""
                    }`
                  : `${BRAZILIAN_STATE_NAMES[uf]}: fora do filtro`
              }
              className={`flex aspect-square flex-col items-center justify-center rounded-md text-[11px] font-bold leading-none transition sm:text-xs ${
                selected
                  ? "ring-2 ring-gold-400 ring-offset-2 ring-offset-ink-950"
                  : "hover:brightness-95 focus-visible:ring-2 focus-visible:ring-gold-400"
              } ${inScope ? "" : "opacity-30"} ${
                hasVotes ? "" : "border border-white/10"
              }`}
              style={{
                gridColumn: col + 1,
                gridRow: row + 1,
                background: fill,
                color: textOn(fill),
              }}
              {...bind(
                <div className="space-y-1">
                  <p className="font-semibold text-white">
                    {BRAZILIAN_STATE_NAMES[uf]} ({uf})
                  </p>
                  {state ? (
                    <>
                      {rankByVotes(state.candidates)
                        .filter((share) => share.votes > 0)
                        .slice(0, TOOLTIP_TOP)
                        .map((share) => (
                          <TooltipRow
                            key={share.slug}
                            color={bySlug.get(share.slug)?.color ?? "#94a3b8"}
                            value={formatPercent(share.percentage)}
                            label={bySlug.get(share.slug)?.name ?? share.slug}
                          />
                        ))}
                      <p className="text-zinc-400">
                        {formatVotes(state.totalVotes)}
                        {hasVotes && !leader && " · empate na liderança"}
                      </p>
                    </>
                  ) : (
                    <p className="text-zinc-400">Fora do filtro atual</p>
                  )}
                </div>,
              )}
            >
              {uf}
            </button>
          );
        })}
      </div>

      <ul className="mt-4 flex flex-wrap justify-center gap-x-3 gap-y-1.5 text-[11px] text-zinc-300">
        {leaders.map(({ candidate, count }) => (
          <li key={candidate!.slug} className="flex items-center gap-1.5">
            <span
              className="h-3 w-3 rounded-sm"
              style={{ background: candidate!.color }}
              aria-hidden
            />
            {candidate!.name} ({count})
          </li>
        ))}
        <li className="flex items-center gap-1.5">
          <span
            className="h-3 w-3 rounded-sm"
            style={{ background: NEUTRAL_FILL }}
            aria-hidden
          />
          Empate
        </li>
        <li className="flex items-center gap-1.5">
          <span
            className="h-3 w-3 rounded-sm border border-white/10"
            style={{ background: EMPTY_FILL }}
            aria-hidden
          />
          Sem votos
        </li>
      </ul>
      <ul className="mt-2 flex flex-wrap justify-center gap-x-3 gap-y-1 text-[11px] text-zinc-400">
        {LEAD_STEPS.map((step) => (
          <li key={step.min} className="flex items-center gap-1.5">
            <span
              className="h-3 w-3 rounded-sm border border-white/10"
              style={{ background: leadFill("#e9b949", step.min) }}
              aria-hidden
            />
            {step.label}
          </li>
        ))}
      </ul>
      {tooltip}
    </div>
  );
}
