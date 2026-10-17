import type { ReactNode } from "react";
import { cn } from "../../lib/cn";

type ProgressRingProps = {
  value: number;
  max?: number;
  size?: number;
  strokeWidth?: number;
  label: string;
  className?: string;
  children?: ReactNode;
};

export function ProgressRing({
  value,
  max = 100,
  size = 120,
  strokeWidth = 10,
  label,
  className,
  children,
}: ProgressRingProps) {
  // Protege contra valores fuera de rango (negativos o mayores que el máximo).
  const maximo = max > 0 ? max : 100;
  const acotado = Math.min(Math.max(value, 0), maximo);
  const fraccion = acotado / maximo;
  const porcentaje = Math.round(fraccion * 100);

  const radio = (size - strokeWidth) / 2;
  const circunferencia = 2 * Math.PI * radio;
  const desplazamiento = circunferencia * (1 - fraccion);

  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={porcentaje}
      className={cn("relative inline-flex items-center justify-center", className)}
      style={{ width: size, height: size }}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="-rotate-90"
        aria-hidden="true"
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radio}
          fill="none"
          strokeWidth={strokeWidth}
          className="stroke-surface-2"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radio}
          fill="none"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circunferencia}
          strokeDashoffset={desplazamiento}
          className="stroke-accent transition-[stroke-dashoffset] duration-700 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        {children ?? (
          <span className="text-2xl font-semibold tabular-nums">
            {porcentaje}%
          </span>
        )}
      </div>
    </div>
  );
}