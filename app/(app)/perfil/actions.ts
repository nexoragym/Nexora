"use server";

import { validarNombre, type ProfileFormState } from "../../../lib/profile";
import { createClient } from "../../../lib/supabase/server";

export async function guardarNombre(
  _estado: ProfileFormState,
  formData: FormData,
): Promise<ProfileFormState> {
  const valor = formData.get("nombre");
  const crudo = typeof valor === "string" ? valor : "";

  const resultado = validarNombre(crudo);
  if (resultado.error) {
    return { error: resultado.error, nombre: crudo };
  }

  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const userId = data?.claims?.sub;

  if (!userId) {
    return { error: "Tu sesión ha caducado. Vuelve a iniciar sesión.", nombre: crudo };
  }

  const { data: filas, error } = await supabase
    .from("profiles")
    .update({ display_name: resultado.nombre })
    .eq("id", userId)
    .select("id");

  if (error || !filas || filas.length === 0) {
    // El código del error no contiene datos personales y ayuda a diagnosticar.
    console.error("[perfil] error de Supabase:", error?.code ?? "sin filas");
    return {
      error: "No se pudo guardar el nombre. Inténtalo de nuevo.",
      nombre: crudo,
    };
  }

  return { ok: true, nombre: resultado.nombre ?? "" };
}