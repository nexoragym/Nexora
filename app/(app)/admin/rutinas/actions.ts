"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { anotarAccionAdmin } from "../../../../lib/admin/audit";
import { esSuperadmin } from "../../../../lib/admin/guard";
import { leerRutinaCatalogo } from "../../../../lib/routines/catalog";
import { createClient } from "../../../../lib/supabase/server";

const UUID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function refrescar(slug?: string) {
  revalidatePath("/admin");
  revalidatePath("/admin/rutinas");
  revalidatePath("/admin/historial");
  revalidatePath("/rutinas");
  if (slug) revalidatePath(`/rutinas/${slug}`);
}

// Publica u oculta una rutina. No se puede publicar si está incompleta.
export async function cambiarPublicacion(formData: FormData): Promise<void> {
  const supabase = await createClient();
  if (!(await esSuperadmin(supabase))) return;

  const id = formData.get("id");
  const publicar = formData.get("publicar") === "true";
  if (typeof id !== "string" || !UUID.test(id)) return;

  const { rutina, error } = await leerRutinaCatalogo(supabase, { id });
  if (error || !rutina) return;

  if (publicar) {
    if (
      rutina.days.length === 0 ||
      rutina.days.some((dia) => dia.exercises.length === 0)
    ) {
      redirect("/admin/rutinas?aviso=vacia");
    }
    if (
      rutina.missing > 0 ||
      rutina.days.some((dia) => dia.exercises.some((e) => !e.active))
    ) {
      redirect("/admin/rutinas?aviso=inactivos");
    }
  }

  const { data, error: errorCambio } = await supabase
    .from("catalog_routines")
    .update({ is_published: publicar })
    .eq("id", id)
    .select("slug");

  if (errorCambio || !data || data.length === 0) {
    console.error(
      "[admin] error al cambiar la publicación:",
      errorCambio?.code ?? "sin filas",
    );
    return;
  }

  await anotarAccionAdmin(
    supabase,
    publicar ? "routine.publish" : "routine.unpublish",
    id,
    { name: rutina.name, slug: rutina.slug },
    "catalog_routines",
  );
  refrescar(rutina.slug);
}

// Crea una copia oculta de la rutina.
export async function duplicarRutina(formData: FormData): Promise<void> {
  const supabase = await createClient();
  if (!(await esSuperadmin(supabase))) return;

  const id = formData.get("id");
  if (typeof id !== "string" || !UUID.test(id)) return;

  const { data, error } = await supabase.rpc("duplicate_catalog_routine", {
    p_id: id,
  });

  if (error || typeof data !== "string") {
    console.error("[admin] error al duplicar la rutina:", error?.code ?? "sin código");
    return;
  }

  await anotarAccionAdmin(
    supabase,
    "routine.duplicate",
    data,
    { from: id },
    "catalog_routines",
  );
  refrescar();
  redirect("/admin/rutinas?aviso=duplicada");
}