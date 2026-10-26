import { describe, expect, it } from "vitest";
import {
  leerFormularioEjercicio,
  lineas,
  slugificar,
} from "./exercise-form";

function formularioBase(): FormData {
  const datos = new FormData();
  datos.append("name", "Press de banca plano");
  datos.append("primary_muscles", "chest");
  datos.append("secondary_muscles", "triceps");
  datos.append("secondary_muscles", "chest");
  datos.append("equipment", "barbell");
  datos.append("movement_pattern", "push");
  datos.append("difficulty", "intermediate");
  datos.append("instructions", "Paso uno\nPaso dos\n\n  Paso tres  ");
  datos.append("common_mistakes", "Error uno");
  datos.append("aliases", "Bench Press\nbench press\nPress de banca plano\nBanca");
  datos.append("is_active", "on");
  return datos;
}

describe("slugificar", () => {
  it("quita tildes, símbolos y espacios", () => {
    expect(slugificar("Extensión de tríceps (polea)")).toBe(
      "extension-de-triceps-polea",
    );
  });

  it("quita los guiones de los extremos", () => {
    expect(slugificar("  --Hola  mundo-- ")).toBe("hola-mundo");
  });
});

describe("lineas", () => {
  it("quita espacios y líneas vacías", () => {
    expect(lineas("a\n\n  b  \r\nc")).toEqual(["a", "b", "c"]);
  });
});

describe("leerFormularioEjercicio", () => {
  it("lee un formulario correcto", () => {
    const { valores, errores } = leerFormularioEjercicio(formularioBase(), "crear");
    expect(errores).toEqual({});
    expect(valores?.slug).toBe("press-de-banca-plano");
    expect(valores?.instructions).toEqual(["Paso uno", "Paso dos", "Paso tres"]);
    expect(valores?.secondaryMuscles).toEqual(["triceps"]);
    expect(valores?.aliases).toEqual(["Bench Press", "Banca"]);
    expect(valores?.isActive).toBe(true);
  });

  it("usa el identificador escrito si lo hay", () => {
    const datos = formularioBase();
    datos.append("slug", "Mi Press Especial");
    const { valores } = leerFormularioEjercicio(datos, "crear");
    expect(valores?.slug).toBe("mi-press-especial");
  });

  it("al editar no pide identificador", () => {
    const { valores } = leerFormularioEjercicio(formularioBase(), "editar");
    expect(valores?.slug).toBe("");
  });

  it("avisa si no hay músculo principal", () => {
    const datos = formularioBase();
    datos.delete("primary_muscles");
    const { valores, errores } = leerFormularioEjercicio(datos, "crear");
    expect(valores).toBeUndefined();
    expect(errores.primary_muscles).toBeDefined();
  });

  it("avisa si el material no es válido", () => {
    const datos = formularioBase();
    datos.set("equipment", "cohete");
    const { errores } = leerFormularioEjercicio(datos, "crear");
    expect(errores.equipment).toBeDefined();
  });

  it("avisa si el nombre es demasiado corto", () => {
    const datos = formularioBase();
    datos.set("name", "A");
    const { errores } = leerFormularioEjercicio(datos, "crear");
    expect(errores.name).toBeDefined();
  });
});