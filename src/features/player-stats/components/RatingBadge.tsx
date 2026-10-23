import { formatDecimal } from "../../../shared/utils/format";

// Same reading as the big stats apps: blue is outstanding, red is poor.
function ratingClass(rating: number): string {
  if (rating >= 8) return "bg-sky-500 text-white";
  if (rating >= 7) return "bg-emerald-500 text-ink-950";
  if (rating >= 6.5) return "bg-yellow-400 text-ink-950";
  if (rating >= 6) return "bg-orange-500 text-ink-950";
  return "bg-red-500 text-white";
}

interface RatingBadgeProps {
  rating: number | null;
  size?: "sm" | "lg";
}

export default function RatingBadge({ rating, size = "sm" }: RatingBadgeProps) {
  const sizing =
    size === "lg"
      ? "min-w-[3.5rem] px-2.5 py-1.5 text-xl"
      : "min-w-[2.5rem] px-1.5 py-0.5 text-xs";

  if (rating === null) {
    return (
      <span
        className={`inline-flex justify-center rounded-md bg-white/[0.06] font-semibold tabular-nums text-zinc-500 ${sizing}`}
        title="Sem nota disponível"
      >
        —
      </span>
    );
  }

  return (
    <span
      className={`inline-flex justify-center rounded-md font-bold tabular-nums ${ratingClass(rating)} ${sizing}`}
      title="Nota da partida (0–10)"
    >
      {formatDecimal(rating, rating >= 10 ? 0 : 1)}
    </span>
  );
}
