"use client";

import { useActionState, useState } from "react";
import { Captcha } from "../../../components/auth/Captcha";
import { Alert } from "../../../components/ui/Alert";
import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";
import type { AuthFormState } from "../../../lib/auth";
import { iniciarSesion } from "../actions";

const estadoInicial: AuthFormState = {};

export function LoginForm() {
  // Cada verificación del captcha sirve una sola vez: se renueva tras cada envío.
  const [reinicio, setReinicio] = useState(0);
  const [estado, accion, pendiente] = useActionState(
    async (previo: AuthFormState, datos: FormData) => {
      const resultado = await iniciarSesion(previo, datos);
      setReinicio((n) => n + 1);
      return resultado;
    },
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
      <Captcha key={reinicio} />
      <Button type="submit" size="lg" fullWidth disabled={pendiente}>
        {pendiente ? "Entrando…" : "Iniciar sesión"}
      </Button>
    </form>
  );
}