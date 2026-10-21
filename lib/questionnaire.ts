import {
  DIFFICULTIES,
  EQUIPMENT,
  type Difficulty,
  type Equipment,
} from "./exercises";

export const GOALS = ["muscle", "strength", "general_fitness"] as const;
export type Goal = (typeof GOALS)[number];

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

export const GOAL_LABELS: Record<Goal, string> = {
  muscle: "Ganar músculo",
  strength: "Ganar fuerza",
  general_fitness: "Mejorar mi condición física",
};

export const GOAL_DESCRIPTIONS: Record<Goal, string> = {
  muscle: "Aumentar el tamaño de tus músculos.",
  strength: "Poder levantar cada vez más peso.",
  general_fitness: "Estar en forma y moverte mejor en el día a día.",
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

// Lo que llega del formulario: siempre texto.
export type QuestionnaireDraft = {
  experience: string;
  goal: string;
  days: string;
  minutes: string;
  equipment: string[];
  limitations: string[];
};

export const BORRADOR_VACIO: QuestionnaireDraft = {
  experience: "",
  goal: "",
  days: "",
  minutes: "",
  equipment: [],
  limitations: [],
};

// Lo que se guarda en la base de datos, ya validado.
export type QuestionnaireValues = {
  experience: Difficulty;
  goal: Goal;
  days: number;
  minutes: number;
  equipment: Equipment[];
  limitations: Limitation[];
};

export type QuestionnaireFieldErrors = {
  experience?: string;
  goal?: string;
  days?: string;
  minutes?: string;
  equipment?: string;
};

export type QuestionnaireFormState = {
  ok?: boolean;
  error?: string;
  draft?: QuestionnaireDraft;
  fieldErrors?: QuestionnaireFieldErrors;
};

function esDe<T extends string>(lista: readonly T[], valor: string): valor is T {
  return (lista as readonly string[]).includes(valor);
}

// Comprueba las respuestas. Si todo es correcto, devuelve "values".
export function validarCuestionario(draft: QuestionnaireDraft): {
  values?: QuestionnaireValues;
  fieldErrors: QuestionnaireFieldErrors;
} {
  const fieldErrors: QuestionnaireFieldErrors = {};

  const experience = esDe(DIFFICULTIES, draft.experience)
    ? draft.experience
    : null;
  const goal = esDe(GOALS, draft.goal) ? draft.goal : null;

  const numeroDias = Number(draft.days);
  const days =
    Number.isInteger(numeroDias) && numeroDias >= 1 && numeroDias <= 7
      ? numeroDias
      : null;

  const numeroMinutos = Number(draft.minutes);
  const minutes = (MINUTES as readonly number[]).includes(numeroMinutos)
    ? numeroMinutos
    : null;

  const equipment = Array.from(
    new Set(draft.equipment.filter((valor): valor is Equipment => esDe(EQUIPMENT, valor))),
  );
  const limitations = Array.from(
    new Set(
      draft.limitations.filter((valor): valor is Limitation =>
        esDe(LIMITATIONS, valor),
      ),
    ),
  );

  if (!experience) fieldErrors.experience = "Elige tu nivel de experiencia.";
  if (!goal) fieldErrors.goal = "Elige tu objetivo principal.";
  if (days === null) fieldErrors.days = "Elige cuántos días puedes entrenar.";
  if (minutes === null) fieldErrors.minutes = "Elige la duración de tus sesiones.";
  if (equipment.length === 0) {
    fieldErrors.equipment = "Elige al menos un tipo de material.";
  }

  if (
    !experience ||
    !goal ||
    days === null ||
    minutes === null ||
    equipment.length === 0
  ) {
    return { fieldErrors };
  }

  return {
    fieldErrors,
    values: { experience, goal, days, minutes, equipment, limitations },
  };
}

// Fila de la base de datos -> texto para rellenar el formulario.
export type PreferencesRow = {
  experience_level: string;
  primary_goal: string;
  days_per_week: number;
  session_minutes: number;
  equipment: string[] | null;
  limitations: string[] | null;
};

export function filaABorrador(
  fila: PreferencesRow | null,
): QuestionnaireDraft {
  if (!fila) return BORRADOR_VACIO;
  return {
    experience: fila.experience_level,
    goal: fila.primary_goal,
    days: String(fila.days_per_week),
    minutes: String(fila.session_minutes),
    equipment: fila.equipment ?? [],
    limitations: fila.limitations ?? [],
  };
}