import type { SupabaseClient } from "@supabase/supabase-js";
import {
  DIFFICULTIES,
  normalizarBusqueda,
  palabrasDeBusqueda,
  type Difficulty,
  type Equipment,
} from "../exercises";
import { FOCUSES, GOALS, type Focus, type Goal } from "../questionnaire";
import { portadaDeRutina } from "./portada";

export const POR_PAGINA = 12;

// "Con este material puedo hacerla": solo salen rutinas que no necesitan nada más.
export const MATERIALES_FILTRO = ["casa", "mancuernas", "maquinas"] as const;
export type MaterialFiltro = (typeof MATERIALES_FILTRO)[number];

export const MATERIAL_FILTRO_LABELS: Record<MaterialFiltro, string> = {
  casa: "Sin material (en casa)",
  mancuernas: "Con mancuernas",
  maquinas: "Con máquinas y mancuernas",
};

const PERMITIDO: Record<MaterialFiltro, readonly Equipment[]> = {
  casa: ["bodyweight"],
  mancuernas: ["bodyweight", "dumbbells"],
  maquinas: ["bodyweight", "dumbbells", "machines"],
};

export type RutinaListada = {
  id: string;
  slug: string;
  name: string;
  description: string;
  goal: Goal;
  focus: Focus;
  level: Difficulty;
  weeks: number;
  equipment: Equipment[];
  coverPath: string | null;
  daysCount: number;
};

export type FiltrosRutinas = {
  q: string;
  goal: Goal | "";
  level: Difficulty | "";
  days: number | null;
  material: MaterialFiltro | "";
  focus: Focus | "";
  page: number;
};

type Params = Record<string, string | string[] | undefined>;

function primero(valor: string | string[] | undefined): string {
  return Array.isArray(valor) ? (valor[0] ?? "") : (valor ?? "");
}

function soloSiPermitido<T extends string>(permitidos: readonly T[], valor: string): T | "" {
  return (permitidos as readonly string[]).includes(valor) ? (valor as T) : "";
}

// Lee y valida los filtros de la dirección de la página.
export function leerFiltrosRutinas(params: Params): FiltrosRutinas {
  const dias = Number(primero(params.dias));
  const pagina = Number(primero(params.pagina));
  return {
    q: primero(params.q).trim().slice(0, 50),
    goal: soloSiPermitido(GOALS, primero(params.objetivo)),
    level: soloSiPermitido(DIFFICULTIES, primero(params.nivel)),
    days: Number.isInteger(dias) && dias >= 1 && dias <= 7 ? dias : null,
    material: soloSiPermitido(MATERIALES_FILTRO, primero(params.material)),
    focus: soloSiPermitido(FOCUSES, primero(params.enfoque)),
    page: Number.isInteger(pagina) && pagina >= 1 ? pagina : 1,
  };
}

export function filtrarRutinas(
  lista: readonly RutinaListada[],
  filtros: FiltrosRutinas,
): RutinaListada[] {
  const palabras = palabrasDeBusqueda(filtros.q);
  const permitido = filtros.material
    ? new Set<Equipment>(PERMITIDO[filtros.material])
    : null;

  return lista.filter((rutina) => {
    if (filtros.goal && rutina.goal !== filtros.goal) return false;
    if (filtros.level && rutina.level !== filtros.level) return false;
    if (filtros.focus && rutina.focus !== filtros.focus) return false;
    if (filtros.days !== null && rutina.daysCount !== filtros.days) return false;
    if (permitido && !rutina.equipment.every((e) => permitido.has(e))) return false;
    if (palabras.length > 0) {
      const texto = normalizarBusqueda(`${rutina.name} ${rutina.description}`);
      if (!palabras.every((palabra) => texto.includes(palabra))) return false;
    }
    return true;
  });
}

export function paginar<T>(
  lista: readonly T[],
  pagina: number,
  tamano = POR_PAGINA,
): { items: T[]; pagina: number; totalPaginas: number } {
  const totalPaginas = Math.max(1, Math.ceil(lista.length / tamano));
  const actual = Math.min(Math.max(1, pagina), totalPaginas);
  return {
    items: lista.slice((actual - 1) * tamano, actual * tamano),
    pagina: actual,
    totalPaginas,
  };
}

// Las rutinas automáticas no tienen imagen propia: usan la de una rutina parecida.
export function portadaListada(rutina: RutinaListada): string {
  if (rutina.coverPath) return portadaDeRutina(rutina.slug, rutina.coverPath);
  if (!rutina.slug.startsWith("auto-")) return portadaDeRutina(rutina.slug, null);

  const sinMaterial = rutina.equipment.every((e) => e === "bodyweight");
  const imagen: Record<Goal, string> = {
    muscle: "masa-muscular-principiante",
    definition: sinMaterial ? "definir-en-casa" : "definir-gimnasio",
    strength: "fuerza-intermedio",
    general_fitness: "condicion-fisica-principiante",
  };
  return `/images/rutinas/${imagen[rutina.goal]}.jpg`;
}

// ---------- Lectura de las rutinas publicadas ----------
const SELECT =
  "id, slug, name, description, goal, focus, level, weeks, equipment, cover_path, " +
  "catalog_routine_days(id)";
const TAM_PAGINA = 1000;

type Fila = {
  id: string;
  slug: string;
  name: string;
  description: string;
  goal: Goal;
  focus: Focus;
  level: Difficulty;
  weeks: number;
  equipment: Equipment[];
  cover_path: string | null;
  catalog_routine_days: { id: string }[] | null;
};

export async function leerRutinasPublicadas(
  supabase: SupabaseClient,
): Promise<{ rutinas: RutinaListada[]; error: boolean }> {
  const rutinas: RutinaListada[] = [];

  for (let desde = 0; ; desde += TAM_PAGINA) {
    const { data, error } = await supabase
      .from("catalog_routines")
      .select(SELECT)
      .eq("is_published", true)
      .order("sort_order")
      .order("name")
      .order("id")
      .range(desde, desde + TAM_PAGINA - 1);

    if (error) {
      console.error("[rutinas] error al listar:", error.code ?? "sin código");
      return { rutinas: [], error: true };
    }

    const filas = (data ?? []) as unknown as Fila[];
    for (const fila of filas) {
      rutinas.push({
        id: fila.id,
        slug: fila.slug,
        name: fila.name,
        description: fila.description,
        goal: fila.goal,
        focus: fila.focus,
        level: fila.level,
        weeks: fila.weeks,
        equipment: fila.equipment,
        coverPath: fila.cover_path,
        daysCount: (fila.catalog_routine_days ?? []).length,
      });
    }
    if (filas.length < TAM_PAGINA) break;
  }

  return { rutinas, error: false };
}