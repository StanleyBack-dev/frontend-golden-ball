import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  Check,
  Copy,
  Download,
  EyeOff,
  Loader2,
  Instagram,
  Share2,
  User,
  X,
} from "lucide-react";
import type { ReceiptChoice } from "../utils/receipt-choice";
import { useToast } from "../../../shared/toast";
import {
  RECEIPT_HEIGHT,
  RECEIPT_WIDTH,
  renderReceiptImage,
} from "../utils/render-receipt-image";
import {
  downloadBlob,
  shareTextWithUrl,
  type ShareNetwork,
  shareNatively,
  shareToInstagramStories,
  siteUrl,
  socialShareLinks,
} from "../utils/share";
import { copyText } from "../../../shared/utils/clipboard";

export interface VoteReceipt {
  state: string;
  votedAt: string;
  /** The vote, when known (right after voting, or remembered by this device). */
  choice: ReceiptChoice | null;
}

interface ReceiptModalProps {
  receipt: VoteReceipt;
  onClose: () => void;
}

export default function ReceiptModal({ receipt, onClose }: ReceiptModalProps) {
  const { showError, showSuccess } = useToast();
  // The vote is shown by default; the voter can hide it before sharing.
  const [showChoice, setShowChoice] = useState(true);
  const [blob, setBlob] = useState<Blob | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);

  const choice = showChoice ? receipt.choice : null;
  const url = siteUrl();
  const message = shareTextWithUrl(choice, url);

  // Render the PNG whenever the reveal toggle changes.
  useEffect(() => {
    let cancelled = false;
    setBlob(null);

    renderReceiptImage({
      state: receipt.state,
      votedAt: receipt.votedAt,
      choice,
      siteHost: window.location.host,
    })
      .then((image) => {
        if (cancelled) return;
        setBlob(image);
        setPreviewUrl(URL.createObjectURL(image));
      })
      .catch(() => {
        if (!cancelled) showError("Não foi possível gerar o comprovante.");
      });

    return () => {
      cancelled = true;
    };
  }, [receipt.state, receipt.votedAt, choice, showError]);

  // Frees each preview URL once it's replaced or the modal closes.
  useEffect(
    () => () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    },
    [previewUrl],
  );

  // Modal behavior: Esc closes, background doesn't scroll, focus returns.
  useEffect(() => {
    const previousFocus = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);

    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
      previousFocus?.focus();
    };
  }, [onClose]);

  const fileName = "comprovante-bola-de-ouro-2026.png";
  const maxSheetHeight =
    typeof CSS !== "undefined" && CSS.supports("height", "100dvh")
      ? "calc(100dvh - 1rem)"
      : "calc(100vh - 1rem)";

  async function handleShare() {
    if (!blob) return;
    try {
      const result = await shareNatively(
        new File([blob], fileName, { type: "image/png" }),
        message,
      );
      if (result === "unsupported") {
        downloadBlob(blob, fileName);
        showSuccess(
          "Imagem baixada",
          "Seu navegador não compartilha direto; publique a imagem baixada.",
        );
      }
    } catch {
      showError("Não foi possível compartilhar.");
    }
  }

  async function handleInstagramStories() {
    if (!blob) return;
    try {
      const result = await shareToInstagramStories(
        new File([blob], fileName, { type: "image/png" }),
      );
      if (result === "unsupported") {
        downloadBlob(blob, fileName);
        showSuccess(
          "Imagem baixada",
          "Abra o Instagram, toque em + › Story e escolha a imagem do comprovante.",
          8000,
        );
      }
    } catch {
      showError("Não foi possível abrir o compartilhamento.");
    }
  }

  /**
   * Web intents (wa.me, t.me...) only carry text. Where the device can share
   * files (phones), go through the native share sheet instead so the receipt
   * image travels with the message as its caption.
   */
  async function handleNetworkShare(network: ShareNetwork, href: string) {
    const file = blob
      ? new File([blob], fileName, { type: "image/png" })
      : null;

    if (file && navigator.canShare?.({ files: [file] })) {
      try {
        await shareNatively(file, shareTextWithUrl(choice, url, network));
      } catch {
        showError("Não foi possível compartilhar.");
      }
      return;
    }

    window.open(href, "_blank", "noopener,noreferrer");
  }

  async function handleCopy() {
    if (await copyText(message)) {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } else {
      // Last resort: show the link so it can be copied by hand.
      showError("Não foi possível copiar automaticamente.", url, 8000);
    }
  }

  return createPortal(
    <div
      className="fixed inset-0 z-[90] flex items-end justify-center overscroll-contain bg-black/70 text-left backdrop-blur-md sm:items-center sm:p-4"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="receipt-title"
        onClick={(event) => event.stopPropagation()}
        className="flex w-full max-w-md flex-col overflow-hidden rounded-t-3xl border border-white/10 bg-ink-900 shadow-2xl sm:rounded-3xl"
        style={{ maxHeight: maxSheetHeight }}
      >
        <div className="flex items-center justify-between border-b border-white/5 px-5 py-4">
          <div>
            <h2
              id="receipt-title"
              className="font-display text-xl uppercase tracking-wider text-white"
            >
              Seu comprovante
            </h2>
            <p className="text-xs text-zinc-400">
              Compartilhe e convide mais gente a votar
            </p>
          </div>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-zinc-400 hover:bg-white/10"
            aria-label="Fechar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 pt-4 pb-[calc(1rem+env(safe-area-inset-bottom))]">
          <div
            className="relative mx-auto h-[min(36vh,22rem)] overflow-hidden rounded-2xl bg-ink-950 shadow-md sm:h-[min(50vh,26rem)]"
            style={{ aspectRatio: `${RECEIPT_WIDTH} / ${RECEIPT_HEIGHT}` }}
          >
            {previewUrl && (
              <img
                src={previewUrl}
                alt={
                  choice
                    ? `Comprovante: ${choice.title}`
                    : "Comprovante: eu votei"
                }
                className={`h-full w-full transition-opacity ${blob ? "" : "opacity-50"}`}
              />
            )}
            {!blob && (
              <Loader2 className="absolute inset-0 m-auto h-6 w-6 animate-spin text-white" />
            )}
          </div>

          {receipt.choice && (
            <button
              type="button"
              onClick={() => setShowChoice((value) => !value)}
              aria-pressed={showChoice}
              className="mx-auto mt-4 flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-sm font-medium text-zinc-200 hover:bg-white/5"
            >
              {showChoice ? (
                <>
                  <EyeOff className="h-4 w-4" aria-hidden /> Esconder meu voto
                </>
              ) : (
                <>
                  <User className="h-4 w-4" aria-hidden /> Mostrar meu voto
                </>
              )}
            </button>
          )}
          <p className="mt-2 text-center text-[11px] text-zinc-500">
            O comprovante não contém seus dados da conta Google.
          </p>

          <button
            type="button"
            onClick={() => void handleShare()}
            disabled={!blob}
            className="btn-primary mt-4 py-3"
          >
            <Share2 className="h-5 w-5" aria-hidden />
            Compartilhar
          </button>

          <button
            type="button"
            onClick={() => void handleInstagramStories()}
            disabled={!blob}
            className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#f58529] via-[#dd2a7b] to-[#8134af] px-5 py-3 text-base font-semibold text-white transition hover:brightness-110 disabled:from-ink-700 disabled:via-ink-700 disabled:to-ink-700 disabled:text-zinc-500"
          >
            <Instagram className="h-5 w-5" aria-hidden />
            Postar nos Stories
          </button>
          <p className="mt-1.5 text-center text-[11px] text-zinc-500">
            No celular, escolha Instagram › Stories na lista de
            compartilhamento.
          </p>

          <div className="mt-3 grid grid-cols-2 gap-2">
            {socialShareLinks(choice, url).map((link) => (
              <button
                key={link.key}
                type="button"
                onClick={() => void handleNetworkShare(link.key, link.href)}
                className="rounded-xl border border-white/10 px-3 py-2.5 text-center text-sm font-medium text-zinc-200 hover:bg-white/5"
              >
                {link.label}
              </button>
            ))}
            <button
              type="button"
              onClick={() => blob && downloadBlob(blob, fileName)}
              disabled={!blob}
              className="flex items-center justify-center gap-1.5 rounded-xl border border-white/10 px-3 py-2.5 text-sm font-medium text-zinc-200 hover:bg-white/5 disabled:opacity-50"
            >
              <Download className="h-4 w-4" aria-hidden />
              Baixar imagem
            </button>
            <button
              type="button"
              onClick={() => void handleCopy()}
              className="flex items-center justify-center gap-1.5 rounded-xl border border-white/10 px-3 py-2.5 text-sm font-medium text-zinc-200 hover:bg-white/5"
            >
              {copied ? (
                <Check className="h-4 w-4 text-gold-400" aria-hidden />
              ) : (
                <Copy className="h-4 w-4" aria-hidden />
              )}
              {copied ? "Copiado!" : "Copiar link"}
            </button>
          </div>
          <p className="mt-2 text-center text-[11px] text-zinc-500">
            No celular, a imagem do comprovante vai junto com a mensagem:
            confirme o app na lista que abrir.
          </p>
        </div>
      </div>
    </div>,
    document.body,
  );
}
