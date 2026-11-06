import { describe, expect, it } from "vitest";
import {
  esPorTiempo,
  mapearRutinaCatalogo,
  type FilaRutinaCatalogo,
} from "./catalog";

function fila(): FilaRutinaCatalogo {
  return {
    id: "r1",
    slug: "prueba",
    name: "Prueba",
    description: "Descripción",
    goal: "muscle",
    focus: "balanced",
    level: "beginner",
    weeks: 8,
    equipment: ["bodyweight"],
    notes: null,
    warnings: null,
    cover_path: null,
    is_published: true,
    sort_order: 10,
    catalog_routine_days: [
      {
        id: "d2",
        day_number: 2,
        name: "Segundo",
        catalog_routine_day_exercises: [],
      },
      {
        id: "d1",
        day_number: 1,
        name: "Primero",
        catalog_routine_day_exercises: [
          {
            id: "e2",
            sort_order: 2,
            target_sets: 3,
            reps_min: 8,
            reps_max: 12,
            rest_seconds: 90,
            exercises: [{ id: "x2", slug: "plancha", name: "Plancha", is_active: true }],
          },
          {
            id: "e1",
            sort_order: 1,
            target_sets: 3,
            reps_min: 8,
            reps_max: 12,
            rest_seconds: 90,
            exercises: { id: "x1", slug: "flexiones", name: "Flexiones", is_active: true },
          },
          {
            id: "e3",
            sort_order: 3,
            target_sets: 2,
            reps_min: 10,
            reps_max: 12,
            rest_seconds: 60,
            exercises: null,
          },
        ],
      },
    ],
  };
}

describe("mapearRutinaCatalogo", () => {
  it("ordena los días y los ejercicios", () => {
    const rutina = mapearRutinaCatalogo(fila());
    expect(rutina.days.map((d) => d.dayNumber)).toEqual([1, 2]);
    expect(rutina.days[0].exercises.map((e) => e.slug)).toEqual([
      "flexiones",
      "plancha",
    ]);
  });

  it("cuenta los ejercicios que no se pueden ver", () => {
    expect(mapearRutinaCatalogo(fila()).missing).toBe(1);
  });

  it("rellena notas y avisos vacíos", () => {
    const rutina = mapearRutinaCatalogo(fila());
    expect(rutina.notes).toEqual([]);
    expect(rutina.warnings).toEqual([]);
    expect(rutina.published).toBe(true);
  });
});

describe("esPorTiempo", () => {
  it("reconoce la plancha y no las flexiones", () => {
    expect(esPorTiempo("plancha")).toBe(true);
    expect(esPorTiempo("flexiones")).toBe(false);
  });
});