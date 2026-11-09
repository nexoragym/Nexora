import type { Metadata } from "next";
import Link from "next/link";
import { GoogleButton } from "../../../components/auth/GoogleButton";
import { RegisterForm } from "./RegisterForm";

export const metadata: Metadata = { title: "Crear cuenta" };

export default function RegistroPage() {
  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">Crear cuenta</h1>
        <p className="text-muted">
          Guarda tus rutinas y sigue tu progreso.
        </p>
      </header>
      <GoogleButton />
      <RegisterForm />
      <p className="text-center text-sm text-muted">
        ¿Ya tienes cuenta?{" "}
        <Link
          href="/login"
          className="font-medium text-foreground underline underline-offset-4 hover:text-muted"
        >
          Iniciar sesión
        </Link>
      </p>
    </div>
  );
}