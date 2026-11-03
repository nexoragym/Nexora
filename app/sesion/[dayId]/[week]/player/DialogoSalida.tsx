import { Button } from "../../../../../components/ui/Button";

type DialogoSalidaProps = {
  saliendo: boolean;
  onSeguir: () => void;
  onSalir: () => void;
};

export function DialogoSalida({ saliendo, onSeguir, onSalir }: DialogoSalidaProps) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Salir del entrenamiento"
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-4 sm:items-center"
    >
      <div className="nx-fade-up flex w-full max-w-md flex-col gap-4 rounded-3xl border border-border bg-surface p-6">
        <h2 className="text-xl font-semibold">¿Salir del entrenamiento?</h2>
        <p className="text-muted">
          Se guardan las series que ya has hecho, pero el día no quedará
          marcado como completado.
        </p>
        <div className="flex flex-col gap-3">
          <Button fullWidth onClick={onSeguir} disabled={saliendo}>
            Seguir entrenando
          </Button>
          <Button variant="secondary" fullWidth onClick={onSalir} disabled={saliendo}>
            {saliendo ? "Saliendo…" : "Salir"}
          </Button>
        </div>
      </div>
    </div>
  );
}