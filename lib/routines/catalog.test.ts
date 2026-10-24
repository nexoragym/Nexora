import { describe, expect, it } from "vitest";
import { CATALOG, esPorTiempo } from "./catalog";

const SLUGS_BIBLIOTECA = [
  "press-banca-plano",
  "press-banca-mancuernas",
  "flexiones",
  "press-inclinado-mancuernas",
  "aperturas-en-maquina",
  "press-militar-mancuernas",
  "elevaciones-laterales",
  "press-hombros-maquina",
  "jalon-al-pecho",
  "remo-con-mancuerna",
  "remo-con-barra",
  "remo-sentado-en-maquina",
  "dominadas",
  "curl-biceps-mancuernas",
  "extension-de-triceps-en-polea",
  "fondos-en-banco",
  "sentadilla-peso-corporal",
  "sentadilla-goblet",
  "sentadilla-con-barra",
  "prensa-de-piernas",
  "zancadas",
  "peso-muerto-rumano-mancuernas",
  "peso-muerto-rumano-barra",
  "puente-de-gluteos",
  "extension-de-cuadriceps",
  "curl-femoral-en-maquina",
  "elevacion-de-talones",
  "plancha",
  "crunch-abdominal",
  "perro-pajaro",
];

describe("catálogo de rutinas estándar", () => {
  it("cada rutina tiene un identificador único", () => {
    const slugs = CATALOG.map((rutina) => rutina.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  for (const rutina of CATALOG) {
    it(`${rutina.slug} cumple los límites de la base de datos`, () => {
      expect(rutina.name.length).toBeGreaterThanOrEqual(1);
      expect(rutina.name.length).toBeLessThanOrEqual(80);
      expect(rutina.weeks).toBeGreaterThanOrEqual(1);
      expect(rutina.weeks).toBeLessThanOrEqual(52);
      expect(rutina.days.length).toBeGreaterThanOrEqual(1);
      expect(rutina.days.length).toBeLessThanOrEqual(7);
      expect(rutina.equipment.length).toBeGreaterThanOrEqual(1);

      for (const dia of rutina.days) {
        expect(dia.name.length).toBeGreaterThanOrEqual(1);
        expect(dia.name.length).toBeLessThanOrEqual(80);
        expect(dia.exercises.length).toBeGreaterThanOrEqual(3);
        expect(dia.exercises.length).toBeLessThanOrEqual(30);

        const vistos = new Set<string>();
        for (const ejercicio of dia.exercises) {
          expect(
            SLUGS_BIBLIOTECA,
            `${rutina.slug}: ejercicio desconocido ${ejercicio.slug}`,
          ).toContain(ejercicio.slug);
          expect(
            vistos.has(ejercicio.slug),
            `${rutina.slug}: ${ejercicio.slug} repetido en un día`,
          ).toBe(false);
          vistos.add(ejercicio.slug);

          expect(ejercicio.sets).toBeGreaterThanOrEqual(1);
          expect(ejercicio.sets).toBeLessThanOrEqual(6);
          expect(ejercicio.repsMin).toBeGreaterThanOrEqual(1);
          expect(ejercicio.repsMax).toBeLessThanOrEqual(100);
          expect(ejercicio.repsMax).toBeGreaterThanOrEqual(ejercicio.repsMin);
          expect(ejercicio.rest).toBeGreaterThanOrEqual(0);
          expect(ejercicio.rest).toBeLessThanOrEqual(600);

          if (esPorTiempo(ejercicio.slug)) {
            expect(ejercicio.repsMin).toBeGreaterThanOrEqual(10);
          }
        }
      }
    });
  }
});