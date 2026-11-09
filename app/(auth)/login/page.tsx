import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { Suspense } from "react";
import { GoogleButton } from "../../../components/auth/GoogleButton";
import { Alert } from "../../../components/ui/Alert";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = { title: "Iniciar sesión" };

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function primero(valor: string | string[] | undefined): string {
  return Array.isArray(valor) ? (valor[0] ?? "") : (valor ?? "");
}

// Avisos cuando se vuelve aquí desde la confirmación del correo o desde Google.
async function AvisoLogin({ searchParams }: { searchParams: SearchParams }) {
  await connection();
  const error = primero((await searchParams).error);

  if (error === "confirmacion") {
    return (
      <Alert tone="warning" title="No se pudo completar el acceso">
        El enlace no es válido o ha caducado. Si ya confirmaste tu correo,
        inicia sesión. Si no, crea la cuenta otra vez.
      </Alert>
    );
  }
  if (error === "google") {
    return (
      <Alert tone="danger" title="No se pudo entrar con Google">
        Inténtalo de nuevo o usa tu correo y contraseña.
      </Alert>
    );
  }
  return null;
}

export default function LoginPage({ searchParams }: { searchParams: SearchParams }) {
  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">
          Iniciar sesión
        </h1>
        <p className="text-muted">Accede a tus rutinas y a tu progreso.</p>
      </header>
      <Suspense fallback={null}>
        <AvisoLogin searchParams={searchParams} />
      </Suspense>
      <GoogleButton />
      <LoginForm />
      <p className="text-center text-sm text-muted">
        ¿No tienes cuenta?{" "}
        <Link
          href="/registro"
          className="font-medium text-foreground underline underline-offset-4 hover:text-muted"
        >
          Crear cuenta
        </Link>
      </p>
    </div>
  );
}