import { useState } from "react";
import type { Candidate } from "../../../api/poll";

interface CandidatePhotoProps {
  candidate: Candidate;
  /** Tailwind size classes for the frame, e.g. "h-16 w-16". */
  className?: string;
}

/** "Vinícius Júnior" → "VJ"; "Rodri" → "R". */
function initials(fullName: string): string {
  const parts = fullName.split(/\s+/).filter(Boolean);
  const letters =
    parts.length > 1 ? parts[0][0] + parts[parts.length - 1][0] : parts[0][0];
  return letters.toUpperCase();
}

/** Round player photo, falling back to the player's initials. */
export default function CandidatePhoto({
  candidate,
  className = "h-16 w-16",
}: CandidatePhotoProps) {
  const [failed, setFailed] = useState(false);

  if (!candidate.photoUrl || failed) {
    return (
      <span
        className={`flex shrink-0 items-center justify-center rounded-full bg-ink-700 font-display font-semibold text-gold-300 ring-1 ring-white/10 ${className}`}
        aria-hidden
      >
        {initials(candidate.fullName)}
      </span>
    );
  }

  return (
    <img
      src={candidate.photoUrl}
      alt={`Foto de ${candidate.fullName}`}
      width={160}
      height={160}
      loading="lazy"
      decoding="async"
      onError={() => setFailed(true)}
      className={`shrink-0 rounded-full bg-ink-700 object-cover object-top ring-1 ring-white/15 ${className}`}
    />
  );
}
