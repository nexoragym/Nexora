import type { SessionInfo } from "../types";
import { IconoCerrar, IconoSonido } from "./Iconos";

type CabeceraSesionProps = {
  data: SessionInfo;
  idxEj: number;
  porcentaje: number;
  sonido: boolean;
  onSalir: () => void;
  onSonido: () => void;
};

export function CabeceraSesion({
  data,
  idxEj,
  porcentaje,
  sonido,
  onSalir,
  onSonido,
}: CabeceraSesionProps) {
  return (
    <header className="sticky top-0 z-20 border-b border-border bg-background/90 pt-[env(safe-area-inset-top)] backdrop-blur">
      <div className="mx-auto flex w-full max-w-xl items-center justify-between gap-3 px-4 py-3">
        <button
          type="button"
          aria-label="Salir del entrenamiento"
          onClick={onSalir}
          className="flex size-11 items-center justify-center rounded-2xl text-muted transition hover:bg-surface-2 hover:text-foreground"
        >
          <IconoCerrar />
        </button>
        <div className="min-w-0 text-center">
          <p className="truncate text-sm font-semibold">
            Día {data.dayNumber} · Semana {data.week}
          </p>
          <p className="text-xs text-muted">
            Ejercicio {idxEj + 1} de {data.exercises.length}
          </p>
        </div>
        <button
          type="button"
          aria-label={sonido ? "Silenciar los avisos" : "Activar los avisos"}
          aria-pressed={sonido}
          onClick={onSonido}
          className="flex size-11 items-center justify-center rounded-2xl text-muted transition hover:bg-surface-2 hover:text-foreground"
        >
          <IconoSonido activo={sonido} />
        </button>
      </div>
      <div
        role="progressbar"
        aria-label="Progreso del entrenamiento"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={porcentaje}
        className="h-1 w-full bg-surface-2"
      >
        <div
          className="h-full bg-linear-to-r from-accent to-orange-500 transition-[width] duration-500"
          style={{ width: `${porcentaje}%` }}
        />
      </div>
    </header>
  );
}