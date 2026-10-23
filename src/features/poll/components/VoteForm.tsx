import { useRef, useState, type FormEvent } from "react";
import {
  CheckCircle2,
  Loader2,
  Lock,
  LogOut,
  Receipt,
  ShieldCheck,
} from "lucide-react";
import type { Voter } from "../../../api/auth";
import { castVote, type Candidate } from "../../../api/poll";
import { getHttpErrorCode, getHttpErrorMessage } from "../../../api/http-error";
import { useToast } from "../../../shared/toast";
import GoogleSignInButton from "../../auth/components/GoogleSignInButton";
import { useVoterSession } from "../../auth/hooks/useVoterSession";
import NomineePicker, { StepBadge } from "./NomineePicker";
import TurnstileWidget, { type TurnstileHandle } from "./TurnstileWidget";
import ReceiptModal, {
  type VoteReceipt,
} from "../../receipt/components/ReceiptModal";
import { toReceiptChoice } from "../../receipt/utils/receipt-choice";

const TURNSTILE_SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY as
  string | undefined;
const VOTED_STORAGE_KEY = "bolaDeOuro2026:voted";
const RECEIPT_STORAGE_KEY = "bolaDeOuro2026:receipt";

/**
 * What this device remembers about its own vote, so the receipt can be
 * reopened later. Lives only in this browser's localStorage — never sent
 * anywhere — and holds the chosen nominee's slug (e.g. "vinicius-junior")
 * so the voter can show their vote again; they can still hide it.
 */
type StoredReceipt = Pick<VoteReceipt, "votedAt"> & {
  choiceSlug?: string;
};

function readStoredReceipt(): StoredReceipt | null {
  try {
    const raw = window.localStorage.getItem(RECEIPT_STORAGE_KEY);
    const parsed = raw ? (JSON.parse(raw) as Partial<StoredReceipt>) : null;
    if (typeof parsed?.votedAt !== "string") {
      return null;
    }
    return {
      votedAt: parsed.votedAt,
      choiceSlug:
        typeof parsed.choiceSlug === "string" &&
        /^[a-z0-9-]{1,40}$/.test(parsed.choiceSlug)
          ? parsed.choiceSlug
          : undefined,
    };
  } catch {
    return null;
  }
}

function storeReceipt(receipt: StoredReceipt) {
  try {
    window.localStorage.setItem(RECEIPT_STORAGE_KEY, JSON.stringify(receipt));
  } catch {
    // Storage unavailable: the receipt is still shown for this session.
  }
}

function readVotedFlag(): boolean {
  try {
    return window.localStorage.getItem(VOTED_STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

function writeVotedFlag() {
  try {
    // Only "already voted" is remembered on this device — never the choice.
    window.localStorage.setItem(VOTED_STORAGE_KEY, "1");
  } catch {
    // Storage unavailable (private mode): the server is the source of truth.
  }
}

interface VoteFormProps {
  candidates: Candidate[];
  votingOpen: boolean;
  onVoted: () => void;
}

export default function VoteForm({
  candidates,
  votingOpen,
  onVoted,
}: VoteFormProps) {
  const { showError, showSuccess } = useToast();
  const turnstileRef = useRef<TurnstileHandle>(null);
  const session = useVoterSession();
  const { voter } = session;

  const [candidateSlug, setCandidateSlug] = useState("");
  const [consent, setConsent] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [voted, setVoted] = useState(readVotedFlag);
  const [storedReceipt, setStoredReceipt] = useState(readStoredReceipt);
  const [openReceipt, setOpenReceipt] = useState<VoteReceipt | null>(null);

  const captchaReady = !TURNSTILE_SITE_KEY || Boolean(captchaToken);

  // What still blocks the vote, in the order the form asks for it.
  const missingSteps = [
    !candidateSlug && "escolha um jogador",
    !consent && "aceite o aviso de privacidade",
    !captchaReady && "conclua a verificação anti-robô",
  ].filter((step): step is string => Boolean(step));

  const canSubmit =
    votingOpen && !submitting && Boolean(voter) && missingSteps.length === 0;

  async function handleSignIn(idToken: string) {
    const signedIn = await session.signIn(idToken);
    if (signedIn.hasVoted) {
      showError(
        "Esta conta já votou",
        "Cada conta Google pode votar uma única vez.",
        6000,
      );
    } else {
      showSuccess("Conta conectada", `Votando como ${signedIn.name}.`);
    }
  }

  async function handleSwitchAccount() {
    await session.signOut();
    setVoted(false);
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!canSubmit) return;

    setSubmitting(true);
    try {
      const response = await castVote({
        candidateSlug,
        privacyConsent: true,
        captchaToken: captchaToken ?? undefined,
      });

      writeVotedFlag();
      const receipt: StoredReceipt = {
        votedAt: response.data.votedAt,
        choiceSlug: candidateSlug,
      };
      storeReceipt(receipt);
      setStoredReceipt(receipt);
      setOpenReceipt({
        votedAt: receipt.votedAt,
        choice: toReceiptChoice(candidateSlug, candidates),
      });
      setVoted(true);
      session.markVoted();
      showSuccess("Voto registrado!", response.message);
      onVoted();
    } catch (error) {
      showError(
        "Não foi possível registrar o voto",
        getHttpErrorMessage(error, "Tente novamente em instantes."),
        6000,
      );

      const code = getHttpErrorCode(error);
      if (code === "AUTH_REQUIRED") session.forget();
      if (code === "VOTE_ALREADY_CAST") session.markVoted();
      // Turnstile tokens are single-use.
      setCaptchaToken(null);
      turnstileRef.current?.reset();
    } finally {
      setSubmitting(false);
    }
  }

  const receiptModal = openReceipt && (
    <ReceiptModal receipt={openReceipt} onClose={() => setOpenReceipt(null)} />
  );

  if (!votingOpen) {
    return (
      <div className="card p-8 text-center">
        <p className="font-display text-2xl uppercase tracking-wider text-white">
          A votação está encerrada.
        </p>
        <p className="mt-1 text-sm text-zinc-300">
          Acompanhe abaixo o resultado final da enquete.
        </p>
        {receiptModal}
      </div>
    );
  }

  if (voted || voter?.hasVoted) {
    return (
      <div className="card flex flex-col items-center gap-3 border-gold-400/30 p-8 text-center shadow-glow">
        <CheckCircle2 className="h-12 w-12 text-gold-400" aria-hidden />
        <p className="font-display text-2xl uppercase tracking-wider text-white">
          {voted
            ? "Seu voto foi registrado neste dispositivo."
            : "Esta conta Google já registrou um voto."}
        </p>
        <p className="max-w-md text-sm text-zinc-400">
          Cada conta Google pode votar uma única vez. Acompanhe o ranking em
          tempo real.
        </p>
        {storedReceipt && (
          <button
            type="button"
            onClick={() =>
              setOpenReceipt({
                votedAt: storedReceipt.votedAt,
                choice: storedReceipt.choiceSlug
                  ? toReceiptChoice(storedReceipt.choiceSlug, candidates)
                  : null,
              })
            }
            className="btn-primary mt-2 w-auto px-6 py-3 text-sm"
          >
            <Receipt className="h-4 w-4" aria-hidden />
            Ver e compartilhar meu comprovante
          </button>
        )}
        <button
          type="button"
          className="text-xs font-medium text-gold-300 underline underline-offset-2"
          onClick={() => void handleSwitchAccount()}
        >
          Votar com outra conta Google
        </button>
        {receiptModal}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="card p-5 sm:p-8" noValidate>
      <NomineePicker
        candidates={candidates}
        value={candidateSlug}
        onChange={setCandidateSlug}
        disabled={submitting}
      />

      <fieldset className="mt-10 border-t border-white/[0.06] pt-8">
        <legend className="flex items-center gap-2 font-display text-lg uppercase tracking-wider text-white">
          <StepBadge>2</StepBadge>
          Confirme com sua conta Google
        </legend>
        <p className="mt-2 text-xs text-zinc-500">
          Cada conta Google vota uma única vez.
        </p>

        {voter && (
          <VoterBadge
            voter={voter}
            onSwitch={() => void handleSwitchAccount()}
          />
        )}

        <div className="mt-5 space-y-5">
          <label className="flex items-start gap-3 text-sm text-zinc-300">
            <input
              type="checkbox"
              checked={consent}
              onChange={(e) => setConsent(e.target.checked)}
              className="mt-0.5 h-4 w-4 shrink-0 rounded border-white/15 accent-gold-400"
            />
            <span>
              Autorizo o uso da minha conta Google apenas para impedir votos
              duplicados. Guardamos somente um código criptográfico irreversível
              da conta, nunca seu nome ou e-mail, e sem vínculo com o voto
              (LGPD).
            </span>
          </label>

          {TURNSTILE_SITE_KEY && (
            <TurnstileWidget
              ref={turnstileRef}
              siteKey={TURNSTILE_SITE_KEY}
              onToken={setCaptchaToken}
            />
          )}
        </div>

        {session.loading ? (
          <div className="mt-6 flex justify-center">
            <Loader2
              className="h-5 w-5 animate-spin text-gold-400"
              aria-label="Carregando"
            />
          </div>
        ) : voter ? (
          <div className="mt-6">
            <button type="submit" disabled={!canSubmit} className="btn-primary">
              {submitting ? (
                <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
              ) : (
                <ShieldCheck className="h-5 w-5" aria-hidden />
              )}
              {submitting ? "Registrando voto..." : "Confirmar voto"}
            </button>
            {!submitting && missingSteps.length > 0 && (
              <p className="mt-2 text-center text-xs text-zinc-500">
                Para votar: {missingSteps.join(", ")}.
              </p>
            )}
          </div>
        ) : (
          <div className="mt-6 flex flex-col items-center gap-3 rounded-2xl border border-white/[0.08] bg-white/[0.02] p-5 text-center">
            <p className="flex items-center gap-2 text-sm font-medium text-zinc-300">
              <Lock className="h-4 w-4 shrink-0 text-gold-400" aria-hidden />
              Para confirmar o voto, entre com sua conta Google.
            </p>
            <GoogleSignInButton onCredential={handleSignIn} />
          </div>
        )}
      </fieldset>
      {receiptModal}
    </form>
  );
}

function VoterBadge({
  voter,
  onSwitch,
}: {
  voter: Voter;
  onSwitch: () => void;
}) {
  return (
    <div className="mt-4 flex items-center gap-3 rounded-2xl border border-gold-400/20 bg-gold-400/5 px-4 py-3">
      {voter.pictureUrl ? (
        <img
          src={voter.pictureUrl}
          alt=""
          referrerPolicy="no-referrer"
          className="h-9 w-9 shrink-0 rounded-full ring-1 ring-gold-400/40"
        />
      ) : (
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gold-gradient text-sm font-semibold text-ink-950">
          {voter.name.charAt(0).toUpperCase()}
        </span>
      )}
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-medium text-white">
          Votando como {voter.name}
        </span>
        <span className="block truncate text-xs text-zinc-400">
          {voter.email}
        </span>
      </span>
      <button
        type="button"
        onClick={onSwitch}
        className="flex shrink-0 items-center gap-1 text-xs font-medium text-gold-300 underline underline-offset-2"
      >
        <LogOut className="h-3.5 w-3.5" aria-hidden />
        Sair
      </button>
    </div>
  );
}
