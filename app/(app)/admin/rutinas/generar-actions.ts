"use server";

import type { SupabaseClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";
import { anotarAccionAdmin } from "../../../../lib/admin/audit";
import { esSuperadmin } from "../../../../lib/admin/guard";
import { leerBibliotecaGenerador } from "../../../../lib/routines/biblioteca";
import {
  MAX_LOTE_SERVIDOR,
  borradorAPayload,
  combinacionDeSlug,
  generarBorrador,
  leerOpciones,
  planificarBorradores,
  slugDeCombinacion,
  type Combinacion,
  type ResultadoLote,
  type ResultadoPublicacion,
  type VistaBorradores,
} from "../../../../lib/routines/borradores";
import { createClient } from "../../../../lib/supabase/server";

const NO_AUTORIZADO = "No tienes permiso para hacer esto.";
const ERROR_DATOS = "Los datos no son válidos. Recarga la página.";
const ERROR_GENERICO = "No se pudo completar la operación. Inténtalo de nuevo.";

function refrescar() {
  revalidatePath("/admin");
  revalidatePath("/admin/rutinas");
  revalidatePath("/admin/historial");
  revalidatePath("/rutinas");
}

// Identificadores de las rutinas automáticas que ya existen.
async function leerSlugsAuto(supabase: SupabaseClient): Promise<Set<string> | null> {
  const slugs = new Set<string>();
  for (let desde = 0; ; desde += 1000) {
    const { data, error } = await supabase
      .from("catalog_routines")
      .select("slug")
      .like("slug", "auto-%")
      .order("slug")
      .range(desde, desde + 999);
    if (error) {
      console.error("[admin] error al leer rutinas automáticas:", error.code ?? "sin código");
      return null;
    }
    const lote = (data ?? []) as { slug: string }[];
    for (const fila of lote) slugs.add(fila.slug);
    if (lote.length < 1000) break;
  }
  return slugs;
}

function vista(error: string): VistaBorradores {
  return {
    ok: false,
    error,
    pendientes: [],
    ejemplos: [],
    resumen: {
      biblioteca: 0,
      posibles: 0,
      revisadas: 0,
      sinEjercicios: 0,
      duplicadas: 0,
      yaExisten: 0,
      aCrear: 0,
    },
  };
}

// Paso 1: calcula qué rutinas se crearían, sin guardar nada.
export async function previsualizarBorradores(entrada: unknown): Promise<VistaBorradores> {
  const supabase = await createClient();
  if (!(await esSuperadmin(supabase))) return vista(NO_AUTORIZADO);

  const opciones = leerOpciones(entrada);
  if (!opciones) {
    return vista("Elige al menos una opción en cada apartado y un máximo de 1 a 300.");
  }

  const { ejercicios, error } = await leerBibliotecaGenerador(supabase);
  if (error) return vista(ERROR_GENERICO);
  if (ejercicios.length === 0) {
    return vista("No hay ejercicios activos marcados para las rutinas automáticas.");
  }

  const existentes = await leerSlugsAuto(supabase);
  if (!existentes) return vista(ERROR_GENERICO);

  const plan = planificarBorradores(opciones, ejercicios);
  const slugs = plan.seleccion.map(slugDeCombinacion);
  const pendientes = slugs.filter((slug) => !existentes.has(slug));

  const ejemplos: string[] = [];
  for (const slug of pendientes.slice(0, 6)) {
    const combinacion = combinacionDeSlug(slug);
    const borrador = combinacion ? generarBorrador(combinacion, ejercicios) : null;
    if (borrador) ejemplos.push(borrador.name);
  }

  return {
    ok: true,
    pendientes,
    ejemplos,
    resumen: {
      biblioteca: ejercicios.length,
      posibles: plan.posibles,
      revisadas: plan.revisadas,
      sinEjercicios: plan.sinEjercicios,
      duplicadas: plan.duplicadas,
      yaExisten: slugs.length - pendientes.length,
      aCrear: pendientes.length,
    },
  };
}

// Paso 2: crea un grupo pequeño de rutinas (la pantalla va llamando por lotes).
export async function crearBorradores(entrada: unknown): Promise<ResultadoLote> {
  const fallo = (error: string): ResultadoLote => ({
    ok: false,
    error,
    creadas: 0,
    yaExistian: 0,
    sinEjercicios: 0,
    errores: 0,
  });

  const supabase = await createClient();
  if (!(await esSuperadmin(supabase))) return fallo(NO_AUTORIZADO);

  if (!Array.isArray(entrada) || entrada.length === 0 || entrada.length > MAX_LOTE_SERVIDOR) {
    return fallo(ERROR_DATOS);
  }

  const combinaciones: Combinacion[] = [];
  const vistos = new Set<string>();
  for (const valor of entrada) {
    if (typeof valor !== "string" || vistos.has(valor)) return fallo(ERROR_DATOS);
    vistos.add(valor);
    const combinacion = combinacionDeSlug(valor);
    if (!combinacion || slugDeCombinacion(combinacion) !== valor) return fallo(ERROR_DATOS);
    combinaciones.push(combinacion);
  }

  const { ejercicios, error: errorLectura } = await leerBibliotecaGenerador(supabase);
  if (errorLectura || ejercicios.length === 0) return fallo(ERROR_GENERICO);

  let creadas = 0;
  let yaExistian = 0;
  let sinEjercicios = 0;
  let errores = 0;
  let primerId: string | null = null;

  for (const combinacion of combinaciones) {
    const borrador = generarBorrador(combinacion, ejercicios);
    if (!borrador) {
      sinEjercicios += 1;
      continue;
    }

    const { data, error } = await supabase.rpc("save_catalog_routine", {
      p_routine: borradorAPayload(borrador),
    });

    if (error) {
      if (error.code === "23505") {
        yaExistian += 1;
      } else {
        console.error("[admin] error al crear un borrador:", error.code ?? "sin código");
        errores += 1;
      }
      continue;
    }

    creadas += 1;
    if (!primerId && typeof data === "string") primerId = data;
  }

  if (creadas > 0 && primerId) {
    await anotarAccionAdmin(
      supabase,
      "routine.create",
      primerId,
      { name: `Borradores automáticos: ${creadas} creados`, slug: borradorSlug(combinaciones[0]) },
      "catalog_routines",
    );
    refrescar();
  }

  return { ok: true, creadas, yaExistian, sinEjercicios, errores };
}

function borradorSlug(combinacion: Combinacion): string {
  return slugDeCombinacion(combinacion);
}

// Una de las rutinas automáticas, para anotar acciones en bloque en el historial.
async function unaAutomatica(supabase: SupabaseClient): Promise<string | null> {
  const { data } = await supabase
    .from("catalog_routines")
    .select("id")
    .like("slug", "auto-%")
    .limit(1)
    .maybeSingle();
  return typeof data?.id === "string" ? data.id : null;
}

// Publica todas las automáticas que estén completas.
export async function publicarBorradoresAuto(): Promise<ResultadoPublicacion> {
  const supabase = await createClient();
  if (!(await esSuperadmin(supabase))) {
    return { ok: false, error: NO_AUTORIZADO, cantidad: 0, pendientes: 0 };
  }

  const { data, error } = await supabase.rpc("publish_auto_catalog_routines");
  if (error) {
    console.error("[admin] error al publicar las automáticas:", error.code ?? "sin código");
    return {
      ok: false,
      error: "No se pudo publicar. Comprueba que has ejecutado la migración 0017.",
      cantidad: 0,
      pendientes: 0,
    };
  }

  const datos = (data ?? {}) as { published?: number; pending?: number };
  const cantidad = datos.published ?? 0;

  if (cantidad > 0) {
    const id = await unaAutomatica(supabase);
    if (id) {
      await anotarAccionAdmin(
        supabase,
        "routine.publish",
        id,
        { name: `Rutinas automáticas publicadas: ${cantidad}` },
        "catalog_routines",
      );
    }
    refrescar();
  }
  return { ok: true, cantidad, pendientes: datos.pending ?? 0 };
}

// Vuelve a ocultar todas las automáticas.
export async function ocultarBorradoresAuto(): Promise<ResultadoPublicacion> {
  const supabase = await createClient();
  if (!(await esSuperadmin(supabase))) {
    return { ok: false, error: NO_AUTORIZADO, cantidad: 0, pendientes: 0 };
  }

  const { data, error } = await supabase.rpc("unpublish_auto_catalog_routines");
  if (error) {
    console.error("[admin] error al ocultar las automáticas:", error.code ?? "sin código");
    return {
      ok: false,
      error: "No se pudo ocultar. Comprueba que has ejecutado la migración 0017.",
      cantidad: 0,
      pendientes: 0,
    };
  }

  const cantidad = ((data ?? {}) as { unpublished?: number }).unpublished ?? 0;

  if (cantidad > 0) {
    const id = await unaAutomatica(supabase);
    if (id) {
      await anotarAccionAdmin(
        supabase,
        "routine.unpublish",
        id,
        { name: `Rutinas automáticas ocultadas: ${cantidad}` },
        "catalog_routines",
      );
    }
    refrescar();
  }
  return { ok: true, cantidad, pendientes: 0 };
}