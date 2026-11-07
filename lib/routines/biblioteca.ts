import type { SupabaseClient } from "@supabase/supabase-js";
import type { GeneratorExercise } from "./types";

const COLUMNAS =
  "id, slug, name, primary_muscles, equipment, movement_pattern, difficulty, popularity";

// Supabase devuelve como mucho 1.000 filas por consulta: se lee por páginas.
const TAM_PAGINA = 1000;

// Todos los ejercicios que puede usar el generador (activos y marcados para rutinas automáticas).
export async function leerBibliotecaGenerador(
  supabase: SupabaseClient,
): Promise<{ ejercicios: GeneratorExercise[]; error: boolean }> {
  const ejercicios: GeneratorExercise[] = [];

  for (let desde = 0; ; desde += TAM_PAGINA) {
    const { data, error } = await supabase
      .from("exercises")
      .select(COLUMNAS)
      .eq("is_active", true)
      .eq("use_in_generator", true)
      .order("slug")
      .range(desde, desde + TAM_PAGINA - 1);

    if (error) {
      console.error("[generador] error al leer ejercicios:", error.code ?? "sin código");
      return { ejercicios: [], error: true };
    }

    const lote = (data ?? []) as unknown as GeneratorExercise[];
    ejercicios.push(...lote);
    if (lote.length < TAM_PAGINA) break;
  }

  return { ejercicios, error: false };
}