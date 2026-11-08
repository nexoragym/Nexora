import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { Suspense } from "react";
import { CustomRoutineEditor } from "../../../../components/routines/CustomRoutineEditor";
import { PageContainer } from "../../../../components/layout/Page";
import { Alert } from "../../../../components/ui/Alert";
import { Badge } from "../../../../components/ui/Badge";
import { puedeCrearRutinasPersonalizadas } from "../../../../lib/features";
import {
  RUTINA_PERSONAL_SELECT,
  mapearRutinaPersonal,
  type FilaRutinaPersonal,
} from "../../../../lib/routines/custom";
import { createClient } from "../../../../lib/supabase/server";

export const metadata: Metadata = { title: "Editar mi rutina" };

const UUID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

type PageProps = {
  params: Promise<{ id: string }>;
};

async function EditarRutinaPersonal({ params }: PageProps) {
  await connection();

  const { id } = await params;
  if (!UUID.test(id)) notFound();

  const supabase = await createClient();

  // Solo las rutinas propias de esta persona (la base de datos ya filtra por usuario).
  const { data, error } = await supabase
    .from("routines")
    .select(RUTINA_PERSONAL_SELECT)
    .eq("id", id)
    .eq("source", "custom")
    .maybeSingle();

  if (error) {
    console.error("[mis rutinas] error al leer la rutina:", error.code ?? "sin código");
    return (
      <Alert tone="danger" title="No se pudo cargar la rutina">
        Inténtalo de nuevo en unos instantes.
      </Alert>
    );
  }
  if (!data) notFound();

  const fila = data as unknown as FilaRutinaPersonal;
  const { draft, missing } = mapearRutinaPersonal(fila);
  const puede = await puedeCrearRutinasPersonalizadas(supabase);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4">
        <Link
          href="/mis-rutinas"
          className="text-sm text-muted transition hover:text-foreground"
        >
          ← Volver a Mis rutinas
        </Link>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-3xl font-semibold tracking-tight">{fila.name}</h1>
          {fila.is_active ? <Badge tone="accent">Activa</Badge> : null}
        </div>
        {fila.is_active ? (
          <Alert tone="info" title="Es tu rutina activa">
            Los cambios se aplican a los días que te queden. Los días que ya
            hayas hecho se conservan si no cambias su posición.
          </Alert>
        ) : null}
        {missing > 0 ? (
          <Alert tone="warning" title="Falta algún ejercicio">
            Algún ejercicio de esta rutina ya no está disponible. Al guardar se
            quitará de la rutina.
          </Alert>
        ) : null}
        {!puede ? (
          <Alert tone="info" title="Función no disponible">
            Ahora mismo no puedes guardar cambios en tus rutinas.
          </Alert>
        ) : null}
      </div>

      <CustomRoutineEditor inicial={draft} rutinaActivaNombre={null} />
    </div>
  );
}

export default function EditarRutinaPersonalPage({ params }: PageProps) {
  return (
    <PageContainer>
      <Suspense
        fallback={<div className="h-96 animate-pulse rounded-3xl bg-surface-2" />}
      >
        <EditarRutinaPersonal params={params} />
      </Suspense>
    </PageContainer>
  );
}