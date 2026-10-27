import { notFound, redirect } from "next/navigation";
import { connection } from "next/server";
import { Alert } from "../../../../components/ui/Alert";
import { urlPublicaMedia } from "../../../../lib/media";
import { nombreSesion } from "../../../../lib/routines/names";
import { TIMED_EXERCISE_SLUGS } from "../../../../lib/routines/rules";
import { createClient } from "../../../../lib/supabase/server";
import type { SessionExercise, SessionInfo } from "./types";
import { WorkoutPlayer } from "./WorkoutPlayer";

const UUID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const SELECT =
  "id, day_number, name, " +
  "routines(id, name, is_active, program_weeks, days_per_week), " +
  "routine_day_exercises(id, sort_order, target_sets, reps_min, reps_max, rest_seconds, " +
  "exercises(id, slug, name, equipment, instructions, image_path, video_path))";

type FilaEjercicio = {
  id: string;
  sort_order: number;
  target_sets: number;
  reps_min: number;
  reps_max: number;
  rest_seconds: number;
  exercises: {
    id: string;
    slug: string;
    name: string;
    equipment: string;
    instructions: string[];
    image_path: string | null;
    video_path: string | null;
  } | null;
};

type FilaRutina = {
  id: string;
  name: string;
  is_active: boolean;
  program_weeks: number | null;
  days_per_week: number | null;
};

type FilaDia = {
  id: string;
  day_number: number;
  name: string;
  routines: FilaRutina | FilaRutina[] | null;
  routine_day_exercises: FilaEjercicio[];
};

type SessionLoaderProps = {
  params: Promise<{ dayId: string; week: string }>;
};

export async function SessionLoader({ params }: SessionLoaderProps) {
  await connection();

  const { dayId, week } = await params;
  const semana = Number(week);
  if (!UUID.test(dayId) || !Number.isInteger(semana) || semana < 1 || semana > 52) {
    notFound();
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("routine_days")
    .select(SELECT)
    .eq("id", dayId)
    .maybeSingle();

  if (error) {
    console.error("[sesión] error de Supabase:", error.code ?? "sin código");
    return (
      <div className="mx-auto w-full max-w-xl p-4">
        <Alert tone="danger" title="No se pudo cargar el entrenamiento">
          Inténtalo de nuevo en unos instantes.
        </Alert>
      </div>
    );
  }

  const dia = (data as unknown as FilaDia | null) ?? null;
  if (!dia) {
    notFound();
  }

  const rutina = Array.isArray(dia.routines)
    ? (dia.routines[0] ?? null)
    : dia.routines;
  if (!rutina || !rutina.is_active) {
    redirect("/entrenar");
  }

  const totalSemanas = rutina.program_weeks ?? 1;
  if (semana > totalSemanas) {
    notFound();
  }

  const ejercicios: SessionExercise[] = [...dia.routine_day_exercises]
    .sort((a, b) => a.sort_order - b.sort_order)
    .flatMap((fila) =>
      fila.exercises
        ? [
            {
              exerciseId: fila.exercises.id,
              slug: fila.exercises.slug,
              name: fila.exercises.name,
              equipment: fila.exercises.equipment,
              instructions: fila.exercises.instructions ?? [],
              sets: fila.target_sets,
              repsMin: fila.reps_min,
              repsMax: fila.reps_max,
              restSeconds: fila.rest_seconds,
              timed: TIMED_EXERCISE_SLUGS.includes(fila.exercises.slug),
              lastWeightKg: null,
              imageUrl: urlPublicaMedia(fila.exercises.image_path),
              videoUrl: urlPublicaMedia(fila.exercises.video_path),
            },
          ]
        : [],
    );

  if (ejercicios.length === 0) {
    return (
      <div className="mx-auto w-full max-w-xl p-4">
        <Alert tone="warning" title="Este día no tiene ejercicios">
          Vuelve a Entrenar y elige otro día.
        </Alert>
      </div>
    );
  }

  // Último peso que usaste en cada ejercicio, para ponerlo ya relleno.
  const ultimos = new Map<string, number>();
  const { data: previas } = await supabase
    .from("workout_sets")
    .select("exercise_id, weight_kg")
    .in(
      "exercise_id",
      ejercicios.map((e) => e.exerciseId),
    )
    .eq("is_completed", true)
    .order("created_at", { ascending: false })
    .limit(300);

  for (const fila of (previas ?? []) as {
    exercise_id: string;
    weight_kg: number | string | null;
  }[]) {
    if (ultimos.has(fila.exercise_id) || fila.weight_kg === null) continue;
    const kg = Number(fila.weight_kg);
    if (Number.isFinite(kg)) ultimos.set(fila.exercise_id, kg);
  }

  const info: SessionInfo = {
    routineId: rutina.id,
    routineName: rutina.name,
    dayId: dia.id,
    dayName: nombreSesion(dia.name),
    dayNumber:
      (semana - 1) * (rutina.days_per_week ?? dia.day_number) + dia.day_number,
    week: semana,
    totalWeeks: totalSemanas,
    exercises: ejercicios.map((e) => ({
      ...e,
      lastWeightKg: ultimos.get(e.exerciseId) ?? null,
    })),
  };

  return <WorkoutPlayer data={info} />;
}