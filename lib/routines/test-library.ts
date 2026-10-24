import type {
  Difficulty,
  Equipment,
  MovementPattern,
  Muscle,
} from "../exercises";
import type { GeneratorExercise } from "./generator";

function ej(
  slug: string,
  name: string,
  primary: Muscle[],
  equipment: Equipment,
  pattern: MovementPattern,
  difficulty: Difficulty,
): GeneratorExercise {
  return {
    id: `id-${slug}`,
    slug,
    name,
    primary_muscles: primary,
    equipment,
    movement_pattern: pattern,
    difficulty,
  };
}

// Biblioteca de ejemplo para las pruebas (los 30 ejercicios iniciales).
export const TEST_LIBRARY: GeneratorExercise[] = [
  ej("press-banca-plano", "Press de banca plano", ["chest"], "barbell", "push", "intermediate"),
  ej("press-banca-mancuernas", "Press de banca con mancuernas", ["chest"], "dumbbells", "push", "beginner"),
  ej("flexiones", "Flexiones", ["chest"], "bodyweight", "push", "beginner"),
  ej("press-inclinado-mancuernas", "Press inclinado con mancuernas", ["chest", "shoulders"], "dumbbells", "push", "intermediate"),
  ej("aperturas-en-maquina", "Aperturas en máquina", ["chest"], "machines", "isolation", "beginner"),
  ej("press-militar-mancuernas", "Press militar con mancuernas sentado", ["shoulders"], "dumbbells", "push", "intermediate"),
  ej("elevaciones-laterales", "Elevaciones laterales", ["shoulders"], "dumbbells", "isolation", "beginner"),
  ej("press-hombros-maquina", "Press de hombros en máquina", ["shoulders"], "machines", "push", "beginner"),
  ej("jalon-al-pecho", "Jalón al pecho", ["lats"], "machines", "pull", "beginner"),
  ej("remo-con-mancuerna", "Remo con mancuerna a una mano", ["lats", "upper_back"], "dumbbells", "pull", "beginner"),
  ej("remo-con-barra", "Remo con barra", ["lats", "upper_back"], "barbell", "pull", "intermediate"),
  ej("remo-sentado-en-maquina", "Remo sentado en máquina", ["upper_back", "lats"], "machines", "pull", "beginner"),
  ej("dominadas", "Dominadas", ["lats"], "bodyweight", "pull", "advanced"),
  ej("curl-biceps-mancuernas", "Curl de bíceps con mancuernas", ["biceps"], "dumbbells", "isolation", "beginner"),
  ej("extension-de-triceps-en-polea", "Extensión de tríceps en polea", ["triceps"], "machines", "isolation", "beginner"),
  ej("fondos-en-banco", "Fondos en banco", ["triceps"], "bodyweight", "push", "beginner"),
  ej("sentadilla-peso-corporal", "Sentadilla con peso corporal", ["quadriceps", "glutes"], "bodyweight", "squat", "beginner"),
  ej("sentadilla-goblet", "Sentadilla goblet", ["quadriceps", "glutes"], "dumbbells", "squat", "beginner"),
  ej("sentadilla-con-barra", "Sentadilla con barra", ["quadriceps", "glutes"], "barbell", "squat", "advanced"),
  ej("prensa-de-piernas", "Prensa de piernas", ["quadriceps", "glutes"], "machines", "squat", "beginner"),
  ej("zancadas", "Zancadas", ["quadriceps", "glutes"], "bodyweight", "lunge", "beginner"),
  ej("peso-muerto-rumano-mancuernas", "Peso muerto rumano con mancuernas", ["hamstrings", "glutes"], "dumbbells", "hinge", "beginner"),
  ej("peso-muerto-rumano-barra", "Peso muerto rumano con barra", ["hamstrings", "glutes"], "barbell", "hinge", "intermediate"),
  ej("puente-de-gluteos", "Puente de glúteos", ["glutes"], "bodyweight", "hinge", "beginner"),
  ej("extension-de-cuadriceps", "Extensión de cuádriceps", ["quadriceps"], "machines", "isolation", "beginner"),
  ej("curl-femoral-en-maquina", "Curl femoral en máquina", ["hamstrings"], "machines", "isolation", "beginner"),
  ej("elevacion-de-talones", "Elevación de talones", ["calves"], "bodyweight", "isolation", "beginner"),
  ej("plancha", "Plancha", ["abs"], "bodyweight", "core", "beginner"),
  ej("crunch-abdominal", "Crunch abdominal", ["abs"], "bodyweight", "core", "beginner"),
  ej("perro-pajaro", "Perro-pájaro (bird dog)", ["abs"], "bodyweight", "core", "beginner"),
];