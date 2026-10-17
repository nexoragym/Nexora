"use client";

import { useActionState } from "react";
import { Alert } from "../../../components/ui/Alert";
import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";
import type { AuthFormState } from "../../../lib/auth";
import { iniciarSesion } from "../actions";

const estadoInicial: AuthFormState = {};

export function LoginForm() {
  const [estado, accion, pendiente] = useActionState(
    iniciarSesion,
    estadoInicial,
  );

  return (
    <form action={accion} noValidate className="flex flex-col gap-4">
      {estado.error ? (
        <Alert tone="danger" title="No se pudo iniciar sesión">
          {estado.error}
        </Alert>
      ) : null}
      <Input
        name="correo"
        type="email"
        label="Correo electrónico"
        autoComplete="email"
        defaultValue={estado.correo}
        error={estado.fieldErrors?.correo}
      />
      <Input
        name="contrasena"
        type="password"
        label="Contraseña"
        autoComplete="current-password"
        error={estado.fieldErrors?.contrasena}
      />
      <Button type="submit" size="lg" fullWidth disabled={pendiente}>
        {pendiente ? "Entrando…" : "Iniciar sesión"}
      </Button>
    </form>
  );
}