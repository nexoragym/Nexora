import { describe, expect, it } from "vitest";
import {
  rutaMediaValida,
  rutaNuevaMedia,
  urlPublicaMedia,
  validarArchivoMedia,
} from "./media";

const ID = "123e4567-e89b-42d3-a456-426614174000";
const OTRO_ID = "223e4567-e89b-42d3-a456-426614174000";

describe("validarArchivoMedia", () => {
  it("acepta una imagen correcta", () => {
    expect(
      validarArchivoMedia("image", { type: "image/webp", size: 200 * 1024 }),
    ).toBeNull();
  });

  it("acepta un vídeo correcto", () => {
    expect(
      validarArchivoMedia("video", { type: "video/mp4", size: 5 * 1024 * 1024 }),
    ).toBeNull();
  });

  it("rechaza un formato no permitido", () => {
    expect(
      validarArchivoMedia("image", { type: "image/gif", size: 1000 }),
    ).toContain("Formato no permitido");
    expect(
      validarArchivoMedia("video", { type: "image/jpeg", size: 1000 }),
    ).toContain("Formato no permitido");
  });

  it("rechaza un archivo demasiado grande", () => {
    expect(
      validarArchivoMedia("image", { type: "image/jpeg", size: 3 * 1024 * 1024 }),
    ).toContain("máximo");
  });

  it("rechaza un archivo vacío", () => {
    expect(
      validarArchivoMedia("image", { type: "image/jpeg", size: 0 }),
    ).toContain("vacío");
  });

  it("no se deja engañar por nombres raros de tipo", () => {
    expect(
      validarArchivoMedia("image", { type: "constructor", size: 1000 }),
    ).toContain("Formato no permitido");
  });
});

describe("rutaMediaValida", () => {
  it("acepta la ruta que genera la propia aplicación", () => {
    const ruta = rutaNuevaMedia(ID, "image", "jpg", 1760000000000);
    expect(rutaMediaValida(ID, "image", ruta)).toBe(true);
  });

  it("rechaza la ruta de otro ejercicio", () => {
    const ruta = rutaNuevaMedia(OTRO_ID, "image", "jpg", 1760000000000);
    expect(rutaMediaValida(ID, "image", ruta)).toBe(false);
  });

  it("rechaza un tipo o una extensión que no corresponde", () => {
    expect(
      rutaMediaValida(ID, "video", `exercises/${ID}/image-1760000000000.jpg`),
    ).toBe(false);
    expect(
      rutaMediaValida(ID, "image", `exercises/${ID}/image-1760000000000.exe`),
    ).toBe(false);
  });

  it("rechaza rutas con trucos", () => {
    expect(
      rutaMediaValida(ID, "image", `exercises/${ID}/../x/image-1760000000000.jpg`),
    ).toBe(false);
    expect(rutaMediaValida("no-es-un-id", "image", "lo-que-sea")).toBe(false);
  });
});

describe("urlPublicaMedia", () => {
  it("construye la dirección pública", () => {
    const previo = process.env.NEXT_PUBLIC_SUPABASE_URL;
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://abc.supabase.co/";
    try {
      expect(urlPublicaMedia(`exercises/${ID}/image-1760000000000.jpg`)).toBe(
        `https://abc.supabase.co/storage/v1/object/public/exercise-media/exercises/${ID}/image-1760000000000.jpg`,
      );
    } finally {
      if (previo === undefined) {
        delete process.env.NEXT_PUBLIC_SUPABASE_URL;
      } else {
        process.env.NEXT_PUBLIC_SUPABASE_URL = previo;
      }
    }
  });

  it("devuelve null si no hay ruta", () => {
    expect(urlPublicaMedia(null)).toBeNull();
    expect(urlPublicaMedia("")).toBeNull();
  });
});