import { describe, expect, it } from "vitest";
import type { Difficulty, Equipment } from "../exercises";
import type { Limitation, QuestionnaireValues } from "../questionnaire";
import {
  estimateDayMinutes,
  generateRoutine,
  type GeneratedRoutine,
} from "./generator";
import {
  DAY_KIND_LABELS,
  DIFFICULTY_RANK,
  LIMITATION_EXCLUSIONS,
  type DayKind,
} from "./rules";
import { SPLIT_VARIANTS } from "./splits";
import { TEST_LIBRARY } from "./test-library";

const NIVEL = { beginner: 1, intermediate: 2, advanced: 3 } as const;
const porId = new Map(TEST_LIBRARY.map((e) => [e.id, e] as const));

const base: QuestionnaireValues = {
  experience: "beginner",
  goal: "general_fitness",
  days: 3,
  minutes: 60,
  equipment: ["dumbbells", "machines", "barbell", "bodyweight"],
  limitations: [],
};

function generar(
  cambios: Partial<QuestionnaireValues>,
  biblioteca = TEST_LIBRARY,
): GeneratedRoutine {
  return generateRoutine({ ...base, ...cambios }, biblioteca);
}

function todosLosEjercicios(rutina: GeneratedRoutine) {
  return rutina.days.flatMap((dia) => dia.exercises);
}

// Nombres que da el generador a los días de una estructura (con A, B, C si se repiten).
function nombresDeEstructura(tipos: readonly DayKind[]): string[] {
  const totales = new Map<DayKind, number>();
  for (const tipo of tipos) {
    totales.set(tipo, (totales.get(tipo) ?? 0) + 1);
  }
  const vistos = new Map<DayKind, number>();
  return tipos.map((tipo) => {
    const ordinal = vistos.get(tipo) ?? 0;
    vistos.set(tipo, ordinal + 1);
    const etiqueta = DAY_KIND_LABELS[tipo];
    return (totales.get(tipo) ?? 1) > 1
      ? `${etiqueta} ${String.fromCharCode(65 + ordinal)}`
      : etiqueta;
  });
}

// Todas las estructuras de semana que puede recibir una persona de ese nivel.
function estructurasValidas(sesiones: number, nivel: Difficulty): string[][] {
  return (SPLIT_VARIANTS[sesiones] ?? [])
    .filter((variante) => DIFFICULTY_RANK[variante.minLevel] <= DIFFICULTY_RANK[nivel])
    .map((variante) => nombresDeEstructura(variante.kinds));
}

// Reglas que debe cumplir CUALQUIER rutina generada.
function comprobarRutina(
  rutina: GeneratedRoutine,
  prefs: QuestionnaireValues,
  etiqueta: string,
) {
  expect(rutina.name.length, etiqueta).toBeGreaterThanOrEqual(1);
  expect(rutina.name.length, etiqueta).toBeLessThanOrEqual(80);
  expect(rutina.days.length, etiqueta).toBeGreaterThanOrEqual(1);
  expect(rutina.days.length, etiqueta).toBeLessThanOrEqual(prefs.days);

  const permitido = new Set<Equipment>([...prefs.equipment, "bodyweight"]);

  rutina.days.forEach((dia, posicionDia) => {
    expect(dia.dayNumber, etiqueta).toBe(posicionDia + 1);
    expect(dia.name.length, etiqueta).toBeGreaterThanOrEqual(1);
    expect(dia.name.length, etiqueta).toBeLessThanOrEqual(80);

    const vistos = new Set<string>();
    dia.exercises.forEach((ej, indice) => {
      const original = porId.get(ej.exerciseId);
      expect(original, `${etiqueta}: ejercicio desconocido`).toBeDefined();
      if (!original) return;

      expect(
        permitido.has(original.equipment),
        `${etiqueta}: material no permitido en ${ej.exerciseSlug}`,
      ).toBe(true);
      expect(
        NIVEL[original.difficulty] <= NIVEL[prefs.experience],
        `${etiqueta}: nivel demasiado alto en ${ej.exerciseSlug}`,
      ).toBe(true);
      expect(
        vistos.has(ej.exerciseId),
        `${etiqueta}: ejercicio repetido en un día (${ej.exerciseSlug})`,
      ).toBe(false);
      vistos.add(ej.exerciseId);

      for (const limitacion of prefs.limitations) {
        const regla = LIMITATION_EXCLUSIONS[limitacion];
        expect(
          regla.slugs.includes(ej.exerciseSlug),
          `${etiqueta}: ${ej.exerciseSlug} debería evitarse por ${limitacion}`,
        ).toBe(false);
        expect(
          regla.patterns.includes(original.movement_pattern),
          `${etiqueta}: patrón evitado por ${limitacion}`,
        ).toBe(false);
      }

      // Límites de la base de datos
      expect(ej.sortOrder, etiqueta).toBe(indice + 1);
      expect(ej.sortOrder, etiqueta).toBeLessThanOrEqual(30);
      expect(ej.targetSets, etiqueta).toBeGreaterThanOrEqual(1);
      expect(ej.targetSets, etiqueta).toBeLessThanOrEqual(10);
      expect(ej.repsMin, etiqueta).toBeGreaterThanOrEqual(1);
      expect(ej.repsMax, etiqueta).toBeLessThanOrEqual(100);
      expect(ej.repsMax, etiqueta).toBeGreaterThanOrEqual(ej.repsMin);
      expect(ej.restSeconds, etiqueta).toBeGreaterThanOrEqual(0);
      expect(ej.restSeconds, etiqueta).toBeLessThanOrEqual(600);
      if (ej.notes !== null) {
        expect(ej.notes.length, etiqueta).toBeLessThanOrEqual(200);
      }
    });

    // Nunca se pasa del tiempo disponible
    expect(
      estimateDayMinutes(dia.exercises),
      `${etiqueta}: la sesión ${dia.name} no cabe en ${prefs.minutes} minutos`,
    ).toBeLessThanOrEqual(prefs.minutes);
  });
}

describe("distribución de las sesiones", () => {
  // La estructura de la semana puede variar según las respuestas, pero siempre
  // debe ser una de las permitidas para ese número de días y ese nivel.
  it("3 días (principiante): una de las estructuras válidas, sin empuje-tirón-piernas", () => {
    const nombres = generar({ days: 3 }).days.map((d) => d.name);
    expect(estructurasValidas(3, "beginner")).toContainEqual(nombres);
    expect(nombres).not.toContain("Empuje");
  });

  it("1 día: una sola sesión de cuerpo completo", () => {
    const rutina = generar({ days: 1 });
    expect(rutina.days.map((d) => d.name)).toEqual(["Cuerpo completo"]);
  });

  it("4 días (intermedio): una de las estructuras válidas", () => {
    const rutina = generar({ experience: "intermediate", days: 4 });
    expect(estructurasValidas(4, "intermediate")).toContainEqual(
      rutina.days.map((d) => d.name),
    );
  });

  it("4 días (principiante): tren superior e inferior alternados", () => {
    const rutina = generar({ experience: "beginner", days: 4 });
    expect(rutina.days.map((d) => d.name)).toEqual([
      "Tren superior A",
      "Tren inferior A",
      "Tren superior B",
      "Tren inferior B",
    ]);
  });

  it("5 días (intermedio): una de las estructuras válidas", () => {
    const rutina = generar({ experience: "intermediate", days: 5 });
    expect(estructurasValidas(5, "intermediate")).toContainEqual(
      rutina.days.map((d) => d.name),
    );
  });

  it("7 días (avanzado): se limita a 6 sesiones, usa una estructura válida y avisa", () => {
    const rutina = generar({ experience: "advanced", days: 7 });
    expect(rutina.days).toHaveLength(6);
    expect(estructurasValidas(6, "advanced")).toContainEqual(
      rutina.days.map((d) => d.name),
    );
    expect(rutina.warnings.some((w) => w.includes("recomendamos 6 sesiones"))).toBe(true);
  });

  it("7 días (principiante): se limita a 4 sesiones y avisa", () => {
    const rutina = generar({ experience: "beginner", days: 7 });
    expect(rutina.days).toHaveLength(4);
    expect(rutina.warnings.some((w) => w.includes("recomendamos 4 sesiones"))).toBe(true);
  });
});

describe("selección de ejercicios", () => {
  it("varía los ejercicios entre sesiones", () => {
    const rutina = generar({ experience: "intermediate", days: 3 });
    const ids = new Set(todosLosEjercicios(rutina).map((e) => e.exerciseId));
    expect(ids.size).toBeGreaterThan(rutina.days[0].exercises.length);
  });

  it("solo usa el material elegido (más el peso corporal)", () => {
    const rutina = generar({ equipment: ["dumbbells"], experience: "intermediate" });
    for (const ej of todosLosEjercicios(rutina)) {
      const original = porId.get(ej.exerciseId);
      expect(["dumbbells", "bodyweight"]).toContain(original?.equipment);
    }
  });

  it("un principiante no recibe ejercicios intermedios ni avanzados", () => {
    const rutina = generar({ experience: "beginner", days: 4 });
    for (const ej of todosLosEjercicios(rutina)) {
      expect(porId.get(ej.exerciseId)?.difficulty).toBe("beginner");
    }
  });

  it("con rodillas delicadas evita zancadas, sentadilla con barra y extensión", () => {
    const rutina = generar({
      experience: "advanced",
      days: 4,
      limitations: ["knees"],
    });
    const slugs = todosLosEjercicios(rutina).map((e) => e.exerciseSlug);
    expect(slugs).not.toContain("zancadas");
    expect(slugs).not.toContain("sentadilla-con-barra");
    expect(slugs).not.toContain("extension-de-cuadriceps");
    expect(slugs.length).toBeGreaterThan(0);
    expect(rutina.warnings.some((w) => w.includes("rodillas"))).toBe(true);
  });

  it("con solo peso corporal avisa de lo que falta y aun así genera ejercicios", () => {
    const rutina = generar({ equipment: ["bodyweight"], days: 4 });
    expect(todosLosEjercicios(rutina).length).toBeGreaterThan(0);
    expect(rutina.warnings.some((w) => w.includes("tirón"))).toBe(true);
  });

  it("la plancha se mide en segundos y lo explica", () => {
    const rutina = generar({ equipment: ["bodyweight"], days: 3 });
    const plancha = todosLosEjercicios(rutina).find((e) => e.exerciseSlug === "plancha");
    expect(plancha).toBeDefined();
    expect(plancha?.repsMin).toBe(20);
    expect(plancha?.repsMax).toBe(40);
    expect(plancha?.notes).toContain("segundos");
  });
});

describe("series, repeticiones y tiempo", () => {
  it("el objetivo cambia las repeticiones: fuerza < músculo < condición física", () => {
    const primera = (goal: QuestionnaireValues["goal"]) =>
      generar({ experience: "intermediate", minutes: 90, goal }).days[0].exercises[0];

    expect(primera("strength").repsMax).toBeLessThan(primera("muscle").repsMax);
    expect(primera("muscle").repsMax).toBeLessThan(
      primera("general_fitness").repsMax,
    );
  });

  it("con más tiempo caben más ejercicios", () => {
    const corta = todosLosEjercicios(generar({ experience: "intermediate", minutes: 30 }));
    const larga = todosLosEjercicios(generar({ experience: "intermediate", minutes: 90 }));
    expect(larga.length).toBeGreaterThan(corta.length);
  });

  it("con poco tiempo reduce series y descansos y avisa, pero deja al menos 3 ejercicios", () => {
    const rutina = generar({ experience: "advanced", goal: "strength", minutes: 30 });
    expect(rutina.warnings.some((w) => w.includes("reducido"))).toBe(true);
    for (const dia of rutina.days) {
      expect(dia.exercises.length).toBeGreaterThanOrEqual(3);
    }
  });
});

describe("fiabilidad", () => {
  it("da siempre el mismo resultado con las mismas respuestas", () => {
    expect(generar({ experience: "intermediate", days: 5 })).toEqual(
      generar({ experience: "intermediate", days: 5 }),
    );
  });

  it("no depende del orden en que vengan los ejercicios de la base de datos", () => {
    const alReves = [...TEST_LIBRARY].reverse();
    expect(generar({ experience: "intermediate", days: 4 }, alReves)).toEqual(
      generar({ experience: "intermediate", days: 4 }),
    );
  });

  it("no falla con una biblioteca vacía y lo explica", () => {
    const rutina = generar({}, []);
    expect(todosLosEjercicios(rutina)).toHaveLength(0);
    expect(rutina.warnings.length).toBeGreaterThan(0);
  });
});

describe("todas las combinaciones", () => {
  it("cumple las reglas con miles de respuestas distintas", () => {
    const niveles = ["beginner", "intermediate", "advanced"] as const;
    const objetivos = ["muscle", "strength", "general_fitness"] as const;
    const duraciones = [30, 45, 60, 90];
    const materiales: Equipment[][] = [
      ["bodyweight"],
      ["dumbbells"],
      ["machines"],
      ["barbell"],
      ["dumbbells", "machines"],
      ["dumbbells", "machines", "barbell", "bodyweight"],
    ];
    const limitaciones: Limitation[][] = [
      [],
      ["knees"],
      ["lower_back", "shoulders"],
      ["wrists"],
      ["knees", "lower_back", "shoulders", "wrists", "avoid_impact"],
    ];

    let comprobadas = 0;

    for (const experience of niveles) {
      for (const goal of objetivos) {
        for (let days = 1; days <= 7; days += 1) {
          for (const minutes of duraciones) {
            for (const equipment of materiales) {
              for (const limits of limitaciones) {
                const prefs: QuestionnaireValues = {
                  experience,
                  goal,
                  days,
                  minutes,
                  equipment,
                  limitations: limits,
                };
                const etiqueta = JSON.stringify(prefs);
                const rutina = generateRoutine(prefs, TEST_LIBRARY);

                comprobarRutina(rutina, prefs, etiqueta);

                // Con mancuernas o máquinas y sin limitaciones,
                // cada sesión debe tener al menos 3 ejercicios.
                const hayMaterial =
                  equipment.includes("dumbbells") || equipment.includes("machines");
                if (hayMaterial && limits.length === 0) {
                  for (const dia of rutina.days) {
                    expect(
                      dia.exercises.length,
                      `${etiqueta}: ${dia.name} tiene pocos ejercicios`,
                    ).toBeGreaterThanOrEqual(3);
                  }
                }
                comprobadas += 1;
              }
            }
          }
        }
      }
    }

    expect(comprobadas).toBe(3 * 3 * 7 * 4 * 6 * 5);
  });
});