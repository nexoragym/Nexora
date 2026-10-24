import type { GeneratedRoutine } from "./generator";

// Convierte la rutina generada al formato que espera la función de Supabase.
export function rutinaAPayload(rutina: GeneratedRoutine) {
  return {
    name: rutina.name,
    goal: rutina.goal,
    focus: rutina.focus,
    program_weeks: rutina.programWeeks,
    days_per_week: rutina.sessionsPerWeek,
    notes: rutina.notes,
    warnings: rutina.warnings,
    days: rutina.days.map((dia) => ({
      day_number: dia.dayNumber,
      name: dia.name,
      exercises: dia.exercises.map((ej) => ({
        exercise_id: ej.exerciseId,
        sort_order: ej.sortOrder,
        target_sets: ej.targetSets,
        reps_min: ej.repsMin,
        reps_max: ej.repsMax,
        rest_seconds: ej.restSeconds,
        notes: ej.notes,
      })),
    })),
  };
}