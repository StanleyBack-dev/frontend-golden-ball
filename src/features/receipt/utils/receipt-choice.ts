import type { Candidate } from "../../../api/poll";

/** What the voter chose, in the shape the receipt draws it. */
export interface ReceiptChoice {
  title: string;
  /** "Real Madrid · Brasil". */
  subtitle: string;
  color: string;
  photoUrl: string | null;
}

export function toReceiptChoice(
  slug: string,
  candidates: Candidate[],
): ReceiptChoice | null {
  const candidate = candidates.find((c) => c.slug === slug);
  if (!candidate) return null;

  return {
    title: candidate.fullName,
    subtitle: `${candidate.club} · ${candidate.nationality}`,
    color: candidate.color,
    photoUrl: candidate.photoUrl,
  };
}
