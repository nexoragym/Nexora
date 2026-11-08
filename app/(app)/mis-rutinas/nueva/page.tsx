import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { Suspense } from "react";
import { CustomRoutineEditor } from "../../../../components/routines/CustomRoutineEditor";
import { PageContainer, PageHeader } from "../../../../components/layout/Page";
import { Alert } from "../../../../components/ui/Alert";
import { puedeCrearRutinasPersonalizadas } from "../../../../lib/features";
import {
  DRAFT_PERSONAL_VACIO,
  MAX_RUTINAS_PERSONALES,
} from "../../../../lib/routines/custom";
import { createClient } from "../../../../lib/supabase/server";

export const metadata: Metadata = { title: "Crear una rutina" };

async function Formulario() {
  await connection();
  const supabase = await createClient();

  if (!(await puedeCrearRutinasPersonalizadas(supabase))) {
    return (
      <Alert tone="info" title="Función no disponible">
        Ahora mismo no puedes crear rutinas propias.
      </Alert>
    );
  }

  const { count } = await supabase
    .from("routines")
    .select("id", { count: "exact", head: true })
    .eq("source", "custom");
  if ((count ?? 0) >= MAX_RUTINAS_PERSONALES) {
    return (
      <Alert tone="warning" title="Has llegado al máximo">
        Ya tienes {MAX_RUTINAS_PERSONALES} rutinas propias. Elimina alguna para
        crear otra.
      </Alert>
    );
  }

  const { data: activa } = await supabase
    .from("routines")
    .select("name")
    .eq("is_active", true)
    .maybeSingle();

  return (
    <CustomRoutineEditor
      inicial={DRAFT_PERSONAL_VACIO}
      rutinaActivaNombre={activa?.name ?? null}
    />
  );
}

export default function NuevaRutinaPersonalPage() {
  return (
    <PageContainer>
      <div className="flex flex-col gap-4">
        <Link
          href="/mis-rutinas"
          className="text-sm text-muted transition hover:text-foreground"
        >
          ← Volver a Mis rutinas
        </Link>
        <PageHeader
          title="Crear una rutina"
          description="Elige los ejercicios de cada día y cuántas series y repeticiones quieres."
        />
      </div>
      <Suspense
        fallback={<div className="h-96 animate-pulse rounded-3xl bg-surface-2" />}
      >
        <Formulario />
      </Suspense>
    </PageContainer>
  );
}