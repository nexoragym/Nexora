import { describe, expect, it } from "vitest";
import { rutaNuevaPortada, rutaPortadaValida } from "./portada";

const ID = "11111111-1111-4111-8111-111111111111";
const OTRO = "22222222-2222-4222-8222-222222222222";

describe("rutas de portada", () => {
  it("la ruta nueva es válida para su rutina", () => {
    const ruta = rutaNuevaPortada(ID, "jpg", 1762300000000);
    expect(rutaPortadaValida(ID, ruta)).toBe(true);
  });

  it("no vale para otra rutina ni para rutas raras", () => {
    const ruta = rutaNuevaPortada(ID, "webp", 1762300000000);
    expect(rutaPortadaValida(OTRO, ruta)).toBe(false);
    expect(rutaPortadaValida(ID, `../${ruta}`)).toBe(false);
    expect(rutaPortadaValida(ID, `routines/${ID}/cover-1762300000000.gif`)).toBe(false);
  });
});