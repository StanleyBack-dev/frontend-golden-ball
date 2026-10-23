const WHITE = "#ffffff";
// Fills fade toward the card surface (dark theme), not toward white.
const SURFACE = "#121218";
export const NEUTRAL_FILL = "#52525b";
export const EMPTY_FILL = "#1b1b24";
export const INK = "#07070a";

function toRgb(hex: string): [number, number, number] {
  const value = hex.replace("#", "");
  return [0, 2, 4].map((i) => parseInt(value.slice(i, i + 2), 16)) as [
    number,
    number,
    number,
  ];
}

/** Mixes `hex` toward the card surface; t = 1 → pure `hex`. */
export function tint(hex: string, t: number): string {
  const [r, g, b] = toRgb(hex);
  const [wr, wg, wb] = toRgb(SURFACE);
  const mix = (c: number, w: number) =>
    Math.round(w + (c - w) * t)
      .toString(16)
      .padStart(2, "0");
  return `#${mix(r, wr)}${mix(g, wg)}${mix(b, wb)}`;
}

function luminance(hex: string): number {
  const [r, g, b] = toRgb(hex).map((c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** White or ink, whichever reads better on `fill`. */
export function textOn(fill: string): string {
  const l = luminance(fill);
  const contrastWhite = 1.05 / (l + 0.05);
  const contrastInk = (l + 0.05) / (luminance(INK) + 0.05);
  return contrastWhite >= contrastInk ? WHITE : INK;
}

// Lead strength steps, in percentage points over the runner-up.
export const LEAD_STEPS = [
  { min: 15, t: 1, label: "Vantagem folgada (15+ p.p.)" },
  { min: 5, t: 0.62, label: "Vantagem moderada (5–15 p.p.)" },
  { min: 0, t: 0.4, label: "Vantagem apertada (< 5 p.p.)" },
] as const;

/**
 * Fill for a state led by a nominee: the leader's own color, lighter the
 * narrower the lead, so both "who" and "by how much" read at a glance.
 */
export function leadFill(color: string, marginPoints: number): string {
  const step =
    LEAD_STEPS.find((candidate) => marginPoints >= candidate.min) ??
    LEAD_STEPS[LEAD_STEPS.length - 1];
  return tint(color, step.t);
}
