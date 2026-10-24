"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { PlanLoading } from "../../components/onboarding/PlanLoading";
import { Alert } from "../../components/ui/Alert";
import { Button } from "../../components/ui/Button";
import { ButtonLink } from "../../components/ui/ButtonLink";
import { ONBOARDING_STORAGE_KEY } from "../../lib/questionnaire";
import { crearPlanInicial } from "./actions";

const TIEMPO_MAXIMO_MS = 40000;

// Tras iniciar sesión o registrarse: si hay respuestas guardadas en el navegador,
// se crea el plan; si no, se va directo al Inicio.
export function BienvenidaClient() {
  const lanzado = useRef(false);
  const [terminado, setTerminado] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (lanzado.current) return;
    lanzado.current = true;

    let crudo: string | null = null;
    try {
      crudo = localStorage.getItem(ONBOARDING_STORAGE_KEY);
    } catch {
      crudo = null;
    }

    let respuestas: unknown = null;
    if (crudo) {
      try {
        respuestas = JSON.parse(crudo);
      } catch {
        respuestas = null;
      }
    }

    // Sin respuestas guardadas no hay nada que crear: se va al Inicio.
    if (!respuestas) {
      window.location.replace("/dashboard");
      return;
    }

    const limite = setTimeout(() => {
      setError(
        "Está tardando más de lo normal. Puedes reintentarlo o ir al inicio.",
      );
    }, TIEMPO_MAXIMO_MS);

    crearPlanInicial(respuestas)
      .then((resultado) => {
        if (resultado.ok) {
          try {
            localStorage.removeItem(ONBOARDING_STORAGE_KEY);
          } catch {
            // Sin almacenamiento disponible.
          }
          setError(null);
          setTerminado(true);
        } else {
          setError(resultado.error ?? "No se pudo crear tu plan.");
        }
      })
      .catch(() => setError("No se pudo crear tu plan. Inténtalo de nuevo."))
      .finally(() => clearTimeout(limite));
  }, []);

  if (error) {
    return (
      <div className="mx-auto flex w-full max-w-lg flex-col gap-4">
        <Alert tone="danger" title="No se pudo crear tu plan">
          {error}
        </Alert>
        <div className="flex flex-wrap gap-3">
          <Button type="button" onClick={() => window.location.reload()}>
            Reintentar
          </Button>
          <ButtonLink href="/dashboard" variant="secondary" size="md">
            Ir al inicio
          </ButtonLink>
        </div>
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col gap-6">
      <PlanLoading
        listo={terminado}
        onDone={() => window.location.replace("/dashboard")}
      />
      <p className="text-center text-sm text-muted">
        ¿Tarda demasiado?{" "}
        <Link href="/dashboard" className="underline underline-offset-4">
          Ir al inicio
        </Link>
      </p>
    </div>
  );
}