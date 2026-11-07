import { describe, expect, it } from "vitest";
import { SLUG_REGEX } from "../admin/exercise-form";
import {
  MAX_BORRADORES,
  OPCIONES_POR_DEFECTO,
  borradorAPayload,
  combinacionDeSlug,
  generarBorrador,
  leerOpciones,
  listarCombinaciones,
  planificarBorradores,
  slugDeCombinacion,
} from "./borradores";
import { BIBLIOTECA_GRANDE } from "./test-library-grande";

describe("identificadores", () => {
  it("todos son válidos, de menos de 60 caracteres y se pueden leer de vuelta", () => {
    const combinaciones = listarCombinaciones({
      ...OPCIONES_POR_DEFECTO,
      days: [1, 2, 3, 4, 5, 6],
    });
    expect(combinaciones.length).toBeGreaterThan(100);

    const vistos = new Set<string>();
    for (const c of combinaciones) {
      const slug = slugDeCombinacion(c);
      expect(SLUG_REGEX.test(slug), slug).toBe(true);
      expect(slug.length, slug).toBeLessThanOrEqual(60);
      expect(vistos.has(slug), `repetido: ${slug}`).toBe(false);
      vistos.add(slug);
      expect(combinacionDeSlug(slug), slug).toEqual(c);
    }
  });

  it("rechaza identificadores falsos", () => {
    expect(combinacionDeSlug("foo")).toBeNull();
    expect(combinacionDeSlug("auto-masa-principiante-6d-casa-completo")).toBeNull();
    expect(combinacionDeSlug("auto-masa-principiante-3d-casa-xyz")).toBeNull();
    expect(combinacionDeSlug("auto-masa-principiante-3d-casa-completo-extra")).toBeNull();
    expect(combinacionDeSlug("masa-principiante-3d-casa-completo")).toBeNull();
  });

  it("no genera combinaciones que pasen del máximo de días del nivel", () => {
    const combinaciones = listarCombinaciones({
      ...OPCIONES_POR_DEFECTO,
      days: [1, 2, 3, 4, 5, 6],
    });
    for (const c of combinaciones) {
      const maximo = { beginner: 4, intermediate: 5, advanced: 6 }[c.level];
      expect(c.days).toBeLessThanOrEqual(maximo);
    }
  });
});

describe("leerOpciones", () => {
  it("acepta las opciones por defecto", () => {
    expect(leerOpciones(OPCIONES_POR_DEFECTO)).toEqual(OPCIONES_POR_DEFECTO);
  });

  it("descarta valores desconocidos y rechaza apartados vacíos", () => {
    const sucias = { ...OPCIONES_POR_DEFECTO, goals: ["muscle", "volar"] };
    expect(leerOpciones(sucias)?.goals).toEqual(["muscle"]);
    expect(leerOpciones({ ...OPCIONES_POR_DEFECTO, goals: [] })).toBeNull();
    expect(leerOpciones({ ...OPCIONES_POR_DEFECTO, goals: ["volar"] })).toBeNull();
  });

  it("limita el máximo", () => {
    expect(leerOpciones({ ...OPCIONES_POR_DEFECTO, max: 0 })).toBeNull();
    expect(leerOpciones({ ...OPCIONES_POR_DEFECTO, max: MAX_BORRADORES + 1 })).toBeNull();
    expect(leerOpciones({ ...OPCIONES_POR_DEFECTO, max: 2.5 })).toBeNull();
    expect(leerOpciones({ ...OPCIONES_POR_DEFECTO, max: MAX_BORRADORES })).not.toBeNull();
    expect(leerOpciones(null)).toBeNull();
  });
});

describe("generarBorrador", () => {
  const combinacion = {
    goal: "muscle",
    level: "beginner",
    days: 3,
    material: "gimnasio",
    focus: "chest",
  } as const;

  it("prepara una rutina completa y dentro de los límites de la base de datos", () => {
    const b = generarBorrador(combinacion, BIBLIOTECA_GRANDE);
    expect(b).not.toBeNull();
    if (!b) return;

    expect(b.slug).toBe("auto-masa-principiante-3d-gimnasio-pecho");
    expect(b.name.length).toBeLessThanOrEqual(80);
    expect(b.description.length).toBeGreaterThan(0);
    expect(b.description.length).toBeLessThanOrEqual(300);
    expect(b.weeks).toBe(8);
    expect(b.days).toHaveLength(3);
    for (const dia of b.days) {
      expect(dia.name.length).toBeLessThanOrEqual(80);
      expect(dia.exercises.length).toBeGreaterThanOrEqual(3);
      expect(dia.exercises.length).toBeLessThanOrEqual(30);
    }
  });

  it("no guarda las notas generales (se añaden solas al usar la rutina)", () => {
    const b = generarBorrador(combinacion, BIBLIOTECA_GRANDE);
    expect(b).not.toBeNull();
    for (const nota of b?.notes ?? []) {
      expect(nota.startsWith("Las series, repeticiones y descansos")).toBe(false);
      expect(nota.startsWith("Estas recomendaciones son generales")).toBe(false);
    }
  });

  it("avisa de los topes de seguridad solo si lleva barra", () => {
    const conBarra = generarBorrador(combinacion, BIBLIOTECA_GRANDE);
    expect(conBarra?.warnings.some((w) => w.includes("barra"))).toBe(true);

    const casa = generarBorrador({ ...combinacion, material: "casa" }, BIBLIOTECA_GRANDE);
    expect(casa).not.toBeNull();
    expect(casa?.warnings.some((w) => w.includes("barra"))).toBe(false);
  });

  it("devuelve null si no hay ejercicios suficientes", () => {
    expect(generarBorrador(combinacion, [])).toBeNull();
  });

  it("el payload tiene el formato de la base de datos", () => {
    const b = generarBorrador(combinacion, BIBLIOTECA_GRANDE);
    if (!b) throw new Error("Debería generarse");
    const payload = borradorAPayload(b);
    expect(payload.id).toBeNull();
    expect(payload.days[0].day_number).toBe(1);
    expect(payload.days[0].exercises[0].sort_order).toBe(1);
    expect(payload.days[0].exercises[0].notes).toBeNull();
  });
});

describe("planificarBorradores", () => {
  it("elige como mucho el máximo, sin repetidas, y siempre lo mismo", () => {
    const opciones = { ...OPCIONES_POR_DEFECTO, max: 50 };
    const plan = planificarBorradores(opciones, BIBLIOTECA_GRANDE);
    expect(plan.seleccion).toHaveLength(50);
    expect(new Set(plan.seleccion.map(slugDeCombinacion)).size).toBe(50);
    expect(planificarBorradores(opciones, BIBLIOTECA_GRANDE).seleccion).toEqual(
      plan.seleccion,
    );
  });

  it("sin ejercicios no crea nada y lo cuenta", () => {
    const plan = planificarBorradores({ ...OPCIONES_POR_DEFECTO, max: 10 }, []);
    expect(plan.seleccion).toHaveLength(0);
    expect(plan.sinEjercicios).toBeGreaterThan(0);
  });
});