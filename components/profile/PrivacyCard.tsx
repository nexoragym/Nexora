"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import {
  eliminarCuenta,
  type EstadoBorrado,
} from "../../app/(app)/perfil/privacidad-actions";
import { Alert } from "../ui/Alert";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";
import { Input } from "../ui/Input";

const estadoInicial: EstadoBorrado = {};

export function PrivacyCard() {
  const [abierto, setAbierto] = useState(false);
  const [estado, accion, pendiente] = useActionState(eliminarCuenta, estadoInicial);

  return (
    <section aria-labelledby="privacidad" className="flex flex-col gap-4">
      <h2 id="privacidad" className="text-xl font-semibold">
        Privacidad y datos
      </h2>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="flex flex-col gap-4">
          <h3 className="text-lg font-semibold">Descargar mis datos</h3>
          <p className="text-muted">
            Te descargas un archivo con tu cuenta, tu perfil, tus preferencias,
            tus rutinas y todo tu historial de entrenamientos.
          </p>
          <div>
            {/* Enlace normal (no Link): es una descarga de archivo */}
            <a
              href="/perfil/exportar"
              download
              className="inline-flex items-center justify-center rounded-2xl border border-border bg-surface-2 px-6 py-3 text-lg font-semibold text-foreground transition hover:bg-border"
            >
              Descargar mis datos
            </a>
          </div>
        </Card>

        <Card className="flex flex-col gap-4">
          <h3 className="text-lg font-semibold">Eliminar mi cuenta</h3>
          <p className="text-muted">
            Se borrarán tu cuenta y todos tus datos: perfil, rutinas, entrenamientos
            y progreso. <strong className="text-foreground">No se puede deshacer.</strong>{" "}
            Si quieres conservar algo, descarga antes tus datos.
          </p>

          {abierto ? (
            <form action={accion} className="flex flex-col gap-4">
              {estado.error ? (
                <Alert tone="danger" title="No se pudo eliminar">
                  {estado.error}
                </Alert>
              ) : null}
              <Input
                name="confirmacion"
                label="Para confirmar, escribe BORRAR"
                autoComplete="off"
                autoCapitalize="characters"
              />
              <div className="flex flex-wrap gap-3">
                <Button type="submit" disabled={pendiente}>
                  {pendiente ? "Eliminando…" : "Eliminar mi cuenta para siempre"}
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setAbierto(false)}
                  disabled={pendiente}
                >
                  Cancelar
                </Button>
              </div>
            </form>
          ) : (
            <div>
              <Button type="button" variant="secondary" onClick={() => setAbierto(true)}>
                Eliminar mi cuenta
              </Button>
            </div>
          )}
        </Card>
      </div>

      <p className="text-sm text-muted">
        Más información en la{" "}
        <Link href="/privacidad" className="font-semibold text-accent hover:underline">
          política de privacidad
        </Link>{" "}
        y las{" "}
        <Link href="/condiciones" className="font-semibold text-accent hover:underline">
          condiciones de uso
        </Link>
        .
      </p>
    </section>
  );
}