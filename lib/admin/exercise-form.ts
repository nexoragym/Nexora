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

export type EstadoFormulario = {
  ok?: boolean;
  error?: string;
  errores?: Record<string, string>;
};

export type EjercicioFormulario = {
  name: string;
  slug: string;
  primaryMuscles: Muscle[];
  secondaryMuscles: Muscle[];
  equipment: Equipment;
  movementPattern: MovementPattern;
  difficulty: Difficulty;
  instructions: string[];
  commonMistakes: string[];
  aliases: string[];
  isActive: boolean;
};

// Número de formas distintas de escribir un ejercicio que recomendamos como mínimo.
export const ALIAS_RECOMENDADOS = 10;

export const SLUG_REGEX = /^[a-z0-9]+(-[a-z0-9]+)*$/;

// "Extensión de tríceps (polea)" -> "extension-de-triceps-polea"
export function slugificar(texto: string): string {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80)
    .replace(/-+$/g, "");
}

// Una línea = un elemento. Quita espacios y líneas vacías.
export function lineas(texto: string): string[] {
  return texto
    .split(/\r?\n/)
    .map((linea) => linea.trim())
    .filter((linea) => linea.length > 0);
}

function texto(valor: FormDataEntryValue | null): string {
  return typeof valor === "string" ? valor : "";
}

function variosPermitidos<T extends string>(
  permitidos: readonly T[],
  valores: FormDataEntryValue[],
): T[] {
  const unicos = new Set<T>();
  for (const valor of valores) {
    if (
      typeof valor === "string" &&
      (permitidos as readonly string[]).includes(valor)
    ) {
      unicos.add(valor as T);
    }
  }
  return Array.from(unicos);
}

function unoPermitido<T extends string>(
  permitidos: readonly T[],
  valor: FormDataEntryValue | null,
): T | null {
  return typeof valor === "string" &&
    (permitidos as readonly string[]).includes(valor)
    ? (valor as T)
    : null;
}

function revisarLista(
  elementos: string[],
  maximoElementos: number,
  maximoLargo: number,
  etiqueta: string,
): string | null {
  if (elementos.length > maximoElementos) {
    return `Hay demasiadas líneas en «${etiqueta}» (máximo ${maximoElementos}).`;
  }
  if (elementos.some((elemento) => elemento.length > maximoLargo)) {
    return `Alguna línea de «${etiqueta}» supera los ${maximoLargo} caracteres.`;
  }
  return null;
}

// Lee y valida el formulario del ejercicio. Las mismas reglas que la base de datos.
export function leerFormularioEjercicio(
  formData: FormData,
  modo: "crear" | "editar",
): { valores?: EjercicioFormulario; errores: Record<string, string> } {
  const errores: Record<string, string> = {};

  const name = texto(formData.get("name")).trim().replace(/\s+/g, " ");
  if (name.length < 2 || name.length > 100) {
    errores.name = "El nombre debe tener entre 2 y 100 caracteres.";
  }

  let slug = "";
  if (modo === "crear") {
    slug = slugificar(texto(formData.get("slug")).trim() || name);
    if (!SLUG_REGEX.test(slug)) {
      errores.slug =
        "El identificador solo puede tener letras minúsculas, números y guiones.";
    }
  }

  const primaryMuscles = variosPermitidos(
    MUSCLES,
    formData.getAll("primary_muscles"),
  );
  if (primaryMuscles.length === 0) {
    errores.primary_muscles = "Elige al menos un músculo principal.";
  }
  const secondaryMuscles = variosPermitidos(
    MUSCLES,
    formData.getAll("secondary_muscles"),
  ).filter((musculo) => !primaryMuscles.includes(musculo));

  const equipment = unoPermitido(EQUIPMENT, formData.get("equipment"));
  if (!equipment) errores.equipment = "Elige el material.";

  const movementPattern = unoPermitido(
    MOVEMENT_PATTERNS,
    formData.get("movement_pattern"),
  );
  if (!movementPattern) errores.movement_pattern = "Elige el tipo de movimiento.";

  const difficulty = unoPermitido(DIFFICULTIES, formData.get("difficulty"));
  if (!difficulty) errores.difficulty = "Elige el nivel.";

  const instructions = lineas(texto(formData.get("instructions")));
  if (instructions.length === 0) {
    errores.instructions = "Escribe al menos un paso (uno por línea).";
  } else {
    const problema = revisarLista(instructions, 20, 500, "Cómo se hace");
    if (problema) errores.instructions = problema;
  }

  const commonMistakes = lineas(texto(formData.get("common_mistakes")));
  const problemaErrores = revisarLista(commonMistakes, 10, 300, "Errores habituales");
  if (problemaErrores) errores.common_mistakes = problemaErrores;

  // Otros nombres: sin repetidos y sin el propio nombre del ejercicio.
  const nombreNormalizado = normalizarBusqueda(name);
  const vistos = new Set<string>();
  const aliases: string[] = [];
  for (const alias of lineas(texto(formData.get("aliases")))) {
    const clave = normalizarBusqueda(alias);
    if (!clave || clave === nombreNormalizado || vistos.has(clave)) continue;
    vistos.add(clave);
    aliases.push(alias);
  }
  const problemaAlias = revisarLista(aliases, 40, 80, "Otros nombres");
  if (problemaAlias) errores.aliases = problemaAlias;

  const isActive = formData.get("is_active") === "on";

  if (
    Object.keys(errores).length > 0 ||
    !equipment ||
    !movementPattern ||
    !difficulty
  ) {
    return { errores };
  }

  return {
    errores,
    valores: {
      name,
      slug,
      primaryMuscles,
      secondaryMuscles,
      equipment,
      movementPattern,
      difficulty,
      instructions,
      commonMistakes,
      aliases,
      isActive,
    },
  };
}