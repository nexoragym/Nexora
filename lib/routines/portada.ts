import { urlPublicaMedia } from "../media";

const UUID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Imagen de portada de una rutina: la subida desde el panel o, si no hay,
// la de siempre en public/images/rutinas/<slug>.jpg.
export function portadaDeRutina(slug: string, coverPath: string | null): string {
  return urlPublicaMedia(coverPath) ?? `/images/rutinas/${slug}.jpg`;
}

// Cada subida tiene un nombre nuevo, así no se mezcla con versiones antiguas de la caché.
export function rutaNuevaPortada(
  routineId: string,
  extension: string,
  ahora: number,
): string {
  return `routines/${routineId}/cover-${ahora}.${extension}`;
}

// Comprueba que una ruta es de esa rutina y tiene la forma esperada.
export function rutaPortadaValida(routineId: string, ruta: string): boolean {
  if (!UUID.test(routineId)) return false;
  const patron = new RegExp(
    `^routines/${routineId.toLowerCase()}/cover-\\d{10,16}\\.(?:jpg|png|webp)$`,
  );
  return patron.test(ruta);
}