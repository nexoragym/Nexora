"use server";

import { redirect } from "next/navigation";
import {
  hayErrores,
  limpiarNombre,
  validarInicioSesion,
  validarRegistro,
  type AuthFormState,
} from "../../lib/auth";
import { createClient } from "../../lib/supabase/server";
import { urlBase } from "../../lib/url-base";

// Si la clave del captcha está puesta, el formulario debe traer su resultado.
const CAPTCHA_ACTIVO = Boolean(process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY);
const ERROR_CAPTCHA =
  "Completa la verificación de seguridad (espera a que aparezca el tick) y vuelve a intentarlo.";

function textoDe(formData: FormData, campo: string): string {
  const valor = formData.get(campo);
  return typeof valor === "string" ? valor : "";
}

export async function iniciarSesion(
  _estado: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const correo = textoDe(formData, "correo").trim();
  const contrasena = textoDe(formData, "contrasena");
  const captcha = textoDe(formData, "captcha");

  const fieldErrors = validarInicioSesion(correo, contrasena);
  if (hayErrores(fieldErrors)) {
    return { fieldErrors, correo };
  }
  if (CAPTCHA_ACTIVO && captcha === "") {
    return { error: ERROR_CAPTCHA, correo };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: correo,
    password: contrasena,
    options: { captchaToken: captcha || undefined },
  });

  if (error) {
    if (error.code === "captcha_failed") {
      return { error: ERROR_CAPTCHA, correo };
    }
    // Mensaje genérico: no revela si el correo existe o no.
    return { error: "Correo o contraseña incorrectos.", correo };
  }

  redirect("/bienvenida");
}

export async function registrarse(
  _estado: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const nombre = limpiarNombre(textoDe(formData, "nombre"));
  const correo = textoDe(formData, "correo").trim();
  const contrasena = textoDe(formData, "contrasena");
  const repetir = textoDe(formData, "repetir");
  const captcha = textoDe(formData, "captcha");

  const fieldErrors = validarRegistro(nombre, correo, contrasena, repetir);
  if (hayErrores(fieldErrors)) {
    return { fieldErrors, nombre, correo };
  }
  if (CAPTCHA_ACTIVO && captcha === "") {
    return { error: ERROR_CAPTCHA, nombre, correo };
  }

  const base = await urlBase();
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email: correo,
    password: contrasena,
    options: {
      // El nombre viaja con el registro y la base de datos lo guarda en el perfil.
      data: { display_name: nombre },
      // A dónde vuelve la persona al pulsar «Confirmar» en el correo.
      emailRedirectTo: base ? `${base}/auth/callback` : undefined,
      captchaToken: captcha || undefined,
    },
  });

  if (error) {
    if (error.code === "captcha_failed") {
      return { error: ERROR_CAPTCHA, nombre, correo };
    }
    console.error("[registro] error de Supabase:", error.code ?? error.message);
    return {
      error: "No se pudo crear la cuenta. Revisa los datos e inténtalo de nuevo.",
      nombre,
      correo,
    };
  }

  if (data.session) {
    redirect("/bienvenida");
  }

  return {
    info: "Cuenta creada. Revisa tu correo para confirmarla antes de iniciar sesión.",
  };
}

// Entrar con Google: lleva a la pantalla de Google y vuelve a /auth/callback.
export async function iniciarConGoogle(): Promise<void> {
  const base = await urlBase();
  const supabase = await createClient();

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: base ? `${base}/auth/callback` : undefined },
  });

  if (error || !data.url) {
    console.error("[google] no se pudo iniciar el acceso:", error?.code ?? "sin código");
    redirect("/login?error=google");
  }
  redirect(data.url);
}

export async function cerrarSesion(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}