import type { CandidateResult, RegionAnalytics } from "../../../api/poll";
import {
  formatInteger,
  formatPercent,
  formatVotes,
} from "../../../shared/utils/format";
import { rankByVotes } from "../../../shared/utils/ranking";
import { textOn } from "../utils/color";
import { TooltipRow } from "./ChartTooltip";
import { useChartTooltip } from "../hooks/useChartTooltip";

// A percentage label only goes inside a segment wide enough to hold it.
const MIN_LABEL_SHARE = 18;
// Nominees drawn per region; the rest are merged into "Outros".
const TOP_PER_REGION = 3;
const OTHERS_SLUG = "__others";
const OTHERS_COLOR = "#3f3f46";

interface Segment {
  slug: string;
  votes: number;
  percentage: number;
}

function regionSegments(shares: Segment[]): Segment[] {
  const ranked = rankByVotes(shares).filter((share) => share.votes > 0);
  const top = ranked.slice(0, TOP_PER_REGION);
  const rest = ranked.slice(TOP_PER_REGION);
  if (!rest.length) return top;

  return [
    ...top,
    {
      slug: OTHERS_SLUG,
      votes: rest.reduce((sum, share) => sum + share.votes, 0),
      percentage:
        Math.round(
          rest.reduce((sum, share) => sum + share.percentage, 0) * 100,
        ) / 100,
    },
  ];
}

interface RegionBarsProps {
  candidates: CandidateResult[];
  regions: RegionAnalytics[];
}

export default function RegionBars({ candidates, regions }: RegionBarsProps) {
  const { tooltip, bind } = useChartTooltip();
  const colorOf = (slug: string) =>
    slug === OTHERS_SLUG
      ? OTHERS_COLOR
      : (candidates.find((c) => c.slug === slug)?.color ?? "#94a3b8");
  const nameOf = (slug: string) =>
    slug === OTHERS_SLUG
      ? "Outros"
      : (candidates.find((c) => c.slug === slug)?.name ?? slug);

  const segmentsByRegion = new Map(
    regions.map((region) => [region.region, regionSegments(region.candidates)]),
  );
  const legendSlugs = [
    ...new Set(
      [...segmentsByRegion.values()].flatMap((segments) =>
        segments.map((segment) => segment.slug),
      ),
    ),
  ].sort((a, b) => (a === OTHERS_SLUG ? 1 : b === OTHERS_SLUG ? -1 : 0));

  return (
    <div>
      <ul className="mb-4 flex flex-wrap gap-x-4 gap-y-1 text-xs text-zinc-300">
        {legendSlugs.map((slug) => (
          <li key={slug} className="flex items-center gap-1.5">
            <span
              className="h-2.5 w-2.5 rounded-sm"
              style={{ background: colorOf(slug) }}
              aria-hidden
            />
            {nameOf(slug)}
          </li>
        ))}
      </ul>

      <ul className="space-y-3">
        {regions.map((region) => (
          <li
            key={region.region}
            className="grid grid-cols-[6.5rem_1fr_auto] items-center gap-3"
          >
            <span className="truncate text-sm font-medium text-zinc-200">
              {region.label}
            </span>

            {region.totalVotes > 0 ? (
              <div
                className="flex h-5 gap-0.5"
                role="img"
                aria-label={`${region.label}: ${segmentsByRegion
                  .get(region.region)!
                  .map(
                    (c) => `${nameOf(c.slug)} ${formatPercent(c.percentage)}`,
                  )
                  .join(", ")}`}
              >
                {segmentsByRegion
                  .get(region.region)!
                  .map((share, index, visible) => {
                    const color = colorOf(share.slug);
                    const first = index === 0;
                    const last = index === visible.length - 1;
                    return (
                      <div
                        key={share.slug}
                        tabIndex={0}
                        className={`flex h-full items-center justify-center text-[11px] font-semibold tabular-nums outline-none transition hover:brightness-110 focus-visible:ring-2 focus-visible:ring-gold-400 ${
                          first ? "rounded-l" : ""
                        } ${last ? "rounded-r" : ""}`}
                        style={{
                          width: `${share.percentage}%`,
                          background: color,
                          color: textOn(color),
                        }}
                        {...bind(
                          <div className="space-y-1">
                            <p className="font-semibold text-white">
                              {region.label}
                            </p>
                            <TooltipRow
                              color={color}
                              value={`${formatPercent(share.percentage)} · ${formatVotes(share.votes)}`}
                              label={nameOf(share.slug)}
                            />
                          </div>,
                        )}
                      >
                        {share.percentage >= MIN_LABEL_SHARE &&
                          formatPercent(share.percentage)}
                      </div>
                    );
                  })}
              </div>
            ) : (
              <div className="flex h-5 items-center rounded bg-ink-800 px-2 text-[11px] text-zinc-500">
                Sem votos
              </div>
            )}

            <span className="w-16 text-right text-xs text-zinc-400 tabular-nums">
              {formatInteger(region.totalVotes)}
            </span>
          </li>
        ))}
      </ul>
      {tooltip}
    </div>
  );
}
