"use client";

import { useState } from "react";
import { LineChart } from "../../../components/charts/LineChart";
import { Card } from "../../../components/ui/Card";
import {
  etiquetaFecha,
  formatearKg,
  type HistorialEjercicio,
} from "../../../lib/progress";

const estiloSelect =
  "h-11 w-full rounded-xl border border-border bg-surface-2 px-3 text-base text-foreground sm:max-w-sm";

export function ExerciseProgress({
  history,
}: {
  history: HistorialEjercicio[];
}) {
  // Al empezar se muestra el ejercicio con más registros.
  const [seleccionado, setSeleccionado] = useState(
    () =>
      [...history].sort((a, b) => b.points.length - a.points.length)[0]
        ?.exerciseId ?? "",
  );

  if (history.length === 0) {
    return (
      <Card>
        <p className="text-muted">
          Cuando registres peso en tus ejercicios, aquí verás cómo evoluciona
          cada uno.
        </p>
      </Card>
    );
  }

  const actual =
    history.find((ejercicio) => ejercicio.exerciseId === seleccionado) ??
    history[0];
  const pesos = actual.points.map((p) => p.weightKg);
  const primero = pesos[0];
  const ultimo = pesos[pesos.length - 1];
  const mejor = Math.max(...pesos);
  const diferencia = ultimo - primero;

  return (
    <Card className="flex flex-col gap-5">
      <label className="flex flex-col gap-1">
        <span className="text-sm text-muted">Ejercicio</span>
        <select
          className={estiloSelect}
          value={actual.exerciseId}
          onChange={(evento) => setSeleccionado(evento.target.value)}
        >
          {history.map((ejercicio) => (
            <option key={ejercicio.exerciseId} value={ejercicio.exerciseId}>
              {ejercicio.name}
            </option>
          ))}
        </select>
      </label>

      <p className="text-sm text-muted">
        {pesos.length >= 2
          ? `De ${formatearKg(primero)} a ${formatearKg(ultimo)} (${
              diferencia > 0 ? "+" : ""
            }${formatearKg(diferencia)}). Tu mejor peso: ${formatearKg(mejor)}.`
          : `Solo tienes un registro (${formatearKg(ultimo)}). Entrena este ejercicio otro día y verás la línea.`}
      </p>

      <LineChart
        points={actual.points.map((p) => ({
          label: etiquetaFecha(p.day),
          value: p.weightKg,
        }))}
        unit="kg"
        ariaLabel={`Evolución del peso máximo en ${actual.name}`}
      />
    </Card>
  );
}