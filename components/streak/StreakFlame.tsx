import { cn } from "../../lib/cn";
import { PALETAS, visualDeEtapa, type EtapaRacha } from "../../lib/streak";

type StreakFlameProps = {
  etapa: EtapaRacha;
  size?: number;
  animar?: boolean;
  className?: string;
};

// Las tres capas de la llama (exterior, interior y núcleo) y la posición de las chispas.
const LLAMA_EXTERIOR =
  "M50 6 C58 26 86 40 86 74 C86 98 70 114 50 114 C30 114 14 98 14 74 C14 54 26 44 32 30 C36 40 40 44 44 44 C42 30 44 16 50 6 Z";
const LLAMA_INTERIOR =
  "M50 46 C56 60 70 68 70 88 C70 102 61 110 50 110 C39 110 30 102 30 88 C30 76 38 70 42 60 C46 66 48 66 50 66 C48 58 48 52 50 46 Z";
const LLAMA_NUCLEO =
  "M50 78 C54 86 60 90 60 100 C60 106 56 110 50 110 C44 110 40 106 40 100 C40 94 46 90 50 78 Z";

const CHISPAS: ReadonlyArray<readonly [number, number]> = [
  [36, 44],
  [62, 34],
  [50, 18],
  [72, 56],
  [28, 60],
  [56, 10],
  [44, 30],
  [66, 46],
];

// Llama de racha. Cambia de color, tamaño, brillo y chispas según la etapa.
export function StreakFlame({
  etapa,
  size = 120,
  animar = true,
  className,
}: StreakFlameProps) {
  const visual = visualDeEtapa(etapa);
  const paleta = PALETAS[etapa.tier];
  const id = `nx-flame-${etapa.tier}`;
  const apagada = etapa.tier === "none";
  const anclaje = `translate(50 114) scale(${visual.escala}) translate(-50 -114)`;
  const alto = size * 1.2;

  return (
    <div
      role="img"
      aria-label={`Racha: ${etapa.nombre}`}
      className={cn("relative inline-block shrink-0", className)}
      style={{ width: size, height: alto }}
    >
      {apagada ? null : (
        <div
          aria-hidden="true"
          className={cn(
            "absolute left-1/2 rounded-full blur-2xl",
            animar && "nx-flame-glow",
          )}
          style={{
            width: size * 0.95,
            height: size * 0.95,
            bottom: size * 0.02,
            marginLeft: -(size * 0.95) / 2,
            background: paleta.brillo,
            opacity: visual.brillo,
          }}
        />
      )}

      <svg
        viewBox="0 0 100 120"
        width={size}
        height={alto}
        className="relative overflow-visible"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id={`${id}-o`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={paleta.exterior[0]} />
            <stop offset="1" stopColor={paleta.exterior[1]} />
          </linearGradient>
          <linearGradient id={`${id}-i`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={paleta.interior[0]} />
            <stop offset="1" stopColor={paleta.interior[1]} />
          </linearGradient>
          <linearGradient id={`${id}-c`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={paleta.nucleo[0]} />
            <stop offset="1" stopColor={paleta.nucleo[1]} />
          </linearGradient>
        </defs>

        <g transform={anclaje}>
          {apagada ? (
            <path
              d={LLAMA_EXTERIOR}
              fill={paleta.exterior[1]}
              fillOpacity={0.25}
              stroke={paleta.contorno}
              strokeWidth={4}
              strokeLinejoin="round"
              strokeDasharray="6 5"
            />
          ) : (
            <>
              <g className={animar ? "nx-flame-outer" : undefined}>
                <path
                  d={LLAMA_EXTERIOR}
                  fill={`url(#${id}-o)`}
                  opacity={visual.capas === 1 ? 0.85 : 1}
                />
              </g>
              {visual.capas >= 2 ? (
                <g className={animar ? "nx-flame-inner" : undefined}>
                  <path d={LLAMA_INTERIOR} fill={`url(#${id}-i)`} />
                </g>
              ) : null}
              {visual.capas >= 3 ? (
                <g className={animar ? "nx-flame-core" : undefined}>
                  <path d={LLAMA_NUCLEO} fill={`url(#${id}-c)`} />
                </g>
              ) : null}
            </>
          )}
        </g>

        {apagada
          ? null
          : CHISPAS.slice(0, visual.chispas).map(([x, y], indice) => (
              <circle
                key={indice}
                cx={x}
                cy={y}
                r={1.8 + (indice % 3) * 0.6}
                fill={paleta.chispa}
                className={animar ? "nx-spark" : undefined}
                style={{ animationDelay: `${indice * 0.4}s` }}
              />
            ))}
      </svg>
    </div>
  );
}