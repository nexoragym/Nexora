import { describe, expect, it } from "vitest";
import { TIMED_NOTE } from "./catalog";
import {
  AVISO_BARRA,
  DRAFT_PERSONAL_VACIO,
  leerBusquedaUsuario,
  mapearRutinaPersonal,
  rutinaPersonalAPayload,
  validarRutinaPersonal,
  type FilaRutinaPersonal,
} from "./custom";

const A = "11111111-1111-4111-8111-111111111111";
const B = "22222222-2222-4222-8222-222222222222";

function base(): Record<string, unknown> {
  return {
    name: "  Mi   rutina ",
    goal: "strength",
    weeks: 6,
    days: [
      {
        name: "Empuje",
        exercises: [
          { exerciseId: A, sets: 3, repsMin: 8, repsMax: 12, rest: 90 },
          { exerciseId: B, sets: "2", repsMin: "20", repsMax: "40", rest: "45" },
        ],
      },
    ],
  };
}

describe("validarRutinaPersonal", () => {
  it("acepta una rutina correcta y limpia el nombre", () => {
    const { valores, errores } = validarRutinaPersonal(base(), "crear");
    expect(errores).toEqual([]);
    expect(valores?.name).toBe("Mi rutina");
    expect(valores?.goal).toBe("strength");
    expect(valores?.weeks).toBe(6);
    expect(valores?.days[0].exercises[1].sets).toBe(2);
  });

  it("avisa si falta el nombre o el objetivo", () => {
    const { valores, errores } = validarRutinaPersonal(
      { ...base(), name: " ", goal: "" },
      "crear",
    );
    expect(valores).toBeUndefined();
    expect(errores.length).toBeGreaterThanOrEqual(2);
  });

  it("el borrador vacío no es válido", () => {
    expect(validarRutinaPersonal(DRAFT_PERSONAL_VACIO, "crear").valores).toBeUndefined();
  });

  it("al editar pide el identificador", () => {
    expect(validarRutinaPersonal(base(), "editar").valores).toBeUndefined();
    expect(validarRutinaPersonal({ ...base(), id: A }, "editar").valores?.id).toBe(A);
  });

  it("no acepta un día sin ejercicios ni semanas fuera de rango", () => {
    expect(
      validarRutinaPersonal({ ...base(), days: [{ name: "Vacío", exercises: [] }] }, "crear")
        .valores,
    ).toBeUndefined();
    expect(validarRutinaPersonal({ ...base(), weeks: 80 }, "crear").valores).toBeUndefined();
  });
});

describe("rutinaPersonalAPayload", () => {
  it("numera los días, marca los ejercicios por tiempo y añade las notas generales", () => {
    const { valores } = validarRutinaPersonal(base(), "crear");
    if (!valores) throw new Error("Debería ser válida");

    const info = new Map([
      [A, { slug: "flexiones", equipment: "bodyweight" }],
      [B, { slug: "plancha", equipment: "bodyweight" }],
    ]);
    const payload = rutinaPersonalAPayload(valores, info);

    expect(payload.id).toBeNull();
    expect(payload.days_per_week).toBe(1);
    expect(payload.program_weeks).toBe(6);
    expect(payload.days[0].day_number).toBe(1);
    expect(payload.days[0].exercises[0].notes).toBeNull();
    expect(payload.days[0].exercises[1].notes).toBe(TIMED_NOTE);
    expect(payload.notes.length).toBeGreaterThan(0);
    expect(payload.warnings).not.toContain(AVISO_BARRA);
  });

  it("avisa de los topes de seguridad si hay barra", () => {
    const { valores } = validarRutinaPersonal(base(), "crear");
    if (!valores) throw new Error("Debería ser válida");
    const info = new Map([
      [A, { slug: "press-banca-plano", equipment: "barbell" }],
      [B, { slug: "plancha", equipment: "bodyweight" }],
    ]);
    expect(rutinaPersonalAPayload(valores, info).warnings).toContain(AVISO_BARRA);
  });
});

describe("mapearRutinaPersonal", () => {
  const fila: FilaRutinaPersonal = {
    id: A,
    name: "Mi rutina",
    goal: "muscle",
    program_weeks: null,
    source: "custom",
    is_active: true,
    routine_days: [
      {
        id: "d2",
        day_number: 2,
        name: "Segundo",
        routine_day_exercises: [],
      },
      {
        id: "d1",
        day_number: 1,
        name: "Primero",
        routine_day_exercises: [
          {
            id: "e2",
            sort_order: 2,
            target_sets: 3,
            reps_min: 8,
            reps_max: 12,
            rest_seconds: 90,
            exercises: [{ id: B, slug: "plancha", name: "Plancha", is_active: true }],
          },
          {
            id: "e1",
            sort_order: 1,
            target_sets: 3,
            reps_min: 8,
            reps_max: 12,
            rest_seconds: 90,
            exercises: { id: A, slug: "flexiones", name: "Flexiones", is_active: true },
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

  it("ordena, cuenta los ejercicios que no se ven y rellena valores por defecto", () => {
    const { draft, missing } = mapearRutinaPersonal(fila);
    expect(draft.days.map((d) => d.name)).toEqual(["Primero", "Segundo"]);
    expect(draft.days[0].exercises.map((e) => e.slug)).toEqual(["flexiones", "plancha"]);
    expect(missing).toBe(1);
    expect(draft.weeks).toBe(8);
    expect(draft.goal).toBe("muscle");
  });

  it("un objetivo desconocido queda sin elegir", () => {
    expect(mapearRutinaPersonal({ ...fila, goal: "volar" }).draft.goal).toBe("");
  });
});

describe("leerBusquedaUsuario", () => {
  it("lee los valores válidos y descarta los demás", () => {
    expect(
      leerBusquedaUsuario({ texto: "  remo ", muscle: "lats", equipment: "barbell" }),
    ).toEqual({ texto: "remo", muscle: "lats", equipment: "barbell" });
    expect(
      leerBusquedaUsuario({ texto: 5, muscle: "alas", equipment: "cohete" }),
    ).toEqual({ texto: "", muscle: "", equipment: "" });
    expect(leerBusquedaUsuario(null)).toBeNull();
  });
});