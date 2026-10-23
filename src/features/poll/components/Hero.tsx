import { ArrowRight, Crown } from "lucide-react";
import type { PollResults } from "../../../api/poll";
import { formatInteger, formatPercent } from "../../../shared/utils/format";
import { rankByVotes } from "../../../shared/utils/ranking";
import VotingCountdown from "./VotingCountdown";

interface HeroProps {
  results: PollResults | null;
  votingOpen: boolean;
  onDeadline: () => void;
}

export default function Hero({ results, votingOpen, onDeadline }: HeroProps) {
  const leader = results?.totalVotes
    ? rankByVotes(results.candidates)[0]
    : undefined;

  return (
    <section className="grid items-center gap-10 py-10 sm:py-16 lg:grid-cols-[1.15fr_1fr]">
      <div>
        <p className="section-title">Enquete popular · Temporada 2025/26</p>
        <h1 className="mt-4 font-display text-5xl font-bold uppercase leading-[0.95] tracking-tight text-white sm:text-7xl">
          Quem merece a{" "}
          <span className="text-gold-gradient block">Bola de Ouro?</span>
        </h1>
        <p className="mt-6 max-w-xl text-base leading-relaxed text-zinc-400 sm:text-lg">
          Escolha entre os 30 indicados ao prêmio de melhor jogador do mundo,
          confirme com sua conta Google, acompanhe o ranking ao vivo e compare a
          temporada de cada jogador.
        </p>

        <div className="mt-8 flex flex-wrap items-center gap-3">
          {votingOpen && (
            <a
              href="#votar"
              className="inline-flex items-center gap-2 rounded-xl bg-gold-gradient px-6 py-3 font-display text-base font-semibold uppercase tracking-wider text-ink-950 shadow-glow transition hover:brightness-110"
            >
              Votar agora
              <ArrowRight className="h-4 w-4" aria-hidden />
            </a>
          )}
          <a
            href="#ranking"
            className="inline-flex items-center gap-2 rounded-xl border border-white/15 px-6 py-3 font-display text-base font-medium uppercase tracking-wider text-white transition hover:border-gold-400/60 hover:text-gold-200"
          >
            Ver ranking
          </a>
        </div>

        <dl className="mt-10 grid max-w-lg grid-cols-3 divide-x divide-white/10 rounded-2xl border border-white/[0.08] bg-white/[0.02]">
          <Stat label="Indicados" value="30" />
          <Stat
            label="Votos"
            value={results ? formatInteger(results.totalVotes) : "—"}
          />
          <Stat label="Cerimônia" value="26/10" />
        </dl>
      </div>

      <div className="space-y-4">
        {results && (
          <VotingCountdown
            closesAt={results.votingClosesAt}
            votingOpen={votingOpen}
            onExpire={onDeadline}
          />
        )}

        <div className="relative overflow-hidden rounded-3xl border border-gold-400/25 bg-ink-900 shadow-glow">
          {leader?.photoUrl ? (
            <img
              src={leader.photoUrl}
              alt={`Foto de ${leader.fullName}`}
              className="h-80 w-full object-cover object-top opacity-90 sm:h-96"
            />
          ) : (
            <div className="flex h-80 items-center justify-center sm:h-96">
              <Crown className="h-20 w-20 text-gold-400/30" aria-hidden />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/40 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 p-6">
            <p className="inline-flex items-center gap-1.5 rounded-full bg-gold-400/15 px-3 py-1 font-display text-xs uppercase tracking-[0.2em] text-gold-300 ring-1 ring-gold-400/30">
              <Crown className="h-3.5 w-3.5" aria-hidden />
              {leader ? "Líder da enquete" : "Ainda sem votos"}
            </p>
            {leader ? (
              <>
                <p className="mt-3 font-display text-4xl font-bold uppercase leading-none text-white">
                  {leader.fullName}
                </p>
                <p className="mt-2 text-sm text-zinc-300">
                  {leader.club} · {leader.nationality}
                </p>
                <p className="text-gold-gradient mt-3 font-display text-5xl font-bold tabular-nums">
                  {formatPercent(leader.percentage)}
                </p>
              </>
            ) : (
              <p className="mt-3 font-display text-3xl font-semibold uppercase leading-tight text-white">
                Seja o primeiro a votar
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="px-4 py-3 text-center">
      <dt className="text-[11px] uppercase tracking-[0.18em] text-zinc-500">
        {label}
      </dt>
      <dd className="mt-1 font-display text-2xl font-semibold tabular-nums text-white">
        {value}
      </dd>
    </div>
  );
}
