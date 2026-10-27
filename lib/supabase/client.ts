import { createBrowserClient } from "@supabase/ssr";
import { getSupabaseEnv } from "./env";

// Conexión con Supabase desde el navegador. Usa tu sesión, así que
// la base de datos decide si puedes subir archivos (solo el superadmin).
export function createClient() {
  const { url, key } = getSupabaseEnv();
  return createBrowserClient(url, key);
}