import type { SupabaseClient } from "@supabase/supabase-js";
import { calcularRacha, hoyEnZona, ZONA_HORARIA } from "./stats";

type FilaStats = { training_days: string[] | null };

// Racha actual de la persona que hace la petición (null si no se pudo leer).
export async function leerRachaActual(
  supabase: SupabaseClient,
): Promise<number | null> {
  const { data, error } = await supabase.rpc("get_my_stats", {
    p_timezone: ZONA_HORARIA,
  });
  if (error) {
    console.error("[racha] error al leer estadísticas:", error.code ?? "sin código");
    return null;
  }
  const fila = ((data as unknown as FilaStats[] | null) ?? [])[0];
  return calcularRacha(fila?.training_days ?? [], hoyEnZona());
}