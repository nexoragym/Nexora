import { describe, expect, it } from "vitest";
import {
  calcularImc,
  categoriaImc,
  categoriaRatio,
  parseNumero,
  rangoPesoReferencia,
  ratioCinturaEstatura,
  resumenImc,
  validarFormularioImc,
} from "./imc";

describe("parseNumero", () => {
  it("acepta coma y punto", () => {
    expect(parseNumero("72,5")).toBe(72.5);
    expect(parseNumero(" 72.5 ")).toBe(72.5);
    expect(parseNumero("70")).toBe(70);
  });

  it("rechaza lo que no es un número normal", () => {
    expect(parseNumero("")).toBeNull();
    expect(parseNumero("abc")).toBeNull();
    expect(parseNumero("-5")).toBeNull();
    expect(parseNumero("1e3")).toBeNull();
    expect(parseNumero("7 0")).toBeNull();
  });
});

describe("calcularImc y categorías", () => {
  it("calcula el IMC con un decimal", () => {
    expect(calcularImc(70, 175)).toBe(22.9);
    expect(calcularImc(100, 180)).toBe(30.9);
    expect(calcularImc(50, 180)).toBe(15.4);
  });

  it("clasifica según los rangos de la OMS", () => {
    expect(categoriaImc(18.4)).toBe("bajo");
    expect(categoriaImc(18.5)).toBe("normal");
    expect(categoriaImc(24.9)).toBe("normal");
    expect(categoriaImc(25)).toBe("sobrepeso");
    expect(categoriaImc(29.9)).toBe("sobrepeso");
    expect(categoriaImc(30)).toBe("obesidad1");
    expect(categoriaImc(35)).toBe("obesidad2");
    expect(categoriaImc(40)).toBe("obesidad3");
  });

  it("clasifica con el mismo número que se enseña", () => {
    // 24,96 se muestra como 25,0: debe ser sobrepeso, no normal
    expect(categoriaImc(calcularImc(72.13, 170))).toBe("sobrepeso");
  });
});

describe("rango de peso de referencia", () => {
  it("corresponde a un IMC de 18,5 a 24,9", () => {
    expect(rangoPesoReferencia(170)).toEqual({ min: 53.5, max: 72 });
  });
});

describe("relación cintura/estatura", () => {
  it("calcula y clasifica", () => {
    expect(ratioCinturaEstatura(80, 180)).toBe(0.44);
    expect(categoriaRatio(0.44)).toBe("saludable");
    expect(categoriaRatio(0.39)).toBe("bajo");
    expect(categoriaRatio(0.53)).toBe("aumentado");
    expect(categoriaRatio(0.6)).toBe("alto");
  });
});

describe("validarFormularioImc", () => {
  const bueno = { peso: "70", altura: "175", edad: "30", cintura: "" };

  it("acepta datos correctos y deja la cintura vacía", () => {
    const { valores, errores } = validarFormularioImc(bueno);
    expect(errores).toEqual({});
    expect(valores).toEqual({ pesoKg: 70, alturaCm: 175, edad: 30, cinturaCm: null });
  });

  it("avisa de cada campo fuera de rango", () => {
    const { valores, errores } = validarFormularioImc({
      peso: "5",
      altura: "20",
      edad: "abc",
      cintura: "10",
    });
    expect(valores).toBeUndefined();
    expect(Object.keys(errores).sort()).toEqual(["altura", "cintura", "edad", "peso"]);
  });

  it("no acepta una edad con decimales", () => {
    expect(validarFormularioImc({ ...bueno, edad: "30,5" }).valores).toBeUndefined();
  });
});

describe("resumenImc", () => {
  it("no da categoría a menores de 18 años", () => {
    expect(
      resumenImc({ pesoKg: 55, alturaCm: 165, edad: 16, cinturaCm: null }),
    ).toEqual({ menor: true });
  });

  it("da el resultado completo a adultos", () => {
    const resultado = resumenImc({
      pesoKg: 70,
      alturaCm: 175,
      edad: 30,
      cinturaCm: 80,
    });
    expect(resultado).toMatchObject({
      menor: false,
      imc: 22.9,
      categoria: "normal",
      ratio: { valor: 0.46, categoria: "saludable" },
    });
  });

  it("sin cintura no hay relación cintura/estatura", () => {
    const resultado = resumenImc({
      pesoKg: 70,
      alturaCm: 175,
      edad: 30,
      cinturaCm: null,
    });
    expect(resultado).toMatchObject({ menor: false, ratio: null });
  });
});