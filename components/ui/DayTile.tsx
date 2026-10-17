import { cn } from "../../lib/cn";

export type DayStatus = "done" | "today" | "pending" | "locked";

type DayTileProps = {
  day: number;
  status: DayStatus;
  label?: string;
};

const statusText: Record<DayStatus, string> = {
  done: "completado",
  today: "hoy",
  pending: "pendiente",
  locked: "bloqueado",
};

const styles: Record<DayStatus, string> = {
  done: "border-transparent bg-accent text-accent-foreground",
  today: "border-accent bg-surface text-foreground",
  pending: "border-border bg-surface-2 text-muted",
  locked: "border-border bg-surface text-muted opacity-50",
};

export function DayTile({ day, status, label }: DayTileProps) {
  return (
    <div
      className={cn(
        "flex aspect-square flex-col items-center justify-center gap-0.5 rounded-2xl border-2 p-1 text-center",
        styles[status],
      )}
    >
      {status === "done" ? (
        <>
          <svg
            viewBox="0 0 24 24"
            width="22"
            height="22"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M5 12.5l4.5 4.5L19 7.5" />
          </svg>
          <span className="text-sm font-semibold tabular-nums">{day}</span>
        </>
      ) : (
        <span className="text-2xl font-semibold tabular-nums">{day}</span>
      )}
      {label ? (
        <span className="text-[11px] leading-tight opacity-90">{label}</span>
      ) : null}
      <span className="sr-only">
        Día {day}, {statusText[status]}
      </span>
    </div>
  );
}