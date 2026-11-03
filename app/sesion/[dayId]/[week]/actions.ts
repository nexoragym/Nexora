"use server";

import { leerRachaActual } from "../../../../lib/racha-servidor";
import { nombreSesion } from "../../../../lib/routines/names";
import { createClient } from "../../../../lib/supabase/server";

const UUID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const ERROR_DATOS = "Los datos no son válidos. Recarga la página.";
const ERROR_GENERICO = "No se pudo completar la operación. Inténtalo de nuevo.";

type RutinaFila = {
  id: string;
  name: string;
  is_active: boolean;
  program_weeks: number | null;
};

// Crea la sesión de entrenamiento cuando pulsas «Empezar».
// Devuelve también la racha que tenías antes de este entrenamiento.
export async function iniciarSesion(
  dayId: unknown,
  week: unknown,
): Promise<{
  ok: boolean;
  error?: string;
  sessionId?: string;
  rachaAntes?: number | null;
}> {
  if (
    typeof dayId !== "string" ||
    !UUID.test(dayId) ||
    typeof week !== "number" ||
    !Number.isInteger(week) ||
    week < 1 ||
    week > 52
  ) {
    return { ok: false, error: ERROR_DATOS };
  }

  const supabase = await createClient();
  const { data: claims } = await supabase.auth.getClaims();
  const userId = claims?.claims?.sub;
  if (!userId) {
    return { ok: false, error: "Tu sesión ha caducado. Vuelve a iniciar sesión." };
  }

  const { data, error } = await supabase
    .from("routine_days")
    .select("id, name, routine_id, routines(id, name, is_active, program_weeks)")
    .eq("id", dayId)
    .maybeSingle();

  if (error) {
    console.error("[sesión] error al leer el día:", error.code ?? "sin código");
    return { ok: false, error: ERROR_GENERICO };
  }

  const dia = data as unknown as {
    id: string;
    name: string;
    routine_id: string;
    routines: RutinaFila | RutinaFila[] | null;
  } | null;
  const rutina = dia
    ? Array.isArray(dia.routines)
      ? (dia.routines[0] ?? null)
      : dia.routines
    : null;

  if (!dia || !rutina || !rutina.is_active) {
    return { ok: false, error: "Este día ya no forma parte de tu rutina activa." };
  }
  if (week > (rutina.program_weeks ?? 1)) {
    return { ok: false, error: ERROR_DATOS };
  }

  // Racha antes de entrenar (si no se puede leer, no se muestra evolución).
  const rachaAntes = await leerRachaActual(supabase);

  const { data: creada, error: errorCrear } = await supabase
    .from("workout_sessions")
    .insert({
      user_id: userId,
      routine_id: rutina.id,
      routine_day_id: dia.id,
      routine_name: rutina.name,
      day_name: nombreSesion(dia.name),
      week_number: week,
    })
    .select("id")
    .single();

  if (errorCrear || !creada) {
    console.error(
      "[sesión] error al crear la sesión:",
      errorCrear?.code ?? "sin código",
    );
    return { ok: false, error: ERROR_GENERICO };
  }

  return { ok: true, sessionId: creada.id as string, rachaAntes };
}

// Guarda una serie terminada (si ya existía, la actualiza).
export async function guardarSerie(
  sessionId: unknown,
  exerciseId: unknown,
  setNumber: unknown,
  weightKg: unknown,
  reps: unknown,
): Promise<{ ok: boolean }> {
  if (
    typeof sessionId !== "string" ||
    !UUID.test(sessionId) ||
    typeof exerciseId !== "string" ||
    !UUID.test(exerciseId) ||
    typeof setNumber !== "number" ||
    !Number.isInteger(setNumber) ||
    setNumber < 1 ||
    setNumber > 50 ||
    typeof weightKg !== "number" ||
    !Number.isFinite(weightKg) ||
    weightKg < 0 ||
    weightKg > 1000 ||
    typeof reps !== "number" ||
    !Number.isInteger(reps) ||
    reps < 0 ||
    reps > 1000
  ) {
    return { ok: false };
  }

  const supabase = await createClient();

  const { data: ejercicio, error: errorEjercicio } = await supabase
    .from("exercises")
    .select("name")
    .eq("id", exerciseId)
    .maybeSingle();

  if (errorEjercicio || !ejercicio) return { ok: false };

  const peso = Math.round(weightKg * 100) / 100;

  const { error } = await supabase.from("workout_sets").insert({
    session_id: sessionId,
    exercise_id: exerciseId,
    exercise_name: ejercicio.name as string,
    set_number: setNumber,
    weight_kg: peso,
    reps,
    is_completed: true,
  });

  if (!error) return { ok: true };

  // Si la serie ya estaba guardada, se actualiza.
  if (error.code === "23505") {
    const { error: errorActualizar } = await supabase
      .from("workout_sets")
      .update({ weight_kg: peso, reps, is_completed: true })
      .eq("session_id", sessionId)
      .eq("exercise_id", exerciseId)
      .eq("set_number", setNumber);
    return { ok: !errorActualizar };
  }

  console.error("[sesión] error al guardar la serie:", error.code ?? "sin código");
  return { ok: false };
}

// Cierra la sesión: completada (terminaste) o abandonada (saliste antes).
export async function terminarSesion(
  sessionId: unknown,
  estado: unknown,
): Promise<{ ok: boolean }> {
  if (
    typeof sessionId !== "string" ||
    !UUID.test(sessionId) ||
    (estado !== "completed" && estado !== "abandoned")
  ) {
    return { ok: false };
  }

  const supabase = await createClient();

  const { data: sesion, error } = await supabase
    .from("workout_sessions")
    .select("started_at, status")
    .eq("id", sessionId)
    .maybeSingle();

  if (error || !sesion) return { ok: false };
  if (sesion.status === "completed" || sesion.status === "abandoned") {
    return { ok: true };
  }

  // La hora de fin nunca puede ser anterior a la de inicio.
  const minimo = Date.parse(sesion.started_at as string) + 1000;
  const fin = new Date(Math.max(Date.now(), minimo)).toISOString();

  const { error: errorCerrar } = await supabase
    .from("workout_sessions")
    .update({ status: estado, ended_at: fin })
    .eq("id", sessionId);

  if (errorCerrar) {
    console.error("[sesión] error al cerrar:", errorCerrar.code ?? "sin código");
    return { ok: false };
  }
  return { ok: true };
}

// Racha actual (se usa al terminar el entrenamiento, para ver si cambias de etapa).
export async function rachaActual(): Promise<{ ok: boolean; racha?: number }> {
  const supabase = await createClient();
  const racha = await leerRachaActual(supabase);
  return racha === null ? { ok: false } : { ok: true, racha };
}