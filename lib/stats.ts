// Zona horaria con la que se cuentan los días (para la beta).
export const ZONA_HORARIA = "Europe/Madrid";

// La racha sigue viva mientras no pasen más de este número de días
// de descanso seguidos entre dos entrenamientos.
export const MAX_DIAS_DESCANSO = 2;

const MS_POR_DIA = 86_400_000;

// Convierte una fecha "2026-10-24" en un número de día (para restar fechas).
function numeroDeDia(fecha: string): number {
  const [anio, mes, dia] = fecha.split("-").map(Number);
  return Math.round(Date.UTC(anio, mes - 1, dia) / MS_POR_DIA);
}

// Fecha de hoy ("2026-10-24") en la zona horaria indicada.
export function hoyEnZona(
  zona: string = ZONA_HORARIA,
  ahora: Date = new Date(),
): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: zona,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(ahora);
}

// Entrenamientos seguidos sin dejar más de MAX_DIAS_DESCANSO días de descanso.
// Si el último entrenamiento es más antiguo que eso, la racha es 0.
export function calcularRacha(fechas: readonly string[], hoy: string): number {
  const dias = Array.from(new Set(fechas.map(numeroDeDia))).sort(
    (a, b) => b - a,
  );
  if (dias.length === 0) return 0;

  const hoyNumero = numeroDeDia(hoy);
  if (hoyNumero - dias[0] - 1 > MAX_DIAS_DESCANSO) return 0;

  let racha = 1;
  for (let i = 1; i < dias.length; i += 1) {
    const descansos = dias[i - 1] - dias[i] - 1;
    if (descansos > MAX_DIAS_DESCANSO) break;
    racha += 1;
  }
  return racha;
}

// Días sin entrenar en los últimos 7 días (contando hoy).
export function calcularDescanso(
  fechas: readonly string[],
  hoy: string,
): number {
  const hoyNumero = numeroDeDia(hoy);
  const entrenados = new Set(
    fechas
      .map(numeroDeDia)
      .filter((dia) => dia <= hoyNumero && dia > hoyNumero - 7),
  );
  return 7 - entrenados.size;
}