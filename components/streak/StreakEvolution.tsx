"use client";

import { useEffect, type CSSProperties } from "react";
import { PALETAS, cambioDeTier, type EtapaRacha } from "../../lib/streak";
import { Button } from "../ui/Button";
import { StreakFlame } from "./StreakFlame";

type StreakEvolutionProps = {
  desde: EtapaRacha;
  hasta: EtapaRacha;
  dias: number;
  onClose: () => void;
};

// Chispas que salen disparadas en círculo en el momento del cambio.
const PARTICULAS = Array.from({ length: 14 }, (_, indice) => {
  const angulo = (indice / 14) * Math.PI * 2;
  const distancia = indice % 2 === 0 ? 150 : 105;
  return {
    dx: Math.round(Math.cos(angulo) * distancia),
    dy: Math.round(Math.sin(angulo) * distancia),
    tamano: 6 + (indice % 3) * 2,
  };
});

// Pantalla completa: la llama vieja gira y se transforma en la nueva.
export function StreakEvolution({
  desde,
  hasta,
  dias,
  onClose,
}: StreakEvolutionProps) {
  const paleta = PALETAS[hasta.tier];
  const grande = cambioDeTier(desde, hasta);

  useEffect(() => {
    const temporizador = window.setTimeout(() => {
      try {
        navigator.vibrate?.([90, 50, 140]);
      } catch {
        // Sin vibración disponible: no pasa nada.
      }
    }, 1100);

    function alPulsar(evento: KeyboardEvent) {
      if (evento.key === "Escape") onClose();
    }
    window.addEventListener("keydown", alPulsar);

    return () => {
      window.clearTimeout(temporizador);
      window.removeEventListener("keydown", alPulsar);
    };
  }, [onClose]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Tu racha ha evolucionado"
      className="fixed inset-0 z-[60] flex flex-col items-center justify-center gap-8 bg-background/95 px-6 backdrop-blur"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: `radial-gradient(circle at 50% 42%, ${paleta.brillo}38, transparent 62%)`,
        }}
      />

      <div className="relative flex size-72 items-center justify-center">
        {/* Anillos que se expanden */}
        {[1.1, 1.35, 1.6].map((retraso) => (
          <div
            key={retraso}
            aria-hidden="true"
            className="nx-evo-ring absolute size-40 rounded-full border-2"
            style={{
              borderColor: paleta.brillo,
              animationDelay: `${retraso}s`,
            }}
          />
        ))}

        {/* Llama vieja: gira y se encoge */}
        <div className="nx-evo-out absolute inset-0 flex items-center justify-center">
          <StreakFlame etapa={desde} size={150} />
        </div>

        {/* Destello */}
        <div
          aria-hidden="true"
          className="nx-evo-flash absolute size-40 rounded-full"
          style={{
            background: "radial-gradient(circle, #ffffff, transparent 70%)",
            animationDelay: "1.05s",
          }}
        />

        {/* Chispas disparadas */}
        {PARTICULAS.map((particula, indice) => {
          const estilo = {
            width: particula.tamano,
            height: particula.tamano,
            marginLeft: -particula.tamano / 2,
            marginTop: -particula.tamano / 2,
            background: paleta.chispa,
            animationDelay: "1.15s",
            "--dx": `${particula.dx}px`,
            "--dy": `${particula.dy}px`,
          } as CSSProperties;
          return (
            <span
              key={indice}
              aria-hidden="true"
              className="nx-evo-burst absolute left-1/2 top-1/2 rounded-full"
              style={estilo}
            />
          );
        })}

        {/* Llama nueva: entra girando y creciendo */}
        <div
          className="nx-evo-in absolute inset-0 flex items-center justify-center"
          style={{ animationDelay: "1.1s" }}
        >
          <StreakFlame etapa={hasta} size={170} />
        </div>
      </div>

      <div
        className="nx-fade-up relative flex flex-col items-center gap-2 text-center"
        style={{ animationDelay: "1.9s" }}
      >
        <h2 className="text-3xl font-bold tracking-tight">
          {grande ? "¡Tu racha ha evolucionado!" : "¡Tu llama crece!"}
        </h2>
        <p
          className="text-2xl font-semibold"
          style={{ color: paleta.chispa }}
        >
          {hasta.nombre}
        </p>
        <p className="text-muted">
          {dias} {dias === 1 ? "día" : "días"} de racha
        </p>
      </div>

      <div
        className="nx-fade-up relative"
        style={{ animationDelay: "2.3s" }}
      >
        <Button size="lg" onClick={onClose} autoFocus>
          Continuar
        </Button>
      </div>
    </div>
  );
}