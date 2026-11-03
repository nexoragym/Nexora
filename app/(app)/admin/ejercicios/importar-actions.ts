"use server";

import type { SupabaseClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";
import { anotarAccionAdmin } from "../../../../lib/admin/audit";
import {
  analizarImportacion,
  columnasDeImportado,
  type EjercicioImportado,
  type FilaAnalizada,
  type ResultadoImportacion,
  type VistaFila,
  type VistaPrevia,
} from "../../../../lib/admin/exercise-import";
import { esSuperadmin } from "../../../../lib/admin/guard";
import { createClient } from "../../../../lib/supabase/server";

const NO_AUTORIZADO = "No tienes permiso para hacer esto.";
const ERROR_GENERICO = "No se pudo completar la operación. Inténtalo de nuevo.";
const TAM_LOTE_INSERTAR = 50;
const TAM_LOTE_ACTUALIZAR = 10;

const RESUMEN_VACIO = {
  total: 0,
  validas: 0,
  errores: 0,
  nuevos: 0,
  existentes: 0,
  conAvisos: 0,
};

type Preparado =
  | { error: string }
  | { filas: FilaAnalizada[]; existentes: Map<string, string> };

// Comprueba permisos, revisa el JSON y busca qué identificadores ya existen.
async function preparar(
  supabase: SupabaseClient,
  texto: unknown,
): Promise<Preparado> {
  if (!(await esSuperadmin(supabase))) return { error: NO_AUTORIZADO };
  if (typeof texto !== "string") return { error: "No se recibió ningún texto." };

  const analisis = analizarImportacion(texto);
  if (analisis.error) return { error: analisis.error };

  const slugs = analisis.filas.flatMap((fila) =>
    fila.valores ? [fila.valores.slug] : [],
  );
  const existentes = new Map<string, string>();
  for (let i = 0; i < slugs.length; i += 50) {
    const { data, error } = await supabase
      .from("exercises")
      .select("id, slug")
      .in("slug", slugs.slice(i, i + 50));
    if (error) {
      console.error("[admin] error al buscar existentes:", error.code ?? "sin código");
      return { error: ERROR_GENERICO };
    }
    for (const fila of (data ?? []) as { id: string; slug: string }[]) {
      existentes.set(fila.slug, fila.id);
    }
  }
  return { filas: analisis.filas, existentes };
}

export async function previsualizarImportacion(
  texto: unknown,
): Promise<VistaPrevia> {
  const supabase = await createClient();
  const preparado = await preparar(supabase, texto);
  if ("error" in preparado) {
    return { ok: false, error: preparado.error, filas: [], resumen: RESUMEN_VACIO };
  }

  const { filas, existentes } = preparado;
  const vista: VistaFila[] = filas.map((fila) => ({
    indice: fila.indice,
    slug: fila.slug,
    name: fila.name,
    estado: !fila.valores ? "error" : existentes.has(fila.slug) ? "existe" : "nuevo",
    errores: fila.errores,
    avisos: fila.avisos,
  }));

  const nuevos = vista.filter((f) => f.estado === "nuevo").length;
  const existentesN = vista.filter((f) => f.estado === "existe").length;
  return {
    ok: true,
    filas: vista,
    resumen: {
      total: vista.length,
      validas: nuevos + existentesN,
      errores: vista.filter((f) => f.estado === "error").length,
      nuevos,
      existentes: existentesN,
      conAvisos: vista.filter((f) => f.avisos.length > 0).length,
    },
  };
}

function resultadoVacio(error: string): ResultadoImportacion {
  return {
    ok: false,
    error,
    creados: 0,
    actualizados: 0,
    omitidos: 0,
    conError: 0,
    fallos: [],
  };
}

export async function confirmarImportacion(
  texto: unknown,
  modo: unknown,
): Promise<ResultadoImportacion> {
  const supabase = await createClient();
  if (modo !== "omitir" && modo !== "actualizar") {
    return resultadoVacio("Elige qué hacer con los ejercicios que ya existen.");
  }

  const preparado = await preparar(supabase, texto);
  if ("error" in preparado) return resultadoVacio(preparado.error);

  const { filas, existentes } = preparado;
  const validos = filas.flatMap((fila) => (fila.valores ? [fila.valores] : []));
  const nuevos = validos.filter((v) => !existentes.has(v.slug));
  const yaExisten = validos.filter((v) => existentes.has(v.slug));

  let creados = 0;
  let actualizados = 0;
  const fallos: { slug: string; motivo: string }[] = [];
  const idsTocados: string[] = [];
  const slugsTocados: string[] = [];

  // ---- Crear los nuevos, por lotes ----
  for (let i = 0; i < nuevos.length; i += TAM_LOTE_INSERTAR) {
    const lote = nuevos.slice(i, i + TAM_LOTE_INSERTAR);
    const { data, error } = await supabase
      .from("exercises")
      .insert(lote.map((v) => ({ slug: v.slug, ...columnasDeImportado(v) })))
      .select("id, slug");

    if (!error && data) {
      for (const fila of data as unknown as { id: string; slug: string }[]) {
        creados += 1;
        idsTocados.push(fila.id);
        slugsTocados.push(fila.slug);
      }
      continue;
    }

    console.error("[admin] error al importar un lote:", error?.code ?? "sin código");
    // Si falla el lote, se prueba de uno en uno para saber cuál falla.
    for (const v of lote) {
      const { data: uno, error: errorUno } = await supabase
        .from("exercises")
        .insert({ slug: v.slug, ...columnasDeImportado(v) })
        .select("id, slug")
        .single();
      if (errorUno || !uno) {
        fallos.push({
          slug: v.slug,
          motivo:
            errorUno?.code === "23505"
              ? "El identificador ya existe."
              : "No se pudo guardar.",
        });
      } else {
        const fila = uno as unknown as { id: string; slug: string };
        creados += 1;
        idsTocados.push(fila.id);
        slugsTocados.push(fila.slug);
      }
    }
  }

  // ---- Actualizar los que ya existían (solo si se ha pedido) ----
  if (modo === "actualizar") {
    for (let i = 0; i < yaExisten.length; i += TAM_LOTE_ACTUALIZAR) {
      const lote: EjercicioImportado[] = yaExisten.slice(i, i + TAM_LOTE_ACTUALIZAR);
      await Promise.all(
        lote.map(async (v) => {
          const id = existentes.get(v.slug);
          if (!id) return;
          const { data, error } = await supabase
            .from("exercises")
            .update(columnasDeImportado(v))
            .eq("id", id)
            .select("id");
          if (error || !data || data.length === 0) {
            console.error("[admin] error al actualizar:", error?.code ?? "sin filas");
            fallos.push({ slug: v.slug, motivo: "No se pudo actualizar." });
          } else {
            actualizados += 1;
            idsTocados.push(id);
            slugsTocados.push(v.slug);
          }
        }),
      );
    }
  }

  const omitidos = modo === "omitir" ? yaExisten.length : 0;
  const conError = filas.length - validos.length;

  if (idsTocados.length > 0) {
    await anotarAccionAdmin(supabase, "exercise.import", idsTocados[0], {
      created: creados,
      updated: actualizados,
      skipped: omitidos,
      failed: conError + fallos.length,
      slugs: slugsTocados.slice(0, 30),
    });
    revalidatePath("/admin");
    revalidatePath("/admin/ejercicios");
    revalidatePath("/admin/historial");
    revalidatePath("/biblioteca");
  }

  return { ok: true, creados, actualizados, omitidos, conError, fallos };
}