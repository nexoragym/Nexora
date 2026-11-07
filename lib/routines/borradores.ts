import {
  DIFFICULTIES,
  DIFFICULTY_LABELS,
  type Difficulty,
  type Equipment,
} from "../exercises";
import {
  FOCUSES,
  FOCUS_LABELS,
  GOALS,
  GOAL_LABELS,
  type Focus,
  type Goal,
} from "../questionnaire";
import { generateRoutine } from "./generator";
import { nombreSesion } from "./names";
import { MAX_SESSIONS_BY_LEVEL, MIN_EXERCISES_PER_DAY } from "./rules";
import type { GeneratorExercise } from "./types";
import { hashTexto } from "./variation";

export const MAX_BORRADORES = 300;
// Cuántas rutinas se crean en cada petición (para no pasarse de tiempo).
export const TAM_LOTE_BORRADORES = 10;
export const MAX_LOTE_SERVIDOR = 15;
const MINUTOS_BORRADOR = 60;

const AVISO_BARRA =
  "Los ejercicios con barra son exigentes: empieza con poco peso y usa topes de seguridad o entrena acompañado.";

// Notas generales que se añaden solas al usar una rutina: aquí no se guardan.
const NOTAS_GENERALES = [
  "Las series, repeticiones y descansos son orientativos",
  "Estas recomendaciones son generales",
];

// ---------- Material ----------
export const MATERIALES_BORRADOR = [
  "casa",
  "mancuernas",
  "maquinas",
  "gimnasio",
] as const;
export type MaterialBorrador = (typeof MATERIALES_BORRADOR)[number];

export const MATERIAL_BORRADOR: Record<
  MaterialBorrador,
  { corto: string; largo: string; con: string; equipment: Equipment[] }
> = {
  casa: {
    corto: "Casa",
    largo: "En casa (solo peso corporal)",
    con: "peso corporal",
    equipment: ["bodyweight"],
  },
  mancuernas: {
    corto: "Mancuernas",
    largo: "Mancuernas",
    con: "mancuernas",
    equipment: ["dumbbells", "bodyweight"],
  },
  maquinas: {
    corto: "Máquinas",
    largo: "Máquinas y mancuernas",
    con: "máquinas y mancuernas",
    equipment: ["machines", "dumbbells", "bodyweight"],
  },
  gimnasio: {
    corto: "Gimnasio",
    largo: "Gimnasio completo (con barra)",
    con: "todo el material del gimnasio",
    equipment: ["barbell", "dumbbells", "machines", "bodyweight"],
  },
};

// ---------- Combinaciones e identificadores ----------
export type Combinacion = {
  goal: Goal;
  level: Difficulty;
  days: number;
  material: MaterialBorrador;
  focus: Focus;
};

const GOAL_SLUG: Record<Goal, string> = {
  muscle: "masa",
  definition: "definir",
  strength: "fuerza",
  general_fitness: "forma",
};
const LEVEL_SLUG: Record<Difficulty, string> = {
  beginner: "principiante",
  intermediate: "intermedio",
  advanced: "avanzado",
};
const FOCUS_SLUG: Record<Focus, string> = {
  balanced: "completo",
  chest: "pecho",
  back: "espalda",
  legs_glutes: "piernas",
  arms_shoulders: "brazos",
  core: "core",
};

// Ejemplo: auto-masa-principiante-3d-mancuernas-pecho
export function slugDeCombinacion(c: Combinacion): string {
  return [
    "auto",
    GOAL_SLUG[c.goal],
    LEVEL_SLUG[c.level],
    `${c.days}d`,
    c.material,
    FOCUS_SLUG[c.focus],
  ].join("-");
}

function buscarClave<T extends string>(
  mapa: Record<T, string>,
  valor: string,
): T | null {
  const entrada = (Object.entries(mapa) as [T, string][]).find(
    ([, texto]) => texto === valor,
  );
  return entrada ? entrada[0] : null;
}

// Vuelve a sacar la combinación de un identificador (y comprueba que es válida).
export function combinacionDeSlug(slug: string): Combinacion | null {
  const partes = slug.split("-");
  if (partes.length !== 6 || partes[0] !== "auto") return null;

  const goal = buscarClave(GOAL_SLUG, partes[1]);
  const level = buscarClave(LEVEL_SLUG, partes[2]);
  const dias = /^([1-6])d$/.exec(partes[3]);
  const material = (MATERIALES_BORRADOR as readonly string[]).includes(partes[4])
    ? (partes[4] as MaterialBorrador)
    : null;
  const focus = buscarClave(FOCUS_SLUG, partes[5]);
  if (!goal || !level || !dias || !material || !focus) return null;

  const days = Number(dias[1]);
  if (days > MAX_SESSIONS_BY_LEVEL[level]) return null;
  return { goal, level, days, material, focus };
}

// ---------- Opciones ----------
export type OpcionesBorradores = {
  goals: Goal[];
  levels: Difficulty[];
  days: number[];
  materials: MaterialBorrador[];
  focuses: Focus[];
  max: number;
};

export const DIAS_BORRADOR = [2, 3, 4, 5, 6] as const;

export const OPCIONES_POR_DEFECTO: OpcionesBorradores = {
  goals: [...GOALS],
  levels: [...DIFFICULTIES],
  days: [3, 4, 5],
  materials: [...MATERIALES_BORRADOR],
  focuses: [...FOCUSES],
  max: 100,
};

function subconjunto<T>(permitidos: readonly T[], valor: unknown): T[] {
  if (!Array.isArray(valor)) return [];
  return permitidos.filter((p) => valor.includes(p));
}

// Lo que llega del navegador no es de fiar: se queda solo con lo permitido.
export function leerOpciones(entrada: unknown): OpcionesBorradores | null {
  if (typeof entrada !== "object" || entrada === null) return null;
  const d = entrada as Record<string, unknown>;

  const goals = subconjunto(GOALS, d.goals);
  const levels = subconjunto(DIFFICULTIES, d.levels);
  const days = subconjunto([1, 2, 3, 4, 5, 6], d.days);
  const materials = subconjunto(MATERIALES_BORRADOR, d.materials);
  const focuses = subconjunto(FOCUSES, d.focuses);
  const max = typeof d.max === "number" && Number.isInteger(d.max) ? d.max : 0;

  if (
    goals.length === 0 ||
    levels.length === 0 ||
    days.length === 0 ||
    materials.length === 0 ||
    focuses.length === 0 ||
    max < 1 ||
    max > MAX_BORRADORES
  ) {
    return null;
  }
  return { goals, levels, days, materials, focuses, max };
}

// Todas las combinaciones posibles, en un orden fijo que reparte bien los tipos.
export function listarCombinaciones(opciones: OpcionesBorradores): Combinacion[] {
  const lista: Combinacion[] = [];
  for (const goal of opciones.goals) {
    for (const level of opciones.levels) {
      for (const days of opciones.days) {
        if (days > MAX_SESSIONS_BY_LEVEL[level]) continue;
        for (const material of opciones.materials) {
          for (const focus of opciones.focuses) {
            lista.push({ goal, level, days, material, focus });
          }
        }
      }
    }
  }

  const clave = (c: Combinacion) => slugDeCombinacion(c);
  return lista.sort(
    (a, b) =>
      hashTexto(clave(a)) - hashTexto(clave(b)) || clave(a).localeCompare(clave(b)),
  );
}

// ---------- Una rutina borrador ----------
export type BorradorGenerado = {
  slug: string;
  name: string;
  description: string;
  goal: Goal;
  focus: Focus;
  level: Difficulty;
  weeks: number;
  equipment: Equipment[];
  notes: string[];
  warnings: string[];
  days: {
    name: string;
    exercises: {
      exerciseId: string;
      sets: number;
      repsMin: number;
      repsMax: number;
      rest: number;
    }[];
  }[];
  // Para detectar rutinas repetidas.
  firma: string;
};

// Genera la rutina de una combinación con la biblioteca real.
// Devuelve null si no se puede preparar una rutina completa.
export function generarBorrador(
  c: Combinacion,
  biblioteca: readonly GeneratorExercise[],
): BorradorGenerado | null {
  const datos = MATERIAL_BORRADOR[c.material];
  const semanas = c.goal === "general_fitness" ? 4 : 8;

  const rutina = generateRoutine(
    {
      experience: c.level,
      goal: c.goal,
      days: c.days,
      minutes: MINUTOS_BORRADOR,
      equipment: datos.equipment,
      limitations: [],
      sex: null,
      focus: c.focus,
      programWeeks: semanas,
    },
    biblioteca,
  );

  if (
    rutina.days.length !== c.days ||
    rutina.days.some((dia) => dia.exercises.length < MIN_EXERCISES_PER_DAY)
  ) {
    return null;
  }

  const equipoPorId = new Map(biblioteca.map((e) => [e.id, e.equipment] as const));
  const usaBarra = rutina.days.some((dia) =>
    dia.exercises.some((e) => equipoPorId.get(e.exerciseId) === "barbell"),
  );

  const nombre = [
    GOAL_LABELS[c.goal],
    DIFFICULTY_LABELS[c.level],
    `${c.days} ${c.days === 1 ? "día" : "días"}`,
    datos.corto,
    c.focus === "balanced" ? null : FOCUS_LABELS[c.focus],
  ]
    .filter((parte): parte is string => parte !== null)
    .join(" · ")
    .slice(0, 80);

  const descripcion = (
    `${c.days} ${c.days === 1 ? "sesión" : "sesiones"} por semana durante ${semanas} semanas. ` +
    `${rutina.notes[0] ?? ""} ` +
    `Pensada para un nivel ${DIFFICULTY_LABELS[c.level].toLowerCase()} con ${datos.con}.`
  )
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 300);

  const notas = rutina.notes
    .filter((nota) => !NOTAS_GENERALES.some((general) => nota.startsWith(general)))
    .map((nota) => nota.slice(0, 300))
    .slice(0, 10);

  const avisos = rutina.warnings.map((aviso) =>
    aviso
      .replace(
        "con tu material, tu nivel y tus preferencias",
        "con este material y este nivel",
      )
      .slice(0, 300),
  );
  if (usaBarra) avisos.push(AVISO_BARRA);

  const dias = rutina.days.map((dia) => ({
    name: nombreSesion(dia.name),
    exercises: dia.exercises.map((e) => ({
      exerciseId: e.exerciseId,
      sets: e.targetSets,
      repsMin: e.repsMin,
      repsMax: e.repsMax,
      rest: e.restSeconds,
    })),
  }));

  const firma = rutina.days
    .map(
      (dia) =>
        `${nombreSesion(dia.name)}:` +
        dia.exercises
          .map((e) => `${e.exerciseSlug}x${e.targetSets}x${e.repsMin}-${e.repsMax}`)
          .join(","),
    )
    .join("|");

  return {
    slug: slugDeCombinacion(c),
    name: nombre,
    description: descripcion,
    goal: c.goal,
    focus: c.focus,
    level: c.level,
    weeks: semanas,
    equipment: datos.equipment,
    notes: notas,
    warnings: avisos.slice(0, 10),
    days: dias,
    firma,
  };
}

// Formato que espera la función save_catalog_routine de Supabase (crea la rutina oculta).
export function borradorAPayload(b: BorradorGenerado) {
  return {
    id: null,
    slug: b.slug,
    name: b.name,
    description: b.description,
    goal: b.goal,
    focus: b.focus,
    level: b.level,
    weeks: b.weeks,
    equipment: b.equipment,
    notes: b.notes,
    warnings: b.warnings,
    days: b.days.map((dia, i) => ({
      day_number: i + 1,
      name: dia.name,
      exercises: dia.exercises.map((e, j) => ({
        exercise_id: e.exerciseId,
        sort_order: j + 1,
        target_sets: e.sets,
        reps_min: e.repsMin,
        reps_max: e.repsMax,
        rest_seconds: e.rest,
        notes: null,
      })),
    })),
  };
}

// ---------- Plan: qué rutinas se van a crear ----------
export type PlanBorradores = {
  posibles: number;
  revisadas: number;
  sinEjercicios: number;
  duplicadas: number;
  seleccion: Combinacion[];
};

export function planificarBorradores(
  opciones: OpcionesBorradores,
  biblioteca: readonly GeneratorExercise[],
): PlanBorradores {
  const combinaciones = listarCombinaciones(opciones);
  const firmas = new Set<string>();
  const seleccion: Combinacion[] = [];
  let sinEjercicios = 0;
  let duplicadas = 0;
  let revisadas = 0;

  for (const c of combinaciones) {
    if (seleccion.length >= opciones.max) break;
    revisadas += 1;

    const borrador = generarBorrador(c, biblioteca);
    if (!borrador) {
      sinEjercicios += 1;
      continue;
    }
    if (firmas.has(borrador.firma)) {
      duplicadas += 1;
      continue;
    }
    firmas.add(borrador.firma);
    seleccion.push(c);
  }

  return {
    posibles: combinaciones.length,
    revisadas,
    sinEjercicios,
    duplicadas,
    seleccion,
  };
}

// ---------- Lo que viaja entre servidor y pantalla ----------
export type VistaBorradores = {
  ok: boolean;
  error?: string;
  pendientes: string[];
  ejemplos: string[];
  resumen: {
    biblioteca: number;
    posibles: number;
    revisadas: number;
    sinEjercicios: number;
    duplicadas: number;
    yaExisten: number;
    aCrear: number;
  };
};

export type ResultadoLote = {
  ok: boolean;
  error?: string;
  creadas: number;
  yaExistian: number;
  sinEjercicios: number;
  errores: number;
};

export type ResultadoPublicacion = {
  ok: boolean;
  error?: string;
  cantidad: number;
  pendientes: number;
};