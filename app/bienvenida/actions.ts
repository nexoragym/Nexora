"use server";

import {
  validarRespuestas,
  type OnboardingDraft,
} from "../../lib/questionnaire";
import {
  generateRoutine,
  type GeneratorExercise,
} from "../../lib/routines/generator";
import { rutinaAPayload } from "../../lib/routines/payload";
import { createClient } from "../../lib/supabase/server";

function texto(valor: unknown): string {
  return typeof valor === "string" ? valor : "";
}

function lista(valor: unknown): string[] {
  return Array.isArray(valor)
    ? valor.filter((v): v is string => typeof v === "string")
    : [];
}

const ERROR_GENERICO = "No se pudo crear tu plan. Inténtalo de nuevo.";

// Guarda tus preferencias, genera la rutina con la biblioteca de ejercicios
// y la guarda en tu cuenta de una sola vez.
export async function crearPlanInicial(
  entrada: unknown,
): Promise<{ ok: boolean; error?: string }> {
  const bruto = (
    typeof entrada === "object" && entrada !== null ? entrada : {}
  ) as Record<string, unknown>;

  // Lo que llega del navegador no es de fiar: se vuelve a validar en el servidor.
  const draft: OnboardingDraft = {
    goal: texto(bruto.goal),
    focus: texto(bruto.focus),
    sex: texto(bruto.sex),
    experience: texto(bruto.experience),
    days: texto(bruto.days),
    minutes: texto(bruto.minutes),
    weeks: texto(bruto.weeks),
    equipment: lista(bruto.equipment),
    limitations: lista(bruto.limitations),
  };

  const { values } = validarRespuestas(draft);
  if (!values) {
    return {
      ok: false,
      error: "Tus respuestas no son válidas. Vuelve a hacer el cuestionario.",
    };
  }

  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const userId = data?.claims?.sub;
  if (!userId) {
    return { ok: false, error: "Tu sesión ha caducado. Vuelve a iniciar sesión." };
  }

  const columnas = {
    experience_level: values.experience,
    primary_goal: values.goal,
    days_per_week: values.days,
    session_minutes: values.minutes,
    equipment: values.equipment,
    limitations: values.limitations,
    sex: values.sex ?? null,
    focus: values.focus ?? "balanced",
    program_weeks: values.programWeeks ?? 8,
  };

  // Una fila de preferencias por persona: se actualiza si existe y, si no, se crea.
  const { data: existente, error: errorLectura } = await supabase
    .from("training_preferences")
    .select("user_id")
    .maybeSingle();

  if (errorLectura) {
    console.error("[plan] error al leer preferencias:", errorLectura.code ?? "sin código");
    return { ok: false, error: ERROR_GENERICO };
  }

  const guardado = existente
    ? await supabase
        .from("training_preferences")
        .update(columnas)
        .eq("user_id", userId)
        .select("user_id")
    : await supabase
        .from("training_preferences")
        .insert({ user_id: userId, ...columnas })
        .select("user_id");

  if (guardado.error || !guardado.data || guardado.data.length === 0) {
    console.error("[plan] error al guardar preferencias:", guardado.error?.code ?? "sin filas");
    return { ok: false, error: ERROR_GENERICO };
  }

  // El generador solo ve los ejercicios activos y marcados para rutinas automáticas.
  const { data: ejercicios, error: errorEjercicios } = await supabase
    .from("exercises")
    .select("id, slug, name, primary_muscles, equipment, movement_pattern, difficulty")
    .eq("is_active", true)
    .eq("use_in_generator", true);

  if (errorEjercicios) {
    console.error("[plan] error al leer ejercicios:", errorEjercicios.code ?? "sin código");
    return { ok: false, error: ERROR_GENERICO };
  }

  const rutina = generateRoutine(values, (ejercicios ?? []) as GeneratorExercise[]);

  if (rutina.days.every((dia) => dia.exercises.length === 0)) {
    return {
      ok: false,
      error:
        "No hemos podido preparar ejercicios con tus respuestas. Prueba a elegir más material.",
    };
  }

  const { error: errorRutina } = await supabase.rpc("save_generated_routine", {
    p_routine: rutinaAPayload(rutina),
  });

  if (errorRutina) {
    console.error("[plan] error al guardar la rutina:", errorRutina.code ?? "sin código");
    return { ok: false, error: ERROR_GENERICO };
  }

  return { ok: true };
}