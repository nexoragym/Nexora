import {
  DIFFICULTIES,
  EQUIPMENT,
  type Difficulty,
  type Equipment,
} from "./exercises";

// Clave donde se guardan las respuestas en el navegador hasta crear la cuenta.
export const ONBOARDING_STORAGE_KEY = "nexora:onboarding:v1";

export const GOALS = ["muscle", "definition", "strength", "general_fitness"] as const;
export type Goal = (typeof GOALS)[number];

export const FOCUSES = [
  "balanced",
  "chest",
  "back",
  "legs_glutes",
  "arms_shoulders",
  "core",
] as const;
export type Focus = (typeof FOCUSES)[number];

export const SEXES = ["male", "female"] as const;
export type Sex = (typeof SEXES)[number];

export const LIMITATIONS = [
  "knees",
  "lower_back",
  "shoulders",
  "wrists",
  "avoid_impact",
] as const;
export type Limitation = (typeof LIMITATIONS)[number];

export const DAYS = [1, 2, 3, 4, 5, 6, 7] as const;
export const MINUTES = [30, 45, 60, 90] as const;
export const PROGRAM_WEEKS = [4, 8, 12] as const;

export const GOAL_LABELS: Record<Goal, string> = {
  muscle: "Ganar masa muscular",
  definition: "Definir y perder grasa",
  strength: "Ganar fuerza",
  general_fitness: "Mejorar mi condición física",
};

export const GOAL_DESCRIPTIONS: Record<Goal, string> = {
  muscle: "Aumentar el tamaño de tus músculos.",
  definition:
    "Marcar más tu musculatura y reducir grasa. La alimentación influye mucho.",
  strength: "Poder levantar cada vez más peso.",
  general_fitness: "Estar en forma y moverte mejor en el día a día.",
};

export const FOCUS_LABELS: Record<Focus, string> = {
  balanced: "Todo el cuerpo",
  chest: "Pecho",
  back: "Espalda",
  legs_glutes: "Piernas y glúteos",
  arms_shoulders: "Brazos y hombros",
  core: "Abdomen",
};

export const FOCUS_DESCRIPTIONS: Record<Focus, string> = {
  balanced: "Un programa equilibrado, sin zona prioritaria.",
  chest: "Más trabajo de pecho.",
  back: "Más trabajo de espalda.",
  legs_glutes: "Más trabajo de piernas y glúteos.",
  arms_shoulders: "Más trabajo de brazos y hombros.",
  core: "Más trabajo de abdomen.",
};

export const SEX_LABELS: Record<Sex, string> = {
  male: "Hombre",
  female: "Mujer",
};

export const EXPERIENCE_DESCRIPTIONS: Record<Difficulty, string> = {
  beginner: "Estoy empezando o llevo menos de 6 meses.",
  intermediate: "Entreno con regularidad desde hace entre 6 meses y 2 años.",
  advanced: "Llevo más de 2 años entrenando con constancia.",
};

export const LIMITATION_LABELS: Record<Limitation, string> = {
  knees: "Rodillas",
  lower_back: "Zona lumbar",
  shoulders: "Hombros",
  wrists: "Muñecas",
  avoid_impact: "Evitar ejercicios de impacto",
};

export const PROGRAM_WEEKS_LABELS: Record<(typeof PROGRAM_WEEKS)[number], string> = {
  4: "4 semanas (1 mes)",
  8: "8 semanas (2 meses)",
  12: "12 semanas (unos 90 días)",
};

export const DAYS_OPTIONS = DAYS.map((dias) => ({
  value: String(dias),
  label: dias === 1 ? "1 día" : `${dias} días`,
}));

const MINUTES_LABELS: Record<(typeof MINUTES)[number], string> = {
  30: "30 minutos",
  45: "45 minutos",
  60: "1 hora",
  90: "1 hora y 30 minutos",
};

export const MINUTES_OPTIONS = MINUTES.map((minutos) => ({
  value: String(minutos),
  label: MINUTES_LABELS[minutos],
}));

// Lo que se recoge en el onboarding: siempre texto.
export type OnboardingDraft = {
  goal: string;
  focus: string;
  sex: string;
  experience: string;
  days: string;
  minutes: string;
  weeks: string;
  equipment: string[];
  limitations: string[];
};

export const BORRADOR_VACIO: OnboardingDraft = {
  goal: "",
  focus: "",
  sex: "",
  experience: "",
  days: "",
  minutes: "",
  weeks: "",
  equipment: [],
  limitations: [],
};

// Lo que usa el generador y se guarda en la base de datos, ya validado.
export type QuestionnaireValues = {
  experience: Difficulty;
  goal: Goal;
  days: number;
  minutes: number;
  equipment: Equipment[];
  limitations: Limitation[];
  sex?: Sex | null;
  focus?: Focus;
  programWeeks?: number;
};

export type DraftErrors = {
  goal?: string;
  focus?: string;
  experience?: string;
  days?: string;
  minutes?: string;
  weeks?: string;
  equipment?: string;
};

function esDe<T extends string>(lista: readonly T[], valor: string): valor is T {
  return (lista as readonly string[]).includes(valor);
}

// Comprueba las respuestas. Si todo es correcto, devuelve "values".
export function validarRespuestas(draft: OnboardingDraft): {
  values?: QuestionnaireValues;
  errors: DraftErrors;
} {
  const errors: DraftErrors = {};

  const goal = esDe(GOALS, draft.goal) ? draft.goal : null;
  const focus = esDe(FOCUSES, draft.focus) ? draft.focus : null;
  const experience = esDe(DIFFICULTIES, draft.experience)
    ? draft.experience
    : null;

  const numeroDias = Number(draft.days);
  const days =
    Number.isInteger(numeroDias) && numeroDias >= 1 && numeroDias <= 7
      ? numeroDias
      : null;

  const numeroMinutos = Number(draft.minutes);
  const minutes = (MINUTES as readonly number[]).includes(numeroMinutos)
    ? numeroMinutos
    : null;

  const numeroSemanas = Number(draft.weeks);
  const programWeeks = (PROGRAM_WEEKS as readonly number[]).includes(numeroSemanas)
    ? numeroSemanas
    : null;

  const equipment = Array.from(
    new Set(
      draft.equipment.filter((valor): valor is Equipment =>
        esDe(EQUIPMENT, valor),
      ),
    ),
  );
  const limitations = Array.from(
    new Set(
      draft.limitations.filter((valor): valor is Limitation =>
        esDe(LIMITATIONS, valor),
      ),
    ),
  );
  const sex: Sex | null = esDe(SEXES, draft.sex) ? draft.sex : null;

  if (!goal) errors.goal = "Elige tu objetivo.";
  if (!focus) errors.focus = "Elige un enfoque.";
  if (!experience) errors.experience = "Elige tu nivel de experiencia.";
  if (days === null) errors.days = "Elige cuántos días puedes entrenar.";
  if (minutes === null) errors.minutes = "Elige la duración de tus sesiones.";
  if (programWeeks === null) errors.weeks = "Elige la duración del programa.";
  if (equipment.length === 0) errors.equipment = "Elige al menos un tipo de material.";

  if (
    !goal ||
    !focus ||
    !experience ||
    days === null ||
    minutes === null ||
    programWeeks === null ||
    equipment.length === 0
  ) {
    return { errors };
  }

  return {
    errors,
    values: {
      experience,
      goal,
      days,
      minutes,
      equipment,
      limitations,
      sex,
      focus,
      programWeeks,
    },
  };
}