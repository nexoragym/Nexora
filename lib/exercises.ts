export const MUSCLES = [
  "chest",
  "upper_back",
  "lats",
  "lower_back",
  "traps",
  "shoulders",
  "biceps",
  "triceps",
  "forearms",
  "abs",
  "quadriceps",
  "hamstrings",
  "glutes",
  "calves",
] as const;
export type Muscle = (typeof MUSCLES)[number];

export const EQUIPMENT = ["bodyweight", "dumbbells", "barbell", "machines"] as const;
export type Equipment = (typeof EQUIPMENT)[number];

export const DIFFICULTIES = ["beginner", "intermediate", "advanced"] as const;
export type Difficulty = (typeof DIFFICULTIES)[number];

export const MOVEMENT_PATTERNS = [
  "push",
  "pull",
  "squat",
  "hinge",
  "lunge",
  "core",
  "isolation",
] as const;
export type MovementPattern = (typeof MOVEMENT_PATTERNS)[number];

export const MUSCLE_LABELS: Record<Muscle, string> = {
  chest: "Pecho",
  upper_back: "Espalda alta",
  lats: "Dorsales",
  lower_back: "Zona lumbar",
  traps: "Trapecios",
  shoulders: "Hombros",
  biceps: "Bíceps",
  triceps: "Tríceps",
  forearms: "Antebrazos",
  abs: "Abdomen",
  quadriceps: "Cuádriceps",
  hamstrings: "Isquiotibiales",
  glutes: "Glúteos",
  calves: "Gemelos",
};

export const EQUIPMENT_LABELS: Record<Equipment, string> = {
  bodyweight: "Peso corporal",
  dumbbells: "Mancuernas",
  barbell: "Barra",
  machines: "Máquinas",
};

export const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  beginner: "Principiante",
  intermediate: "Intermedio",
  advanced: "Avanzado",
};

export const MOVEMENT_LABELS: Record<MovementPattern, string> = {
  push: "Empuje",
  pull: "Tirón",
  squat: "Sentadilla",
  hinge: "Bisagra de cadera",
  lunge: "Zancada",
  core: "Core",
  isolation: "Aislamiento",
};

export type Exercise = {
  id: string;
  slug: string;
  name: string;
  primary_muscles: Muscle[];
  secondary_muscles: Muscle[];
  equipment: Equipment;
  movement_pattern: MovementPattern;
  difficulty: Difficulty;
  instructions: string[];
  common_mistakes: string[];
};

export type ExerciseFilters = {
  q: string;
  muscle: Muscle | "";
  equipment: Equipment | "";
  difficulty: Difficulty | "";
};

type SearchParams = Record<string, string | string[] | undefined>;

function primerValor(valor: string | string[] | undefined): string {
  if (Array.isArray(valor)) return valor[0] ?? "";
  return valor ?? "";
}

// Devuelve el valor solo si está en la lista permitida; si no, cadena vacía.
function soloSiPermitido<T extends string>(
  permitidos: readonly T[],
  valor: string,
): T | "" {
  return (permitidos as readonly string[]).includes(valor) ? (valor as T) : "";
}

// Lee y valida los filtros que vienen en la dirección de la página.
export function leerFiltros(params: SearchParams): ExerciseFilters {
  return {
    q: primerValor(params.q).trim().slice(0, 50),
    muscle: soloSiPermitido(MUSCLES, primerValor(params.musculo)),
    equipment: soloSiPermitido(EQUIPMENT, primerValor(params.material)),
    difficulty: soloSiPermitido(DIFFICULTIES, primerValor(params.nivel)),
  };
}

// Evita que los símbolos % y _ del buscador se tomen como comodines.
export function escaparBusqueda(texto: string): string {
  return texto.replace(/[\\%_]/g, "\\$&");
}

export const MUSCLE_OPTIONS = MUSCLES.map((valor) => ({
  value: valor,
  label: MUSCLE_LABELS[valor],
}));

export const EQUIPMENT_OPTIONS = EQUIPMENT.map((valor) => ({
  value: valor,
  label: EQUIPMENT_LABELS[valor],
}));

export const DIFFICULTY_OPTIONS = DIFFICULTIES.map((valor) => ({
  value: valor,
  label: DIFFICULTY_LABELS[valor],
}));