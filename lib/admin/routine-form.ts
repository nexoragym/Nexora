import {
  DIFFICULTIES,
  EQUIPMENT,
  type Difficulty,
  type Equipment,
  type Muscle,
} from "../exercises";
import { FOCUSES, GOALS, type Focus, type Goal } from "../questionnaire";
import { esPorTiempo, type CatalogRoutine } from "../routines/catalog";
import { SLUG_REGEX, lineas, slugificar } from "./exercise-form";

export const MAX_DIAS = 7;
export const MAX_EJERCICIOS_DIA = 30;
// Los ejercicios por tiempo se miden en segundos: menos de esto no tiene sentido.
export const MIN_SEGUNDOS = 10;

const UUID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// ---------- Lo que se edita en pantalla ----------
export type Num = number | "";

export type EjercicioDraft = {
  exerciseId: string;
  // Solo para mostrar: el servidor vuelve a comprobarlos.
  name: string;
  slug: string;
  active: boolean;
  sets: Num;
  repsMin: Num;
  repsMax: Num;
  rest: Num;
};

export type DiaDraft = { name: string; exercises: EjercicioDraft[] };

export type RutinaDraft = {
  id: string | null;
  slug: string;
  name: string;
  description: string;
  goal: Goal | "";
  focus: Focus;
  level: Difficulty | "";
  weeks: Num;
  equipment: Equipment[];
  notes: string;
  warnings: string;
  days: DiaDraft[];
};

export const DRAFT_VACIO: RutinaDraft = {
  id: null,
  slug: "",
  name: "",
  description: "",
  goal: "",
  focus: "balanced",
  level: "",
  weeks: 8,
  equipment: [],
  notes: "",
  warnings: "",
  days: [{ name: "", exercises: [] }],
};

// ---------- Lo que se guarda, ya validado ----------
export type EjercicioValido = {
  exerciseId: string;
  sets: number;
  repsMin: number;
  repsMax: number;
  rest: number;
};

export type DiaValido = { name: string; exercises: EjercicioValido[] };

export type RutinaValida = {
  id: string | null;
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
  days: DiaValido[];
};

export type ResultadoBusqueda = {
  id: string;
  slug: string;
  name: string;
  equipment: Equipment;
  difficulty: Difficulty;
  muscles: Muscle[];
};

// ---------- Utilidades ----------
function texto(valor: unknown): string {
  return typeof valor === "string" ? valor : "";
}

function limpiar(valor: string): string {
  return valor.trim().replace(/\s+/g, " ");
}

function entero(valor: unknown): number | null {
  if (typeof valor === "number") return Number.isInteger(valor) ? valor : null;
  if (typeof valor === "string" && valor.trim() !== "") {
    const numero = Number(valor);
    return Number.isInteger(numero) ? numero : null;
  }
  return null;
}

function fuera(valor: number | null, min: number, max: number): boolean {
  return valor === null || valor < min || valor > max;
}

function enLista<T extends string>(
  lista: readonly T[],
  valor: unknown,
): T | null {
  return typeof valor === "string" && (lista as readonly string[]).includes(valor)
    ? (valor as T)
    : null;
}

function objeto(valor: unknown): Record<string, unknown> {
  return typeof valor === "object" && valor !== null
    ? (valor as Record<string, unknown>)
    : {};
}

function revisarLineas(
  elementos: string[],
  etiqueta: string,
  errores: string[],
) {
  if (elementos.length > 10) {
    errores.push(`«${etiqueta}» tiene demasiadas líneas (máximo 10).`);
  }
  if (elementos.some((linea) => linea.length > 300)) {
    errores.push(`Alguna línea de «${etiqueta}» supera los 300 caracteres.`);
  }
}

// Cambia de sitio un elemento (arriba o abajo) sin modificar la lista original.
export function moverElemento<T>(lista: readonly T[], indice: number, delta: -1 | 1): T[] {
  const destino = indice + delta;
  const copia = [...lista];
  if (indice < 0 || indice >= copia.length || destino < 0 || destino >= copia.length) {
    return copia;
  }
  [copia[indice], copia[destino]] = [copia[destino], copia[indice]];
  return copia;
}

// ---------- Validación ----------
function validarDias(bruto: unknown, errores: string[]): DiaValido[] {
  if (!Array.isArray(bruto) || bruto.length < 1 || bruto.length > MAX_DIAS) {
    errores.push(`La rutina debe tener entre 1 y ${MAX_DIAS} días.`);
    return [];
  }

  const dias: DiaValido[] = [];
  bruto.forEach((diaBruto, i) => {
    const n = i + 1;
    const dia = objeto(diaBruto);

    const name = limpiar(texto(dia.name));
    if (name.length < 1 || name.length > 80) {
      errores.push(`Día ${n}: el nombre debe tener entre 1 y 80 caracteres.`);
    }

    const lista = Array.isArray(dia.exercises) ? dia.exercises : [];
    if (lista.length < 1 || lista.length > MAX_EJERCICIOS_DIA) {
      errores.push(
        `Día ${n}: debe tener entre 1 y ${MAX_EJERCICIOS_DIA} ejercicios.`,
      );
    }

    const vistos = new Set<string>();
    const ejercicios: EjercicioValido[] = [];
    lista.forEach((ejercicioBruto, j) => {
      const m = j + 1;
      const e = objeto(ejercicioBruto);

      const exerciseId = texto(e.exerciseId);
      if (!UUID.test(exerciseId)) {
        errores.push(`Día ${n}, ejercicio ${m}: no es válido.`);
        return;
      }
      if (vistos.has(exerciseId)) {
        errores.push(`Día ${n}: hay un ejercicio repetido (el ${m}).`);
      }
      vistos.add(exerciseId);

      const sets = entero(e.sets);
      const repsMin = entero(e.repsMin);
      const repsMax = entero(e.repsMax);
      const rest = entero(e.rest);

      if (fuera(sets, 1, 10)) {
        errores.push(`Día ${n}, ejercicio ${m}: las series deben ser de 1 a 10.`);
      }
      if (fuera(repsMin, 1, 100) || fuera(repsMax, 1, 100)) {
        errores.push(
          `Día ${n}, ejercicio ${m}: las repeticiones deben ser de 1 a 100.`,
        );
      } else if (repsMin !== null && repsMax !== null && repsMax < repsMin) {
        errores.push(
          `Día ${n}, ejercicio ${m}: el máximo de repeticiones no puede ser menor que el mínimo.`,
        );
      }
      if (fuera(rest, 0, 600)) {
        errores.push(
          `Día ${n}, ejercicio ${m}: el descanso debe ser de 0 a 600 segundos.`,
        );
      }

      if (sets !== null && repsMin !== null && repsMax !== null && rest !== null) {
        ejercicios.push({ exerciseId, sets, repsMin, repsMax, rest });
      }
    });

    dias.push({ name, exercises: ejercicios });
  });

  return dias;
}

// Lee y valida una rutina. Las mismas reglas que la base de datos.
export function validarRutina(
  entrada: unknown,
  modo: "crear" | "editar",
): { valores?: RutinaValida; errores: string[] } {
  if (typeof entrada !== "object" || entrada === null) {
    return { errores: ["Los datos no son válidos. Recarga la página."] };
  }
  const d = entrada as Record<string, unknown>;
  const errores: string[] = [];

  const name = limpiar(texto(d.name));
  if (name.length < 1 || name.length > 80) {
    errores.push("El nombre debe tener entre 1 y 80 caracteres.");
  }

  const description = limpiar(texto(d.description));
  if (description.length < 1 || description.length > 300) {
    errores.push("La descripción debe tener entre 1 y 300 caracteres.");
  }

  let id: string | null = null;
  let slug = "";
  if (modo === "editar") {
    const valor = texto(d.id);
    if (UUID.test(valor)) {
      id = valor;
    } else {
      errores.push("Falta el identificador de la rutina. Recarga la página.");
    }
  } else {
    slug = slugificar(texto(d.slug).trim() || name)
      .slice(0, 60)
      .replace(/-+$/g, "");
    if (!SLUG_REGEX.test(slug)) {
      errores.push(
        "El identificador solo puede tener letras minúsculas, números y guiones.",
      );
    }
  }

  const goal = enLista(GOALS, d.goal);
  if (!goal) errores.push("Elige el objetivo.");

  const level = enLista(DIFFICULTIES, d.level);
  if (!level) errores.push("Elige el nivel.");

  const focus = enLista(FOCUSES, d.focus) ?? "balanced";

  const weeks = entero(d.weeks);
  if (fuera(weeks, 1, 52)) errores.push("Las semanas deben ser de 1 a 52.");

  const equipment = Array.isArray(d.equipment)
    ? Array.from(
        new Set(
          d.equipment.filter((v): v is Equipment => enLista(EQUIPMENT, v) !== null),
        ),
      )
    : [];
  if (equipment.length === 0) errores.push("Elige al menos un material.");

  const notes = lineas(texto(d.notes));
  revisarLineas(notes, "Notas", errores);
  const warnings = lineas(texto(d.warnings));
  revisarLineas(warnings, "Avisos", errores);

  const days = validarDias(d.days, errores);

  if (errores.length > 0 || !goal || !level || weeks === null) {
    return { errores };
  }

  return {
    errores,
    valores: {
      id,
      slug,
      name,
      description,
      goal,
      focus,
      level,
      weeks,
      equipment,
      notes,
      warnings,
      days,
    },
  };
}

// Comprobaciones que necesitan los datos reales de los ejercicios.
export function revisarEjerciciosRutina(
  rutina: RutinaValida,
  filas: readonly { id: string; slug: string; name: string; is_active: boolean }[],
): string[] {
  const porId = new Map(filas.map((fila) => [fila.id, fila] as const));
  const problemas: string[] = [];

  rutina.days.forEach((dia, i) => {
    dia.exercises.forEach((e) => {
      const fila = porId.get(e.exerciseId);
      if (!fila) {
        problemas.push(`Día ${i + 1}: un ejercicio ya no existe.`);
        return;
      }
      if (!fila.is_active) {
        problemas.push(
          `Día ${i + 1}: «${fila.name}» está desactivado. Actívalo o quítalo.`,
        );
      }
      if (esPorTiempo(fila.slug) && e.repsMin < MIN_SEGUNDOS) {
        problemas.push(
          `Día ${i + 1}: «${fila.name}» se mide en segundos: el mínimo debe ser ${MIN_SEGUNDOS} o más.`,
        );
      }
    });
  });

  return problemas;
}

// ---------- Conversiones ----------
// Formato que espera la función save_catalog_routine de Supabase.
export function rutinaAPayloadCatalogo(rutina: RutinaValida) {
  return {
    id: rutina.id,
    slug: rutina.slug,
    name: rutina.name,
    description: rutina.description,
    goal: rutina.goal,
    focus: rutina.focus,
    level: rutina.level,
    weeks: rutina.weeks,
    equipment: rutina.equipment,
    notes: rutina.notes,
    warnings: rutina.warnings,
    days: rutina.days.map((dia, i) => ({
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

export function rutinaADraft(rutina: CatalogRoutine): RutinaDraft {
  return {
    id: rutina.id,
    slug: rutina.slug,
    name: rutina.name,
    description: rutina.description,
    goal: rutina.goal,
    focus: rutina.focus,
    level: rutina.level,
    weeks: rutina.weeks,
    equipment: rutina.equipment,
    notes: rutina.notes.join("\n"),
    warnings: rutina.warnings.join("\n"),
    days: rutina.days.map((dia) => ({
      name: dia.name,
      exercises: dia.exercises.map((e) => ({
        exerciseId: e.exerciseId,
        name: e.name,
        slug: e.slug,
        active: e.active,
        sets: e.sets,
        repsMin: e.repsMin,
        repsMax: e.repsMax,
        rest: e.rest,
      })),
    })),
  };
}

// Valores por defecto al añadir un ejercicio a un día.
export function ejercicioNuevo(resultado: ResultadoBusqueda): EjercicioDraft {
  const porTiempo = esPorTiempo(resultado.slug);
  return {
    exerciseId: resultado.id,
    name: resultado.name,
    slug: resultado.slug,
    active: true,
    sets: 3,
    repsMin: porTiempo ? 20 : 8,
    repsMax: porTiempo ? 40 : 12,
    rest: porTiempo ? 45 : 90,
  };
}

// Qué campos han cambiado (para el historial).
export function camposCambiados(
  previa: RutinaValida | null,
  nueva: RutinaValida,
): string[] {
  if (!previa) {
    return [
      "name",
      "description",
      "goal",
      "level",
      "weeks",
      "equipment",
      "notes",
      "warnings",
      "days",
    ];
  }
  const cambios: string[] = [];
  if (previa.name !== nueva.name) cambios.push("name");
  if (previa.description !== nueva.description) cambios.push("description");
  if (previa.goal !== nueva.goal) cambios.push("goal");
  if (previa.level !== nueva.level) cambios.push("level");
  if (previa.weeks !== nueva.weeks) cambios.push("weeks");
  if ([...previa.equipment].sort().join() !== [...nueva.equipment].sort().join()) {
    cambios.push("equipment");
  }
  if (JSON.stringify(previa.notes) !== JSON.stringify(nueva.notes)) cambios.push("notes");
  if (JSON.stringify(previa.warnings) !== JSON.stringify(nueva.warnings)) {
    cambios.push("warnings");
  }
  if (JSON.stringify(previa.days) !== JSON.stringify(nueva.days)) cambios.push("days");
  return cambios;
}