"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  revisarEjerciciosRutina,
  type ResultadoBusqueda,
} from "../../../lib/admin/routine-form";
import {
  escaparBusqueda,
  palabrasDeBusqueda,
  type Difficulty,
  type Equipment,
  type Muscle,
} from "../../../lib/exercises";
import { puedeCrearRutinasPersonalizadas } from "../../../lib/features";
import {
  MAX_RUTINAS_PERSONALES,
  leerBusquedaUsuario,
  rutinaPersonalAPayload,
  validarRutinaPersonal,
  type InfoEjercicio,
} from "../../../lib/routines/custom";
import { createClient } from "../../../lib/supabase/server";

const UUID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const ERROR_GENERICO = "No se pudo guardar. Inténtalo de nuevo.";
const NO_DISPONIBLE = "Esta función no está disponible en tu cuenta.";
const SESION_CADUCADA = "Tu sesión ha caducado. Vuelve a iniciar sesión.";

type ResultadoGuardado = {
  ok: boolean;
  error?: string;
  errores?: string[];
  id?: string;
};

type FilaEjercicio = {
  id: string;
  slug: string;
  name: string;
  is_active: boolean;
  equipment: string;
};

function refrescar() {
  revalidatePath("/mis-rutinas");
  revalidatePath("/rutinas");
  revalidatePath("/entrenar");
  revalidatePath("/dashboard");
}

// Crea una rutina propia o guarda los cambios de una que ya existe.
export async function guardarRutinaPersonal(
  entrada: unknown,
  activar: unknown,
): Promise<ResultadoGuardado> {
  const supabase = await createClient();
  const { data: claims } = await supabase.auth.getClaims();
  if (!claims?.claims?.sub) return { ok: false, error: SESION_CADUCADA };

  if (!(await puedeCrearRutinasPersonalizadas(supabase))) {
    return { ok: false, error: NO_DISPONIBLE };
  }

  const idEntrada =
    typeof entrada === "object" && entrada !== null
      ? (entrada as { id?: unknown }).id
      : null;
  const modo = typeof idEntrada === "string" && idEntrada.length > 0 ? "editar" : "crear";

  const { valores, errores } = validarRutinaPersonal(entrada, modo);
  if (!valores) return { ok: false, errores };

  // Los ejercicios deben existir y estar activos (cada persona solo ve los activos).
  const ids = Array.from(
    new Set(valores.days.flatMap((dia) => dia.exercises.map((e) => e.exerciseId))),
  );
  const filas: FilaEjercicio[] = [];
  for (let i = 0; i < ids.length; i += 50) {
    const { data, error } = await supabase
      .from("exercises")
      .select("id, slug, name, is_active, equipment")
      .in("id", ids.slice(i, i + 50));
    if (error) {
      console.error("[rutinas propias] error al leer ejercicios:", error.code ?? "sin código");
      return { ok: false, error: ERROR_GENERICO };
    }
    filas.push(...((data ?? []) as FilaEjercicio[]));
  }

  const problemas = revisarEjerciciosRutina(valores.base, filas);
  if (problemas.length > 0) return { ok: false, errores: problemas };

  const info = new Map<string, InfoEjercicio>(
    filas.map((fila) => [fila.id, { slug: fila.slug, equipment: fila.equipment }] as const),
  );

  const { data: id, error } = await supabase.rpc("save_custom_routine", {
    p_routine: rutinaPersonalAPayload(valores, info),
    p_activate: activar === true,
  });

  if (error || typeof id !== "string") {
    const mensaje = error?.message ?? "";
    if (mensaje.includes("Límite de rutinas")) {
      return {
        ok: false,
        errores: [
          `Ya tienes ${MAX_RUTINAS_PERSONALES} rutinas propias. Elimina alguna para crear otra.`,
        ],
      };
    }
    if (mensaje.includes("Rutina no encontrada")) {
      return { ok: false, error: "Esta rutina ya no existe. Vuelve a Mis rutinas." };
    }
    if (mensaje.includes("Ejercicio no disponible")) {
      return {
        ok: false,
        errores: ["Algún ejercicio ya no está disponible. Quítalo y vuelve a guardar."],
      };
    }
    console.error("[rutinas propias] error al guardar:", error?.code ?? "sin código");
    return { ok: false, error: ERROR_GENERICO };
  }

  refrescar();
  return { ok: true, id };
}

// Buscador del constructor: cualquier ejercicio activo, también los que
// no entran en el generador. Filtra por nombre u otros nombres, músculo y material.
export async function buscarEjerciciosUsuario(
  entrada: unknown,
): Promise<{ ok: boolean; resultados: ResultadoBusqueda[] }> {
  const busqueda = leerBusquedaUsuario(entrada);
  if (!busqueda) return { ok: false, resultados: [] };

  const palabras = palabrasDeBusqueda(busqueda.texto);
  if (palabras.length === 0 && !busqueda.muscle && !busqueda.equipment) {
    return { ok: true, resultados: [] };
  }

  const supabase = await createClient();

  let consulta = supabase
    .from("exercises")
    .select("id, slug, name, equipment, difficulty, primary_muscles")
    .eq("is_active", true)
    .order("popularity", { ascending: false })
    .order("name")
    .limit(20);

  for (const palabra of palabras) {
    consulta = consulta.ilike("search_text", `%${escaparBusqueda(palabra)}%`);
  }
  if (busqueda.muscle) consulta = consulta.contains("primary_muscles", [busqueda.muscle]);
  if (busqueda.equipment) consulta = consulta.eq("equipment", busqueda.equipment);

  const { data, error } = await consulta;
  if (error) {
    console.error("[rutinas propias] error en el buscador:", error.code ?? "sin código");
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

// Usa una de tus rutinas propias como la activa (sustituye a la que tengas).
export async function activarRutinaPersonal(formData: FormData): Promise<void> {
  const id = formData.get("id");
  if (typeof id !== "string" || !UUID.test(id)) return;

  const supabase = await createClient();
  const { error } = await supabase.rpc("set_active_routine", { p_routine_id: id });
  if (error) {
    console.error("[rutinas propias] error al activar:", error.code ?? "sin código");
    return;
  }

  refrescar();
  redirect("/entrenar");
}

// Elimina una rutina propia. El historial de entrenamientos se conserva.
export async function eliminarRutinaPersonal(formData: FormData): Promise<void> {
  const id = formData.get("id");
  if (typeof id !== "string" || !UUID.test(id)) return;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("routines")
    .delete()
    .eq("id", id)
    .eq("source", "custom")
    .select("id");

  if (error || !data || data.length === 0) {
    console.error("[rutinas propias] error al eliminar:", error?.code ?? "sin filas");
    return;
  }

  refrescar();
  redirect("/mis-rutinas?aviso=eliminada");
}