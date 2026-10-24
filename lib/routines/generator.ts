import type { Difficulty, Equipment, Exercise } from "../exercises";
import {
  FOCUS_LABELS,
  GOAL_LABELS,
  LIMITATION_LABELS,
  type Focus,
  type Goal,
  type Limitation,
  type QuestionnaireValues,
} from "../questionnaire";
import {
  DAY_KIND_LABELS,
  DAY_TEMPLATES,
  DIFFICULTY_RANK,
  EQUIPMENT_PREFERENCE,
  FOCUS_SLOTS,
  LIMITATION_EXCLUSIONS,
  MAX_EXERCISES_PER_DAY,
  MAX_SESSIONS_BY_LEVEL,
  MIN_EXERCISES_PER_DAY,
  PRESCRIPTIONS,
  SECONDS_PER_SET,
  SLOT_LABELS,
  SPLIT_DESCRIPTIONS,
  SPLITS,
  TIMED_EXERCISE_SLUGS,
  TIMED_REPS,
  TRANSITION_MINUTES,
  WARMUP_MINUTES,
  type DayKind,
  type Prescription,
  type Slot,
} from "./rules";

// Lo que el generador necesita saber de cada ejercicio de la biblioteca.
export type GeneratorExercise = Pick<
  Exercise,
  | "id"
  | "slug"
  | "name"
  | "primary_muscles"
  | "equipment"
  | "movement_pattern"
  | "difficulty"
>;

export type GeneratedExercise = {
  exerciseId: string;
  exerciseSlug: string;
  exerciseName: string;
  sortOrder: number;
  targetSets: number;
  repsMin: number;
  repsMax: number;
  restSeconds: number;
  notes: string | null;
};

export type GeneratedDay = {
  dayNumber: number;
  name: string;
  exercises: GeneratedExercise[];
};

export type GeneratedRoutine = {
  name: string;
  goal: Goal;
  focus: Focus;
  programWeeks: number;
  sessionsPerWeek: number;
  days: GeneratedDay[];
  notes: string[];
  warnings: string[];
};

type Context = {
  goal: Goal;
  focus: Focus;
  level: Difficulty;
  minutes: number;
  equipment: ReadonlySet<Equipment>;
  limitations: readonly Limitation[];
  library: readonly GeneratorExercise[];
};

type WeekState = {
  usedInWeek: Set<string>;
  slotUsage: Map<string, number>;
};

// ---------- Tiempos ----------
export function estimateExerciseMinutes(sets: number, restSeconds: number): number {
  return (sets * (SECONDS_PER_SET + restSeconds)) / 60 + TRANSITION_MINUTES;
}

export function estimateDayMinutes(exercises: readonly GeneratedExercise[]): number {
  return (
    WARMUP_MINUTES +
    exercises.reduce(
      (total, e) => total + estimateExerciseMinutes(e.targetSets, e.restSeconds),
      0,
    )
  );
}

// ---------- Selección de ejercicios ----------
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

// Orden fijo (sin azar): material preferido, luego más exigente, luego nombre.
function comparador(objetivo: Goal) {
  const orden: readonly string[] = EQUIPMENT_PREFERENCE[objetivo];
  return (a: GeneratorExercise, b: GeneratorExercise): number => {
    const porMaterial = orden.indexOf(a.equipment) - orden.indexOf(b.equipment);
    if (porMaterial !== 0) return porMaterial;
    const porNivel = DIFFICULTY_RANK[b.difficulty] - DIFFICULTY_RANK[a.difficulty];
    if (porNivel !== 0) return porNivel;
    const porNombre = a.name.localeCompare(b.name, "es");
    if (porNombre !== 0) return porNombre;
    return a.slug.localeCompare(b.slug, "es");
  };
}

function candidatos(hueco: Slot, ctx: Context): GeneratorExercise[] {
  return ctx.library
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
}

function elegirEjercicio(
  hueco: Slot,
  ctx: Context,
  estado: WeekState,
  usadosHoy: ReadonlySet<string>,
): GeneratorExercise | null {
  // Nunca se repite un ejercicio dentro de la misma sesión.
  const posibles = candidatos(hueco, ctx).filter((e) => !usadosHoy.has(e.id));
  if (posibles.length === 0) return null;

  // Se prefiere uno que no se haya usado ya esta semana, para dar variedad.
  const sinUsar = posibles.filter((e) => !estado.usedInWeek.has(e.id));
  if (sinUsar.length > 0) return sinUsar[0];

  // Si todos se han usado, se rota entre ellos.
  const veces = estado.slotUsage.get(hueco.id) ?? 0;
  return posibles[veces % posibles.length];
}

// Si el enfoque toca esta sesión, sus huecos pasan delante y se añaden extras.
function aplicarEnfoque(plantilla: readonly Slot[], enfoque: Focus): readonly Slot[] {
  if (enfoque === "balanced") return plantilla;
  const config = FOCUS_SLOTS[enfoque];
  const prioridad = new Set(config.priority);
  const prioritarios = plantilla.filter((hueco) => prioridad.has(hueco.id));
  if (prioritarios.length === 0) return plantilla;
  const resto = plantilla.filter((hueco) => !prioridad.has(hueco.id));
  return [...prioritarios, ...config.extras, ...resto];
}

// ---------- Series, repeticiones y descanso ----------
// "intento" sube solo si no caben los ejercicios en el tiempo:
// 1 y 2 quitan una serie cada vez; 3 limita además el descanso a 90 segundos.
function prescripcion(
  hueco: Slot,
  ejercicio: GeneratorExercise,
  ctx: Context,
  intento: number,
): Prescription {
  const base = PRESCRIPTIONS[ctx.goal][hueco.role][ctx.level];
  const series = Math.max(2, base.sets - Math.min(intento, 2));
  const descanso = intento >= 3 ? Math.min(base.restSeconds, 90) : base.restSeconds;

  if (TIMED_EXERCISE_SLUGS.includes(ejercicio.slug)) {
    return {
      sets: series,
      repsMin: TIMED_REPS.min,
      repsMax: TIMED_REPS.max,
      restSeconds: descanso,
    };
  }
  return {
    sets: series,
    repsMin: base.repsMin,
    repsMax: base.repsMax,
    restSeconds: descanso,
  };
}

// ---------- Construcción de una sesión ----------
type ResultadoDia = {
  ejercicios: GeneratedExercise[];
  faltantes: string[];
  cortadoPorTiempo: boolean;
  estado: WeekState;
};

function clonarEstado(estado: WeekState): WeekState {
  return {
    usedInWeek: new Set(estado.usedInWeek),
    slotUsage: new Map(estado.slotUsage),
  };
}

function construirDia(
  tipo: DayKind,
  ctx: Context,
  estadoPrevio: WeekState,
  intento: number,
): ResultadoDia {
  const presupuesto = ctx.minutes - WARMUP_MINUTES;
  const estado = clonarEstado(estadoPrevio);
  const usadosHoy = new Set<string>();
  const ejercicios: GeneratedExercise[] = [];
  const faltantes: string[] = [];
  let gastado = 0;
  let cortadoPorTiempo = false;

  for (const hueco of aplicarEnfoque(DAY_TEMPLATES[tipo], ctx.focus)) {
    if (ejercicios.length >= MAX_EXERCISES_PER_DAY) break;

    const elegido = elegirEjercicio(hueco, ctx, estado, usadosHoy);
    if (!elegido) {
      faltantes.push(hueco.id);
      continue;
    }

    const pauta = prescripcion(hueco, elegido, ctx, intento);
    const minutos = estimateExerciseMinutes(pauta.sets, pauta.restSeconds);
    if (gastado + minutos > presupuesto) {
      cortadoPorTiempo = true;
      break;
    }

    gastado += minutos;
    usadosHoy.add(elegido.id);
    estado.usedInWeek.add(elegido.id);
    estado.slotUsage.set(hueco.id, (estado.slotUsage.get(hueco.id) ?? 0) + 1);

    ejercicios.push({
      exerciseId: elegido.id,
      exerciseSlug: elegido.slug,
      exerciseName: elegido.name,
      sortOrder: ejercicios.length + 1,
      targetSets: pauta.sets,
      repsMin: pauta.repsMin,
      repsMax: pauta.repsMax,
      restSeconds: pauta.restSeconds,
      notes: TIMED_EXERCISE_SLUGS.includes(elegido.slug)
        ? "Las repeticiones son segundos: mantén la posición durante ese tiempo."
        : null,
    });
  }

  return { ejercicios, faltantes, cortadoPorTiempo, estado };
}

// Si la sesión se queda con menos de 3 ejercicios por falta de tiempo,
// se reducen series y descansos hasta que entren.
function construirDiaAjustado(
  tipo: DayKind,
  ctx: Context,
  estado: WeekState,
): ResultadoDia & { intento: number } {
  let intento = 0;
  let resultado = construirDia(tipo, ctx, estado, intento);

  while (
    resultado.ejercicios.length < MIN_EXERCISES_PER_DAY &&
    resultado.cortadoPorTiempo &&
    intento < 3
  ) {
    intento += 1;
    resultado = construirDia(tipo, ctx, estado, intento);
  }

  return { ...resultado, intento };
}

// ---------- Función principal ----------
export function generateRoutine(
  preferencias: QuestionnaireValues,
  biblioteca: readonly GeneratorExercise[],
): GeneratedRoutine {
  const sesiones = Math.min(
    preferencias.days,
    MAX_SESSIONS_BY_LEVEL[preferencias.experience],
  );
  const tipos = SPLITS[sesiones];
  if (!tipos) {
    throw new Error(`No hay distribución definida para ${sesiones} sesiones`);
  }

  const enfoque: Focus = preferencias.focus ?? "balanced";
  const semanas = preferencias.programWeeks ?? 8;

  const ctx: Context = {
    goal: preferencias.goal,
    focus: enfoque,
    level: preferencias.experience,
    minutes: preferencias.minutes,
    // El peso corporal no necesita material: siempre está disponible.
    equipment: new Set<Equipment>([...preferencias.equipment, "bodyweight"]),
    limitations: preferencias.limitations,
    library: biblioteca,
  };

  const totales = new Map<DayKind, number>();
  for (const tipo of tipos) {
    totales.set(tipo, (totales.get(tipo) ?? 0) + 1);
  }

  const vistos = new Map<DayKind, number>();
  const dias: GeneratedDay[] = [];
  const faltantes = new Set<string>();
  let estado: WeekState = { usedInWeek: new Set(), slotUsage: new Map() };
  let huboReduccion = false;

  for (let indice = 0; indice < tipos.length; indice += 1) {
    const tipo = tipos[indice];
    const ordinal = vistos.get(tipo) ?? 0;
    vistos.set(tipo, ordinal + 1);

    const resultado = construirDiaAjustado(tipo, ctx, estado);
    estado = resultado.estado;
    if (resultado.intento > 0) huboReduccion = true;
    for (const id of resultado.faltantes) faltantes.add(id);

    const etiqueta = DAY_KIND_LABELS[tipo];
    const nombre =
      (totales.get(tipo) ?? 1) > 1
        ? `${etiqueta} ${String.fromCharCode(65 + ordinal)}`
        : etiqueta;

    dias.push({
      dayNumber: indice + 1,
      name: nombre,
      exercises: resultado.ejercicios,
    });
  }

  // ---- Avisos para el usuario ----
  const warnings: string[] = [];

  if (preferencias.days > sesiones) {
    warnings.push(
      `Has indicado ${preferencias.days} días, pero para tu nivel recomendamos ${sesiones} sesiones por semana. Usa el resto de días para descansar o hacer actividad ligera.`,
    );
  }
  if (huboReduccion) {
    warnings.push(
      `Con ${preferencias.minutes} minutos por sesión hemos reducido las series (y los descansos) para que quepan los ejercicios principales.`,
    );
  }
  if (faltantes.size > 0) {
    const lista = Array.from(faltantes)
      .map((id) => SLOT_LABELS[id] ?? id)
      .join(", ");
    warnings.push(
      `No hemos encontrado ejercicios de ${lista} con tu material, tu nivel y tus preferencias.`,
    );
  }
  if (preferencias.limitations.length > 0) {
    const zonas = preferencias.limitations
      .map((limitacion) => LIMITATION_LABELS[limitacion].toLowerCase())
      .join(", ");
    warnings.push(
      `Hemos evitado ejercicios que suelen cargar estas zonas: ${zonas}. Es una adaptación general y no sustituye el consejo de un profesional sanitario.`,
    );
  }
  if (dias.every((dia) => dia.exercises.length === 0)) {
    warnings.push(
      "No hemos podido preparar ningún ejercicio con tus respuestas. Prueba a elegir más material en el cuestionario.",
    );
  }

  const notes = [
    SPLIT_DESCRIPTIONS[sesiones] ?? "",
    `Programa de ${semanas} semanas. Cuando completes todas las series de un ejercicio en el máximo de repeticiones y con buena técnica, sube un poco el peso la semana siguiente.`,
    preferencias.goal === "definition"
      ? "Para definir, el entrenamiento ayuda, pero la alimentación tiene un peso enorme en el resultado."
      : "",
    "Las series, repeticiones y descansos son orientativos para tu objetivo y tu nivel. Elige un peso con el que mantengas una buena técnica.",
    "Estas recomendaciones son generales y no sustituyen el consejo de un profesional.",
  ].filter((nota) => nota.length > 0);

  const nombrePrograma = [
    GOAL_LABELS[preferencias.goal],
    enfoque === "balanced" ? null : FOCUS_LABELS[enfoque],
    `${semanas} semanas`,
  ]
    .filter((parte): parte is string => parte !== null)
    .join(" · ");

  return {
    name: nombrePrograma,
    goal: preferencias.goal,
    focus: enfoque,
    programWeeks: semanas,
    sessionsPerWeek: sesiones,
    days: dias,
    notes,
    warnings,
  };
}