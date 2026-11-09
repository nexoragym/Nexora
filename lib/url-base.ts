import { headers } from "next/headers";

// Dirección de la web que está haciendo la petición (para los enlaces de vuelta).
// Supabase la comprueba contra la lista de «Redirect URLs», así que no es un riesgo.
export async function urlBase(): Promise<string> {
  const cabeceras = await headers();

  const origen = cabeceras.get("origin");
  if (origen && /^https?:\/\/[^\s/]+$/.test(origen)) return origen;

  const host = cabeceras.get("x-forwarded-host") ?? cabeceras.get("host");
  if (!host) return "";
  const protocolo =
    cabeceras.get("x-forwarded-proto") ??
    (host.startsWith("localhost") ? "http" : "https");
  return `${protocolo}://${host}`;
}