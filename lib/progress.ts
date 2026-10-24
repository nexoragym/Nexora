export type SemanaProgreso = {
  weekStart: string;
  sessions: number;
  volumeKg: number;
};

export type RecordePersonal = {
  exerciseId: string;
  name: string;
  weightKg: number;
  reps: number;
  day: string;
};

export type PuntoHistorial = {
  day: string;
  weightKg: number;
};

export type HistorialEjercicio = {
  exerciseId: string;
  name: string;
  points: PuntoHistorial[];
};

export type ProgresoDatos = {
  weekly: SemanaProgreso[];
  records: RecordePersonal[];
  history: HistorialEjercicio[];
};

const MESES = [
  "ene",
  "feb",
  "mar",
  "abr",
  "may",
  "jun",
  "jul",
  "ago",
  "sep",
  "oct",
  "nov",
  "dic",
];

// "2026-10-19" -> "19 oct"
export function etiquetaFecha(fecha: string): string {
  const [, mes, dia] = fecha.split("-").map(Number);
  if (!mes || !dia || mes < 1 || mes > 12) return fecha;
  return `${dia} ${MESES[mes - 1]}`;
}

export function formatearKg(valor: number): string {
  return `${valor.toLocaleString("es-ES", { maximumFractionDigits: 1 })} kg`;
}

function esObjeto(valor: unknown): valor is Record<string, unknown> {
  return typeof valor === "object" && valor !== null && !Array.isArray(valor);
}

function numero(valor: unknown): number | null {
  const n =
    typeof valor === "number"
      ? valor
      : typeof valor === "string"
        ? Number(valor)
        : Number.NaN;
  return Number.isFinite(n) ? n : null;
}

function texto(valor: unknown): string | null {
  return typeof valor === "string" && valor.length > 0 ? valor : null;
}

function lista(valor: unknown): unknown[] {
  return Array.isArray(valor) ? valor : [];
}

// Lee con cuidado lo que devuelve la base de datos: si algo no cuadra, lo ignora.
export function leerProgreso(bruto: unknown): ProgresoDatos {
  const vacio: ProgresoDatos = { weekly: [], records: [], history: [] };
  if (!esObjeto(bruto)) return vacio;

  const weekly = lista(bruto.weekly).flatMap((item): SemanaProgreso[] => {
    if (!esObjeto(item)) return [];
    const weekStart = texto(item.week_start);
    const sessions = numero(item.sessions);
    const volumeKg = numero(item.volume_kg);
    return weekStart && sessions !== null && volumeKg !== null
      ? [{ weekStart, sessions, volumeKg }]
      : [];
  });

  const records = lista(bruto.records).flatMap((item): RecordePersonal[] => {
    if (!esObjeto(item)) return [];
    const exerciseId = texto(item.exercise_id);
    const name = texto(item.exercise_name);
    const weightKg = numero(item.weight_kg);
    const reps = numero(item.reps);
    const day = texto(item.day);
    return exerciseId && name && weightKg !== null && reps !== null && day
      ? [{ exerciseId, name, weightKg, reps, day }]
      : [];
  });

  const porEjercicio = new Map<string, HistorialEjercicio>();
  for (const item of lista(bruto.history)) {
    if (!esObjeto(item)) continue;
    const exerciseId = texto(item.exercise_id);
    const name = texto(item.exercise_name);
    const day = texto(item.day);
    const weightKg = numero(item.weight_kg);
    if (!exerciseId || !name || !day || weightKg === null) continue;

    const actual = porEjercicio.get(exerciseId) ?? {
      exerciseId,
      name,
      points: [],
    };
    actual.points.push({ day, weightKg });
    porEjercicio.set(exerciseId, actual);
  }

  const history = Array.from(porEjercicio.values()).map((ejercicio) => ({
    ...ejercicio,
    points: [...ejercicio.points].sort((a, b) => a.day.localeCompare(b.day)),
  }));

  return { weekly, records, history };
}