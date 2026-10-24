import { cn } from "../../lib/cn";

type BarChartProps = {
  data: { label: string; value: number }[];
  unit: string;
  ariaLabel: string;
  className?: string;
};

const ANCHO = 480;
const ALTO = 230;
const MARGEN_SUPERIOR = 28;
const MARGEN_INFERIOR = 30;

function formatear(valor: number): string {
  return valor.toLocaleString("es-ES", { maximumFractionDigits: 0 });
}

// Gráfica de barras dibujada con SVG (sin librerías externas).
export function BarChart({ data, unit, ariaLabel, className }: BarChartProps) {
  const alturaUtil = ALTO - MARGEN_SUPERIOR - MARGEN_INFERIOR;
  const cantidad = Math.max(data.length, 1);
  const hueco = ANCHO / cantidad;
  const anchoBarra = Math.min(hueco * 0.6, 56);
  const maximo = Math.max(1, ...data.map((d) => d.value));

  return (
    <svg
      viewBox={`0 0 ${ANCHO} ${ALTO}`}
      role="img"
      aria-label={ariaLabel}
      className={cn("h-auto w-full", className)}
    >
      <defs>
        <linearGradient id="nx-barra" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" style={{ stopColor: "var(--accent)" }} />
          <stop
            offset="100%"
            style={{ stopColor: "var(--accent-hover)", stopOpacity: 0.55 }}
          />
        </linearGradient>
      </defs>

      {[0, 0.5, 1].map((fraccion) => {
        const y = MARGEN_SUPERIOR + alturaUtil * (1 - fraccion);
        return (
          <line
            key={fraccion}
            x1={0}
            x2={ANCHO}
            y1={y}
            y2={y}
            className="stroke-border"
            strokeWidth={1}
            strokeDasharray={fraccion === 0 ? undefined : "4 4"}
          />
        );
      })}

      {data.map((dato, indice) => {
        const altura = (dato.value / maximo) * alturaUtil;
        const x = indice * hueco + (hueco - anchoBarra) / 2;
        const y = MARGEN_SUPERIOR + alturaUtil - altura;
        const conValor = dato.value > 0;

        return (
          <g key={`${dato.label}-${indice}`}>
            <title>{`${dato.label}: ${formatear(dato.value)} ${unit}`}</title>
            {conValor ? (
              <rect
                x={x}
                y={y}
                width={anchoBarra}
                height={altura}
                rx={6}
                fill="url(#nx-barra)"
              />
            ) : (
              <rect
                x={x}
                y={MARGEN_SUPERIOR + alturaUtil - 3}
                width={anchoBarra}
                height={3}
                rx={1.5}
                className="fill-surface-2"
              />
            )}
            {conValor && cantidad <= 12 ? (
              <text
                x={x + anchoBarra / 2}
                y={y - 6}
                textAnchor="middle"
                className="fill-foreground"
                fontSize={13}
              >
                {formatear(dato.value)}
              </text>
            ) : null}
            <text
              x={x + anchoBarra / 2}
              y={ALTO - 8}
              textAnchor="middle"
              className="fill-muted"
              fontSize={13}
            >
              {dato.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}