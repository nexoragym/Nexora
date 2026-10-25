import { describe, expect, it } from "vitest";
import { normalizarBusqueda, palabrasDeBusqueda } from "./exercises";

describe("normalizarBusqueda", () => {
  it("quita tildes y mayúsculas", () => {
    expect(normalizarBusqueda("  Extensión de Tríceps ")).toBe(
      "extension de triceps",
    );
  });

  it("trata la ñ como una n", () => {
    expect(normalizarBusqueda("Compañero")).toBe("companero");
  });

  it("junta los espacios repetidos", () => {
    expect(normalizarBusqueda("press   banca")).toBe("press banca");
  });
});

describe("palabrasDeBusqueda", () => {
  it("divide el texto en palabras sueltas", () => {
    expect(palabrasDeBusqueda("Press de BANCA")).toEqual([
      "press",
      "de",
      "banca",
    ]);
  });

  it("devuelve una lista vacía si no hay texto", () => {
    expect(palabrasDeBusqueda("   ")).toEqual([]);
  });

  it("limita el número de palabras", () => {
    expect(palabrasDeBusqueda("a b c d e f g h", 6)).toHaveLength(6);
  });
});