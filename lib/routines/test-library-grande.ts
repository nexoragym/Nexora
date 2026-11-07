import type { Difficulty, Equipment, MovementPattern, Muscle } from "../exercises";
import type { GeneratorExercise } from "./types";

// Biblioteca ARTIFICIAL, solo para las pruebas: 180 ejercicios inventados que cubren
// todos los huecos del generador. Sirve para comprobar cuánta variedad es capaz de dar.
const GRUPOS: { id: string; pattern: MovementPattern; muscles: Muscle[] }[] = [
  { id: "squat", pattern: "squat", muscles: ["quadriceps", "glutes"] },
  { id: "hinge", pattern: "hinge", muscles: ["hamstrings", "glutes"] },
  { id: "lunge", pattern: "lunge", muscles: ["quadriceps", "glutes"] },
  { id: "pushChest", pattern: "push", muscles: ["chest"] },
  { id: "pushShoulders", pattern: "push", muscles: ["shoulders"] },
  { id: "pullLats", pattern: "pull", muscles: ["lats"] },
  { id: "pullBack", pattern: "pull", muscles: ["upper_back"] },
  { id: "biceps", pattern: "isolation", muscles: ["biceps"] },
  { id: "triceps", pattern: "isolation", muscles: ["triceps"] },
  { id: "lateral", pattern: "isolation", muscles: ["shoulders"] },
  { id: "chestFly", pattern: "isolation", muscles: ["chest"] },
  { id: "quadsIso", pattern: "isolation", muscles: ["quadriceps"] },
  { id: "hamstringsIso", pattern: "isolation", muscles: ["hamstrings"] },
  { id: "calves", pattern: "isolation", muscles: ["calves"] },
  { id: "core", pattern: "core", muscles: ["abs"] },
];

const EQUIPOS: Equipment[] = ["bodyweight", "dumbbells", "barbell", "machines"];
const NIVELES: Difficulty[] = ["beginner", "beginner", "intermediate"];

export const BIBLIOTECA_GRANDE: GeneratorExercise[] = GRUPOS.flatMap((grupo) =>
  EQUIPOS.flatMap((equipo) =>
    NIVELES.map((nivel, i) => ({
      id: `id-${grupo.id}-${equipo}-${i}`,
      slug: `${grupo.id}-${equipo}-${i}`,
      name: `${grupo.id} ${equipo} ${i}`,
      primary_muscles: grupo.muscles,
      equipment: equipo,
      movement_pattern: grupo.pattern,
      difficulty: nivel,
      popularity: i,
    })),
  ),
);