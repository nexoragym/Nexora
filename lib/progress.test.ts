import { describe, expect, it } from "vitest";
import { etiquetaFecha, leerProgreso } from "./progress";

describe("etiquetaFecha", () => {
  it("escribe el día y el mes abreviado", () => {
    expect(etiquetaFecha("2026-10-19")).toBe("19 oct");
    expect(etiquetaFecha("2027-01-05")).toBe("5 ene");
  });

  it("devuelve el texto tal cual si no es una fecha", () => {
    expect(etiquetaFecha("hola")).toBe("hola");
  });
});

describe("leerProgreso", () => {
  it("devuelve todo vacío si llega algo raro", () => {
    const vacio = { weekly: [], records: [], history: [] };
    expect(leerProgreso(null)).toEqual(vacio);
    expect(leerProgreso("texto")).toEqual(vacio);
    expect(leerProgreso([])).toEqual(vacio);
  });

  it("lee las semanas y acepta números escritos como texto", () => {
    const datos = leerProgreso({
      weekly: [
        { week_start: "2026-10-19", sessions: 3, volume_kg: "1250.5" },
        { week_start: "2026-10-26", sessions: "x", volume_kg: 10 },
      ],
    });
    expect(datos.weekly).toEqual([
      { weekStart: "2026-10-19", sessions: 3, volumeKg: 1250.5 },
    ]);
  });

  it("agrupa el historial por ejercicio y lo ordena por fecha", () => {
    const datos = leerProgreso({
      history: [
        { exercise_id: "a", exercise_name: "Press", day: "2026-10-20", weight_kg: 50 },
        { exercise_id: "b", exercise_name: "Remo", day: "2026-10-18", weight_kg: 30 },
        { exercise_id: "a", exercise_name: "Press", day: "2026-10-10", weight_kg: 45 },
      ],
    });
    expect(datos.history).toHaveLength(2);
    const press = datos.history.find((h) => h.exerciseId === "a");
    expect(press?.points.map((p) => p.weightKg)).toEqual([45, 50]);
  });
});