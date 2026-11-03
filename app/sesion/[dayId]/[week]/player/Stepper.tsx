import { formatearNumero, redondear } from "./formato";

type StepperProps = {
  label: string;
  value: number;
  step: number;
  min: number;
  max: number;
  onChange: (valor: number) => void;
};

export function Stepper({ label, value, step, min, max, onChange }: StepperProps) {
  const cambiar = (delta: number) =>
    onChange(Math.min(max, Math.max(min, redondear(value + delta))));

  const botones =
    "flex size-12 shrink-0 items-center justify-center rounded-2xl border border-border bg-surface-2 text-2xl transition duration-150 hover:bg-border active:scale-95";

  return (
    <div className="flex flex-col gap-2 rounded-3xl border border-border bg-surface p-4">
      <span className="text-sm text-muted">{label}</span>
      <div className="flex items-center justify-between gap-2">
        <button
          type="button"
          aria-label={`Bajar ${label.toLowerCase()}`}
          onClick={() => cambiar(-step)}
          className={botones}
        >
          −
        </button>
        <span className="text-3xl font-semibold tabular-nums">
          {formatearNumero(value)}
        </span>
        <button
          type="button"
          aria-label={`Subir ${label.toLowerCase()}`}
          onClick={() => cambiar(step)}
          className={botones}
        >
          +
        </button>
      </div>
    </div>
  );
}