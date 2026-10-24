import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { getSupabaseEnv } from "./lib/supabase/env";

// Pantallas que se pueden ver sin iniciar sesión. Todo lo demás es privado.
const rutasPublicas = ["/login", "/registro", "/empezar"];

function esRutaPublica(pathname: string): boolean {
  return (
    pathname === "/" ||
    rutasPublicas.some(
      (ruta) => pathname === ruta || pathname.startsWith(`${ruta}/`),
    )
  );
}

// Crea una redirección conservando las cookies y cabeceras de la sesión.
function redirigir(
  request: NextRequest,
  supabaseResponse: NextResponse,
  ruta: string,
): NextResponse {
  const url = request.nextUrl.clone();
  url.pathname = ruta;
  url.search = "";

  const respuesta = NextResponse.redirect(url);
  supabaseResponse.cookies.getAll().forEach((cookie) => {
    respuesta.cookies.set(cookie);
  });
  for (const cabecera of ["cache-control", "expires", "pragma"]) {
    const valor = supabaseResponse.headers.get(cabecera);
    if (valor) respuesta.headers.set(cabecera, valor);
  }
  return respuesta;
}

export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });
  const { url, key } = getSupabaseEnv();

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet, headers) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value),
        );
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options),
        );
        Object.entries(headers).forEach(([nombre, valor]) =>
          supabaseResponse.headers.set(nombre, valor),
        );
      },
    },
  });

  // getClaims() verifica la sesión y la renueva si hace falta.
  const { data } = await supabase.auth.getClaims();
  const haySesion = Boolean(data?.claims);
  const { pathname } = request.nextUrl;

  if (!haySesion && !esRutaPublica(pathname)) {
    return redirigir(request, supabaseResponse, "/login");
  }

  // Quien ya tiene sesión pasa por la bienvenida, que crea su plan si lo tiene pendiente.
  if (haySesion && (pathname === "/login" || pathname === "/registro")) {
    return redirigir(request, supabaseResponse, "/bienvenida");
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};