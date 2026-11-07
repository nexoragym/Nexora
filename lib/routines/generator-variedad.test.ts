import { describe, expect, it } from "vitest";
import type { Difficulty, Equipment } from "../exercises";
import { FOCUSES, GOALS, type QuestionnaireValues } from "../questionnaire";
import { generateRoutine } from "./generator";
import { formarPool } from "./selection";
import { SPLIT_VARIANTS, elegirSplit } from "./splits";
import { BIBLIOTECA_GRANDE } from "./test-library-grande";
import { crearSemilla } from "./variation";

const EQUIPOS: Equipment[][] = [
  ["bodyweight"],
  ["dumbbells", "bodyweight"],
  ["machines", "dumbbells"],
  ["barbell", "dumbbells", "machines", "bodyweight"],
];
const NIVELES: Difficulty[] = ["beginner", "intermediate", "advanced"];

function respuestas(
  goal: QuestionnaireValues["goal"],
  focus: NonNullable<QuestionnaireValues["focus"]>,
  experience: Difficulty,
  days: number,
  equipment: Equipment[],
): QuestionnaireValues {
  return {
    goal,
    focus,
    experience,
    days,
    minutes: 60,
    equipment,
    limitations: [],
    sex: null,
    programWeeks: 8,
  };
}

describe("variedad del generador", () => {
  it("con una biblioteca grande da al menos 200 rutinas distintas", () => {
    const firmas = new Set<string>();

    for (const goal of GOALS) {
      for (const focus of FOCUSES) {
        for (const nivel of NIVELES) {
          for (let dias = 1; dias <= 6; dias += 1) {
            for (const equipo of EQUIPOS) {
              const rutina = generateRoutine(
                respuestas(goal, focus, nivel, dias, equipo),
                BIBLIOTECA_GRANDE,
              );
              firmas.add(
                rutina.days
                  .map(
                    (dia) =>
                      `${dia.name}:${dia.exercises.map((e) => e.exerciseSlug).join(",")}`,
                  )
                  .join("|"),
              );
            }
          }
        }
      }
    }

    expect(firmas.size).toBeGreaterThanOrEqual(200);
  }, 120_000);

  it("las mismas respuestas dan siempre la misma rutina", () => {
    const datos = respuestas("muscle", "chest", "intermediate", 4, EQUIPOS[3]);
    expect(generateRoutine(datos, BIBLIOTECA_GRANDE)).toEqual(
      generateRoutine(datos, BIBLIOTECA_GRANDE),
    );
  });
});

describe("semilla", () => {
  const base = respuestas("muscle", "balanced", "beginner", 3, ["dumbbells"]);

  it("cambia al cambiar cualquier respuesta", () => {
    const variantes: QuestionnaireValues[] = [
      { ...base, goal: "strength" },
      { ...base, focus: "chest" },
      { ...base, experience: "advanced" },
      { ...base, days: 4 },
      { ...base, minutes: 45 },
      { ...base, programWeeks: 12 },
      { ...base, equipment: ["machines"] },
      { ...base, limitations: ["knees"] },
    ];
    for (const variante of variantes) {
      expect(crearSemilla(variante)).not.toBe(crearSemilla(base));
    }
  });

  it("no depende del sexo", () => {
    expect(crearSemilla({ ...base, sex: "female" })).toBe(crearSemilla(base));
    expect(crearSemilla({ ...base, sex: "male" })).toBe(crearSemilla(base));
  });
});

describe("estructuras de la semana", () => {
  it("cada variante tiene tantos días como sesiones", () => {
    for (const [sesiones, variantes] of Object.entries(SPLIT_VARIANTS)) {
      for (const variante of variantes) {
        expect(variante.kinds.length).toBe(Number(sesiones));
      }
    }
  });

  it("siempre devuelve una estructura del tamaño pedido", () => {
    for (let sesiones = 1; sesiones <= 6; sesiones += 1) {
      for (const nivel of NIVELES) {
        for (let i = 0; i < 30; i += 1) {
          const tipos = elegirSplit(sesiones, nivel, `semilla-${i}`);
          expect(tipos?.length).toBe(sesiones);
        }
      }
    }
  });

  it("un principiante no recibe empuje-tirón-piernas en 3 días", () => {
    for (let i = 0; i < 50; i += 1) {
      const tipos = elegirSplit(3, "beginner", `semilla-${i}`);
      expect(tipos).not.toContain("push");
    }
  });
});

describe("preferencia por ejercicios populares", () => {
  const ej = (id: string, popularity: number) => ({
    ...BIBLIOTECA_GRANDE[0],
    id,
    slug: id,
    name: id,
    equipment: "dumbbells" as const,
    popularity,
  });

  it("deja fuera a los poco conocidos si hay suficientes populares", () => {
    const pool = formarPool([ej("a", 3), ej("b", 3), ej("c", 1), ej("d", 0)], "muscle");
    expect(pool.map((e) => e.id)).toEqual(["a", "b"]);
  });

  it("si solo hay un popular, también compite el siguiente", () => {
    const pool = formarPool([ej("a", 3), ej("b", 0), ej("c", 0)], "muscle");
    expect(pool.map((e) => e.id)).toEqual(["a", "b"]);
  });
});