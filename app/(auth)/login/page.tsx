import type { Metadata } from "next";
import Link from "next/link";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = { title: "Iniciar sesión" };

export default function LoginPage() {
  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">
          Iniciar sesión
        </h1>
        <p className="text-muted">Accede a tus rutinas y a tu progreso.</p>
      </header>
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