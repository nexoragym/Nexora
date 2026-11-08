import {
  validarRutina,
  type DiaDraft,
  type DiaValido,
  type EjercicioDraft,
  type Num,
  type RutinaValida,
} from "../admin/routine-form";
import { EQUIPMENT, MUSCLES, type Equipment, type Muscle } from "../exercises";
import { GOALS, type Goal } from "../questionnaire";
import {
  CATALOG_GENERAL_NOTES,
  CATALOG_GENERAL_WARNINGS,
  TIMED_NOTE,
  esPorTiempo,
} from "./catalog";

export const MAX_RUTINAS_PERSONALES = 20;

export const AVISO_BARRA =
  "Los ejercicios con barra son exigentes: empieza con poco peso y usa topes de seguridad o entrena acompañado.";

// ---------- Lo que se edita en pantalla ----------
export type RutinaPersonalDraft = {
  id: string | null;
  name: string;
  goal: Goal | "";
  weeks: Num;
  days: DiaDraft[];
};

export const DRAFT_PERSONAL_VACIO: RutinaPersonalDraft = {
  id: null,
  name: "",
  goal: "",
  weeks: 8,
  days: [{ name: "Cuerpo completo", exercises: [] }],
};

// ---------- Lo que se guarda, ya validado ----------
export type RutinaPersonalValida = {
  id: string | null;
  name: string;
  goal: Goal;
  weeks: number;
  days: DiaValido[];
  // La misma rutina con el formato del catálogo (para reutilizar las revisiones).
  base: RutinaValida;
};

export type InfoEjercicio = { slug: string; equipment: string };

// Lee y valida una rutina propia. Las mismas reglas que la base de datos.
export function validarRutinaPersonal(
  entrada: unknown,
  modo: "crear" | "editar",
): { valores?: RutinaPersonalValida; errores: string[] } {
  if (typeof entrada !== "object" || entrada === null) {
    return { errores: ["Los datos no son válidos. Recarga la página."] };
  }
  const d = entrada as Record<string, unknown>;
  const errores: string[] = [];

  const name =
    typeof d.name === "string" ? d.name.trim().replace(/\s+/g, " ") : "";
  const nombreValido = name.length >= 1 && name.length <= 80;
  if (!nombreValido) errores.push("El nombre debe tener entre 1 y 80 caracteres.");

  const goal =
    typeof d.goal === "string" && (GOALS as readonly string[]).includes(d.goal)
      ? (d.goal as Goal)
      : null;
  if (!goal) errores.push("Elige el objetivo.");

  // Los días, las semanas y los ejercicios se validan con las mismas reglas
  // que las rutinas del catálogo. Los campos que aquí no existen llevan valores fijos.
  const comun = validarRutina(
    {
      id: d.id,
      slug: "rutina-personal",
      name: nombreValido ? name : "x",
      description: "Rutina personalizada",
      goal: goal ?? "muscle",
      level: "beginner",
      weeks: d.weeks,
      equipment: ["bodyweight"],
      notes: "",
      warnings: "",
      days: d.days,
    },
    modo,
  );
  errores.push(...comun.errores);

  if (errores.length > 0 || !comun.valores || !goal) {
    return { errores };
  }

  return {
    errores,
    valores: {
      id: comun.valores.id,
      name,
      goal,
      weeks: comun.valores.weeks,
      days: comun.valores.days,
      base: comun.valores,
    },
  };
}

// Formato que espera la función save_custom_routine de Supabase.
export function rutinaPersonalAPayload(
  rutina: RutinaPersonalValida,
  infoPorId: ReadonlyMap<string, InfoEjercicio>,
) {
  const usaBarra = rutina.days.some((dia) =>
    dia.exercises.some((e) => infoPorId.get(e.exerciseId)?.equipment === "barbell"),
  );

  return {
    id: rutina.id,
    name: rutina.name,
    goal: rutina.goal,
    program_weeks: rutina.weeks,
    days_per_week: rutina.days.length,
    notes: [...CATALOG_GENERAL_NOTES],
    warnings: [...CATALOG_GENERAL_WARNINGS, ...(usaBarra ? [AVISO_BARRA] : [])],
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
        notes: esPorTiempo(infoPorId.get(e.exerciseId)?.slug ?? "") ? TIMED_NOTE : null,
      })),
    })),
  };
}

// ---------- Lectura de una rutina propia ----------
export const RUTINA_PERSONAL_SELECT =
  "id, name, goal, program_weeks, source, is_active, " +
  "routine_days(id, day_number, name, " +
  "routine_day_exercises(id, sort_order, target_sets, reps_min, reps_max, rest_seconds, " +
  "exercises(id, slug, name, is_active)))";

type FilaEjercicioRef = { id: string; slug: string; name: string; is_active: boolean };

type FilaEjercicioPersonal = {
  id: string;
  sort_order: number;
  target_sets: number;
  reps_min: number;
  reps_max: number;
  rest_seconds: number;
  exercises: FilaEjercicioRef | FilaEjercicioRef[] | null;
};

type FilaDiaPersonal = {
  id: string;
  day_number: number;
  name: string;
  routine_day_exercises: FilaEjercicioPersonal[] | null;
};

export type FilaRutinaPersonal = {
  id: string;
  name: string;
  goal: string | null;
  program_weeks: number | null;
  source: string;
  is_active: boolean;
  routine_days: FilaDiaPersonal[] | null;
};

function uno<T>(valor: T | T[] | null): T | null {
  return Array.isArray(valor) ? (valor[0] ?? null) : valor;
}

// Convierte lo que devuelve Supabase en un borrador editable.
// "missing" cuenta los ejercicios que ya no se pueden ver (por ejemplo, desactivados).
export function mapearRutinaPersonal(fila: FilaRutinaPersonal): {
  draft: RutinaPersonalDraft;
  missing: number;
} {
  let missing = 0;

  const dias: DiaDraft[] = [...(fila.routine_days ?? [])]
    .sort((a, b) => a.day_number - b.day_number)
    .map((dia) => {
      const ejercicios: EjercicioDraft[] = [];
      const filas = [...(dia.routine_day_exercises ?? [])].sort(
        (a, b) => a.sort_order - b.sort_order,
      );
      for (const f of filas) {
        const ejercicio = uno(f.exercises);
        if (!ejercicio) {
          missing += 1;
          continue;
        }
        ejercicios.push({
          exerciseId: ejercicio.id,
          name: ejercicio.name,
          slug: ejercicio.slug,
          active: ejercicio.is_active,
          sets: f.target_sets,
          repsMin: f.reps_min,
          repsMax: f.reps_max,
          rest: f.rest_seconds,
        });
      }
      return { name: dia.name, exercises: ejercicios };
    });

  const goal =
    fila.goal && (GOALS as readonly string[]).includes(fila.goal)
      ? (fila.goal as Goal)
      : "";

  return {
    draft: {
      id: fila.id,
      name: fila.name,
      goal,
      weeks: fila.program_weeks ?? 8,
      days: dias.length > 0 ? dias : DRAFT_PERSONAL_VACIO.days,
    },
    missing,
  };
}

// ---------- Buscador de ejercicios ----------
export type BusquedaUsuario = {
  texto: string;
  muscle: Muscle | "";
  equipment: Equipment | "";
};

export function leerBusquedaUsuario(entrada: unknown): BusquedaUsuario | null {
  if (typeof entrada !== "object" || entrada === null) return null;
  const d = entrada as Record<string, unknown>;

  const texto = typeof d.texto === "string" ? d.texto.trim().slice(0, 50) : "";
  const muscle =
    typeof d.muscle === "string" && (MUSCLES as readonly string[]).includes(d.muscle)
      ? (d.muscle as Muscle)
      : "";
  const equipment =
    typeof d.equipment === "string" && (EQUIPMENT as readonly string[]).includes(d.equipment)
      ? (d.equipment as Equipment)
      : "";

  return { texto, muscle, equipment };
}