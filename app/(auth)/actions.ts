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

  const fieldErrors = validarInicioSesion(correo, contrasena);
  if (hayErrores(fieldErrors)) {
    return { fieldErrors, correo };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: correo,
    password: contrasena,
  });

  if (error) {
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

  const fieldErrors = validarRegistro(nombre, correo, contrasena, repetir);
  if (hayErrores(fieldErrors)) {
    return { fieldErrors, nombre, correo };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email: correo,
    password: contrasena,
    // El nombre viaja con el registro y la base de datos lo guarda en el perfil.
    options: { data: { display_name: nombre } },
  });

  if (error) {
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

export async function cerrarSesion(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}