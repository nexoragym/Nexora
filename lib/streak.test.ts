import { describe, expect, it } from "vitest";
import {
  cambioDeTier,
  calcularMejorRacha,
  diasHastaSiguienteEtapa,
  etapaDeRacha,
  progresoEnEtapa,
  semanaDeFechas,
} from "./streak";

describe("etapaDeRacha", () => {
  it("elige la etapa correcta en cada límite", () => {
    const casos: [number, string][] = [
      [0, "sin-racha"],
      [1, "brasa"],
      [3, "brasa"],
      [4, "llama-pequena"],
      [5, "llama-pequena"],
      [6, "llama-viva"],
      [7, "fuego"],
      [9, "fuego"],
      [10, "fuego-vivo"],
      [11, "fuego-vivo"],
      [12, "fuego-intenso"],
      [14, "fuego-intenso"],
      [15, "fuego-morado"],
      [19, "fuego-morado"],
      [20, "morado-vivo"],
      [24, "morado-vivo"],
      [25, "morado-intenso"],
      [29, "morado-intenso"],
      [30, "fuego-azul"],
      [200, "fuego-azul"],
    ];
    for (const [dias, id] of casos) {
      expect(etapaDeRacha(dias).id, `${dias} días`).toBe(id);
    }
  });

  it("no falla con valores raros", () => {
    expect(etapaDeRacha(-5).id).toBe("sin-racha");
    expect(etapaDeRacha(Number.NaN).id).toBe("sin-racha");
    expect(etapaDeRacha(2.9).id).toBe("brasa");
  });

  it("las etapas no tienen huecos ni se solapan", () => {
    for (let dias = 0; dias <= 60; dias += 1) {
      const etapa = etapaDeRacha(dias);
      expect(dias).toBeGreaterThanOrEqual(etapa.desde);
      if (etapa.hasta !== null) {
        expect(dias).toBeLessThanOrEqual(etapa.hasta);
      }
    }
  });
});

describe("diasHastaSiguienteEtapa", () => {
  it("cuenta los días que faltan", () => {
    expect(diasHastaSiguienteEtapa(0)).toBe(1);
    expect(diasHastaSiguienteEtapa(3)).toBe(1);
    expect(diasHastaSiguienteEtapa(5)).toBe(1);
    expect(diasHastaSiguienteEtapa(6)).toBe(1);
    expect(diasHastaSiguienteEtapa(7)).toBe(3);
    expect(diasHastaSiguienteEtapa(14)).toBe(1);
    expect(diasHastaSiguienteEtapa(15)).toBe(5);
    expect(diasHastaSiguienteEtapa(29)).toBe(1);
  });

  it("es null en la última etapa", () => {
    expect(diasHastaSiguienteEtapa(30)).toBeNull();
    expect(diasHastaSiguienteEtapa(90)).toBeNull();
  });
});

describe("progresoEnEtapa", () => {
  it("va de 0 a 1 dentro de la etapa", () => {
    expect(progresoEnEtapa(4)).toBe(0);
    expect(progresoEnEtapa(5)).toBe(0.5);
    expect(progresoEnEtapa(8)).toBeCloseTo(1 / 3);
  });

  it("es 1 en la última etapa", () => {
    expect(progresoEnEtapa(30)).toBe(1);
  });
});

describe("cambioDeTier", () => {
  it("detecta si cambia el color del fuego", () => {
    expect(cambioDeTier(etapaDeRacha(6), etapaDeRacha(7))).toBe(true);
    expect(cambioDeTier(etapaDeRacha(14), etapaDeRacha(15))).toBe(true);
    expect(cambioDeTier(etapaDeRacha(3), etapaDeRacha(4))).toBe(true);
    expect(cambioDeTier(etapaDeRacha(4), etapaDeRacha(6))).toBe(false);
    expect(cambioDeTier(etapaDeRacha(9), etapaDeRacha(10))).toBe(false);
  });
});

describe("calcularMejorRacha", () => {
  it("es 0 si no hay entrenamientos", () => {
    expect(calcularMejorRacha([])).toBe(0);
  });

  it("encuentra la racha más larga", () => {
    expect(
      calcularMejorRacha([
        "2026-10-01",
        "2026-10-02",
        "2026-10-03",
        "2026-10-20",
        "2026-10-21",
      ]),
    ).toBe(3);
  });

  it("permite 2 días de descanso pero no 3", () => {
    expect(calcularMejorRacha(["2026-10-01", "2026-10-04"])).toBe(2);
    expect(calcularMejorRacha(["2026-10-01", "2026-10-05"])).toBe(1);
  });

  it("no cuenta dos veces el mismo día", () => {
    expect(calcularMejorRacha(["2026-10-01", "2026-10-01"])).toBe(1);
  });
});

describe("semanaDeFechas", () => {
  it("marca los días entrenados de la semana (de lunes a domingo)", () => {
    // El 28 de octubre de 2026 es miércoles.
    const semana = semanaDeFechas(["2026-10-26", "2026-10-28"], "2026-10-28");
    expect(semana).toHaveLength(7);
    expect(semana[0].fecha).toBe("2026-10-26");
    expect(semana[0].letra).toBe("L");
    expect(semana[0].entrenado).toBe(true);
    expect(semana[1].entrenado).toBe(false);
    expect(semana[2].esHoy).toBe(true);
    expect(semana[2].entrenado).toBe(true);
    expect(semana[3].futuro).toBe(true);
    expect(semana[6].letra).toBe("D");
    expect(semana[6].fecha).toBe("2026-11-01");
  });

  it("si hoy es domingo, la semana empieza seis días antes", () => {
    const semana = semanaDeFechas([], "2026-11-01");
    expect(semana[0].fecha).toBe("2026-10-26");
    expect(semana[6].esHoy).toBe(true);
  });

  it("si hoy es lunes, la semana empieza hoy", () => {
    const semana = semanaDeFechas([], "2026-10-26");
    expect(semana[0].esHoy).toBe(true);
  });
});