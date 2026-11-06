"use server";

import { revalidatePath } from "next/cache";
import { anotarAccionAdmin } from "../../../../lib/admin/audit";
import { esSuperadmin } from "../../../../lib/admin/guard";
import {
  camposCambiados,
  revisarEjerciciosRutina,
  rutinaADraft,
  rutinaAPayloadCatalogo,
  validarRutina,
  type ResultadoBusqueda,
  type RutinaValida,
} from "../../../../lib/admin/routine-form";
import {
  escaparBusqueda,
  palabrasDeBusqueda,
  type Difficulty,
  type Equipment,
  type Muscle,
} from "../../../../lib/exercises";
import { leerRutinaCatalogo } from "../../../../lib/routines/catalog";
import { createClient } from "../../../../lib/supabase/server";

const NO_AUTORIZADO = "No tienes permiso para hacer esto.";
const ERROR_GENERICO = "No se pudo guardar. Inténtalo de nuevo.";

type ResultadoGuardado = {
  ok: boolean;
  error?: string;
  errores?: string[];
  id?: string;
};

type FilaEjercicio = { id: string; slug: string; name: string; is_active: boolean };

function refrescar(id: string, slug: string) {
  revalidatePath("/admin");
  revalidatePath("/admin/rutinas");
  revalidatePath(`/admin/rutinas/${id}`);
  revalidatePath("/admin/historial");
  revalidatePath("/rutinas");
  revalidatePath(`/rutinas/${slug}`);
}

// Crea una rutina nueva (oculta) o guarda los cambios de una que ya existe.
export async function guardarRutina(entrada: unknown): Promise<ResultadoGuardado> {
  const supabase = await createClient();
  if (!(await esSuperadmin(supabase))) return { ok: false, error: NO_AUTORIZADO };

  const idEntrada =
    typeof entrada === "object" && entrada !== null
      ? (entrada as { id?: unknown }).id
      : null;
  const modo = typeof idEntrada === "string" && idEntrada.length > 0 ? "editar" : "crear";

  const { valores, errores } = validarRutina(entrada, modo);
  if (!valores) return { ok: false, errores };

  // Los ejercicios deben existir, estar activos y, si son por tiempo, medirse en segundos.
  const ids = Array.from(
    new Set(valores.days.flatMap((dia) => dia.exercises.map((e) => e.exerciseId))),
  );
  const filas: FilaEjercicio[] = [];
  for (let i = 0; i < ids.length; i += 50) {
    const { data, error } = await supabase
      .from("exercises")
      .select("id, slug, name, is_active")
      .in("id", ids.slice(i, i + 50));
    if (error) {
      console.error("[admin] error al leer ejercicios:", error.code ?? "sin código");
      return { ok: false, error: ERROR_GENERICO };
    }
    filas.push(...((data ?? []) as FilaEjercicio[]));
  }
  const problemas = revisarEjerciciosRutina(valores, filas);
  if (problemas.length > 0) return { ok: false, errores: problemas };

  // Para el historial: cómo era antes.
  let previa: RutinaValida | null = null;
  let slug = valores.slug;
  if (valores.id) {
    const { rutina, error } = await leerRutinaCatalogo(supabase, { id: valores.id });
    if (error || !rutina) return { ok: false, error: "La rutina no existe." };
    previa = validarRutina(rutinaADraft(rutina), "editar").valores ?? null;
    slug = rutina.slug;
  }

  const { data: id, error } = await supabase.rpc("save_catalog_routine", {
    p_routine: rutinaAPayloadCatalogo(valores),
  });

  if (error || typeof id !== "string") {
    if (error?.code === "23505") {
      return {
        ok: false,
        errores: [
          "Ya existe una rutina con ese identificador. Escribe otro o cambia el nombre.",
        ],
      };
    }
    console.error("[admin] error al guardar la rutina:", error?.code ?? "sin código");
    return { ok: false, error: ERROR_GENERICO };
  }

  await anotarAccionAdmin(
    supabase,
    valores.id ? "routine.update" : "routine.create",
    id,
    {
      name: valores.name,
      slug,
      changed: camposCambiados(previa, valores),
    },
    "catalog_routines",
  );
  refrescar(id, slug);
  return { ok: true, id };
}

// Buscador de ejercicios del editor: nombre u otros nombres, sin tildes.
// Incluye los ejercicios que no entran en el generador (se pueden elegir a mano).
export async function buscarEjerciciosParaRutina(
  texto: unknown,
): Promise<{ ok: boolean; resultados: ResultadoBusqueda[] }> {
  const supabase = await createClient();
  if (!(await esSuperadmin(supabase)) || typeof texto !== "string") {
    return { ok: false, resultados: [] };
  }

  const palabras = palabrasDeBusqueda(texto.slice(0, 50));
  if (palabras.length === 0) return { ok: true, resultados: [] };

  let consulta = supabase
    .from("exercises")
    .select("id, slug, name, equipment, difficulty, primary_muscles")
    .eq("is_active", true)
    .order("name")
    .limit(12);
  for (const palabra of palabras) {
    consulta = consulta.ilike("search_text", `%${escaparBusqueda(palabra)}%`);
  }

  const { data, error } = await consulta;
  if (error) {
    console.error("[admin] error en el buscador:", error.code ?? "sin código");
    return { ok: false, resultados: [] };
  }

  const filas = (data ?? []) as unknown as {
    id: string;
    slug: string;
    name: string;
    equipment: Equipment;
    difficulty: Difficulty;
    primary_muscles: Muscle[];
  }[];

  return {
    ok: true,
    resultados: filas.map((fila) => ({
      id: fila.id,
      slug: fila.slug,
      name: fila.name,
      equipment: fila.equipment,
      difficulty: fila.difficulty,
      muscles: fila.primary_muscles,
    })),
  };
}