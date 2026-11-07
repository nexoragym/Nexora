import type { Difficulty } from "../exercises";
import { DIFFICULTY_RANK, SPLITS, type DayKind } from "./rules";
import { hashTexto } from "./variation";

type VarianteSemana = { kinds: readonly DayKind[]; minLevel: Difficulty };

const v = (minLevel: Difficulty, ...kinds: DayKind[]): VarianteSemana => ({
  kinds,
  minLevel,
});

// Estructuras posibles de la semana según los días. La primera de cada número
// es la de siempre.
export const SPLIT_VARIANTS: Record<number, readonly VarianteSemana[]> = {
  1: [v("beginner", "full")],
  2: [v("beginner", "full", "full"), v("beginner", "upper", "lower")],
  3: [
    v("beginner", "full", "full", "full"),
    v("beginner", "upper", "lower", "full"),
    v("intermediate", "push", "pull", "legs"),
  ],
  4: [
    v("beginner", "upper", "lower", "upper", "lower"),
    v("intermediate", "push", "pull", "legs", "full"),
  ],
  5: [
    v("beginner", "push", "pull", "legs", "upper", "lower"),
    v("beginner", "upper", "lower", "push", "pull", "legs"),
  ],
  6: [
    v("beginner", "push", "pull", "legs", "push", "pull", "legs"),
    v("intermediate", "upper", "lower", "push", "pull", "legs", "full"),
  ],
};

// Elige la estructura de la semana (siempre la misma para las mismas respuestas).
export function elegirSplit(
  sesiones: number,
  nivel: Difficulty,
  semilla: string,
): readonly DayKind[] | null {
  const validas = (SPLIT_VARIANTS[sesiones] ?? []).filter(
    (variante) => DIFFICULTY_RANK[variante.minLevel] <= DIFFICULTY_RANK[nivel],
  );
  if (validas.length === 0) return SPLITS[sesiones] ?? null;
  return validas[hashTexto(`${semilla}|semana`) % validas.length].kinds;
}

// Texto que se muestra en las notas del plan.
export function descripcionDeSplit(tipos: readonly DayKind[]): string {
  const usados = new Set(tipos);

  if (usados.size === 1 && usados.has("full")) {
    return tipos.length === 1
      ? "Tu sesión trabaja todo el cuerpo."
      : "Cada sesión trabaja todo el cuerpo.";
  }

  const hayEmpujeTiron =
    usados.has("push") || usados.has("pull") || usados.has("legs");

  if (!hayEmpujeTiron) {
    return usados.has("full")
      ? "Combinas sesiones de tren superior, de tren inferior y de cuerpo completo."
      : "Alternas sesiones de tren superior y de tren inferior.";
  }

  const soloCiclo =
    !usados.has("upper") && !usados.has("lower") && !usados.has("full");
  if (soloCiclo && tipos.length === 6) {
    return "Repites dos veces el ciclo de empuje, tirón y piernas.";
  }

  let texto = "Combinas empuje, tirón y piernas";
  if (usados.has("upper") || usados.has("lower")) {
    texto += " con sesiones de tren superior e inferior";
  }
  if (usados.has("full")) {
    texto += usados.has("upper") || usados.has("lower") ? " y una de" : " y una sesión de";
    texto += " cuerpo completo";
  }
  return `${texto}.`;
}