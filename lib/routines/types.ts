import type { Exercise } from "../exercises";
import type { Focus, Goal } from "../questionnaire";

// Lo que el generador necesita saber de cada ejercicio de la biblioteca.
export type GeneratorExercise = Pick<
  Exercise,
  | "id"
  | "slug"
  | "name"
  | "primary_muscles"
  | "equipment"
  | "movement_pattern"
  | "difficulty"
> & {
  // 0 normal, 3 muy conocido. Si no viene, cuenta como 0.
  popularity?: number | null;
};

export type GeneratedExercise = {
  exerciseId: string;
  exerciseSlug: string;
  exerciseName: string;
  sortOrder: number;
  targetSets: number;
  repsMin: number;
  repsMax: number;
  restSeconds: number;
  notes: string | null;
};

export type GeneratedDay = {
  dayNumber: number;
  name: string;
  exercises: GeneratedExercise[];
};

export type GeneratedRoutine = {
  name: string;
  goal: Goal;
  focus: Focus;
  programWeeks: number;
  sessionsPerWeek: number;
  days: GeneratedDay[];
  notes: string[];
  warnings: string[];
};