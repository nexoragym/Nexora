import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { getSupabaseEnv } from "./env";

// Cliente de Supabase para código que se ejecuta en el servidor
// (páginas, acciones de formulario). Crea uno nuevo en cada petición.
export async function createClient() {
  const cookieStore = await cookies();
  const { url, key } = getSupabaseEnv();

  return createServerClient(url, key, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          );
        } catch {
          // Las páginas no pueden escribir cookies. Se ignora porque
          // proxy.ts ya renueva la sesión en cada petición.
        }
      },
    },
  });
}