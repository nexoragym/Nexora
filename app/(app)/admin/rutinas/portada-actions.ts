"use server";

import type { SupabaseClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";
import { anotarAccionAdmin } from "../../../../lib/admin/audit";
import { esSuperadmin } from "../../../../lib/admin/guard";
import { BUCKET_MEDIA } from "../../../../lib/media";
import { rutaPortadaValida } from "../../../../lib/routines/portada";
import { createClient } from "../../../../lib/supabase/server";

const UUID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const NO_AUTORIZADO = "No tienes permiso para hacer esto.";
const ERROR_DATOS = "Los datos no son válidos. Recarga la página.";
const ERROR_GENERICO = "No se pudo guardar. Inténtalo de nuevo.";

type Resultado = { ok: boolean; error?: string };
type Previo = { name: string; slug: string; ruta: string | null };

async function leerPrevio(
  supabase: SupabaseClient,
  id: string,
): Promise<Previo | null> {
  const { data, error } = await supabase
    .from("catalog_routines")
    .select("name, slug, cover_path")
    .eq("id", id)
    .maybeSingle();
  if (error || !data) return null;
  const fila = data as unknown as {
    name: string;
    slug: string;
    cover_path: string | null;
  };
  return { name: fila.name, slug: fila.slug, ruta: fila.cover_path };
}

function refrescar(id: string, slug: string) {
  revalidatePath("/admin/rutinas");
  revalidatePath(`/admin/rutinas/${id}`);
  revalidatePath("/admin/historial");
  revalidatePath("/rutinas");
  revalidatePath(`/rutinas/${slug}`);
}

async function borrarArchivo(supabase: SupabaseClient, ruta: string) {
  const { error } = await supabase.storage.from(BUCKET_MEDIA).remove([ruta]);
  if (error) {
    console.error("[admin] no se pudo borrar la portada anterior:", error.message);
  }
}

// Guarda la ruta de una portada que el navegador ya ha subido, y borra la anterior.
export async function guardarPortada(
  routineId: unknown,
  ruta: unknown,
): Promise<Resultado> {
  if (
    typeof routineId !== "string" ||
    !UUID.test(routineId) ||
    typeof ruta !== "string" ||
    !rutaPortadaValida(routineId, ruta)
  ) {
    return { ok: false, error: ERROR_DATOS };
  }

  const supabase = await createClient();
  if (!(await esSuperadmin(supabase))) return { ok: false, error: NO_AUTORIZADO };

  const previo = await leerPrevio(supabase, routineId);
  if (!previo) return { ok: false, error: ERROR_GENERICO };

  const { data, error } = await supabase
    .from("catalog_routines")
    .update({ cover_path: ruta })
    .eq("id", routineId)
    .select("id");

  if (error || !data || data.length === 0) {
    console.error("[admin] error al guardar la portada:", error?.code ?? "sin filas");
    return { ok: false, error: ERROR_GENERICO };
  }

  if (previo.ruta && previo.ruta !== ruta && rutaPortadaValida(routineId, previo.ruta)) {
    await borrarArchivo(supabase, previo.ruta);
  }

  await anotarAccionAdmin(
    supabase,
    "routine.cover_update",
    routineId,
    { name: previo.name, slug: previo.slug },
    "catalog_routines",
  );
  refrescar(routineId, previo.slug);
  return { ok: true };
}

// Quita la portada subida (vuelve la de public/images/rutinas, si existe).
export async function quitarPortada(routineId: unknown): Promise<Resultado> {
  if (typeof routineId !== "string" || !UUID.test(routineId)) {
    return { ok: false, error: ERROR_DATOS };
  }

  const supabase = await createClient();
  if (!(await esSuperadmin(supabase))) return { ok: false, error: NO_AUTORIZADO };

  const previo = await leerPrevio(supabase, routineId);
  if (!previo) return { ok: false, error: ERROR_GENERICO };
  if (!previo.ruta) return { ok: true };

  const { data, error } = await supabase
    .from("catalog_routines")
    .update({ cover_path: null })
    .eq("id", routineId)
    .select("id");

  if (error || !data || data.length === 0) {
    console.error("[admin] error al quitar la portada:", error?.code ?? "sin filas");
    return { ok: false, error: ERROR_GENERICO };
  }

  if (rutaPortadaValida(routineId, previo.ruta)) {
    await borrarArchivo(supabase, previo.ruta);
  }

  await anotarAccionAdmin(
    supabase,
    "routine.cover_remove",
    routineId,
    { name: previo.name, slug: previo.slug },
    "catalog_routines",
  );
  refrescar(routineId, previo.slug);
  return { ok: true };
}