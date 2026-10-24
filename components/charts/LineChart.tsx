import { cn } from "../../lib/cn";

type LineChartProps = {
  points: { label: string; value: number }[];
  unit: string;
  ariaLabel: string;
  className?: string;
};

const ANCHO = 480;
const ALTO = 230;
const MARGEN_IZQUIERDO = 48;
const MARGEN_DERECHO = 16;
const MARGEN_SUPERIOR = 20;
const MARGEN_INFERIOR = 32;

function formatear(valor: number): string {
  return valor.toLocaleString("es-ES", { maximumFractionDigits: 1 });
}

// Gráfica de línea dibujada con SVG (sin librerías externas).
export function LineChart({ points, unit, ariaLabel, className }: LineChartProps) {
  const cantidad = points.length;
  if (cantidad === 0) return null;

  const anchoUtil = ANCHO - MARGEN_IZQUIERDO - MARGEN_DERECHO;
  const alturaUtil = ALTO - MARGEN_SUPERIOR - MARGEN_INFERIOR;

  const valores = points.map((p) => p.value);
  const minimo = Math.min(...valores);
  const maximo = Math.max(...valores);
  const margen = minimo === maximo ? 5 : (maximo - minimo) * 0.15;
  const bajo = Math.max(0, minimo - margen);
  const alto = maximo + margen;

  const posX = (i: number) =>
    MARGEN_IZQUIERDO + (cantidad === 1 ? anchoUtil / 2 : (i * anchoUtil) / (cantidad - 1));
  const posY = (valor: number) =>
    MARGEN_SUPERIOR + alturaUtil * (1 - (valor - bajo) / (alto - bajo));

  const linea = points
    .map((p, i) => `${i === 0 ? "M" : "L"}${posX(i)} ${posY(p.value)}`)
    .join(" ");
  const area = `${linea} L${posX(cantidad - 1)} ${MARGEN_SUPERIOR + alturaUtil} L${posX(0)} ${MARGEN_SUPERIOR + alturaUtil} Z`;

  const etiquetasX = new Set<number>([0, cantidad - 1]);
  if (cantidad >= 5) etiquetasX.add(Math.floor((cantidad - 1) / 2));

  const marcasY = [bajo, (bajo + alto) / 2, alto];

  return (
    <svg
      viewBox={`0 0 ${ANCHO} ${ALTO}`}
      role="img"
      aria-label={ariaLabel}
      className={cn("h-auto w-full", className)}
    >
      <defs>
        <linearGradient id="nx-area" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" style={{ stopColor: "var(--accent)", stopOpacity: 0.35 }} />
          <stop offset="100%" style={{ stopColor: "var(--accent)", stopOpacity: 0 }} />
        </linearGradient>
      </defs>

      {marcasY.map((valor, i) => {
        const y = posY(valor);
        return (
          <g key={i}>
            <line
              x1={MARGEN_IZQUIERDO}
              x2={ANCHO - MARGEN_DERECHO}
              y1={y}
              y2={y}
              className="stroke-border"
              strokeWidth={1}
              strokeDasharray={i === 0 ? undefined : "4 4"}
            />
            <text
              x={MARGEN_IZQUIERDO - 8}
              y={y + 4}
              textAnchor="end"
              className="fill-muted"
              fontSize={12}
            >
              {formatear(valor)}
            </text>
          </g>
        );
      })}

      {cantidad > 1 ? <path d={area} fill="url(#nx-area)" /> : null}
      {cantidad > 1 ? (
        <path
          d={linea}
          fill="none"
          className="stroke-accent"
          strokeWidth={3}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ) : null}

      {points.map((p, i) => (
        <g key={`${p.label}-${i}`}>
          <title>{`${p.label}: ${formatear(p.value)} ${unit}`}</title>
          <circle
            cx={posX(i)}
            cy={posY(p.value)}
            r={5}
            className="fill-background stroke-accent"
            strokeWidth={3}
          />
        </g>
      ))}

      {Array.from(etiquetasX).map((i) => (
        <text
          key={i}
          x={posX(i)}
          y={ALTO - 8}
          textAnchor="middle"
          className="fill-muted"
          fontSize={12}
        >
          {points[i].label}
        </text>
      ))}
    </svg>
  );
}