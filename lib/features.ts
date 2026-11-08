import type { SupabaseClient } from "@supabase/supabase-js";

// ¿Puede esta persona construir sus propias rutinas?
// La respuesta la da la base de datos (función can_build_custom_routines).
// Para hacerla Premium solo hay que cambiar esa función en Supabase.
export async function puedeCrearRutinasPersonalizadas(
  supabase: SupabaseClient,
): Promise<boolean> {
  const { data, error } = await supabase.rpc("can_build_custom_routines");
  if (error) {
    console.error("[rutinas propias] no se pudo comprobar el acceso:", error.code ?? "sin código");
    return false;
  }
  return data === true;
}