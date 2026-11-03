import Link from "next/link";
import { Alert } from "../../../../../components/ui/Alert";
import { Button } from "../../../../../components/ui/Button";
import type { SessionInfo } from "../types";

type PantallaIntroProps = {
  data: SessionInfo;
  error: string | null;
  iniciando: boolean;
  onComenzar: () => void;
};

export function PantallaIntro({
  data,
  error,
  iniciando,
  onComenzar,
}: PantallaIntroProps) {
  return (
    <main className="nx-page-in mx-auto flex min-h-dvh w-full max-w-xl flex-col gap-6 px-4 py-8">
      <Link
        href="/entrenar"
        className="text-sm text-muted transition hover:text-foreground"
      >
        ← Volver a Entrenar
      </Link>
      <div className="flex flex-col gap-1">
        <p className="text-sm text-muted">
          Semana {data.week} · {data.routineName}
        </p>
        <h1 className="text-4xl font-bold tracking-tight">Día {data.dayNumber}</h1>
        <p className="text-lg text-muted">{data.dayName}</p>
      </div>
      <ol className="flex flex-col gap-3">
        {data.exercises.map((ej, i) => (
          <li
            key={ej.exerciseId}
            className="flex items-center gap-4 rounded-3xl border border-border bg-surface p-4"
          >
            {ej.imageUrl ? (
              <div className="relative size-16 shrink-0 overflow-hidden rounded-2xl bg-linear-to-br from-accent/30 to-surface-2">
                <div
                  aria-hidden="true"
                  className="absolute inset-0 bg-cover bg-center"
                  style={{ backgroundImage: `url("${ej.imageUrl}")` }}
                />
                <span className="absolute left-1 top-1 flex size-6 items-center justify-center rounded-full bg-background/80 text-xs font-semibold text-accent">
                  {i + 1}
                </span>
              </div>
            ) : (
              <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-accent/15 font-semibold text-accent">
                {i + 1}
              </span>
            )}
            <div className="flex min-w-0 flex-col">
              <span className="font-medium">{ej.name}</span>
              <span className="text-sm text-muted">
                {ej.sets} series · {ej.repsMin}-{ej.repsMax}{" "}
                {ej.timed ? "segundos" : "repeticiones"}
              </span>
            </div>
          </li>
        ))}
      </ol>
      {error ? (
        <Alert tone="danger" title="No se pudo empezar">
          {error}
        </Alert>
      ) : null}
      <div className="mt-auto pt-4">
        <Button size="xl" fullWidth onClick={onComenzar} disabled={iniciando}>
          {iniciando ? "Preparando…" : "Empezar entrenamiento"}
        </Button>
      </div>
    </main>
  );
}