"use client";

import { useActionState } from "react";
import { Alert } from "../../../components/ui/Alert";
import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";
import { NOMBRE_MAXIMO, type ProfileFormState } from "../../../lib/profile";
import { guardarNombre } from "./actions";

const estadoInicial: ProfileFormState = {};

export function ProfileForm({ nombreInicial }: { nombreInicial: string }) {
  const [estado, accion, pendiente] = useActionState(
    guardarNombre,
    estadoInicial,
  );

  return (
    <form action={accion} noValidate className="flex flex-col gap-4">
      {estado.ok ? <Alert tone="success">Nombre guardado.</Alert> : null}
      {estado.error ? (
        <Alert tone="danger" title="No se pudo guardar">
          {estado.error}
        </Alert>
      ) : null}
      <Input
        name="nombre"
        label="Nombre o apodo"
        hint="Es opcional. Lo usaremos para saludarte."
        maxLength={NOMBRE_MAXIMO}
        autoComplete="given-name"
        defaultValue={estado.nombre ?? nombreInicial}
      />
      <Button type="submit" disabled={pendiente}>
        {pendiente ? "Guardando…" : "Guardar"}
      </Button>
    </form>
  );
}