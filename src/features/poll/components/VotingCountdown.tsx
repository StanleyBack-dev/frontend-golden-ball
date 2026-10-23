import { useMemo } from "react";
import { Clock } from "lucide-react";
import {
  BRASILIA_TIME_ZONE,
  deviceTimeZone,
  formatDayInZone,
  formatTimeInZone,
} from "../../../shared/utils/time-zone";
import { useCountdown } from "../hooks/useCountdown";

interface VotingCountdownProps {
  /** Official closing instant (ISO 8601). */
  closesAt: string;
  votingOpen: boolean;
  onExpire: () => void;
}

const pad = (value: number) => String(value).padStart(2, "0");

export default function VotingCountdown({
  closesAt,
  votingOpen,
  onExpire,
}: VotingCountdownProps) {
  const deadline = useMemo(() => new Date(closesAt), [closesAt]);
  const { totalMs, days, hours, minutes, seconds } = useCountdown(
    deadline,
    onExpire,
  );

  const brasiliaTime = formatTimeInZone(deadline, BRASILIA_TIME_ZONE);
  const brasiliaDay = formatDayInZone(deadline, BRASILIA_TIME_ZONE);
  const deviceZone = deviceTimeZone();
  const deviceTime = formatTimeInZone(deadline, deviceZone);
  const closed = !votingOpen || totalMs <= 0;

  if (closed) {
    return (
      <div className="card flex items-center gap-3 px-5 py-4 font-display text-lg uppercase tracking-wider text-white">
        <Clock className="h-5 w-5 text-gold-400" aria-hidden />
        Votação encerrada
      </div>
    );
  }

  const units = [
    { value: pad(days), label: days === 1 ? "dia" : "dias" },
    { value: pad(hours), label: "horas" },
    { value: pad(minutes), label: "min" },
    { value: pad(seconds), label: "seg" },
  ];

  return (
    <div className="card w-full px-5 py-4 text-white">
      <p className="section-title text-xs">Votação encerra em</p>

      <div
        className="mt-3 grid grid-cols-4 gap-2"
        role="timer"
        aria-live="off"
        aria-label={`Faltam ${days} dias, ${hours} horas, ${minutes} minutos e ${seconds} segundos`}
      >
        {units.map((unit) => (
          <span
            key={unit.label}
            className="flex flex-col items-center rounded-xl border border-white/[0.06] bg-ink-800 py-2"
          >
            <span className="font-display text-3xl font-semibold tabular-nums text-white sm:text-4xl">
              {unit.value}
            </span>
            <span className="text-[10px] uppercase tracking-[0.18em] text-zinc-500">
              {unit.label}
            </span>
          </span>
        ))}
      </div>

      <p className="mt-3 text-xs text-zinc-400">
        <span className="capitalize">{brasiliaDay}</span>, às {brasiliaTime}{" "}
        (horário de Brasília)
        {deviceZone && deviceTime !== brasiliaTime && (
          <> · {deviceTime} no seu horário</>
        )}
      </p>
    </div>
  );
}
