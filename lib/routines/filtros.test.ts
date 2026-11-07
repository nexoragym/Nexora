import { describe, expect, it } from "vitest";
import {
  filtrarRutinas,
  leerFiltrosRutinas,
  paginar,
  portadaListada,
  type FiltrosRutinas,
  type RutinaListada,
} from "./filtros";

const sinFiltros: FiltrosRutinas = {
  q: "",
  goal: "",
  level: "",
  days: null,
  material: "",
  focus: "",
  page: 1,
};

function rutina(extra: Partial<RutinaListada>): RutinaListada {
  return {
    id: "1",
    slug: "prueba",
    name: "Prueba",
    description: "Descripción",
    goal: "muscle",
    focus: "balanced",
    level: "beginner",
    weeks: 8,
    equipment: ["bodyweight"],
    coverPath: null,
    daysCount: 3,
    ...extra,
  };
}

describe("leerFiltrosRutinas", () => {
  it("lee los valores válidos", () => {
    const f = leerFiltrosRutinas({
      q: "  pecho ",
      objetivo: "muscle",
      nivel: "advanced",
      dias: "4",
      material: "casa",
      enfoque: "chest",
      pagina: "3",
    });
    expect(f).toEqual({
      q: "pecho",
      goal: "muscle",
      level: "advanced",
      days: 4,
      material: "casa",
      focus: "chest",
      page: 3,
    });
  });

  it("ignora lo que no es válido", () => {
    const f = leerFiltrosRutinas({
      objetivo: "volar",
      nivel: "dios",
      dias: "99",
      material: "cohete",
      enfoque: "alas",
      pagina: "-2",
    });
    expect(f).toEqual(sinFiltros);
  });
});

describe("filtrarRutinas", () => {
  const lista = [
    rutina({ id: "a", name: "Masa en casa", equipment: ["bodyweight"], daysCount: 3 }),
    rutina({
      id: "b",
      name: "Fuerza con barra",
      goal: "strength",
      level: "advanced",
      equipment: ["barbell", "bodyweight"],
      daysCount: 5,
    }),
    rutina({
      id: "c",
      name: "Definir con mancuernas",
      goal: "definition",
      focus: "core",
      equipment: ["dumbbells", "bodyweight"],
      daysCount: 4,
    }),
  ];

  it("sin filtros salen todas", () => {
    expect(filtrarRutinas(lista, sinFiltros)).toHaveLength(3);
  });

  it("filtra por objetivo, nivel, días y enfoque", () => {
    expect(filtrarRutinas(lista, { ...sinFiltros, goal: "strength" }).map((r) => r.id)).toEqual(["b"]);
    expect(filtrarRutinas(lista, { ...sinFiltros, level: "advanced" }).map((r) => r.id)).toEqual(["b"]);
    expect(filtrarRutinas(lista, { ...sinFiltros, days: 4 }).map((r) => r.id)).toEqual(["c"]);
    expect(filtrarRutinas(lista, { ...sinFiltros, focus: "core" }).map((r) => r.id)).toEqual(["c"]);
  });

  it("el material es lo que tienes: solo salen rutinas que no piden más", () => {
    expect(filtrarRutinas(lista, { ...sinFiltros, material: "casa" }).map((r) => r.id)).toEqual(["a"]);
    expect(filtrarRutinas(lista, { ...sinFiltros, material: "mancuernas" }).map((r) => r.id)).toEqual(["a", "c"]);
    expect(filtrarRutinas(lista, { ...sinFiltros, material: "maquinas" }).map((r) => r.id)).toEqual(["a", "c"]);
  });

  it("busca sin tildes y con varias palabras en cualquier orden", () => {
    expect(filtrarRutinas(lista, { ...sinFiltros, q: "MANCUERNAS definir" }).map((r) => r.id)).toEqual(["c"]);
    expect(filtrarRutinas(lista, { ...sinFiltros, q: "inexistente" })).toEqual([]);
  });
});

describe("paginar", () => {
  const lista = Array.from({ length: 30 }, (_, i) => i);

  it("parte en páginas de 12", () => {
    expect(paginar(lista, 1).items).toHaveLength(12);
    expect(paginar(lista, 3).items).toHaveLength(6);
    expect(paginar(lista, 1).totalPaginas).toBe(3);
  });

  it("no se sale de las páginas que existen", () => {
    expect(paginar(lista, 99).pagina).toBe(3);
    expect(paginar([], 5)).toEqual({ items: [], pagina: 1, totalPaginas: 1 });
  });
});

describe("portadaListada", () => {
  it("las automáticas usan la imagen de una rutina parecida", () => {
    const auto = rutina({ slug: "auto-masa-principiante-3d-casa-completo" });
    expect(portadaListada(auto)).toBe("/images/rutinas/masa-muscular-principiante.jpg");
    const casa = rutina({ slug: "auto-definir-principiante-3d-casa-completo", goal: "definition" });
    expect(portadaListada(casa)).toBe("/images/rutinas/definir-en-casa.jpg");
  });

  it("las demás usan la imagen con su nombre", () => {
    expect(portadaListada(rutina({ slug: "fuerza-intermedio" }))).toBe(
      "/images/rutinas/fuerza-intermedio.jpg",
    );
  });
});