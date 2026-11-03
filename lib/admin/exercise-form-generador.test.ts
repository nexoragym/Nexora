import { describe, expect, it } from "vitest";
import { leerFormularioEjercicio } from "./exercise-form";

function formularioBase(): FormData {
  const datos = new FormData();
  datos.append("name", "Remo con barra");
  datos.append("primary_muscles", "lats");
  datos.append("equipment", "barbell");
  datos.append("movement_pattern", "pull");
  datos.append("difficulty", "intermediate");
  datos.append("instructions", "Paso uno");
  datos.append("is_active", "on");
  return datos;
}

describe("ajustes del generador en el formulario", () => {
  it("lee la casilla y la popularidad", () => {
    const datos = formularioBase();
    datos.append("use_in_generator", "on");
    datos.append("popularity", "3");
    const { valores, errores } = leerFormularioEjercicio(datos, "crear");
    expect(errores).toEqual({});
    expect(valores?.useInGenerator).toBe(true);
    expect(valores?.popularity).toBe(3);
  });

  it("casilla sin marcar = no se usa en el generador", () => {
    const { valores } = leerFormularioEjercicio(formularioBase(), "crear");
    expect(valores?.useInGenerator).toBe(false);
    expect(valores?.popularity).toBe(0);
  });

  it("rechaza una popularidad fuera de 0 a 3", () => {
    const datos = formularioBase();
    datos.append("popularity", "7");
    const { errores } = leerFormularioEjercicio(datos, "crear");
    expect(errores.popularity).toBeDefined();
  });
});