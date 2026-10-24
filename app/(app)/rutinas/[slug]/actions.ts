"use server";

import { revalidatePath } from "next/cache";
import {
  buscarRutinaCatalogo,
  CATALOG_GENERAL_NOTES,
  CATALOG_GENERAL_WARNINGS,
  esPorTiempo,
  TIMED_NOTE,
} from "../../../../lib/routines/catalog";
import { createClient } from "../../../../lib/supabase/server";

const ERROR_GENERICO = "No se pudo guardar la rutina. Inténtalo de nuevo.";
const ERROR_DATOS =
  "La rutina no es válida. Recarga la página e inténtalo de nuevo.";

// Guarda una rutina del catálogo como tu rutina activa.
export async function usarRutinaCatalogo(
  slug: unknown,
): Promise<{ ok: boolean; error?: string; firstDayId?: string }> {
  if (typeof slug !== "string") return { ok: false, error: ERROR_DATOS };

  const rutina = buscarRutinaCatalogo(slug);
  if (!rutina) return { ok: false, error: ERROR_DATOS };

  const supabase = await createClient();
  const { data: claims } = await supabase.auth.getClaims();
  if (!claims?.claims?.sub) {
    return { ok: false, error: "Tu sesión ha caducado. Vuelve a iniciar sesión." };
  }

  const slugs = Array.from(
    new Set(rutina.days.flatMap((dia) => dia.exercises.map((e) => e.slug))),
  );

  const { data: filas, error: errorLectura } = await supabase
    .from("exercises")
    .select("id, slug")
    .eq("is_active", true)
    .in("slug", slugs);

  if (errorLectura) {
    console.error(
      "[rutina estándar] error al leer ejercicios:",
      errorLectura.code ?? "sin código",
    );
    return { ok: false, error: ERROR_GENERICO };
  }

  const ids = new Map(
    ((filas ?? []) as { id: string; slug: string }[]).map(
      (fila) => [fila.slug, fila.id] as const,
    ),
  );

  if (slugs.some((s) => !ids.has(s))) {
    return {
      ok: false,
      error: "Falta algún ejercicio de esta rutina en la biblioteca.",
    };
  }

  const payload = {
    name: rutina.name,
    source: "standard",
    catalog_slug: rutina.slug,
    goal: rutina.goal,
    focus: rutina.focus,
    program_weeks: rutina.weeks,
    days_per_week: rutina.days.length,
    notes: [...rutina.notes, ...CATALOG_GENERAL_NOTES],
    warnings: [...rutina.warnings, ...CATALOG_GENERAL_WARNINGS],
    days: rutina.days.map((dia, i) => ({
      day_number: i + 1,
      name: dia.name,
      exercises: dia.exercises.map((e, j) => ({
        exercise_id: ids.get(e.slug),
        sort_order: j + 1,
        target_sets: e.sets,
        reps_min: e.repsMin,
        reps_max: e.repsMax,
        rest_seconds: e.rest,
        notes: esPorTiempo(e.slug) ? TIMED_NOTE : null,
      })),
    })),
  };

  const { data: routineId, error: errorGuardado } = await supabase.rpc(
    "save_generated_routine",
    { p_routine: payload },
  );

  if (errorGuardado || typeof routineId !== "string") {
    console.error(
      "[rutina estándar] error al guardar:",
      errorGuardado?.code ?? "sin código",
    );
    return { ok: false, error: ERROR_GENERICO };
  }

  const { data: primerDia } = await supabase
    .from("routine_days")
    .select("id")
    .eq("routine_id", routineId)
    .eq("day_number", 1)
    .maybeSingle();
  const firstDayId: string | undefined = primerDia?.id ?? undefined;

  revalidatePath("/entrenar");
  revalidatePath("/dashboard");
  revalidatePath("/rutinas");

  return { ok: true, firstDayId };
}