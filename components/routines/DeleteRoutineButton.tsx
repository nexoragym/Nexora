"use client";

import { useState } from "react";
import { eliminarRutinaPersonal } from "../../app/(app)/mis-rutinas/actions";
import { Button } from "../ui/Button";

type DeleteRoutineButtonProps = {
  id: string;
  name: string;
};

export function DeleteRoutineButton({ id, name }: DeleteRoutineButtonProps) {
  const [confirmando, setConfirmando] = useState(false);

  if (!confirmando) {
    return (
      <Button type="button" size="sm" variant="ghost" onClick={() => setConfirmando(true)}>
        Eliminar
      </Button>
    );
  }

  return (
    <form action={eliminarRutinaPersonal} className="flex flex-wrap items-center gap-2">
      <input type="hidden" name="id" value={id} />
      <span className="text-sm text-muted">
        ¿Eliminar «{name}»? Tu historial se conserva.
      </span>
      <Button type="submit" size="sm">
        Sí, eliminar
      </Button>
      <Button
        type="button"
        size="sm"
        variant="secondary"
        onClick={() => setConfirmando(false)}
      >
        Cancelar
      </Button>
    </form>
  );
}