"use server";

import { redirect } from "next/navigation";
import { createClient } from "../../../lib/supabase/server";

export type EstadoBorrado = { error?: string };

// Elimina tu cuenta y todos tus datos. No se puede deshacer.
export async function eliminarCuenta(
  _estado: EstadoBorrado,
  formData: FormData,
): Promise<EstadoBorrado> {
  const confirmacion = formData.get("confirmacion");
  if (typeof confirmacion !== "string" || confirmacion.trim().toUpperCase() !== "BORRAR") {
    return { error: "Escribe BORRAR (en mayúsculas) para confirmar." };
  }

  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  if (!data?.claims?.sub) {
    return { error: "Tu sesión ha caducado. Vuelve a iniciar sesión." };
  }

  const { error } = await supabase.rpc("delete_my_account");
  if (error) {
    if (error.message.includes("Administrador")) {
      return {
        error: "La cuenta de administrador no se puede eliminar desde aquí.",
      };
    }
    console.error("[perfil] error al eliminar la cuenta:", error.code ?? "sin código");
    return { error: "No se pudo eliminar la cuenta. Inténtalo de nuevo." };
  }

  // La sesión local ya no sirve: se limpia. Si falla, no pasa nada.
  try {
    await supabase.auth.signOut({ scope: "local" });
  } catch {
    // Sin sesión que cerrar.
  }

  redirect("/login?aviso=eliminada");
}