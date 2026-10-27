// Textos del historial de cambios del panel.
const ETIQUETAS_ACCION: Record<string, string> = {
  "exercise.create": "Ejercicio creado",
  "exercise.update": "Ejercicio editado",
  "exercise.activate": "Ejercicio activado",
  "exercise.deactivate": "Ejercicio desactivado",
  "exercise.duplicate": "Ejercicio duplicado",
  "exercise.media_update": "Imagen o vídeo subido",
  "exercise.media_remove": "Imagen o vídeo quitado",
};

const NOMBRES_CAMPO: Record<string, string> = {
  name: "nombre",
  primary_muscles: "músculos principales",
  secondary_muscles: "músculos secundarios",
  equipment: "material",
  movement_pattern: "tipo de movimiento",
  difficulty: "nivel",
  instructions: "instrucciones",
  common_mistakes: "errores habituales",
  aliases: "otros nombres",
  is_active: "estado",
};

export function etiquetaAccion(accion: string): string {
  return ETIQUETAS_ACCION[accion] ?? accion;
}

// Resumen de una línea de los detalles que guarda cada acción.
export function describirDetalles(detalles: unknown): string {
  if (typeof detalles !== "object" || detalles === null) return "";
  const datos = detalles as Record<string, unknown>;

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