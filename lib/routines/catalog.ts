import type { SupabaseClient } from "@supabase/supabase-js";
import type { Difficulty, Equipment } from "../exercises";
import type { Focus, Goal } from "../questionnaire";
import { TIMED_EXERCISE_SLUGS } from "./rules";

// ---------- Textos que se añaden al usar una rutina ----------
export const TIMED_NOTE =
  "Las repeticiones son segundos: mantén la posición durante ese tiempo.";

export const CATALOG_GENERAL_NOTES: string[] = [
  "Las series, repeticiones y descansos son orientativos. Elige un peso con el que mantengas una buena técnica.",
  "Estas recomendaciones son generales y no sustituyen el consejo de un profesional.",
];

export const CATALOG_GENERAL_WARNINGS: string[] = [
  "Si tienes una lesión o dolor, consulta con un profesional sanitario antes de entrenar. Estas rutinas son generales.",
];

export function esPorTiempo(slug: string): boolean {
  return TIMED_EXERCISE_SLUGS.includes(slug);
}

// ---------- Tipos ----------
export type CatalogExercise = {
  id: string;
  exerciseId: string;
  slug: string;
  name: string;
  active: boolean;
  sortOrder: number;
  sets: number;
  repsMin: number;
  repsMax: number;
  rest: number;
};

export type CatalogDay = {
  id: string;
  dayNumber: number;
  name: string;
  exercises: CatalogExercise[];
};

export type CatalogRoutine = {
  id: string;
  slug: string;
  name: string;
  description: string;
  goal: Goal;
  focus: Focus;
  level: Difficulty;
  weeks: number;
  equipment: Equipment[];
  notes: string[];
  warnings: string[];
  coverPath: string | null;
  published: boolean;
  sortOrder: number;
  days: CatalogDay[];
  // Ejercicios que no se pueden ver (por ejemplo, porque se han desactivado).
  missing: number;
};

export type CatalogResumen = {
  id: string;
  slug: string;
  name: string;
  description: string;
  goal: Goal;
  level: Difficulty;
  weeks: number;
  coverPath: string | null;
  published: boolean;
  sortOrder: number;
  daysCount: number;
};

// ---------- Consultas ----------
const LISTA_SELECT =
  "id, slug, name, description, goal, level, weeks, cover_path, is_published, sort_order, " +
  "catalog_routine_days(id)";

export const CATALOG_SELECT =
  "id, slug, name, description, goal, focus, level, weeks, equipment, notes, warnings, " +
  "cover_path, is_published, sort_order, " +
  "catalog_routine_days(id, day_number, name, " +
  "catalog_routine_day_exercises(id, sort_order, target_sets, reps_min, reps_max, rest_seconds, " +
  "exercises(id, slug, name, is_active)))";

type FilaEjercicioRef = {
  id: string;
  slug: string;
  name: string;
  is_active: boolean;
};

type FilaDiaEjercicio = {
  id: string;
  sort_order: number;
  target_sets: number;
  reps_min: number;
  reps_max: number;
  rest_seconds: number;
  exercises: FilaEjercicioRef | FilaEjercicioRef[] | null;
};

type FilaDia = {
  id: string;
  day_number: number;
  name: string;
  catalog_routine_day_exercises: FilaDiaEjercicio[] | null;
};

export type FilaRutinaCatalogo = {
  id: string;
  slug: string;
  name: string;
  description: string;
  goal: Goal;
  focus: Focus;
  level: Difficulty;
  weeks: number;
  equipment: Equipment[];
  notes: string[] | null;
  warnings: string[] | null;
  cover_path: string | null;
  is_published: boolean;
  sort_order: number;
  catalog_routine_days: FilaDia[] | null;
};

type FilaResumen = {
  id: string;
  slug: string;
  name: string;
  description: string;
  goal: Goal;
  level: Difficulty;
  weeks: number;
  cover_path: string | null;
  is_published: boolean;
  sort_order: number;
  catalog_routine_days: { id: string }[] | null;
};

function uno<T>(valor: T | T[] | null): T | null {
  return Array.isArray(valor) ? (valor[0] ?? null) : valor;
}

// Convierte lo que devuelve Supabase en una rutina ordenada y fácil de usar.
export function mapearRutinaCatalogo(fila: FilaRutinaCatalogo): CatalogRoutine {
  let missing = 0;

  const days: CatalogDay[] = [...(fila.catalog_routine_days ?? [])]
    .sort((a, b) => a.day_number - b.day_number)
    .map((dia) => {
      const exercises: CatalogExercise[] = [];
      const filas = [...(dia.catalog_routine_day_exercises ?? [])].sort(
        (a, b) => a.sort_order - b.sort_order,
      );
      for (const f of filas) {
        const ejercicio = uno(f.exercises);
        if (!ejercicio) {
          missing += 1;
          continue;
        }
        exercises.push({
          id: f.id,
          exerciseId: ejercicio.id,
          slug: ejercicio.slug,
          name: ejercicio.name,
          active: ejercicio.is_active,
          sortOrder: f.sort_order,
          sets: f.target_sets,
          repsMin: f.reps_min,
          repsMax: f.reps_max,
          rest: f.rest_seconds,
        });
      }
      return { id: dia.id, dayNumber: dia.day_number, name: dia.name, exercises };
    });

  return {
    id: fila.id,
    slug: fila.slug,
    name: fila.name,
    description: fila.description,
    goal: fila.goal,
    focus: fila.focus,
    level: fila.level,
    weeks: fila.weeks,
    equipment: fila.equipment,
    notes: fila.notes ?? [],
    warnings: fila.warnings ?? [],
    coverPath: fila.cover_path,
    published: fila.is_published,
    sortOrder: fila.sort_order,
    days,
    missing,
  };
}

// Lista de rutinas (sin sus ejercicios). Los usuarios solo ven las publicadas.
export async function listarRutinasCatalogo(
  supabase: SupabaseClient,
  opciones: { soloPublicadas: boolean },
): Promise<{ rutinas: CatalogResumen[]; error: boolean }> {
  let consulta = supabase
    .from("catalog_routines")
    .select(LISTA_SELECT)
    .order("sort_order")
    .order("name");
  if (opciones.soloPublicadas) consulta = consulta.eq("is_published", true);

  const { data, error } = await consulta;
  if (error) {
    console.error("[catálogo] error al listar:", error.code ?? "sin código");
    return { rutinas: [], error: true };
  }

  const filas = (data ?? []) as unknown as FilaResumen[];
  return {
    error: false,
    rutinas: filas.map((fila) => ({
      id: fila.id,
      slug: fila.slug,
      name: fila.name,
      description: fila.description,
      goal: fila.goal,
      level: fila.level,
      weeks: fila.weeks,
      coverPath: fila.cover_path,
      published: fila.is_published,
      sortOrder: fila.sort_order,
      daysCount: (fila.catalog_routine_days ?? []).length,
    })),
  };
}

// Una rutina completa, por identificador (slug) o por id.
export async function leerRutinaCatalogo(
  supabase: SupabaseClient,
  filtro: { slug: string } | { id: string },
): Promise<{ rutina: CatalogRoutine | null; error: boolean }> {
  const base = supabase.from("catalog_routines").select(CATALOG_SELECT);
  const { data, error } = await ("slug" in filtro
    ? base.eq("slug", filtro.slug)
    : base.eq("id", filtro.id)
  ).maybeSingle();

  if (error) {
    console.error("[catálogo] error al leer:", error.code ?? "sin código");
    return { rutina: null, error: true };
  }
  if (!data) return { rutina: null, error: false };

  return {
    rutina: mapearRutinaCatalogo(data as unknown as FilaRutinaCatalogo),
    error: false,
  };
}