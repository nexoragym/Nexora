"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Alert } from "../../../../components/ui/Alert";
import { Button } from "../../../../components/ui/Button";
import { usarRutinaCatalogo } from "./actions";

type Modo = "empezar" | "usar";

type UseRoutineButtonProps = {
  slug: string;
  activeRoutineName: string | null;
};

export function UseRoutineButton({
  slug,
  activeRoutineName,
}: UseRoutineButtonProps) {
  const router = useRouter();
  const [pendiente, setPendiente] = useState<Modo | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function ejecutar(modo: Modo) {
    setEnviando(true);
    setError(null);
    try {
      const resultado = await usarRutinaCatalogo(slug);
      if (!resultado.ok) {
        setError(resultado.error ?? "No se pudo guardar la rutina.");
        setEnviando(false);
        return;
      }
      if (modo === "empezar" && resultado.firstDayId) {
        router.push(`/sesion/${resultado.firstDayId}/1`);
      } else {
        router.push("/entrenar");
      }
      router.refresh();
    } catch {
      setError(
        "No se pudo guardar la rutina. Comprueba tu conexión e inténtalo de nuevo.",
      );
      setEnviando(false);
    }
  }

  function pulsar(modo: Modo) {
    if (activeRoutineName && pendiente !== modo) {
      setPendiente(modo);
      return;
    }
    void ejecutar(modo);
  }

  return (
    <div className="flex flex-col gap-4">
      {error ? (
        <Alert tone="danger" title="No se pudo guardar">
          {error}
        </Alert>
      ) : null}

      {pendiente ? (
        <Alert tone="warning" title="Ya tienes una rutina activa">
          <div className="flex flex-col gap-3">
            <p>
              Tu rutina actual es «{activeRoutineName}». Si continúas, esta la
              sustituye. Tu historial de entrenamientos se conserva.
            </p>
            <div className="flex flex-wrap gap-2">
              <Button onClick={() => void ejecutar(pendiente)} disabled={enviando}>
                {enviando ? "Guardando…" : "Sí, continuar"}
              </Button>
              <Button
                variant="secondary"
                onClick={() => setPendiente(null)}
                disabled={enviando}
              >
                Cancelar
              </Button>
            </div>
          </div>
        </Alert>
      ) : (
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button
            size="xl"
            onClick={() => pulsar("empezar")}
            disabled={enviando}
          >
            {enviando ? "Guardando…" : "Usar y empezar el Día 1"}
          </Button>
          <Button
            size="xl"
            variant="secondary"
            onClick={() => pulsar("usar")}
            disabled={enviando}
          >
            Solo usar esta rutina
          </Button>
        </div>
      )}
    </div>
  );
}