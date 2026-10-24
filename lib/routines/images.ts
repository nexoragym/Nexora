// Enfoques que tienen imagen de tarjeta.
export const ENFOQUES_IMAGEN = [
  "balanced",
  "chest",
  "back",
  "legs_glutes",
  "arms_shoulders",
  "core",
] as const;

// Ruta de la imagen de una rutina según sexo (opcional) y enfoque.
// Si el sexo no está indicado, se usa la versión "male".
// Ejemplos: /images/rutinas/male-chest.jpg, /images/rutinas/female-core.jpg
export function rutinaImagen(
  sexo: string | null,
  enfoque: string | null,
): string {
  const sexoImagen = sexo === "female" ? "female" : "male";
  const enfoqueImagen =
    ENFOQUES_IMAGEN.find((valor) => valor === enfoque) ?? "balanced";
  return `/images/rutinas/${sexoImagen}-${enfoqueImagen}.jpg`;
}