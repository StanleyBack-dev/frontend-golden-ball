import { Camera } from "lucide-react";
import type { Candidate } from "../../api/poll";
import { PHOTO_CREDITS } from "../../shared/constants/photo-credits";

/** Attribution required by the photos' Creative Commons licenses. */
export default function PhotoCredits({
  candidates,
}: {
  candidates: Candidate[];
}) {
  const credited = candidates.filter(
    (candidate) => candidate.photoUrl && PHOTO_CREDITS[candidate.slug],
  );
  if (!credited.length) return null;

  return (
    <details className="group max-w-md sm:text-right">
      <summary className="inline-flex cursor-pointer list-none items-center gap-1.5 text-zinc-400 transition hover:text-gold-300">
        <Camera className="h-3.5 w-3.5" aria-hidden />
        Créditos das fotos (Wikimedia Commons)
      </summary>
      <ul className="mt-3 max-h-64 space-y-1 overflow-y-auto pr-1 text-left leading-relaxed">
        {credited.map((candidate) => {
          const credit = PHOTO_CREDITS[candidate.slug];
          return (
            <li key={candidate.slug}>
              <a
                href={credit.source}
                target="_blank"
                rel="noopener noreferrer"
                className="text-zinc-300 hover:text-gold-300"
              >
                {candidate.fullName}
              </a>
              : {credit.author},{" "}
              <a
                href={credit.licenseUrl}
                target="_blank"
                rel="noopener noreferrer license"
                className="underline decoration-white/20 underline-offset-2 hover:text-gold-300"
              >
                {credit.license}
              </a>
            </li>
          );
        })}
      </ul>
    </details>
  );
}
