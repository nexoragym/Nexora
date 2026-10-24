// Rutina activa con sus días y ejercicios, tal como la devuelve Supabase.
export const ACTIVE_ROUTINE_SELECT =
  "id, name, goal, focus, program_weeks, days_per_week, start_date, notes, warnings, " +
  "routine_days(id, day_number, name, " +
  "routine_day_exercises(id, sort_order, target_sets, reps_min, reps_max, rest_seconds, notes, " +
  "exercises(id, slug, name)))";

export type ActiveRoutineExercise = {
  id: string;
  sort_order: number;
  target_sets: number;
  reps_min: number;
  reps_max: number;
  rest_seconds: number;
  notes: string | null;
  exercises: { id: string; slug: string; name: string } | null;
};

export type ActiveRoutineDay = {
  id: string;
  day_number: number;
  name: string;
  routine_day_exercises: ActiveRoutineExercise[];
};

export type ActiveRoutine = {
  id: string;
  name: string;
  goal: string | null;
  focus: string | null;
  program_weeks: number | null;
  days_per_week: number | null;
  start_date: string;
  notes: string[];
  warnings: string[];
  routine_days: ActiveRoutineDay[];
};