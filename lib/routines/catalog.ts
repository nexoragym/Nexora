import type { Difficulty, Equipment } from "../exercises";
import type { Focus, Goal } from "../questionnaire";
import { TIMED_EXERCISE_SLUGS } from "./rules";

export type CatalogExercise = {
  slug: string;
  sets: number;
  repsMin: number;
  repsMax: number;
  rest: number;
};

export type CatalogDay = {
  name: string;
  exercises: CatalogExercise[];
};

export type CatalogRoutine = {
  slug: string;
  name: string;
  description: string;
  goal: Goal;
  focus: Focus;
  level: Difficulty;
  weeks: number;
  // Material con el que se puede cambiar un ejercicio por otro
  equipment: Equipment[];
  notes: string[];
  warnings: string[];
  days: CatalogDay[];
};

export const TIMED_NOTE =
  "Las repeticiones son segundos: mantén la posición durante ese tiempo.";

export const CATALOG_GENERAL_NOTES: string[] = [
  "Las series, repeticiones y descansos son orientativos. Elige un peso con el que mantengas una buena técnica.",
  "Estas recomendaciones son generales y no sustituyen el consejo de un profesional.",
];

export const CATALOG_GENERAL_WARNINGS: string[] = [
  "Si tienes una lesión o dolor, consulta con un profesional sanitario antes de entrenar. Estas rutinas son generales.",
];

const AVISO_BARRA =
  "Los ejercicios con barra son exigentes: empieza con poco peso y usa topes de seguridad o entrena acompañado.";

const SUPERIOR = "Parte superior (pecho, espalda y brazos)";
const INFERIOR = "Parte inferior (piernas y glúteos)";
const COMPLETO = "Cuerpo completo";

// Atajo para escribir un ejercicio: ejercicio(slug, series, rep. mín., rep. máx., descanso en segundos)
const ej = (
  slug: string,
  sets: number,
  repsMin: number,
  repsMax: number,
  rest: number,
): CatalogExercise => ({ slug, sets, repsMin, repsMax, rest });

export function esPorTiempo(slug: string): boolean {
  return TIMED_EXERCISE_SLUGS.includes(slug);
}

export const CATALOG: readonly CatalogRoutine[] = [
  {
    slug: "masa-muscular-principiante",
    name: "Masa muscular · Principiante",
    description:
      "Tres sesiones de cuerpo completo por semana con máquinas y mancuernas. Ideal para empezar.",
    goal: "muscle",
    focus: "balanced",
    level: "beginner",
    weeks: 8,
    equipment: ["machines", "dumbbells", "bodyweight"],
    notes: [
      "Tres sesiones de cuerpo completo por semana, con un día de descanso entre ellas.",
      "Cuando completes todas las series en el máximo de repeticiones y con buena técnica, sube un poco el peso la semana siguiente.",
    ],
    warnings: [],
    days: [
      {
        name: COMPLETO,
        exercises: [
          ej("press-banca-mancuernas", 3, 8, 12, 90),
          ej("jalon-al-pecho", 3, 8, 12, 90),
          ej("prensa-de-piernas", 3, 10, 12, 90),
          ej("elevaciones-laterales", 2, 12, 15, 60),
          ej("curl-biceps-mancuernas", 2, 12, 15, 60),
          ej("plancha", 2, 20, 40, 45),
        ],
      },
      {
        name: COMPLETO,
        exercises: [
          ej("press-hombros-maquina", 3, 8, 12, 90),
          ej("remo-sentado-en-maquina", 3, 8, 12, 90),
          ej("sentadilla-goblet", 3, 8, 12, 90),
          ej("peso-muerto-rumano-mancuernas", 3, 8, 12, 90),
          ej("extension-de-triceps-en-polea", 2, 12, 15, 60),
          ej("crunch-abdominal", 2, 12, 15, 45),
        ],
      },
      {
        name: COMPLETO,
        exercises: [
          ej("flexiones", 3, 8, 12, 90),
          ej("remo-con-mancuerna", 3, 8, 12, 90),
          ej("prensa-de-piernas", 3, 10, 12, 90),
          ej("curl-femoral-en-maquina", 2, 12, 15, 60),
          ej("aperturas-en-maquina", 2, 12, 15, 60),
          ej("perro-pajaro", 2, 10, 12, 45),
        ],
      },
    ],
  },
  {
    slug: "masa-muscular-intermedio",
    name: "Masa muscular · Intermedio",
    description:
      "Cuatro sesiones por semana alternando parte superior e inferior, con barra, mancuernas y máquinas.",
    goal: "muscle",
    focus: "balanced",
    level: "intermediate",
    weeks: 8,
    equipment: ["barbell", "dumbbells", "machines", "bodyweight"],
    notes: [
      "Alternas parte superior e inferior: dos sesiones de cada una por semana.",
      "Cuando completes todas las series en el máximo de repeticiones y con buena técnica, sube un poco el peso la semana siguiente.",
    ],
    warnings: [AVISO_BARRA],
    days: [
      {
        name: SUPERIOR,
        exercises: [
          ej("press-banca-plano", 4, 8, 12, 90),
          ej("remo-con-barra", 4, 8, 12, 90),
          ej("press-militar-mancuernas", 3, 8, 12, 90),
          ej("jalon-al-pecho", 3, 10, 12, 75),
          ej("curl-biceps-mancuernas", 3, 10, 15, 60),
          ej("extension-de-triceps-en-polea", 3, 10, 15, 60),
        ],
      },
      {
        name: INFERIOR,
        exercises: [
          ej("prensa-de-piernas", 4, 8, 12, 90),
          ej("peso-muerto-rumano-barra", 4, 8, 12, 90),
          ej("zancadas", 3, 10, 12, 75),
          ej("curl-femoral-en-maquina", 3, 10, 15, 60),
          ej("elevacion-de-talones", 3, 12, 15, 45),
          ej("plancha", 3, 20, 40, 45),
        ],
      },
      {
        name: SUPERIOR,
        exercises: [
          ej("press-inclinado-mancuernas", 4, 8, 12, 90),
          ej("remo-con-mancuerna", 4, 8, 12, 90),
          ej("press-hombros-maquina", 3, 8, 12, 90),
          ej("remo-sentado-en-maquina", 3, 10, 12, 75),
          ej("elevaciones-laterales", 3, 12, 15, 60),
          ej("aperturas-en-maquina", 3, 12, 15, 60),
        ],
      },
      {
        name: INFERIOR,
        exercises: [
          ej("sentadilla-goblet", 4, 8, 12, 90),
          ej("peso-muerto-rumano-mancuernas", 4, 8, 12, 90),
          ej("puente-de-gluteos", 3, 12, 15, 60),
          ej("extension-de-cuadriceps", 3, 10, 15, 60),
          ej("elevacion-de-talones", 3, 12, 15, 45),
          ej("crunch-abdominal", 3, 10, 15, 45),
        ],
      },
    ],
  },
  {
    slug: "definir-gimnasio",
    name: "Definir y perder grasa · Gimnasio",
    description:
      "Tres sesiones de cuerpo completo con más repeticiones y descansos cortos, con máquinas y mancuernas.",
    goal: "definition",
    focus: "balanced",
    level: "beginner",
    weeks: 8,
    equipment: ["machines", "dumbbells", "bodyweight"],
    notes: [
      "Más repeticiones y descansos cortos para mantener el ritmo alto.",
      "No se puede perder grasa de una sola zona: el cuerpo la reduce en conjunto.",
      "Para definir, el entrenamiento ayuda, pero la alimentación tiene un peso enorme en el resultado.",
    ],
    warnings: [],
    days: [
      {
        name: COMPLETO,
        exercises: [
          ej("prensa-de-piernas", 3, 12, 15, 45),
          ej("press-banca-mancuernas", 3, 12, 15, 45),
          ej("jalon-al-pecho", 3, 12, 15, 45),
          ej("elevaciones-laterales", 2, 12, 15, 30),
          ej("crunch-abdominal", 2, 15, 20, 30),
          ej("plancha", 2, 20, 40, 30),
        ],
      },
      {
        name: COMPLETO,
        exercises: [
          ej("sentadilla-goblet", 3, 12, 15, 45),
          ej("press-hombros-maquina", 3, 12, 15, 45),
          ej("remo-sentado-en-maquina", 3, 12, 15, 45),
          ej("peso-muerto-rumano-mancuernas", 3, 12, 15, 45),
          ej("curl-biceps-mancuernas", 2, 12, 15, 30),
          ej("perro-pajaro", 2, 10, 12, 30),
        ],
      },
      {
        name: COMPLETO,
        exercises: [
          ej("zancadas", 3, 12, 15, 45),
          ej("flexiones", 3, 10, 15, 45),
          ej("remo-con-mancuerna", 3, 12, 15, 45),
          ej("curl-femoral-en-maquina", 2, 12, 15, 30),
          ej("extension-de-triceps-en-polea", 2, 12, 15, 30),
          ej("plancha", 2, 20, 40, 30),
        ],
      },
    ],
  },
  {
    slug: "definir-en-casa",
    name: "Definir y perder grasa · En casa",
    description:
      "Tres sesiones de cuerpo completo solo con tu peso corporal y un banco o silla. No necesitas gimnasio.",
    goal: "definition",
    focus: "balanced",
    level: "beginner",
    weeks: 8,
    equipment: ["bodyweight"],
    notes: [
      "Solo con peso corporal: sin material no hay ejercicios de espalda. Si tienes mancuernas o acceso a un gimnasio, la rutina de gimnasio es más completa.",
      "No se puede perder grasa de una sola zona: el cuerpo la reduce en conjunto.",
      "Para definir, el entrenamiento ayuda, pero la alimentación tiene un peso enorme en el resultado.",
    ],
    warnings: [],
    days: [
      {
        name: COMPLETO,
        exercises: [
          ej("sentadilla-peso-corporal", 3, 15, 20, 45),
          ej("flexiones", 3, 10, 15, 45),
          ej("puente-de-gluteos", 3, 15, 20, 30),
          ej("fondos-en-banco", 2, 10, 15, 45),
          ej("crunch-abdominal", 3, 15, 20, 30),
          ej("plancha", 3, 20, 40, 30),
        ],
      },
      {
        name: COMPLETO,
        exercises: [
          ej("zancadas", 3, 10, 12, 45),
          ej("flexiones", 3, 10, 15, 45),
          ej("elevacion-de-talones", 3, 15, 20, 30),
          ej("perro-pajaro", 2, 10, 12, 30),
          ej("crunch-abdominal", 3, 15, 20, 30),
        ],
      },
      {
        name: COMPLETO,
        exercises: [
          ej("sentadilla-peso-corporal", 3, 15, 20, 45),
          ej("fondos-en-banco", 3, 10, 15, 45),
          ej("puente-de-gluteos", 3, 15, 20, 30),
          ej("flexiones", 2, 10, 15, 45),
          ej("plancha", 3, 20, 40, 30),
          ej("perro-pajaro", 2, 10, 12, 30),
        ],
      },
    ],
  },
  {
    slug: "fuerza-intermedio",
    name: "Fuerza · Intermedio",
    description:
      "Cuatro sesiones por semana con pocas repeticiones y descansos largos para levantar cada vez más peso.",
    goal: "strength",
    focus: "balanced",
    level: "intermediate",
    weeks: 8,
    equipment: ["barbell", "dumbbells", "machines", "bodyweight"],
    notes: [
      "Pocas repeticiones con mucho peso y descansos largos: descansa lo necesario entre series.",
      "Cuando completes todas las series en el máximo de repeticiones y con buena técnica, sube un poco el peso la semana siguiente.",
    ],
    warnings: [AVISO_BARRA],
    days: [
      {
        name: SUPERIOR,
        exercises: [
          ej("press-banca-plano", 4, 4, 6, 150),
          ej("remo-con-barra", 4, 4, 6, 150),
          ej("press-militar-mancuernas", 3, 6, 8, 120),
          ej("jalon-al-pecho", 3, 8, 10, 90),
          ej("extension-de-triceps-en-polea", 3, 8, 12, 75),
        ],
      },
      {
        name: INFERIOR,
        exercises: [
          ej("prensa-de-piernas", 4, 5, 8, 150),
          ej("peso-muerto-rumano-barra", 4, 4, 6, 150),
          ej("zancadas", 3, 8, 10, 90),
          ej("curl-femoral-en-maquina", 3, 8, 12, 75),
          ej("plancha", 3, 20, 40, 60),
        ],
      },
      {
        name: SUPERIOR,
        exercises: [
          ej("press-inclinado-mancuernas", 4, 6, 8, 120),
          ej("remo-con-mancuerna", 4, 6, 8, 120),
          ej("press-hombros-maquina", 3, 6, 8, 120),
          ej("remo-sentado-en-maquina", 3, 8, 10, 90),
          ej("curl-biceps-mancuernas", 3, 8, 12, 75),
        ],
      },
      {
        name: INFERIOR,
        exercises: [
          ej("sentadilla-goblet", 4, 6, 10, 120),
          ej("peso-muerto-rumano-mancuernas", 4, 6, 8, 120),
          ej("extension-de-cuadriceps", 3, 8, 12, 75),
          ej("elevacion-de-talones", 3, 10, 12, 60),
          ej("crunch-abdominal", 3, 8, 12, 60),
        ],
      },
    ],
  },
  {
    slug: "condicion-fisica-principiante",
    name: "Condición física · Principiante",
    description:
      "Un mes de tres sesiones suaves de cuerpo completo para ponerte en marcha y coger el hábito.",
    goal: "general_fitness",
    focus: "balanced",
    level: "beginner",
    weeks: 4,
    equipment: ["machines", "dumbbells", "bodyweight"],
    notes: [
      "Tres sesiones suaves por semana: lo importante es crear el hábito.",
      "Si te sobra energía al terminar las series, sube un poco el peso la semana siguiente.",
    ],
    warnings: [],
    days: [
      {
        name: COMPLETO,
        exercises: [
          ej("sentadilla-peso-corporal", 2, 10, 15, 60),
          ej("flexiones", 2, 10, 15, 60),
          ej("remo-sentado-en-maquina", 2, 10, 15, 60),
          ej("puente-de-gluteos", 2, 12, 15, 45),
          ej("plancha", 2, 20, 40, 45),
        ],
      },
      {
        name: COMPLETO,
        exercises: [
          ej("prensa-de-piernas", 2, 10, 15, 60),
          ej("press-banca-mancuernas", 2, 10, 15, 60),
          ej("jalon-al-pecho", 2, 10, 15, 60),
          ej("elevaciones-laterales", 2, 12, 15, 45),
          ej("perro-pajaro", 2, 10, 12, 45),
        ],
      },
      {
        name: COMPLETO,
        exercises: [
          ej("sentadilla-goblet", 2, 10, 15, 60),
          ej("press-hombros-maquina", 2, 10, 15, 60),
          ej("remo-con-mancuerna", 2, 10, 15, 60),
          ej("zancadas", 2, 10, 12, 60),
          ej("crunch-abdominal", 2, 10, 15, 45),
        ],
      },
    ],
  },
];

export function buscarRutinaCatalogo(slug: string): CatalogRoutine | null {
  return CATALOG.find((rutina) => rutina.slug === slug) ?? null;
}