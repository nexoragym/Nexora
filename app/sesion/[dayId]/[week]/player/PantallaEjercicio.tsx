import { ExerciseMedia } from "../../../../../components/exercises/ExerciseMedia";
import { Button } from "../../../../../components/ui/Button";
import { ProgressRing } from "../../../../../components/ui/ProgressRing";
import type { SessionExercise } from "../types";
import { KG_MAX, formatearTiempo } from "./formato";
import { Stepper } from "./Stepper";

type PantallaEjercicioProps = {
  ejercicio: SessionExercise;
  idxEj: number;
  idxSerie: number;
  kg: number;
  reps: number;
  sinPeso: boolean;
  aguantando: boolean;
  restante: number;
  totalTemp: number;
  onKg: (valor: number) => void;
  onReps: (valor: number) => void;
  onTerminado: () => void;
  onEmpezarAguantar: () => void;
  onTerminarAguantar: () => void;
};

export function PantallaEjercicio({
  ejercicio,
  idxEj,
  idxSerie,
  kg,
  reps,
  sinPeso,
  aguantando,
  restante,
  totalTemp,
  onKg,
  onReps,
  onTerminado,
  onEmpezarAguantar,
  onTerminarAguantar,
}: PantallaEjercicioProps) {
  return (
    <>
      <main
        key={`ejercicio-${idxEj}-${idxSerie}`}
        className="nx-page-in mx-auto flex w-full max-w-xl flex-1 flex-col gap-5 px-4 py-6"
      >
        <ExerciseMedia
          imageUrl={ejercicio.imageUrl}
          videoUrl={ejercicio.videoUrl}
          alt={ejercicio.name}
        />

        <div className="flex flex-col gap-3">
          <h1 className="text-3xl font-bold tracking-tight">{ejercicio.name}</h1>
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <span className="rounded-full bg-accent/15 px-3 py-1 font-semibold text-accent">
              Serie {idxSerie + 1} de {ejercicio.sets}
            </span>
            <span className="rounded-full border border-border bg-surface px-3 py-1 text-muted">
              Objetivo: {ejercicio.repsMin}-{ejercicio.repsMax}{" "}
              {ejercicio.timed ? "segundos" : "repeticiones"}
            </span>
          </div>
        </div>

        {ejercicio.timed ? (
          aguantando ? (
            <div className="flex justify-center py-2">
              <ProgressRing
                value={restante}
                max={Math.max(totalTemp, 1)}
                size={220}
                strokeWidth={14}
                label="Tiempo restante del ejercicio"
              >
                <span className="text-5xl font-semibold tabular-nums">
                  {formatearTiempo(restante)}
                </span>
              </ProgressRing>
            </div>
          ) : (
            <Stepper
              label="Segundos a mantener"
              value={reps}
              step={5}
              min={5}
              max={600}
              onChange={onReps}
            />
          )
        ) : (
          <div
            className={sinPeso ? "grid grid-cols-1 gap-3" : "grid grid-cols-2 gap-3"}
          >
            {sinPeso ? null : (
              <Stepper
                label="Peso (kg)"
                value={kg}
                step={2.5}
                min={0}
                max={KG_MAX}
                onChange={onKg}
              />
            )}
            <Stepper
              label="Repeticiones"
              value={reps}
              step={1}
              min={1}
              max={100}
              onChange={onReps}
            />
          </div>
        )}

        {ejercicio.instructions.length > 0 ? (
          <details className="rounded-3xl border border-border bg-surface p-4 text-sm">
            <summary className="cursor-pointer select-none font-medium">
              Cómo se hace
            </summary>
            <ol className="mt-3 flex list-decimal flex-col gap-2 pl-5 text-muted">
              {ejercicio.instructions.map((paso, indice) => (
                <li key={indice}>{paso}</li>
              ))}
            </ol>
          </details>
        ) : null}
      </main>

      <div className="sticky bottom-0 z-10 bg-linear-to-t from-background via-background to-transparent px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-6">
        <div className="mx-auto w-full max-w-xl">
          {ejercicio.timed ? (
            aguantando ? (
              <Button size="xl" fullWidth onClick={onTerminarAguantar}>
                Terminado
              </Button>
            ) : (
              <Button size="xl" fullWidth onClick={onEmpezarAguantar}>
                Empezar
              </Button>
            )
          ) : (
            <Button size="xl" fullWidth onClick={onTerminado}>
              Terminado
            </Button>
          )}
        </div>
      </div>
    </>
  );
}