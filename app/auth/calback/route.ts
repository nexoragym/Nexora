import type { EmailOtpType } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "../../../lib/supabase/server";

const TIPOS_PERMITIDOS: readonly string[] = ["signup", "email", "magiclink"];

function ir(request: NextRequest, ruta: string, error?: string): NextResponse {
  const url = request.nextUrl.clone();
  url.pathname = ruta;
  url.search = error ? `?error=${error}` : "";
  return NextResponse.redirect(url);
}

// Aquí vuelven el enlace de confirmación del correo y el inicio de sesión con Google.
export async function GET(request: NextRequest) {
  const parametros = request.nextUrl.searchParams;
  const code = parametros.get("code");
  const tokenHash = parametros.get("token_hash");
  const tipo = parametros.get("type");

  const supabase = await createClient();

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return ir(request, "/bienvenida");
  } else if (tokenHash && tipo && TIPOS_PERMITIDOS.includes(tipo)) {
    const { error } = await supabase.auth.verifyOtp({
      type: tipo as EmailOtpType,
      token_hash: tokenHash,
    });
    if (!error) return ir(request, "/bienvenida");
  }

  console.error("[auth] no se pudo completar la confirmación o el acceso");
  return ir(request, "/login", "confirmacion");
}