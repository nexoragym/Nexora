// Calculadora de IMC (adultos). Referencias generales de la OMS: son orientativas.

export const LIMITES_IMC = {
  pesoMin: 20,
  pesoMax: 400,
  alturaMin: 100,
  alturaMax: 250,
  edadMin: 5,
  edadMax: 110,
  cinturaMin: 40,
  cinturaMax: 250,
} as const;

export type CategoriaImc =
  | "bajo"
  | "normal"
  | "sobrepeso"
  | "obesidad1"
  | "obesidad2"
  | "obesidad3";

export type CategoriaRatio = "bajo" | "saludable" | "aumentado" | "alto";

export type TonoImc = "success" | "warning" | "danger";

export const ETIQUETAS_IMC: Record<CategoriaImc, string> = {
  bajo: "Bajo peso",
  normal: "Peso normal",
  sobrepeso: "Sobrepeso",
  obesidad1: "Obesidad grado I",
  obesidad2: "Obesidad grado II",
  obesidad3: "Obesidad grado III",
};

export const TONOS_IMC: Record<CategoriaImc, TonoImc> = {
  bajo: "warning",
  normal: "success",
  sobrepeso: "warning",
  obesidad1: "danger",
  obesidad2: "danger",
  obesidad3: "danger",
};

export const DESCRIPCIONES_IMC: Record<CategoriaImc, string> = {
  bajo: "Por debajo del rango habitual para adultos. Si no es tu situación normal, o te preocupa tu peso o tu relación con la comida, habla con un profesional sanitario.",
  normal: "Dentro del rango habitual para adultos.",
  sobrepeso:
    "Por encima del rango habitual. Recuerda que el IMC no distingue músculo de grasa: si entrenas fuerza, puede no reflejar tu composición real.",
  obesidad1:
    "En el rango de obesidad según la clasificación de la OMS. Un profesional sanitario puede valorar tu caso completo.",
  obesidad2:
    "En el rango de obesidad según la clasificación de la OMS. Un profesional sanitario puede valorar tu caso completo.",
  obesidad3:
    "En el rango de obesidad según la clasificación de la OMS. Un profesional sanitario puede valorar tu caso completo.",
};

export const ETIQUETAS_RATIO: Record<CategoriaRatio, string> = {
  bajo: "Por debajo de 0,4",
  saludable: "Rango habitual (0,4 a 0,49)",
  aumentado: "Riesgo aumentado (0,5 a 0,59)",
  alto: "Riesgo alto (0,6 o más)",
};

export const TONOS_RATIO: Record<CategoriaRatio, TonoImc> = {
  bajo: "warning",
  saludable: "success",
  aumentado: "warning",
  alto: "danger",
};

// ---------- Números ----------
// Acepta "72,5" y "72.5". Rechaza texto, negativos y notación científica.
export function parseNumero(texto: string): number | null {
  const limpio = texto.trim().replace(",", ".");
  if (!/^\d+(\.\d+)?$/.test(limpio)) return null;
  const numero = Number(limpio);
  return Number.isFinite(numero) ? numero : null;
}

function redondear(valor: number, decimales: number): number {
  const factor = 10 ** decimales;
  return Math.round(valor * factor) / factor;
}

// ---------- Cálculos ----------
export function calcularImc(pesoKg: number, alturaCm: number): number {
  const metros = alturaCm / 100;
  return redondear(pesoKg / (metros * metros), 1);
}

// Se clasifica con el valor ya redondeado, el mismo que ve la persona.
export function categoriaImc(imc: number): CategoriaImc {
  if (imc < 18.5) return "bajo";
  if (imc < 25) return "normal";
  if (imc < 30) return "sobrepeso";
  if (imc < 35) return "obesidad1";
  if (imc < 40) return "obesidad2";
  return "obesidad3";
}

// Pesos que corresponden a un IMC de 18,5 a 24,9 con esa estatura.
export function rangoPesoReferencia(alturaCm: number): { min: number; max: number } {
  const metros = alturaCm / 100;
  return {
    min: redondear(18.5 * metros * metros, 1),
    max: redondear(24.9 * metros * metros, 1),
  };
}

export function ratioCinturaEstatura(cinturaCm: number, alturaCm: number): number {
  return redondear(cinturaCm / alturaCm, 2);
}

export function categoriaRatio(ratio: number): CategoriaRatio {
  if (ratio < 0.4) return "bajo";
  if (ratio < 0.5) return "saludable";
  if (ratio < 0.6) return "aumentado";
  return "alto";
}

// ---------- Formulario ----------
export type EntradaImc = {
  peso: string;
  altura: string;
  edad: string;
  cintura: string;
};

export type ValoresImc = {
  pesoKg: number;
  alturaCm: number;
  edad: number;
  cinturaCm: number | null;
};

export type ErroresImc = {
  peso?: string;
  altura?: string;
  edad?: string;
  cintura?: string;
};

function dentro(valor: number, min: number, max: number): boolean {
  return valor >= min && valor <= max;
}

export function validarFormularioImc(entrada: EntradaImc): {
  valores?: ValoresImc;
  errores: ErroresImc;
} {
  const errores: ErroresImc = {};

  const peso = parseNumero(entrada.peso);
  if (peso === null || !dentro(peso, LIMITES_IMC.pesoMin, LIMITES_IMC.pesoMax)) {
    errores.peso = `Escribe tu peso en kg (de ${LIMITES_IMC.pesoMin} a ${LIMITES_IMC.pesoMax}).`;
  }

  const altura = parseNumero(entrada.altura);
  if (
    altura === null ||
    !dentro(altura, LIMITES_IMC.alturaMin, LIMITES_IMC.alturaMax)
  ) {
    errores.altura = `Escribe tu estatura en cm (de ${LIMITES_IMC.alturaMin} a ${LIMITES_IMC.alturaMax}).`;
  }

  const edad = parseNumero(entrada.edad);
  if (
    edad === null ||
    !Number.isInteger(edad) ||
    !dentro(edad, LIMITES_IMC.edadMin, LIMITES_IMC.edadMax)
  ) {
    errores.edad = `Escribe tu edad en años (de ${LIMITES_IMC.edadMin} a ${LIMITES_IMC.edadMax}).`;
  }

  let cintura: number | null = null;
  if (entrada.cintura.trim() !== "") {
    const valor = parseNumero(entrada.cintura);
    if (
      valor === null ||
      !dentro(valor, LIMITES_IMC.cinturaMin, LIMITES_IMC.cinturaMax)
    ) {
      errores.cintura = `Escribe tu cintura en cm (de ${LIMITES_IMC.cinturaMin} a ${LIMITES_IMC.cinturaMax}) o déjala en blanco.`;
    } else {
      cintura = valor;
    }
  }

  if (Object.keys(errores).length > 0 || peso === null || altura === null || edad === null) {
    return { errores };
  }

  return {
    errores,
    valores: { pesoKg: peso, alturaCm: altura, edad, cinturaCm: cintura },
  };
}

// ---------- Resultado ----------
export type ResultadoImc =
  | { menor: true }
  | {
      menor: false;
      imc: number;
      categoria: CategoriaImc;
      rango: { min: number; max: number };
      ratio: { valor: number; categoria: CategoriaRatio } | null;
    };

export function resumenImc(valores: ValoresImc): ResultadoImc {
  // El IMC de adultos no se aplica a menores: se interpreta con tablas por edad y sexo.
  if (valores.edad < 18) return { menor: true };

  const imc = calcularImc(valores.pesoKg, valores.alturaCm);
  const ratioValor =
    valores.cinturaCm === null
      ? null
      : ratioCinturaEstatura(valores.cinturaCm, valores.alturaCm);

  return {
    menor: false,
    imc,
    categoria: categoriaImc(imc),
    rango: rangoPesoReferencia(valores.alturaCm),
    ratio:
      ratioValor === null
        ? null
        : { valor: ratioValor, categoria: categoriaRatio(ratioValor) },
  };
}