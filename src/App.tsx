import { useCallback, useState } from "react";
import { Info, Loader2, Lock } from "lucide-react";
import { ToastProvider } from "./shared/toast/ToastProvider";
import { usePollResults } from "./features/poll/hooks/usePollResults";
import ResultsSummary from "./features/poll/components/ResultsSummary";
import AnalyticsSection from "./features/analytics/components/AnalyticsSection";
import VoteForm from "./features/poll/components/VoteForm";
import Hero from "./features/poll/components/Hero";
import BallMark from "./components/brand/BallMark";
import PhotoCredits from "./components/brand/PhotoCredits";

const NAV_LINKS = [
  { href: "#ranking", label: "Ranking" },
  { href: "#votar", label: "Votar" },
  { href: "#analise", label: "Análise" },
];

function PollPage() {
  const { results, error, loading, refresh } = usePollResults();
  // Flips the instant the countdown hits zero, without waiting for the next
  // results poll (the backend rejects late votes regardless).
  const [deadlinePassed, setDeadlinePassed] = useState(false);
  const [analyticsRefreshKey, setAnalyticsRefreshKey] = useState(0);
  const votingOpen = Boolean(results?.votingOpen) && !deadlinePassed;

  const handleDeadline = useCallback(() => {
    setDeadlinePassed(true);
    void refresh();
  }, [refresh]);

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-40 border-b border-white/[0.06] bg-ink-950/70 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-4">
          <a href="#topo" className="flex items-center gap-2.5">
            <BallMark className="h-7 w-7" />
            <span className="font-display text-base font-semibold uppercase tracking-[0.18em] text-white">
              Bola de Ouro{" "}
              <span className="text-gold-gradient font-bold">2026</span>
            </span>
          </a>
          <nav className="flex items-center gap-1 text-sm">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="hidden rounded-lg px-3 py-1.5 text-zinc-400 transition hover:bg-white/5 hover:text-white sm:block"
              >
                {link.label}
              </a>
            ))}
            {votingOpen && (
              <a
                href="#votar"
                className="ml-1 rounded-lg bg-gold-gradient px-3.5 py-1.5 font-display text-sm font-semibold uppercase tracking-wider text-ink-950 transition hover:brightness-110"
              >
                Votar
              </a>
            )}
          </nav>
        </div>
      </header>

      <main id="topo" className="mx-auto max-w-6xl px-4">
        <Hero
          results={results}
          votingOpen={votingOpen}
          onDeadline={handleDeadline}
        />

        <p className="mb-12 flex items-start gap-2 rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3 text-xs leading-relaxed text-zinc-400">
          <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gold-400" />
          <span>
            <strong className="text-zinc-200">Enquete não oficial.</strong> Sem
            vínculo com a France Football, a UEFA ou a premiação da Bola de Ouro
            e sem valor estatístico: reflete apenas a opinião de quem participou
            por este site.
          </span>
        </p>

        <div className="space-y-16 pb-16">
          <section
            id="ranking"
            aria-labelledby="results-heading"
            className="scroll-mt-20"
          >
            <SectionHeading
              id="results-heading"
              eyebrow="Ao vivo"
              title="Ranking parcial"
            />
            {loading && !results ? (
              <div className="card flex h-40 items-center justify-center">
                <Loader2
                  className="h-6 w-6 animate-spin text-gold-400"
                  aria-label="Carregando"
                />
              </div>
            ) : results ? (
              <ResultsSummary results={results} />
            ) : (
              <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-5 text-sm text-red-300">
                {error}{" "}
                <button
                  type="button"
                  className="font-semibold underline"
                  onClick={() => void refresh()}
                >
                  Tentar novamente
                </button>
              </div>
            )}
          </section>

          {results && (
            <section
              id="votar"
              aria-labelledby="vote-heading"
              className="scroll-mt-20"
            >
              <SectionHeading
                id="vote-heading"
                eyebrow="Sua vez"
                title="Escolha o seu Bola de Ouro"
              />
              <VoteForm
                candidates={results.candidates}
                votingOpen={votingOpen}
                onVoted={() => {
                  void refresh();
                  setAnalyticsRefreshKey((key) => key + 1);
                }}
              />
            </section>
          )}

          {results && (
            <div id="analise" className="scroll-mt-20">
              <AnalyticsSection refreshKey={analyticsRefreshKey} />
            </div>
          )}
        </div>
      </main>

      <footer className="border-t border-white/[0.06] bg-ink-950">
        <div className="mx-auto grid max-w-6xl gap-6 px-4 py-10 text-xs text-zinc-500 sm:grid-cols-[1fr_auto]">
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <BallMark className="h-6 w-6" />
              <span className="font-display text-sm uppercase tracking-[0.18em] text-zinc-300">
                Bola de Ouro 2026 · Enquete popular
              </span>
            </div>
            <p className="flex max-w-2xl items-start gap-2 leading-relaxed">
              <Lock className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
              Privacidade: o login com Google serve só para impedir votos
              duplicados. Guardamos apenas um código criptográfico irreversível
              da conta, sem e-mail e separado do voto. Nada é publicado em seu
              nome.
            </p>
            <p>
              Lista oficial dos 30 indicados divulgada pela France Football e
              pela UEFA.
            </p>
          </div>
          <PhotoCredits candidates={results?.candidates ?? []} />
        </div>
      </footer>
    </div>
  );
}

function SectionHeading({
  id,
  eyebrow,
  title,
}: {
  id: string;
  eyebrow: string;
  title: string;
}) {
  return (
    <div className="mb-5">
      <p className="section-title">{eyebrow}</p>
      <h2
        id={id}
        className="mt-1 font-display text-3xl font-semibold uppercase tracking-wide text-white sm:text-4xl"
      >
        {title}
      </h2>
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <PollPage />
    </ToastProvider>
  );
}
