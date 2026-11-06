import { describe, expect, it } from "vitest";
import type { CatalogRoutine } from "../routines/catalog";
import {
  camposCambiados,
  moverElemento,
  revisarEjerciciosRutina,
  rutinaADraft,
  validarRutina,
} from "./routine-form";

const A = "11111111-1111-4111-8111-111111111111";
const B = "22222222-2222-4222-8222-222222222222";

function base(): Record<string, unknown> {
  return {
    name: "Mi rutina nueva",
    description: "Una descripción",
    goal: "muscle",
    level: "beginner",
    weeks: 8,
    equipment: ["dumbbells", "dumbbells", "cohete"],
    notes: "Nota 1\n\n  Nota 2  ",
    warnings: "",
    days: [
      {
        name: "Cuerpo completo",
        exercises: [
          { exerciseId: A, sets: 3, repsMin: 8, repsMax: 12, rest: 90 },
          { exerciseId: B, sets: "2", repsMin: "20", repsMax: "40", rest: "45" },
        ],
      },
    ],
  };
}

describe("validarRutina", () => {
  it("acepta una rutina correcta y genera el identificador", () => {
    const { valores, errores } = validarRutina(base(), "crear");
    expect(errores).toEqual([]);
    expect(valores?.slug).toBe("mi-rutina-nueva");
    expect(valores?.equipment).toEqual(["dumbbells"]);
    expect(valores?.notes).toEqual(["Nota 1", "Nota 2"]);
    expect(valores?.focus).toBe("balanced");
    expect(valores?.days[0].exercises[1].sets).toBe(2);
  });

  it("al editar pide el identificador de la rutina", () => {
    expect(validarRutina(base(), "editar").valores).toBeUndefined();
    const { valores } = validarRutina({ ...base(), id: A }, "editar");
    expect(valores?.id).toBe(A);
  });

  it("avisa si falta el nombre o el material", () => {
    const datos = { ...base(), name: " ", equipment: [] };
    const { valores, errores } = validarRutina(datos, "crear");
    expect(valores).toBeUndefined();
    expect(errores.length).toBeGreaterThanOrEqual(2);
  });

  it("no acepta un día sin ejercicios", () => {
    const datos = { ...base(), days: [{ name: "Vacío", exercises: [] }] };
    expect(validarRutina(datos, "crear").valores).toBeUndefined();
  });

  it("no acepta repeticiones máximas menores que las mínimas", () => {
    const datos = base();
    (datos.days as { exercises: Record<string, unknown>[] }[])[0].exercises[0].repsMax = 5;
    expect(validarRutina(datos, "crear").valores).toBeUndefined();
  });

  it("no acepta un ejercicio repetido en un día", () => {
    const datos = base();
    (datos.days as { exercises: Record<string, unknown>[] }[])[0].exercises[1].exerciseId = A;
    expect(validarRutina(datos, "crear").valores).toBeUndefined();
  });

  it("no acepta más de 7 días", () => {
    const dia = (base().days as unknown[])[0];
    const datos = { ...base(), days: Array.from({ length: 8 }, () => dia) };
    expect(validarRutina(datos, "crear").valores).toBeUndefined();
  });
});

describe("revisarEjerciciosRutina", () => {
  it("avisa de ejercicios desactivados, inexistentes y por tiempo mal puestos", () => {
    const { valores } = validarRutina(base(), "crear");
    if (!valores) throw new Error("La rutina de prueba debería ser válida");

    const bien = revisarEjerciciosRutina(valores, [
      { id: A, slug: "flexiones", name: "Flexiones", is_active: true },
      { id: B, slug: "plancha", name: "Plancha", is_active: true },
    ]);
    expect(bien).toEqual([]);

    const mal = revisarEjerciciosRutina(valores, [
      { id: A, slug: "flexiones", name: "Flexiones", is_active: false },
    ]);
    expect(mal.length).toBe(2);

    valores.days[0].exercises[1].repsMin = 5;
    const segundos = revisarEjerciciosRutina(valores, [
      { id: A, slug: "flexiones", name: "Flexiones", is_active: true },
      { id: B, slug: "plancha", name: "Plancha", is_active: true },
    ]);
    expect(segundos.length).toBe(1);
  });
});

describe("rutinaADraft y camposCambiados", () => {
  const rutina: CatalogRoutine = {
    id: A,
    slug: "mi-rutina",
    name: "Mi rutina",
    description: "Descripción",
    goal: "strength",
    focus: "balanced",
    level: "intermediate",
    weeks: 4,
    equipment: ["barbell", "dumbbells"],
    notes: ["Nota"],
    warnings: [],
    coverPath: null,
    published: false,
    sortOrder: 1,
    missing: 0,
    days: [
      {
        id: "d1",
        dayNumber: 1,
        name: "Día uno",
        exercises: [
          {
            id: "e1",
            exerciseId: B,
            slug: "flexiones",
            name: "Flexiones",
            active: true,
            sortOrder: 1,
            sets: 3,
            repsMin: 8,
            repsMax: 12,
            rest: 90,
          },
        ],
      },
    ],
  };

  it("la rutina del catálogo, pasada a borrador, sigue siendo válida", () => {
    const { valores } = validarRutina(rutinaADraft(rutina), "editar");
    expect(valores?.name).toBe("Mi rutina");
    expect(valores?.days[0].exercises[0].exerciseId).toBe(B);
  });

  it("detecta los campos que cambian", () => {
    const previa = validarRutina(rutinaADraft(rutina), "editar").valores ?? null;
    const draft = rutinaADraft(rutina);
    draft.name = "Otro nombre";
    draft.days[0].exercises[0].sets = 4;
    const nueva = validarRutina(draft, "editar").valores;
    if (!nueva) throw new Error("Debería ser válida");
    expect(camposCambiados(previa, nueva)).toEqual(["name", "days"]);
  });
});

describe("moverElemento", () => {
  it("cambia de sitio sin salirse de la lista", () => {
    expect(moverElemento([1, 2, 3], 0, 1)).toEqual([2, 1, 3]);
    expect(moverElemento([1, 2, 3], 0, -1)).toEqual([1, 2, 3]);
    expect(moverElemento([1, 2, 3], 2, 1)).toEqual([1, 2, 3]);
  });
});