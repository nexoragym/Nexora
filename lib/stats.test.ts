import { describe, expect, it } from "vitest";
import { calcularDescanso, calcularRacha } from "./stats";

describe("racha", () => {
  it("es 0 si no has entrenado nunca", () => {
    expect(calcularRacha([], "2026-10-24")).toBe(0);
  });

  it("cuenta entrenamientos en días seguidos", () => {
    expect(
      calcularRacha(["2026-10-24", "2026-10-23", "2026-10-22"], "2026-10-24"),
    ).toBe(3);
  });

  it("permite hasta 2 días de descanso entre entrenamientos", () => {
    expect(
      calcularRacha(["2026-10-24", "2026-10-21", "2026-10-18"], "2026-10-24"),
    ).toBe(3);
  });

  it("se corta con 3 días de descanso seguidos", () => {
    expect(calcularRacha(["2026-10-24", "2026-10-20"], "2026-10-24")).toBe(1);
  });

  it("sigue viva si el último entrenamiento fue hace 3 días", () => {
    expect(calcularRacha(["2026-10-21"], "2026-10-24")).toBe(1);
  });

  it("se pierde si el último entrenamiento fue hace más de 3 días", () => {
    expect(calcularRacha(["2026-10-20"], "2026-10-24")).toBe(0);
  });

  it("no cuenta dos veces el mismo día", () => {
    expect(
      calcularRacha(["2026-10-24", "2026-10-24", "2026-10-23"], "2026-10-24"),
    ).toBe(2);
  });
});

describe("días de descanso", () => {
  it("son 7 si no has entrenado esta semana", () => {
    expect(calcularDescanso(["2026-10-10"], "2026-10-24")).toBe(7);
  });

  it("descuenta los días entrenados de los últimos 7", () => {
    expect(calcularDescanso(["2026-10-24", "2026-10-22"], "2026-10-24")).toBe(5);
  });

  it("no cuenta el día 8 hacia atrás", () => {
    expect(calcularDescanso(["2026-10-17", "2026-10-18"], "2026-10-24")).toBe(6);
  });
});