import { useMemo, useState } from "react";
import { Check, Search } from "lucide-react";
import type { Candidate } from "../../../api/poll";
import CandidatePhoto from "./CandidatePhoto";

/** Accent- and case-insensitive search key. */
const normalize = (value: string) =>
  value.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

interface NomineePickerProps {
  candidates: Candidate[];
  value: string;
  onChange: (slug: string) => void;
  disabled?: boolean;
}

/** Searchable grid of the 30 nominees, as a radio group. */
export default function NomineePicker({
  candidates,
  value,
  onChange,
  disabled = false,
}: NomineePickerProps) {
  const [search, setSearch] = useState("");

  const visibleCandidates = useMemo(() => {
    const term = normalize(search.trim());
    if (!term) return candidates;
    return candidates.filter((candidate) =>
      normalize(
        `${candidate.fullName} ${candidate.name} ${candidate.club} ${candidate.nationality} ${candidate.position}`,
      ).includes(term),
    );
  }, [candidates, search]);
  const selectedCandidate = candidates.find((c) => c.slug === value);

  return (
    <fieldset disabled={disabled} className="disabled:opacity-60">
      <legend className="flex items-center gap-2 font-display text-lg uppercase tracking-wider text-white">
        <StepBadge>1</StepBadge>
        Escolha o jogador
      </legend>

      <div className="mt-3 flex flex-wrap items-center gap-3">
        <label className="relative block w-full sm:w-72">
          <Search
            className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500"
            aria-hidden
          />
          <span className="sr-only">Buscar jogador</span>
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nome, clube ou seleção"
            className="field py-2 pl-8 text-sm"
          />
        </label>
        {selectedCandidate && (
          <p className="text-sm text-zinc-300">
            Seu voto:{" "}
            <strong className="text-gold-300">
              {selectedCandidate.fullName}
            </strong>
          </p>
        )}
      </div>

      <div className="mt-4 grid max-h-[40rem] grid-cols-2 gap-3 overflow-y-auto overscroll-contain p-1 sm:grid-cols-3 lg:grid-cols-5">
        {visibleCandidates.map((candidate) => {
          const selected = candidate.slug === value;
          return (
            <label
              key={candidate.slug}
              className={`group relative block aspect-[3/4] cursor-pointer overflow-hidden rounded-2xl border bg-ink-800 transition has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-gold-400 ${
                selected
                  ? "border-gold-400 shadow-glow"
                  : "border-white/10 hover:border-white/30"
              }`}
            >
              <input
                type="radio"
                name="candidate"
                value={candidate.slug}
                checked={selected}
                onChange={() => onChange(candidate.slug)}
                className="sr-only"
              />
              {candidate.photoUrl ? (
                <img
                  src={candidate.photoUrl}
                  alt=""
                  loading="lazy"
                  decoding="async"
                  className={`absolute inset-0 h-full w-full object-cover object-top transition duration-500 group-hover:scale-105 ${
                    selected ? "" : "grayscale-[35%] group-hover:grayscale-0"
                  }`}
                />
              ) : (
                <span className="absolute inset-0 flex items-center justify-center">
                  <CandidatePhoto
                    candidate={candidate}
                    className="h-20 w-20 text-2xl"
                  />
                </span>
              )}
              <span className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/30 to-transparent" />
              {selected && (
                <span className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-gold-gradient text-ink-950 shadow-glow">
                  <Check className="h-4 w-4" strokeWidth={3} aria-hidden />
                </span>
              )}
              <span className="absolute inset-x-0 bottom-0 p-3">
                <span className="block truncate font-display text-lg font-semibold uppercase leading-tight text-white">
                  {candidate.fullName}
                </span>
                <span className="block truncate text-[11px] text-zinc-300">
                  {candidate.club}
                </span>
                <span className="block truncate text-[11px] text-gold-300/80">
                  {candidate.nationality} · {candidate.position}
                </span>
              </span>
            </label>
          );
        })}
        {visibleCandidates.length === 0 && (
          <p className="col-span-full py-6 text-center text-sm text-zinc-500">
            Nenhum jogador encontrado para “{search}”.
          </p>
        )}
      </div>
    </fieldset>
  );
}

export function StepBadge({ children }: { children: React.ReactNode }) {
  return (
    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gold-gradient font-display text-sm font-bold text-ink-950">
      {children}
    </span>
  );
}
