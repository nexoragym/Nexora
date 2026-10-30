import { MAX_DIAS_DESCANSO } from "./stats";

const MS_POR_DIA = 86_400_000;

export type Tier = "none" | "ember" | "flame" | "fire" | "purple" | "blue";

export type EtapaRacha = {
  id: string;
  nombre: string;
  descripcion: string;
  // Primer y último día de racha de la etapa (hasta es null en la última).
  desde: number;
  hasta: number | null;
  tier: Tier;
  // Intensidad dentro del mismo color (1 a 3).
  nivel: number;
};

// Las etapas de la racha. Para cambiar un día de evolución, se cambia aquí.
export const ETAPAS: readonly EtapaRacha[] = [
  {
    id: "sin-racha",
    nombre: "Sin racha",
    descripcion: "Entrena hoy para encender tu racha.",
    desde: 0,
    hasta: 0,
    tier: "none",
    nivel: 0,
  },
  {
    id: "brasa",
    nombre: "Brasa",
    descripcion: "Tu racha acaba de encenderse.",
    desde: 1,
    hasta: 3,
    tier: "ember",
    nivel: 1,
  },
  {
    id: "llama-pequena",
    nombre: "Llama pequeña",
    descripcion: "Ya se ve la primera llama.",
    desde: 4,
    hasta: 5,
    tier: "flame",
    nivel: 1,
  },
  {
    id: "llama-viva",
    nombre: "Llama viva",
    descripcion: "Cada vez más viva. ¡Casi evolucionas!",
    desde: 6,
    hasta: 6,
    tier: "flame",
    nivel: 2,
  },
  {
    id: "fuego",
    nombre: "Fuego",
    descripcion: "¡Has evolucionado! Un fuego completo.",
    desde: 7,
    hasta: 9,
    tier: "fire",
    nivel: 1,
  },
  {
    id: "fuego-vivo",
    nombre: "Fuego vivo",
    descripcion: "El fuego crece con cada entrenamiento.",
    desde: 10,
    hasta: 11,
    tier: "fire",
    nivel: 2,
  },
  {
    id: "fuego-intenso",
    nombre: "Fuego intenso",
    descripcion: "Un gran halo te rodea.",
    desde: 12,
    hasta: 14,
    tier: "fire",
    nivel: 3,
  },
  {
    id: "fuego-morado",
    nombre: "Fuego morado",
    descripcion: "Segunda evolución: el fuego se vuelve morado.",
    desde: 15,
    hasta: 19,
    tier: "purple",
    nivel: 1,
  },
  {
    id: "morado-vivo",
    nombre: "Morado vivo",
    descripcion: "Constancia de verdad.",
    desde: 20,
    hasta: 24,
    tier: "purple",
    nivel: 2,
  },
  {
    id: "morado-intenso",
    nombre: "Morado intenso",
    descripcion: "Casi imparable.",
    desde: 25,
    hasta: 29,
    tier: "purple",
    nivel: 3,
  },
  {
    id: "fuego-azul",
    nombre: "Fuego azul",
    descripcion: "La etapa más alta por ahora.",
    desde: 30,
    hasta: null,
    tier: "blue",
    nivel: 3,
  },
];

// ---------- Colores de cada tipo de fuego ----------
export type Paleta = {
  // Colores de arriba y de abajo de cada capa de la llama
  exterior: readonly [string, string];
  interior: readonly [string, string];
  nucleo: readonly [string, string];
  chispa: string;
  brillo: string;
  contorno: string;
};

export const PALETAS: Record<Tier, Paleta> = {
  none: {
    exterior: ["#52525b", "#3f3f46"],
    interior: ["#52525b", "#3f3f46"],
    nucleo: ["#52525b", "#3f3f46"],
    chispa: "#71717a",
    brillo: "#71717a",
    contorno: "#71717a",
  },
  ember: {
    exterior: ["#9a3412", "#ea580c"],
    interior: ["#c2410c", "#fb923c"],
    nucleo: ["#fdba74", "#fed7aa"],
    chispa: "#fb923c",
    brillo: "#ea580c",
    contorno: "#ea580c",
  },
  flame: {
    exterior: ["#fb923c", "#ea580c"],
    interior: ["#fde047", "#f59e0b"],
    nucleo: ["#fffbeb", "#fef08a"],
    chispa: "#fde047",
    brillo: "#f97316",
    contorno: "#f97316",
  },
  fire: {
    exterior: ["#f97316", "#dc2626"],
    interior: ["#fbbf24", "#f97316"],
    nucleo: ["#fef9c3", "#fde047"],
    chispa: "#fbbf24",
    brillo: "#ef4444",
    contorno: "#ef4444",
  },
  purple: {
    exterior: ["#c084fc", "#6d28d9"],
    interior: ["#e879f9", "#8b5cf6"],
    nucleo: ["#fae8ff", "#e9d5ff"],
    chispa: "#e879f9",
    brillo: "#a855f7",
    contorno: "#a855f7",
  },
  blue: {
    exterior: ["#38bdf8", "#1d4ed8"],
    interior: ["#a5f3fc", "#38bdf8"],
    nucleo: ["#f0f9ff", "#bae6fd"],
    chispa: "#a5f3fc",
    brillo: "#38bdf8",
    contorno: "#38bdf8",
  },
};

// ---------- Aspecto de cada etapa ----------
export type VisualEtapa = {
  escala: number; // tamaño de la llama (1 = normal)
  chispas: number; // cuántas chispas suben
  brillo: number; // intensidad del resplandor (0 a 1)
  capas: 0 | 1 | 2 | 3; // 0 = solo contorno; 1 = exterior; 2 = + interior; 3 = + núcleo
};

export function visualDeEtapa(etapa: EtapaRacha): VisualEtapa {
  switch (etapa.tier) {
    case "none":
      return { escala: 0.7, chispas: 0, brillo: 0, capas: 0 };
    case "ember":
      return { escala: 0.6, chispas: 0, brillo: 0.25, capas: 1 };
    case "flame":
      return etapa.nivel <= 1
        ? { escala: 0.72, chispas: 0, brillo: 0.4, capas: 2 }
        : { escala: 0.86, chispas: 3, brillo: 0.55, capas: 3 };
    case "fire":
      if (etapa.nivel <= 1) return { escala: 0.95, chispas: 3, brillo: 0.6, capas: 3 };
      if (etapa.nivel === 2) return { escala: 1.02, chispas: 5, brillo: 0.7, capas: 3 };
      return { escala: 1.08, chispas: 7, brillo: 0.85, capas: 3 };
    case "purple":
      if (etapa.nivel <= 1) return { escala: 0.95, chispas: 4, brillo: 0.65, capas: 3 };
      if (etapa.nivel === 2) return { escala: 1.02, chispas: 6, brillo: 0.75, capas: 3 };
      return { escala: 1.08, chispas: 8, brillo: 0.9, capas: 3 };
    case "blue":
      return { escala: 1.08, chispas: 8, brillo: 0.95, capas: 3 };
  }
}

// ---------- Cálculos de la racha ----------
function limpiar(dias: number): number {
  return Math.max(0, Math.floor(Number.isFinite(dias) ? dias : 0));
}

export function etapaDeRacha(dias: number): EtapaRacha {
  const valor = limpiar(dias);
  for (let i = ETAPAS.length - 1; i >= 0; i -= 1) {
    if (valor >= ETAPAS[i].desde) return ETAPAS[i];
  }
  return ETAPAS[0];
}

export function siguienteEtapa(etapa: EtapaRacha): EtapaRacha | null {
  const indice = ETAPAS.findIndex((e) => e.id === etapa.id);
  return ETAPAS[indice + 1] ?? null;
}

// Días que faltan para la siguiente etapa (null si ya estás en la última).
export function diasHastaSiguienteEtapa(dias: number): number | null {
  const siguiente = siguienteEtapa(etapaDeRacha(dias));
  return siguiente ? siguiente.desde - limpiar(dias) : null;
}

// Cuánto has avanzado dentro de tu etapa actual (de 0 a 1).
export function progresoEnEtapa(dias: number): number {
  const etapa = etapaDeRacha(dias);
  const siguiente = siguienteEtapa(etapa);
  if (!siguiente) return 1;
  const total = siguiente.desde - etapa.desde;
  const hecho = limpiar(dias) - etapa.desde;
  return Math.min(1, Math.max(0, hecho / total));
}

// ¿Cambia el color del fuego (evolución grande) o solo crece dentro del mismo color?
export function cambioDeTier(a: EtapaRacha, b: EtapaRacha): boolean {
  return a.tier !== b.tier;
}

function numeroDeDia(fecha: string): number {
  const [anio, mes, dia] = fecha.split("-").map(Number);
  return Math.round(Date.UTC(anio, mes - 1, dia) / MS_POR_DIA);
}

function textoDeDia(numero: number): string {
  return new Date(numero * MS_POR_DIA).toISOString().slice(0, 10);
}

// La racha más larga que has tenido (con la misma regla de descanso).
export function calcularMejorRacha(fechas: readonly string[]): number {
  const dias = Array.from(new Set(fechas.map(numeroDeDia))).sort((a, b) => a - b);
  if (dias.length === 0) return 0;

  let mejor = 1;
  let actual = 1;
  for (let i = 1; i < dias.length; i += 1) {
    const descansos = dias[i] - dias[i - 1] - 1;
    actual = descansos > MAX_DIAS_DESCANSO ? 1 : actual + 1;
    mejor = Math.max(mejor, actual);
  }
  return mejor;
}

// ---------- Semana actual (de lunes a domingo) ----------
export type DiaSemana = {
  fecha: string;
  letra: string;
  entrenado: boolean;
  esHoy: boolean;
  futuro: boolean;
};

const LETRAS_SEMANA = ["L", "M", "X", "J", "V", "S", "D"];

export function semanaDeFechas(
  fechas: readonly string[],
  hoy: string,
): DiaSemana[] {
  const hoyNumero = numeroDeDia(hoy);
  const diaSemana = new Date(hoyNumero * MS_POR_DIA).getUTCDay(); // 0 = domingo
  const lunes = hoyNumero - ((diaSemana + 6) % 7);
  const entrenados = new Set(fechas.map(numeroDeDia));

  return LETRAS_SEMANA.map((letra, indice) => {
    const numero = lunes + indice;
    return {
      fecha: textoDeDia(numero),
      letra,
      entrenado: entrenados.has(numero),
      esHoy: numero === hoyNumero,
      futuro: numero > hoyNumero,
    };
  });
}