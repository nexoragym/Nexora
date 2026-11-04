import { describe, expect, it } from "vitest";
import { SLUG_REGEX } from "../admin/exercise-form";
import { LIMITATION_EXCLUSIONS, TIMED_EXERCISE_SLUGS } from "./rules";

describe("ejercicios por tiempo", () => {
  it("incluye los isométricos de la biblioteca", () => {
    for (const slug of [
      "plancha",
      "plancha-lateral",
      "hollow-hold",
      "sentadilla-isometrica-en-pared",
    ]) {
      expect(TIMED_EXERCISE_SLUGS).toContain(slug);
    }
  });

  it("no tiene repetidos y todos son identificadores válidos", () => {
    expect(new Set(TIMED_EXERCISE_SLUGS).size).toBe(TIMED_EXERCISE_SLUGS.length);
    for (const slug of TIMED_EXERCISE_SLUGS) {
      expect(SLUG_REGEX.test(slug)).toBe(true);
    }
  });
});

describe("zonas a cuidar", () => {
  it("todos los identificadores son válidos y no se repiten dentro de cada zona", () => {
    for (const regla of Object.values(LIMITATION_EXCLUSIONS)) {
      expect(new Set(regla.slugs).size).toBe(regla.slugs.length);
      for (const slug of regla.slugs) {
        expect(SLUG_REGEX.test(slug)).toBe(true);
      }
    }
  });

  it("evitar impacto cubre los saltos", () => {
    expect(LIMITATION_EXCLUSIONS.avoid_impact.slugs).toContain("salto-al-cajon");
    expect(LIMITATION_EXCLUSIONS.avoid_impact.slugs).toContain("burpee");
  });
});