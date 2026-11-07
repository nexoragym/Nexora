import type { Difficulty, Equipment } from "../exercises";
import type { Focus, Goal, Limitation } from "../questionnaire";
import {
  DIFFICULTY_RANK,
  EQUIPMENT_PREFERENCE,
  LIMITATION_EXCLUSIONS,
  type Slot,
} from "./rules";
import type { GeneratorExercise } from "./types";
import { hashTexto } from "./variation";

// Cuántos ejercicios como máximo compiten por un mismo hueco.
const POOL_MAX = 4;

export type Context = {
  goal: Goal;
  focus: Focus;
  level: Difficulty;
  minutes: number;
  equipment: ReadonlySet<Equipment>;
  limitations: readonly Limitation[];
  library: readonly GeneratorExercise[];
  // Candidatos ya calculados por hueco (acelera el generador).
  cache: Map<string, GeneratorExercise[]>;
};

export type WeekState = {
  usedInWeek: Set<string>;
  slotUsage: Map<string, number>;
};

function estaExcluido(
  ejercicio: GeneratorExercise,
  limitaciones: readonly Limitation[],
): boolean {
  return limitaciones.some((limitacion) => {
    const regla = LIMITATION_EXCLUSIONS[limitacion];
    return (
      regla.slugs.includes(ejercicio.slug) ||
      regla.patterns.includes(ejercicio.movement_pattern)
    );
  });
}

// Orden fijo (sin azar): material preferido, más popular, más exigente y nombre.
function comparador(objetivo: Goal) {
  const orden: readonly string[] = EQUIPMENT_PREFERENCE[objetivo];
  return (a: GeneratorExercise, b: GeneratorExercise): number => {
    const porMaterial = orden.indexOf(a.equipment) - orden.indexOf(b.equipment);
    if (porMaterial !== 0) return porMaterial;
    const porPopularidad = (b.popularity ?? 0) - (a.popularity ?? 0);
    if (porPopularidad !== 0) return porPopularidad;
    const porNivel = DIFFICULTY_RANK[b.difficulty] - DIFFICULTY_RANK[a.difficulty];
    if (porNivel !== 0) return porNivel;
    const porNombre = a.name.localeCompare(b.name, "es");
    if (porNombre !== 0) return porNombre;
    return a.slug.localeCompare(b.slug, "es");
  };
}

export function candidatos(hueco: Slot, ctx: Context): GeneratorExercise[] {
  const guardado = ctx.cache.get(hueco.id);
  if (guardado) return guardado;

  const lista = ctx.library
    .filter(
      (ejercicio) =>
        ctx.equipment.has(ejercicio.equipment) &&
        DIFFICULTY_RANK[ejercicio.difficulty] <= DIFFICULTY_RANK[ctx.level] &&
        hueco.patterns.includes(ejercicio.movement_pattern) &&
        (!hueco.muscles ||
          hueco.muscles.some((musculo) =>
            ejercicio.primary_muscles.includes(musculo),
          )) &&
        !estaExcluido(ejercicio, ctx.limitations),
    )
    .sort(comparador(ctx.goal));

  ctx.cache.set(hueco.id, lista);
  return lista;
}

// Los ejercicios que compiten por un hueco: mismo material que el mejor y,
// como mucho, un punto menos de popularidad. Si queda uno solo, entra también el siguiente.
export function formarPool(
  ordenados: readonly GeneratorExercise[],
  objetivo: Goal,
): GeneratorExercise[] {
  const orden: readonly string[] = EQUIPMENT_PREFERENCE[objetivo];
  const mejor = ordenados[0];
  const nivelMaterial = orden.indexOf(mejor.equipment);
  const popularidad = mejor.popularity ?? 0;

  const pool = ordenados
    .filter(
      (e) =>
        orden.indexOf(e.equipment) === nivelMaterial &&
        (e.popularity ?? 0) >= popularidad - 1,
    )
    .slice(0, POOL_MAX);

  return pool.length >= 2 ? pool : ordenados.slice(0, Math.min(2, ordenados.length));
}

export function elegirEjercicio(
  hueco: Slot,
  ctx: Context,
  estado: WeekState,
  usadosHoy: ReadonlySet<string>,
  semilla: string,
): GeneratorExercise | null {
  // Nunca se repite un ejercicio dentro de la misma sesión.
  const posibles = candidatos(hueco, ctx).filter((e) => !usadosHoy.has(e.id));
  if (posibles.length === 0) return null;

  const veces = estado.slotUsage.get(hueco.id) ?? 0;
  const numero = hashTexto(`${semilla}|${hueco.id}|${veces}`);

  // Se prefiere uno que no se haya usado ya esta semana, para dar variedad.
  const sinUsar = posibles.filter((e) => !estado.usedInWeek.has(e.id));
  if (sinUsar.length > 0) {
    const pool = formarPool(sinUsar, ctx.goal);
    return pool[numero % pool.length];
  }

  // Si todos se han usado, se rota entre ellos.
  return posibles[(veces + numero) % posibles.length];
}