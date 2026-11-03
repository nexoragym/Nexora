import { StreakEvolution } from "../../../../../components/streak/StreakEvolution";
import { StreakFlame } from "../../../../../components/streak/StreakFlame";
import { Alert } from "../../../../../components/ui/Alert";
import { Button } from "../../../../../components/ui/Button";
import { etapaDeRacha } from "../../../../../lib/streak";
import type { SessionInfo } from "../types";
import { formatearNumero, formatearTiempo } from "./formato";
import { IconoCheck } from "./Iconos";
import type { Registro, Resumen } from "./tipos";

type PantallaFinProps = {
  data: SessionInfo;
  registros: Registro[];
  resumen: Resumen | null;
  evolucionAbierta: boolean;
  onCerrarEvolucion: () => void;
  onReintentar: () => void;
  onVolver: () => void;
};

export function PantallaFin({
  data,
  registros,
  resumen,
  evolucionAbierta,
  onCerrarEvolucion,
  onReintentar,
  onVolver,
}: PantallaFinProps) {
  const volumen = Math.round(
    registros.reduce((suma, r) => suma + r.kg * r.reps, 0),
  );
  const porEjercicio = data.exercises
    .map((ej) => ({
      nombre: ej.name,
      series: registros.filter((r) => r.exerciseId === ej.exerciseId).length,
    }))
    .filter((item) => item.series > 0);

  const racha = resumen?.racha ?? null;
  const etapa = racha !== null ? etapaDeRacha(racha) : null;

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-xl flex-col items-center gap-6 px-4 py-10">
      <div className="relative flex size-28 items-center justify-center">
        <span className="absolute inset-0 animate-[ping_1s_cubic-bezier(0,0,0.2,1)_2] rounded-full bg-accent/30" />
        <span className="nx-fade-up relative flex size-28 items-center justify-center rounded-full bg-linear-to-br from-accent to-accent-hover text-white shadow-lg shadow-accent/30">
          <IconoCheck />
        </span>
      </div>
      <div className="nx-fade-up flex flex-col items-center gap-1 text-center">
        <h1 className="text-3xl font-bold tracking-tight">¡Entrenamiento completado!</h1>
        <p className="text-muted">
          Día {data.dayNumber} · {data.dayName}
        </p>
      </div>

      {resumen ? (
        <div className="nx-fade-up grid w-full grid-cols-3 gap-3">
          <div className="flex flex-col items-center gap-1 rounded-3xl border border-border bg-surface p-4">
            <span className="text-2xl font-semibold tabular-nums">
              {formatearTiempo(resumen.duracion)}
            </span>
            <span className="text-xs text-muted">Duración</span>
          </div>
          <div className="flex flex-col items-center gap-1 rounded-3xl border border-border bg-surface p-4">
            <span className="text-2xl font-semibold tabular-nums">
              {registros.length}
            </span>
            <span className="text-xs text-muted">Series</span>
          </div>
          <div className="flex flex-col items-center gap-1 rounded-3xl border border-border bg-surface p-4">
            <span className="text-2xl font-semibold tabular-nums">
              {volumen > 0 ? formatearNumero(volumen) : "—"}
            </span>
            <span className="text-xs text-muted">Kilos totales</span>
          </div>
        </div>
      ) : (
        <p className="text-muted" aria-live="polite">
          Guardando tu entrenamiento…
        </p>
      )}

      {racha !== null && etapa ? (
        <div className="nx-fade-up flex w-full items-center gap-4 rounded-3xl border border-border bg-surface px-5 py-3">
          <StreakFlame etapa={etapa} size={56} />
          <div className="flex flex-col">
            <span className="text-2xl font-semibold tabular-nums">
              {racha === 1 ? "1 día de racha" : `${racha} días de racha`}
            </span>
            <span className="text-sm text-muted">{etapa.nombre}</span>
          </div>
        </div>
      ) : null}

      {resumen?.aviso ? (
        <Alert tone="warning" title="No se pudo guardar todo">
          <div className="flex flex-col gap-3">
            <p>
              Comprueba tu conexión y pulsa Reintentar. Hasta entonces el día
              no quedará marcado como completado.
            </p>
            <div>
              <Button variant="secondary" onClick={onReintentar}>
                Reintentar
              </Button>
            </div>
          </div>
        </Alert>
      ) : null}

      <ul className="flex w-full flex-col gap-2 text-sm text-muted">
        {porEjercicio.map((item) => (
          <li
            key={item.nombre}
            className="flex items-center justify-between rounded-2xl border border-border bg-surface px-4 py-3"
          >
            <span className="text-foreground">{item.nombre}</span>
            <span>{item.series} series</span>
          </li>
        ))}
      </ul>

      <div className="mt-auto w-full pt-4">
        <Button size="xl" fullWidth disabled={resumen === null} onClick={onVolver}>
          Volver a Entrenar
        </Button>
      </div>

      {evolucionAbierta && resumen?.evolucion ? (
        <StreakEvolution
          desde={resumen.evolucion.desde}
          hasta={resumen.evolucion.hasta}
          dias={resumen.evolucion.dias}
          onClose={onCerrarEvolucion}
        />
      ) : null}
    </main>
  );
}