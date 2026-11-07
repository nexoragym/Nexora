import type { Difficulty } from "../exercises";
import type { Goal } from "../questionnaire";
import {
  PRESCRIPTIONS,
  SECONDS_PER_SET,
  TIMED_EXERCISE_SLUGS,
  TIMED_REPS,
  TRANSITION_MINUTES,
  WARMUP_MINUTES,
  type Prescription,
  type Slot,
} from "./rules";
import type { GeneratedExercise, GeneratorExercise } from "./types";

// ---------- Tiempos ----------
export function estimateExerciseMinutes(sets: number, restSeconds: number): number {
  return (sets * (SECONDS_PER_SET + restSeconds)) / 60 + TRANSITION_MINUTES;
}

export function estimateDayMinutes(exercises: readonly GeneratedExercise[]): number {
  return (
    WARMUP_MINUTES +
    exercises.reduce(
      (total, e) => total + estimateExerciseMinutes(e.targetSets, e.restSeconds),
      0,
    )
  );
}

// ---------- Series, repeticiones y descanso ----------
// "intento" sube solo si no caben los ejercicios en el tiempo:
// 1 y 2 quitan una serie cada vez; 3 limita además el descanso a 90 segundos.
export function prescripcion(
  hueco: Slot,
  ejercicio: GeneratorExercise,
  objetivo: Goal,
  nivel: Difficulty,
  intento: number,
): Prescription {
  const base = PRESCRIPTIONS[objetivo][hueco.role][nivel];
  const series = Math.max(2, base.sets - Math.min(intento, 2));
  const descanso = intento >= 3 ? Math.min(base.restSeconds, 90) : base.restSeconds;

  if (TIMED_EXERCISE_SLUGS.includes(ejercicio.slug)) {
    return {
      sets: series,
      repsMin: TIMED_REPS.min,
      repsMax: TIMED_REPS.max,
      restSeconds: descanso,
    };
  }
  return {
    sets: series,
    repsMin: base.repsMin,
    repsMax: base.repsMax,
    restSeconds: descanso,
  };
}