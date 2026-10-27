// Reglas de las imágenes y vídeos de los ejercicios.
export const BUCKET_MEDIA = "exercise-media";

export type TipoMedia = "image" | "video";

const TIPOS_PERMITIDOS: Record<TipoMedia, Map<string, string>> = {
  image: new Map([
    ["image/jpeg", "jpg"],
    ["image/png", "png"],
    ["image/webp", "webp"],
  ]),
  video: new Map([
    ["video/mp4", "mp4"],
    ["video/webm", "webm"],
  ]),
};

export const LIMITE_BYTES: Record<TipoMedia, number> = {
  image: 2 * 1024 * 1024,
  video: 10 * 1024 * 1024,
};

const UUID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function esTipoMedia(valor: unknown): valor is TipoMedia {
  return valor === "image" || valor === "video";
}

export function extensionDeTipo(tipo: TipoMedia, mime: string): string | null {
  return TIPOS_PERMITIDOS[tipo].get(mime) ?? null;
}

export function formatearTamano(bytes: number): string {
  if (bytes < 1024 * 1024) {
    return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  }
  return `${(bytes / (1024 * 1024)).toLocaleString("es-ES", {
    maximumFractionDigits: 1,
  })} MB`;
}

// Devuelve el motivo si el archivo no sirve, o null si está bien.
export function validarArchivoMedia(
  tipo: TipoMedia,
  archivo: { type: string; size: number },
): string | null {
  if (!extensionDeTipo(tipo, archivo.type)) {
    return tipo === "image"
      ? "Formato no permitido. Usa JPG, PNG o WebP."
      : "Formato no permitido. Usa MP4 o WebM.";
  }
  if (archivo.size <= 0) {
    return "El archivo está vacío.";
  }
  if (archivo.size > LIMITE_BYTES[tipo]) {
    return `El archivo pesa ${formatearTamano(archivo.size)} y el máximo es ${formatearTamano(LIMITE_BYTES[tipo])}. Comprímelo y vuelve a intentarlo.`;
  }
  return null;
}

// Cada subida tiene un nombre nuevo, así no se mezcla con versiones antiguas guardadas en la caché.
export function rutaNuevaMedia(
  exerciseId: string,
  tipo: TipoMedia,
  extension: string,
  ahora: number,
): string {
  return `exercises/${exerciseId}/${tipo}-${ahora}.${extension}`;
}

// Comprueba que una ruta es de ese ejercicio y tiene la forma esperada.
export function rutaMediaValida(
  exerciseId: string,
  tipo: TipoMedia,
  ruta: string,
): boolean {
  if (!UUID.test(exerciseId)) return false;
  const extensiones = tipo === "image" ? "jpg|png|webp" : "mp4|webm";
  const patron = new RegExp(
    `^exercises/${exerciseId.toLowerCase()}/${tipo}-\\d{10,16}\\.(?:${extensiones})$`,
  );
  return patron.test(ruta);
}

// Dirección pública de un archivo guardado, o null si no hay.
export function urlPublicaMedia(
  ruta: string | null | undefined,
): string | null {
  if (!ruta) return null;
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!base) return null;
  const codificada = ruta.split("/").map(encodeURIComponent).join("/");
  return `${base.replace(/\/+$/, "")}/storage/v1/object/public/${BUCKET_MEDIA}/${codificada}`;
}

// Campos que añade la base de datos a un ejercicio con imagen o vídeo.
export type ConMedia = {
  image_path?: string | null;
  video_path?: string | null;
};