"use server";

import type { SupabaseClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";
import { esSuperadmin } from "../../../../lib/admin/guard";
import {
  BUCKET_MEDIA,
  esTipoMedia,
  rutaMediaValida,
  type TipoMedia,
} from "../../../../lib/media";
import { createClient } from "../../../../lib/supabase/server";

const UUID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const NO_AUTORIZADO = "No tienes permiso para hacer esto.";
const ERROR_DATOS = "Los datos no son válidos. Recarga la página.";
const ERROR_GENERICO = "No se pudo guardar. Inténtalo de nuevo.";

type Resultado = { ok: boolean; error?: string };

function columna(tipo: TipoMedia): "image_path" | "video_path" {
  return tipo === "image" ? "image_path" : "video_path";
}

async function leerPrevio(
  supabase: SupabaseClient,
  id: string,
  col: "image_path" | "video_path",
): Promise<{ name: string; ruta: string | null } | null> {
  const { data, error } = await supabase
    .from("exercises")
    .select(`name, ${col}`)
    .eq("id", id)
    .maybeSingle();
  if (error || !data) return null;
  const fila = data as unknown as Record<string, unknown>;
  const ruta = fila[col];
  return {
    name: String(fila.name ?? ""),
    ruta: typeof ruta === "string" ? ruta : null,
  };
}

async function anotar(
  supabase: SupabaseClient,
  accion: string,
  id: string,
  detalles: Record<string, unknown>,
) {
  const { error } = await supabase.rpc("log_admin_action", {
    p_action: accion,
    p_target_table: "exercises",
    p_target_id: id,
    p_details: detalles,
  });
  if (error) {
    console.error("[admin] no se pudo anotar en el historial:", error.code ?? "sin código");
  }
}

function refrescar(id: string) {
  revalidatePath("/admin");
  revalidatePath("/admin/ejercicios");
  revalidatePath(`/admin/ejercicios/${id}`);
  revalidatePath("/admin/historial");
  revalidatePath("/biblioteca");
}

// Guarda la ruta de un archivo que el navegador ya ha subido, y borra el anterior.
export async function guardarMedia(
  exerciseId: unknown,
  tipo: unknown,
  ruta: unknown,
): Promise<Resultado> {
  if (
    typeof exerciseId !== "string" ||
    !UUID.test(exerciseId) ||
    !esTipoMedia(tipo) ||
    typeof ruta !== "string" ||
    !rutaMediaValida(exerciseId, tipo, ruta)
  ) {
    return { ok: false, error: ERROR_DATOS };
  }

  const supabase = await createClient();
  if (!(await esSuperadmin(supabase))) return { ok: false, error: NO_AUTORIZADO };

  const col = columna(tipo);
  const previo = await leerPrevio(supabase, exerciseId, col);
  if (!previo) return { ok: false, error: ERROR_GENERICO };

  const { data, error } = await supabase
    .from("exercises")
    .update({ [col]: ruta })
    .eq("id", exerciseId)
    .select("id");

  if (error || !data || data.length === 0) {
    console.error("[admin] error al guardar el archivo:", error?.code ?? "sin filas");
    return { ok: false, error: ERROR_GENERICO };
  }

  // Borra el archivo anterior para no gastar almacenamiento (si falla, no pasa nada grave).
  if (
    previo.ruta &&
    previo.ruta !== ruta &&
    rutaMediaValida(exerciseId, tipo, previo.ruta)
  ) {
    const { error: errorBorrar } = await supabase.storage
      .from(BUCKET_MEDIA)
      .remove([previo.ruta]);
    if (errorBorrar) {
      console.error("[admin] no se pudo borrar el archivo anterior:", errorBorrar.message);
    }
  }

  await anotar(supabase, "exercise.media_update", exerciseId, {
    name: previo.name,
    kind: tipo,
  });
  refrescar(exerciseId);
  return { ok: true };
}

// Quita la imagen o el vídeo de un ejercicio y borra el archivo.
export async function quitarMedia(
  exerciseId: unknown,
  tipo: unknown,
): Promise<Resultado> {
  if (
    typeof exerciseId !== "string" ||
    !UUID.test(exerciseId) ||
    !esTipoMedia(tipo)
  ) {
    return { ok: false, error: ERROR_DATOS };
  }

  const supabase = await createClient();
  if (!(await esSuperadmin(supabase))) return { ok: false, error: NO_AUTORIZADO };

  const col = columna(tipo);
  const previo = await leerPrevio(supabase, exerciseId, col);
  if (!previo) return { ok: false, error: ERROR_GENERICO };
  if (!previo.ruta) return { ok: true };

  const { data, error } = await supabase
    .from("exercises")
    .update({ [col]: null })
    .eq("id", exerciseId)
    .select("id");

  if (error || !data || data.length === 0) {
    console.error("[admin] error al quitar el archivo:", error?.code ?? "sin filas");
    return { ok: false, error: ERROR_GENERICO };
  }

  if (rutaMediaValida(exerciseId, tipo, previo.ruta)) {
    const { error: errorBorrar } = await supabase.storage
      .from(BUCKET_MEDIA)
      .remove([previo.ruta]);
    if (errorBorrar) {
      console.error("[admin] no se pudo borrar el archivo:", errorBorrar.message);
    }
  }

  await anotar(supabase, "exercise.media_remove", exerciseId, {
    name: previo.name,
    kind: tipo,
  });
  refrescar(exerciseId);
  return { ok: true };
}