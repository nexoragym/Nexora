import type { SupabaseClient } from "@supabase/supabase-js";
import { notFound } from "next/navigation";
import { createClient } from "../supabase/server";

// ¿Quien hace la petición es superadministrador? La respuesta la da la base de datos.
export async function esSuperadmin(supabase: SupabaseClient): Promise<boolean> {
  const { data, error } = await supabase.rpc("is_superadmin");
  return !error && data === true;
}

// Para las páginas del panel: si no eres superadministrador, la página "no existe".
export async function exigirSuperadmin(): Promise<SupabaseClient> {
  const supabase = await createClient();
  if (!(await esSuperadmin(supabase))) {
    notFound();
  }
  return supabase;
}