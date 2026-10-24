"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "../../lib/cn";
import { Logo } from "../brand/Logo";

const PROCESOS = [
  "Analizando tus respuestas",
  "Eligiendo los ejercicios para ti",
  "Calculando series, repeticiones y descansos",
  "Organizando tu semana de entrenamiento",
  "Preparando tu plan",
];

type PlanLoadingProps = {
  // Mientras sea false, la barra espera en el 92 %.
  listo: boolean;
  onDone?: () => void;
};

export function PlanLoading({ listo, onDone }: PlanLoadingProps) {
  const [progreso, setProgreso] = useState(0);
  const onDoneRef = useRef(onDone);

  useEffect(() => {
    onDoneRef.current = onDone;
  });

  useEffect(() => {
    const id = setInterval(() => {
      setProgreso((actual) => {
        const tope = listo ? 100 : 92;
        return actual < tope ? actual + 1 : actual;
      });
    }, 60);
    return () => clearInterval(id);
  }, [listo]);

  useEffect(() => {
    if (progreso < 100) return;
    const temporizador = setTimeout(() => onDoneRef.current?.(), 600);
    return () => clearTimeout(temporizador);
  }, [progreso]);

  const paso = Math.min(
    PROCESOS.length - 1,
    Math.floor(progreso / (100 / PROCESOS.length)),
  );

  return (
    <div className="mx-auto flex w-full max-w-lg flex-col items-center gap-8 text-center">
      <div className="animate-pulse">
        <Logo size="lg" />
      </div>
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          Estamos preparando tu plan
        </h1>
        <p className="text-muted">Esto solo tarda unos segundos.</p>
      </div>

      <div className="w-full">
        <div
          role="progressbar"
          aria-label="Preparando tu plan"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={progreso}
          className="h-3 w-full overflow-hidden rounded-full bg-surface-2"
        >
          <div
            className="h-full rounded-full bg-linear-to-r from-accent to-accent-hover transition-[width] duration-100 ease-linear"
            style={{ width: `${progreso}%` }}
          />
        </div>
        <p className="mt-2 text-sm tabular-nums text-muted">{progreso}%</p>
      </div>

      <ul className="flex w-full flex-col gap-3 text-left">
        {PROCESOS.map((texto, indice) => {
          const hecho = indice < paso || progreso >= 100;
          const activo = indice === paso && !hecho;
          return (
            <li
              key={texto}
              className={cn(
                "flex items-center gap-3 transition-opacity",
                hecho || activo ? "opacity-100" : "opacity-40",
              )}
            >
              <span
                aria-hidden="true"
                className={cn(
                  "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2",
                  hecho
                    ? "border-transparent bg-accent text-accent-foreground"
                    : "border-border",
                  activo && "animate-pulse border-accent",
                )}
              >
                {hecho ? (
                  <svg
                    viewBox="0 0 24 24"
                    width="14"
                    height="14"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M5 12.5l4.5 4.5L19 7.5" />
                  </svg>
                ) : null}
              </span>
              <span>{texto}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}