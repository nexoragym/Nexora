import { Button } from "../../../../../components/ui/Button";
import { ProgressRing } from "../../../../../components/ui/ProgressRing";
import { formatearTiempo } from "./formato";

type PantallaDescansoProps = {
  idxEj: number;
  idxSerie: number;
  restante: number;
  totalTemp: number;
  siguiente: { nombre: string; serie: number; de: number } | null;
  onSaltar: () => void;
  onSumar: () => void;
};

export function PantallaDescanso({
  idxEj,
  idxSerie,
  restante,
  totalTemp,
  siguiente,
  onSaltar,
  onSumar,
}: PantallaDescansoProps) {
  return (
    <>
      <main
        key={`descanso-${idxEj}-${idxSerie}`}
        className="nx-page-in mx-auto flex w-full max-w-xl flex-1 flex-col items-center gap-6 px-4 py-8"
      >
        <p className="text-sm font-semibold uppercase tracking-widest text-muted">
          Descanso
        </p>
        <ProgressRing
          value={restante}
          max={Math.max(totalTemp, 1)}
          size={260}
          strokeWidth={14}
          label="Tiempo de descanso restante"
        >
          <span className="text-6xl font-semibold tabular-nums">
            {formatearTiempo(restante)}
          </span>
        </ProgressRing>
        {siguiente ? (
          <div className="w-full rounded-3xl border border-border bg-surface p-5 text-center">
            <p className="text-sm text-muted">A continuación</p>
            <p className="text-lg font-semibold">{siguiente.nombre}</p>
            <p className="text-sm text-muted">
              Serie {siguiente.serie} de {siguiente.de}
            </p>
          </div>
        ) : null}
      </main>
      <div className="sticky bottom-0 z-10 bg-linear-to-t from-background via-background to-transparent px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-6">
        <div className="mx-auto flex w-full max-w-xl flex-col gap-3">
          <Button size="xl" fullWidth onClick={onSaltar}>
            Saltar descanso
          </Button>
          <Button variant="secondary" fullWidth onClick={onSumar}>
            +15 segundos
          </Button>
        </div>
      </div>
    </>
  );
}