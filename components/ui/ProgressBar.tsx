import { cn } from "../../lib/cn";

type ProgressBarProps = {
  value: number;
  max?: number;
  label: string;
  showValue?: boolean;
  className?: string;
};

export function ProgressBar({
  value,
  max = 100,
  label,
  showValue = true,
  className,
}: ProgressBarProps) {
  // Protege contra valores fuera de rango (negativos o mayores que el máximo).
  const maximo = max > 0 ? max : 100;
  const acotado = Math.min(Math.max(value, 0), maximo);
  const porcentaje = Math.round((acotado / maximo) * 100);

  return (
    <div className={cn("w-full", className)}>
      <div className="mb-2 flex items-center justify-between text-sm">
        <span className="text-muted">{label}</span>
        {showValue ? (
          <span className="tabular-nums text-foreground">{porcentaje}%</span>
        ) : null}
      </div>
      <div
        role="progressbar"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={porcentaje}
        className="h-2 w-full overflow-hidden rounded-full bg-surface-2"
      >
        <div
          className="h-full rounded-full bg-accent transition-[width] duration-700 ease-out"
          style={{ width: `${porcentaje}%` }}
        />
      </div>
    </div>
  );
}