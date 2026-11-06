import type { SupabaseClient } from "@supabase/supabase-js";

// Textos del historial de cambios del panel.
const ETIQUETAS_ACCION: Record<string, string> = {
  "exercise.create": "Ejercicio creado",
  "exercise.update": "Ejercicio editado",
  "exercise.activate": "Ejercicio activado",
  "exercise.deactivate": "Ejercicio desactivado",
  "exercise.duplicate": "Ejercicio duplicado",
  "exercise.media_update": "Imagen o vídeo subido",
  "exercise.media_remove": "Imagen o vídeo quitado",
  "exercise.import": "Importación de ejercicios",
  "routine.create": "Rutina creada",
  "routine.update": "Rutina editada",
  "routine.publish": "Rutina publicada",
  "routine.unpublish": "Rutina ocultada",
  "routine.duplicate": "Rutina duplicada",
  "routine.cover_update": "Portada de rutina subida",
  "routine.cover_remove": "Portada de rutina quitada",
};

const NOMBRES_CAMPO: Record<string, string> = {
  name: "nombre",
  description: "descripción",
  goal: "objetivo",
  level: "nivel",
  weeks: "semanas",
  equipment: "material",
  notes: "notas",
  warnings: "avisos",
  days: "días y ejercicios",
  primary_muscles: "músculos principales",
  secondary_muscles: "músculos secundarios",
  movement_pattern: "tipo de movimiento",
  difficulty: "nivel",
  instructions: "instrucciones",
  common_mistakes: "errores habituales",
  aliases: "otros nombres",
  use_in_generator: "uso en rutinas automáticas",
  popularity: "popularidad",
  is_active: "estado",
};

export function etiquetaAccion(accion: string): string {
  return ETIQUETAS_ACCION[accion] ?? accion;
}

// Anota una acción en el historial. Si falla, no se cancela el cambio.
export async function anotarAccionAdmin(
  supabase: SupabaseClient,
  accion: string,
  id: string,
  detalles: Record<string, unknown>,
  tabla = "exercises",
): Promise<void> {
  const { error } = await supabase.rpc("log_admin_action", {
    p_action: accion,
    p_target_table: tabla,
    p_target_id: id,
    p_details: detalles,
  });
  if (error) {
    console.error(
      "[admin] no se pudo anotar en el historial:",
      error.code ?? "sin código",
    );
  }
}

// Resumen de una línea de los detalles que guarda cada acción.
export function describirDetalles(detalles: unknown): string {
  if (typeof detalles !== "object" || detalles === null) return "";
  const datos = detalles as Record<string, unknown>;

  if (typeof datos.created === "number") {
    const numero = (clave: string) =>
      typeof datos[clave] === "number" ? (datos[clave] as number) : 0;
    return (
      `Creados: ${numero("created")} · Actualizados: ${numero("updated")} · ` +
      `Omitidos: ${numero("skipped")} · Con error: ${numero("failed")}`
    );
  }

  const elemento =
    typeof datos.name === "string"
      ? datos.name
      : typeof datos.slug === "string"
        ? datos.slug
        : "";

  const tipo =
    datos.kind === "image" ? "Imagen" : datos.kind === "video" ? "Vídeo" : "";

  const cambios = Array.isArray(datos.changed)
    ? datos.changed
        .filter((campo): campo is string => typeof campo === "string")
        .map((campo) => NOMBRES_CAMPO[campo] ?? campo)
    : [];

  const partes = [elemento, tipo];
  if (cambios.length > 0) partes.push(`Cambios: ${cambios.join(", ")}`);
  return partes.filter((parte) => parte.length > 0).join(" · ");
}

export function formatearFechaAdmin(iso: string, zona: string): string {
  const fecha = new Date(iso);
  if (Number.isNaN(fecha.getTime())) return iso;
  return fecha.toLocaleString("es-ES", {
    timeZone: zona,
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}