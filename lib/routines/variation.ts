import type { QuestionnaireValues } from "../questionnaire";

// Número a partir de un texto (FNV-1a de 32 bits). Siempre da el mismo resultado.
export function hashTexto(texto: string): number {
  let hash = 0x811c9dc5;
  for (let i = 0; i < texto.length; i += 1) {
    hash ^= texto.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return hash >>> 0;
}

// Semilla con las respuestas del cuestionario. El sexo NO entra: solo personaliza
// las imágenes y no debe cambiar los ejercicios.
export function crearSemilla(preferencias: QuestionnaireValues): string {
  return [
    preferencias.goal,
    preferencias.focus ?? "balanced",
    preferencias.experience,
    preferencias.days,
    preferencias.minutes,
    preferencias.programWeeks ?? 8,
    [...preferencias.equipment].sort().join("+"),
    [...preferencias.limitations].sort().join("+"),
  ].join("|");
}