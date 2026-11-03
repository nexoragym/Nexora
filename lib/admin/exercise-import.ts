import {
  DIFFICULTIES,
  EQUIPMENT,
  MOVEMENT_PATTERNS,
  MUSCLES,
  normalizarBusqueda,
  type Difficulty,
  type Equipment,
  type MovementPattern,
  type Muscle,
} from "../exercises";
import { ALIAS_RECOMENDADOS, SLUG_REGEX, slugificar } from "./exercise-form";

export const MAX_FILAS_IMPORTACION = 200;
export const MAX_CARACTERES_IMPORTACION = 900_000;

export type ModoExistentes = "omitir" | "actualizar";

export type EjercicioImportado = {
  slug: string;
  name: string;
  primaryMuscles: Muscle[];
  secondaryMuscles: Muscle[];
  equipment: Equipment;
  movementPattern: MovementPattern;
  difficulty: Difficulty;
  instructions: string[];
  commonMistakes: string[];
  aliases: string[];
  useInGenerator: boolean;
  popularity: number;
  isActive: boolean;
};

export type FilaAnalizada = {
  indice: number; // empieza en 1
  slug: string;
  name: string;
  errores: string[];
  avisos: string[];
  valores: EjercicioImportado | null;
};

export type Analisis = { error: string | null; filas: FilaAnalizada[] };

// ---------- Lo que viaja entre servidor y pantalla ----------
export type VistaFila = {
  indice: number;
  slug: string;
  name: string;
  estado: "nuevo" | "existe" | "error";
  errores: string[];
  avisos: string[];
};

export type VistaPrevia = {
  ok: boolean;
  error?: string;
  filas: VistaFila[];
  resumen: {
    total: number;
    validas: number;
    errores: number;
    nuevos: number;
    existentes: number;
    conAvisos: number;
  };
};

export type ResultadoImportacion = {
  ok: boolean;
  error?: string;
  creados: number;
  actualizados: number;
  omitidos: number;
  conError: number;
  fallos: { slug: string; motivo: string }[];
};

const CAMPOS_CONOCIDOS = [
  "slug",
  "name",
  "primary_muscles",
  "secondary_muscles",
  "equipment",
  "movement_pattern",
  "difficulty",
  "instructions",
  "common_mistakes",
  "aliases",
  "use_in_generator",
  "popularity",
  "is_active",
];

// Quita las marcas ```json ... ``` que aparecen al copiar desde un chat.
export function limpiarJson(texto: string): string {
  let limpio = texto.replace(/^\uFEFF/, "").trim();
  const bloque = limpio.match(/^```[a-zA-Z]*\s*\n([\s\S]*?)\n?```$/);
  if (bloque) limpio = bloque[1].trim();
  return limpio;
}

function leerLista(
  valor: unknown,
  etiqueta: string,
  errores: string[],
  obligatorio: boolean,
): string[] {
  if (valor === undefined || valor === null) {
    if (obligatorio) errores.push(`Falta «${etiqueta}».`);
    return [];
  }
  if (!Array.isArray(valor)) {
    errores.push(`«${etiqueta}» debe ser una lista [ ... ].`);
    return [];
  }
  const textos: string[] = [];
  for (const elemento of valor) {
    if (typeof elemento !== "string") {
      errores.push(`«${etiqueta}» solo puede contener textos.`);
      return [];
    }
    const limpio = elemento.trim().replace(/\s+/g, " ");
    if (limpio) textos.push(limpio);
  }
  return textos;
}

function leerMusculos(
  valor: unknown,
  etiqueta: string,
  errores: string[],
  obligatorio: boolean,
): Muscle[] {
  const erroresAntes = errores.length;
  const textos = leerLista(valor, etiqueta, errores, obligatorio);
  const validos: Muscle[] = [];
  const raros: string[] = [];
  for (const texto of textos) {
    if ((MUSCLES as readonly string[]).includes(texto)) {
      if (!validos.includes(texto as Muscle)) validos.push(texto as Muscle);
    } else {
      raros.push(texto);
    }
  }
  if (raros.length > 0) {
    errores.push(
      `«${etiqueta}» tiene músculos desconocidos: ${raros.join(", ")}. Válidos: ${MUSCLES.join(", ")}.`,
    );
  }
  if (obligatorio && validos.length === 0 && errores.length === erroresAntes) {
    errores.push(`«${etiqueta}» necesita al menos un músculo.`);
  }
  return validos;
}

function leerUnoDe<T extends string>(
  valor: unknown,
  permitidos: readonly T[],
  etiqueta: string,
  errores: string[],
): T | null {
  if (
    typeof valor === "string" &&
    (permitidos as readonly string[]).includes(valor)
  ) {
    return valor as T;
  }
  const visto =
    valor === undefined ? "falta" : String(JSON.stringify(valor)).slice(0, 30);
  errores.push(
    `«${etiqueta}» no es válido (${visto}). Valores: ${permitidos.join(", ")}.`,
  );
  return null;
}

function leerBooleano(
  valor: unknown,
  etiqueta: string,
  porDefecto: boolean,
  errores: string[],
): boolean {
  if (valor === undefined || valor === null) return porDefecto;
  if (typeof valor === "boolean") return valor;
  errores.push(`«${etiqueta}» debe ser true o false (sin comillas).`);
  return porDefecto;
}

function revisarLargo(
  lista: string[],
  maximoElementos: number,
  maximoLargo: number,
  etiqueta: string,
  errores: string[],
) {
  if (lista.length > maximoElementos) {
    errores.push(`«${etiqueta}» tiene demasiados elementos (máximo ${maximoElementos}).`);
  }
  if (lista.some((elemento) => elemento.length > maximoLargo)) {
    errores.push(`Algún elemento de «${etiqueta}» supera los ${maximoLargo} caracteres.`);
  }
}

function validarFila(bruto: unknown, indice: number): FilaAnalizada {
  const errores: string[] = [];
  const avisos: string[] = [];

  if (typeof bruto !== "object" || bruto === null || Array.isArray(bruto)) {
    return {
      indice,
      slug: "",
      name: "",
      errores: ["Cada ejercicio debe ser un objeto { ... }."],
      avisos,
      valores: null,
    };
  }
  const fila = bruto as Record<string, unknown>;

  for (const clave of Object.keys(fila)) {
    if (!CAMPOS_CONOCIDOS.includes(clave)) {
      avisos.push(`Campo desconocido «${clave}»: se ignora.`);
    }
  }

  // Nombre
  let name = "";
  if (typeof fila.name !== "string") {
    errores.push("Falta «name» (texto).");
  } else {
    name = fila.name.trim().replace(/\s+/g, " ");
    if (name.length < 2 || name.length > 100) {
      errores.push("«name» debe tener entre 2 y 100 caracteres.");
    }
  }

  // Identificador
  let slug = "";
  const slugBruto = fila.slug;
  if (slugBruto !== undefined && slugBruto !== null && slugBruto !== "") {
    if (typeof slugBruto !== "string") {
      errores.push("«slug» debe ser un texto.");
    } else {
      slug = slugBruto.trim();
      if (!SLUG_REGEX.test(slug) || slug.length > 80) {
        errores.push(
          "«slug» no es válido: solo minúsculas, números y guiones (máximo 80).",
        );
      }
    }
  } else if (name) {
    slug = slugificar(name);
    if (!SLUG_REGEX.test(slug)) {
      errores.push("No se pudo crear un identificador desde el nombre: escribe un «slug».");
    }
  }

  const primaryMuscles = leerMusculos(fila.primary_muscles, "primary_muscles", errores, true);
  const secondaryMuscles = leerMusculos(
    fila.secondary_muscles,
    "secondary_muscles",
    errores,
    false,
  ).filter((musculo) => !primaryMuscles.includes(musculo));

  const equipment = leerUnoDe(fila.equipment, EQUIPMENT, "equipment", errores);
  const movementPattern = leerUnoDe(
    fila.movement_pattern,
    MOVEMENT_PATTERNS,
    "movement_pattern",
    errores,
  );
  const difficulty = leerUnoDe(fila.difficulty, DIFFICULTIES, "difficulty", errores);

  const instructions = leerLista(fila.instructions, "instructions", errores, true);
  if (
    instructions.length === 0 &&
    fila.instructions !== undefined &&
    fila.instructions !== null &&
    Array.isArray(fila.instructions)
  ) {
    errores.push("«instructions» necesita al menos un paso.");
  }
  revisarLargo(instructions, 20, 500, "instructions", errores);

  const commonMistakes = leerLista(fila.common_mistakes, "common_mistakes", errores, false);
  revisarLargo(commonMistakes, 10, 300, "common_mistakes", errores);

  // Otros nombres: sin repetidos y sin el propio nombre.
  const nombreNormalizado = normalizarBusqueda(name);
  const vistos = new Set<string>();
  const aliases: string[] = [];
  for (const alias of leerLista(fila.aliases, "aliases", errores, false)) {
    const clave = normalizarBusqueda(alias);
    if (!clave || clave === nombreNormalizado || vistos.has(clave)) continue;
    vistos.add(clave);
    aliases.push(alias);
  }
  revisarLargo(aliases, 40, 80, "aliases", errores);

  const useInGenerator = leerBooleano(fila.use_in_generator, "use_in_generator", true, errores);
  const isActive = leerBooleano(fila.is_active, "is_active", true, errores);

  let popularity = 0;
  if (fila.popularity !== undefined && fila.popularity !== null) {
    if (
      typeof fila.popularity === "number" &&
      Number.isInteger(fila.popularity) &&
      fila.popularity >= 0 &&
      fila.popularity <= 3
    ) {
      popularity = fila.popularity;
    } else {
      errores.push("«popularity» debe ser un número entero de 0 a 3.");
    }
  }

  // Avisos (no impiden guardar)
  if (aliases.length < ALIAS_RECOMENDADOS) {
    avisos.push(
      `Solo tiene ${aliases.length} otros nombres (recomendado: ${ALIAS_RECOMENDADOS}).`,
    );
  }
  if (instructions.length > 0 && instructions.length < 3) {
    avisos.push("Tiene menos de 3 pasos en «instructions».");
  }
  if (commonMistakes.length < 3) {
    avisos.push("Tiene menos de 3 errores comunes.");
  }

  if (errores.length > 0 || !equipment || !movementPattern || !difficulty) {
    return { indice, slug, name, errores, avisos, valores: null };
  }

  return {
    indice,
    slug,
    name,
    errores,
    avisos,
    valores: {
      slug,
      name,
      primaryMuscles,
      secondaryMuscles,
      equipment,
      movementPattern,
      difficulty,
      instructions,
      commonMistakes,
      aliases,
      useInGenerator,
      popularity,
      isActive,
    },
  };
}

// Lee el texto pegado y revisa cada ejercicio (sin tocar la base de datos).
export function analizarImportacion(texto: string): Analisis {
  if (texto.length > MAX_CARACTERES_IMPORTACION) {
    return { error: "El texto es demasiado grande. Divídelo en varios pegados.", filas: [] };
  }
  const limpio = limpiarJson(texto);
  if (!limpio) {
    return { error: "Pega primero el JSON de los ejercicios.", filas: [] };
  }

  let datos: unknown;
  try {
    datos = JSON.parse(limpio);
  } catch (e) {
    const detalle = e instanceof Error ? e.message : "";
    return {
      error: `El texto no es un JSON válido. Detalle técnico: ${detalle}`,
      filas: [],
    };
  }

  if (!Array.isArray(datos)) {
    return {
      error: "El JSON debe ser una lista: empieza por [ y termina por ].",
      filas: [],
    };
  }
  if (datos.length === 0) {
    return { error: "La lista está vacía.", filas: [] };
  }
  if (datos.length > MAX_FILAS_IMPORTACION) {
    return {
      error: `Hay ${datos.length} ejercicios y el máximo por pegado es ${MAX_FILAS_IMPORTACION}. Divídelo en varios.`,
      filas: [],
    };
  }

  const filas = datos.map((bruto, i) => validarFila(bruto, i + 1));

  // Identificadores repetidos dentro del mismo JSON.
  const primeraVez = new Map<string, number>();
  for (const fila of filas) {
    if (!fila.slug) continue;
    const anterior = primeraVez.get(fila.slug);
    if (anterior === undefined) {
      primeraVez.set(fila.slug, fila.indice);
    } else {
      fila.errores.push(
        `El identificador «${fila.slug}» ya aparece en la fila ${anterior} de este JSON.`,
      );
      fila.valores = null;
    }
  }

  return { error: null, filas };
}

// Columnas de la tabla exercises (sin el slug).
export function columnasDeImportado(v: EjercicioImportado) {
  return {
    name: v.name,
    primary_muscles: v.primaryMuscles,
    secondary_muscles: v.secondaryMuscles,
    equipment: v.equipment,
    movement_pattern: v.movementPattern,
    difficulty: v.difficulty,
    instructions: v.instructions,
    common_mistakes: v.commonMistakes,
    aliases: v.aliases,
    use_in_generator: v.useInGenerator,
    popularity: v.popularity,
    is_active: v.isActive,
  };
}

// ---------- Exportar ----------
export type FilaExportable = {
  slug: string;
  name: string;
  primary_muscles: string[];
  secondary_muscles: string[] | null;
  equipment: string;
  movement_pattern: string;
  difficulty: string;
  instructions: string[];
  common_mistakes: string[] | null;
  aliases: string[] | null;
  use_in_generator: boolean | null;
  popularity: number | null;
  is_active: boolean;
};

export const COLUMNAS_EXPORTAR =
  "slug, name, primary_muscles, secondary_muscles, equipment, movement_pattern, difficulty, instructions, common_mistakes, aliases, use_in_generator, popularity, is_active";

// Mismo formato que acepta el importador.
export function filaAJson(fila: FilaExportable) {
  return {
    slug: fila.slug,
    name: fila.name,
    primary_muscles: fila.primary_muscles,
    secondary_muscles: fila.secondary_muscles ?? [],
    equipment: fila.equipment,
    movement_pattern: fila.movement_pattern,
    difficulty: fila.difficulty,
    instructions: fila.instructions,
    common_mistakes: fila.common_mistakes ?? [],
    aliases: fila.aliases ?? [],
    use_in_generator: fila.use_in_generator ?? true,
    popularity: fila.popularity ?? 0,
    is_active: fila.is_active,
  };
}