"use client";

import { useActionState, useState } from "react";
import { Captcha } from "../../../components/auth/Captcha";
import { Alert } from "../../../components/ui/Alert";
import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";
import {
  CONTRASENA_MINIMA,
  NOMBRE_MAXIMO,
  type AuthFormState,
} from "../../../lib/auth";
import { registrarse } from "../actions";

const estadoInicial: AuthFormState = {};

export function RegisterForm() {
  // Cada verificación del captcha sirve una sola vez: se renueva tras cada envío.
  const [reinicio, setReinicio] = useState(0);
  const [estado, accion, pendiente] = useActionState(
    async (previo: AuthFormState, datos: FormData) => {
      const resultado = await registrarse(previo, datos);
      setReinicio((n) => n + 1);
      return resultado;
    },
    estadoInicial,
  );

  return (
    <form action={accion} noValidate className="flex flex-col gap-4">
      {estado.error ? (
        <Alert tone="danger" title="No se pudo crear la cuenta">
          {estado.error}
        </Alert>
      ) : null}
      {estado.info ? (
        <Alert tone="success" title="Casi listo">
          {estado.info}
        </Alert>
      ) : null}
      <Input
        name="nombre"
        label="Nombre"
        autoComplete="given-name"
        maxLength={NOMBRE_MAXIMO}
        defaultValue={estado.nombre}
        error={estado.fieldErrors?.nombre}
      />
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
        autoComplete="new-password"
        hint={`Mínimo ${CONTRASENA_MINIMA} caracteres.`}
        error={estado.fieldErrors?.contrasena}
      />
      <Input
        name="repetir"
        type="password"
        label="Repite la contraseña"
        autoComplete="new-password"
        error={estado.fieldErrors?.repetir}
      />
      <Captcha key={reinicio} />
      <Button type="submit" size="lg" fullWidth disabled={pendiente}>
        {pendiente ? "Creando cuenta…" : "Crear cuenta"}
      </Button>
    </form>
  );
}