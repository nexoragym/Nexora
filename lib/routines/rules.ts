import type { Difficulty, MovementPattern, Muscle } from "../exercises";
import type { Focus, Goal, Limitation } from "../questionnaire";

// ---------- Ajustes generales ----------
export const WARMUP_MINUTES = 5;
export const TRANSITION_MINUTES = 1;
export const SECONDS_PER_SET = 40;
export const MIN_EXERCISES_PER_DAY = 3;
export const MAX_EXERCISES_PER_DAY = 8;

export const DIFFICULTY_RANK: Record<Difficulty, number> = {
  beginner: 1,
  intermediate: 2,
  advanced: 3,
};

// Máximo de sesiones semanales recomendado según el nivel
export const MAX_SESSIONS_BY_LEVEL: Record<Difficulty, number> = {
  beginner: 4,
  intermediate: 5,
  advanced: 6,
};

// ---------- Huecos de ejercicio ----------
export type Role = "compound" | "isolation" | "core";

export type Slot = {
  id: string;
  role: Role;
  patterns: readonly MovementPattern[];
  muscles?: readonly Muscle[];
};

export const SLOTS = {
  squat: { id: "squat", role: "compound", patterns: ["squat"] },
  hinge: { id: "hinge", role: "compound", patterns: ["hinge"] },
  lunge: { id: "lunge", role: "compound", patterns: ["lunge"] },
  pushChest: { id: "pushChest", role: "compound", patterns: ["push"], muscles: ["chest"] },
  pushShoulders: { id: "pushShoulders", role: "compound", patterns: ["push"], muscles: ["shoulders"] },
  pullLats: { id: "pullLats", role: "compound", patterns: ["pull"], muscles: ["lats"] },
  pullBack: { id: "pullBack", role: "compound", patterns: ["pull"], muscles: ["upper_back"] },
  biceps: { id: "biceps", role: "isolation", patterns: ["isolation"], muscles: ["biceps"] },
  triceps: { id: "triceps", role: "isolation", patterns: ["isolation", "push"], muscles: ["triceps"] },
  lateralDelts: { id: "lateralDelts", role: "isolation", patterns: ["isolation"], muscles: ["shoulders"] },
  chestFly: { id: "chestFly", role: "isolation", patterns: ["isolation"], muscles: ["chest"] },
  quadsIso: { id: "quadsIso", role: "isolation", patterns: ["isolation"], muscles: ["quadriceps"] },
  hamstringsIso: { id: "hamstringsIso", role: "isolation", patterns: ["isolation"], muscles: ["hamstrings"] },
  calves: { id: "calves", role: "isolation", patterns: ["isolation"], muscles: ["calves"] },
  core: { id: "core", role: "core", patterns: ["core"] },
} as const satisfies Record<string, Slot>;

export const SLOT_LABELS: Record<string, string> = {
  squat: "sentadilla o prensa",
  hinge: "bisagra de cadera",
  lunge: "zancadas",
  pushChest: "empuje de pecho",
  pushShoulders: "empuje de hombros",
  pullLats: "tirón vertical (dorsales)",
  pullBack: "remo (espalda alta)",
  biceps: "bíceps",
  triceps: "tríceps",
  lateralDelts: "hombros laterales",
  chestFly: "aperturas de pecho",
  quadsIso: "cuádriceps",
  hamstringsIso: "isquiotibiales",
  calves: "gemelos",
  core: "abdomen",
};

// ---------- Tipos de sesión y distribución semanal ----------
export type DayKind = "full" | "upper" | "lower" | "push" | "pull" | "legs";

export const DAY_KIND_LABELS: Record<DayKind, string> = {
  full: "Cuerpo completo",
  upper: "Tren superior",
  lower: "Tren inferior",
  push: "Empuje",
  pull: "Tirón",
  legs: "Piernas",
};

// Los huecos van por prioridad: si falta tiempo, se quitan los últimos.
const LOWER_DAY: readonly Slot[] = [
  SLOTS.squat,
  SLOTS.hinge,
  SLOTS.lunge,
  SLOTS.hamstringsIso,
  SLOTS.quadsIso,
  SLOTS.calves,
  SLOTS.core,
];

export const DAY_TEMPLATES: Record<DayKind, readonly Slot[]> = {
  full: [
    SLOTS.squat,
    SLOTS.pushChest,
    SLOTS.pullLats,
    SLOTS.hinge,
    SLOTS.core,
    SLOTS.pushShoulders,
    SLOTS.pullBack,
  ],
  upper: [
    SLOTS.pushChest,
    SLOTS.pullLats,
    SLOTS.pushShoulders,
    SLOTS.pullBack,
    SLOTS.biceps,
    SLOTS.triceps,
    SLOTS.lateralDelts,
  ],
  lower: LOWER_DAY,
  push: [
    SLOTS.pushChest,
    SLOTS.pushShoulders,
    SLOTS.pushChest,
    SLOTS.lateralDelts,
    SLOTS.triceps,
    SLOTS.chestFly,
  ],
  pull: [SLOTS.pullLats, SLOTS.pullBack, SLOTS.pullLats, SLOTS.biceps, SLOTS.core],
  legs: LOWER_DAY,
};

export const SPLITS: Record<number, readonly DayKind[]> = {
  1: ["full"],
  2: ["full", "full"],
  3: ["full", "full", "full"],
  4: ["upper", "lower", "upper", "lower"],
  5: ["push", "pull", "legs", "upper", "lower"],
  6: ["push", "pull", "legs", "push", "pull", "legs"],
};

export const SPLIT_DESCRIPTIONS: Record<number, string> = {
  1: "Tu sesión trabaja todo el cuerpo.",
  2: "Cada sesión trabaja todo el cuerpo.",
  3: "Cada sesión trabaja todo el cuerpo.",
  4: "Alternas sesiones de tren superior y de tren inferior.",
  5: "Combinas empuje, tirón y piernas con sesiones de tren superior e inferior.",
  6: "Repites dos veces el ciclo de empuje, tirón y piernas.",
};

// ---------- Enfoque: qué huecos pasan a ser prioritarios ----------
// Solo se aplica a las sesiones que ya trabajan esa zona.
export const FOCUS_SLOTS: Record<
  Exclude<Focus, "balanced">,
  { priority: readonly string[]; extras: readonly Slot[] }
> = {
  chest: {
    priority: ["pushChest", "chestFly"],
    extras: [SLOTS.pushChest, SLOTS.chestFly],
  },
  back: {
    priority: ["pullLats", "pullBack"],
    extras: [SLOTS.pullLats, SLOTS.pullBack],
  },
  legs_glutes: {
    priority: ["squat", "hinge", "lunge"],
    extras: [SLOTS.squat, SLOTS.hinge],
  },
  arms_shoulders: {
    priority: ["biceps", "triceps", "lateralDelts", "pushShoulders"],
    extras: [SLOTS.biceps, SLOTS.triceps, SLOTS.lateralDelts],
  },
  core: { priority: ["core"], extras: [SLOTS.core] },
};

// ---------- Series, repeticiones y descanso ----------
export type Prescription = {
  sets: number;
  repsMin: number;
  repsMax: number;
  restSeconds: number;
};

const rx = (
  sets: number,
  repsMin: number,
  repsMax: number,
  restSeconds: number,
): Prescription => ({ sets, repsMin, repsMax, restSeconds });

export const PRESCRIPTIONS: Record<
  Goal,
  Record<Role, Record<Difficulty, Prescription>>
> = {
  muscle: {
    compound: { beginner: rx(3, 8, 12, 90), intermediate: rx(4, 8, 12, 90), advanced: rx(4, 6, 10, 120) },
    isolation: { beginner: rx(2, 12, 15, 60), intermediate: rx(3, 10, 15, 60), advanced: rx(3, 10, 15, 60) },
    core: { beginner: rx(2, 10, 15, 45), intermediate: rx(3, 10, 15, 45), advanced: rx(3, 10, 15, 45) },
  },
  definition: {
    compound: { beginner: rx(3, 12, 15, 45), intermediate: rx(3, 10, 15, 45), advanced: rx(4, 10, 15, 45) },
    isolation: { beginner: rx(2, 12, 15, 30), intermediate: rx(3, 12, 15, 30), advanced: rx(3, 12, 20, 30) },
    core: { beginner: rx(2, 12, 20, 30), intermediate: rx(3, 12, 20, 30), advanced: rx(3, 12, 20, 30) },
  },
  strength: {
    compound: { beginner: rx(3, 6, 10, 120), intermediate: rx(4, 4, 6, 150), advanced: rx(5, 3, 5, 180) },
    isolation: { beginner: rx(2, 10, 12, 75), intermediate: rx(3, 8, 12, 75), advanced: rx(3, 8, 12, 90) },
    core: { beginner: rx(2, 8, 12, 60), intermediate: rx(3, 8, 12, 60), advanced: rx(3, 8, 12, 60) },
  },
  general_fitness: {
    compound: { beginner: rx(2, 10, 15, 60), intermediate: rx(3, 10, 15, 60), advanced: rx(3, 8, 12, 75) },
    isolation: { beginner: rx(2, 12, 15, 45), intermediate: rx(2, 12, 15, 45), advanced: rx(3, 12, 15, 45) },
    core: { beginner: rx(2, 10, 15, 45), intermediate: rx(3, 10, 15, 45), advanced: rx(3, 10, 15, 45) },
  },
};

// Ejercicios que se miden en segundos y no en repeticiones.
// Si añades en la biblioteca otro ejercicio de aguantar la posición
// (isométrico), su identificador (slug) debe estar en esta lista.
export const TIMED_EXERCISE_SLUGS: readonly string[] = [
  "plancha",
  "plancha-lateral",
  "hollow-hold",
  "sentadilla-isometrica-en-pared",
];
export const TIMED_REPS = { min: 20, max: 40 } as const;

// Material preferido al elegir entre varios ejercicios
export const EQUIPMENT_PREFERENCE = {
  muscle: ["barbell", "dumbbells", "machines", "bodyweight"],
  definition: ["machines", "dumbbells", "bodyweight", "barbell"],
  strength: ["barbell", "dumbbells", "machines", "bodyweight"],
  general_fitness: ["machines", "dumbbells", "bodyweight", "barbell"],
} as const satisfies Record<Goal, readonly string[]>;

// ---------- Zonas a cuidar: ejercicios que se evitan (adaptación general) ----------
// Incluye ejercicios que hoy no entran en el generador (use_in_generator = false):
// así, si se activan más adelante, ya están cubiertos.
export const LIMITATION_EXCLUSIONS: Record<
  Limitation,
  { slugs: readonly string[]; patterns: readonly MovementPattern[] }
> = {
  knees: {
    slugs: [
      "sentadilla-con-barra",
      "extension-de-cuadriceps",
      "extension-de-cuadriceps-a-una-pierna",
      "sentadilla-frontal-con-barra",
      "sentadilla-hack-en-maquina",
      "sentadilla-en-multipower",
      "sentadilla-isometrica-en-pared",
      "sentadilla-sissy",
      "sentadilla-a-una-pierna-a-caja",
      "prensa-de-piernas-a-una-pierna",
      "thruster-con-mancuernas",
      "thruster-con-barra",
      "curl-nordico",
      "sentadilla-con-salto",
    ],
    patterns: ["lunge"],
  },
  lower_back: {
    slugs: [
      "peso-muerto-rumano-mancuernas",
      "peso-muerto-rumano-barra",
      "remo-con-barra",
      "sentadilla-con-barra",
      "peso-muerto-convencional",
      "peso-muerto-sumo",
      "peso-muerto-con-barra-hexagonal",
      "peso-muerto-con-piernas-rigidas",
      "peso-muerto-a-una-pierna-con-mancuerna",
      "buenos-dias-con-barra",
      "hiperextensiones-en-banco-romano",
      "superman-en-suelo",
      "sentadilla-frontal-con-barra",
      "remo-en-t-con-barra",
      "remo-pendlay",
      "remo-con-barra-agarre-supino",
      "remo-con-barra-landmine",
      "remo-con-mancuernas-inclinado",
      "remo-con-peso-muerto-y-mancuernas",
      "swing-con-mancuerna",
      "swing-a-una-mano-con-mancuerna",
      "cargada-de-potencia-con-barra",
      "cargada-colgante-con-barra",
      "arrancada-con-mancuerna",
      "cargada-y-press-con-mancuernas",
      "thruster-con-barra",
      "elevacion-de-gemelos-con-barra",
      "rueda-abdominal",
      "abdominales-en-v",
      "elevacion-de-piernas-colgado",
    ],
    patterns: [],
  },
  shoulders: {
    slugs: [
      "press-militar-mancuernas",
      "press-hombros-maquina",
      "press-inclinado-mancuernas",
      "fondos-en-banco",
      "dominadas",
      "dominadas-supinas",
      "dominadas-agarre-neutro",
      "dominadas-negativas",
      "dominadas-asistidas-en-maquina",
      "fondos-en-paralelas",
      "fondos-asistidos-en-maquina",
      "flexion-en-t",
      "plancha-con-toques-de-hombro",
      "press-de-banca-agarre-cerrado",
      "pullover-con-mancuerna",
      "extension-de-triceps-sobre-la-cabeza-con-mancuerna",
      "extension-de-triceps-sobre-la-cabeza-en-polea",
      "push-press-con-mancuernas",
      "zancada-con-press-de-hombros",
      "thruster-con-mancuernas",
      "thruster-con-barra",
      "man-maker",
      "arrancada-con-mancuerna",
      "cargada-y-press-con-mancuernas",
      "levantamiento-turco",
      "elevacion-de-piernas-colgado",
      "elevacion-de-rodillas-colgado",
    ],
    patterns: [],
  },
  wrists: {
    slugs: [
      "flexiones",
      "plancha",
      "fondos-en-banco",
      "perro-pajaro",
      "plancha-lateral",
      "plancha-con-toques-de-hombro",
      "plancha-con-flexion",
      "escaladores",
      "gusano-inchworm",
      "flexion-en-t",
      "flexiones-diamante",
      "fondos-en-paralelas",
      "fondos-asistidos-en-maquina",
      "gateo-del-oso",
      "rueda-abdominal",
      "burpee",
      "burpee-sin-salto",
      "man-maker",
      "remo-renegado",
      "press-de-banca-agarre-cerrado",
      "press-frances-con-barra-z",
      "press-frances-con-mancuernas",
      "patada-de-gluteo-a-cuatro-patas",
      "curl-de-muneca-con-mancuernas",
      "curl-de-muneca-inverso",
      "paseo-del-granjero",
      "paseo-de-maleta",
      "levantamiento-turco",
    ],
    patterns: [],
  },
  avoid_impact: {
    slugs: [
      "sentadilla-con-salto",
      "burpee",
      "saltos-de-tijera",
      "salto-de-patinador",
      "rodillas-altas",
      "salto-al-cajon",
      "zancada-con-salto",
      "saltos-de-gemelos",
      "escaladores",
    ],
    patterns: [],
  },
};