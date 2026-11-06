import { urlPublicaMedia } from "../media";

// Imagen de portada de una rutina: la subida desde el panel o, si no hay,
// la de siempre en public/images/rutinas/<slug>.jpg.
export function portadaDeRutina(slug: string, coverPath: string | null): string {
  return urlPublicaMedia(coverPath) ?? `/images/rutinas/${slug}.jpg`;
}