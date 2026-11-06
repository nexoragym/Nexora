import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { Suspense } from "react";
import { CoverUploader } from "../../../../../components/admin/CoverUploader";
import { RoutineEditor } from "../../../../../components/admin/RoutineEditor";
import { PageContainer } from "../../../../../components/layout/Page";
import { Alert } from "../../../../../components/ui/Alert";
import { Badge } from "../../../../../components/ui/Badge";
import { Button } from "../../../../../components/ui/Button";
import { Card } from "../../../../../components/ui/Card";
import { exigirSuperadmin } from "../../../../../lib/admin/guard";
import { rutinaADraft } from "../../../../../lib/admin/routine-form";
import { leerRutinaCatalogo } from "../../../../../lib/routines/catalog";
import { cambiarPublicacion, duplicarRutina } from "../actions";

export const metadata: Metadata = { title: "Editar rutina · Admin" };

const UUID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

type PageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

async function EditarRutina({ params, searchParams }: PageProps) {
  await connection();
  const supabase = await exigirSuperadmin();

  const { id } = await params;
  if (!UUID.test(id)) notFound();

  const { rutina, error } = await leerRutinaCatalogo(supabase, { id });
  if (error) {
    return (
      <Alert tone="danger" title="No se pudo cargar la rutina">
        Inténtalo de nuevo en unos instantes.
      </Alert>
    );
  }
  if (!rutina) notFound();

  const creada = (await searchParams).creada === "1";
  const conInactivos = rutina.days.some((dia) =>
    dia.exercises.some((e) => !e.active),
  );

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-4">
        <Link
          href="/admin/rutinas"
          className="text-sm text-muted transition hover:text-foreground"
        >
          ← Volver a Rutinas
        </Link>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-3xl font-semibold tracking-tight">{rutina.name}</h1>
          {rutina.published ? (
            <Badge tone="success">Publicada</Badge>
          ) : (
            <Badge>Oculta</Badge>
          )}
        </div>
        <p className="text-sm text-muted">Identificador: {rutina.slug}</p>

        {creada ? (
          <Alert tone="success" title="Rutina creada">
            Está oculta. Cuando la tengas lista, pulsa «Publicar» a la derecha.
          </Alert>
        ) : null}
        {rutina.missing > 0 ? (
          <Alert tone="warning" title="Falta algún ejercicio">
            Algún ejercicio de esta rutina ya no existe. Al guardar se quitará
            de la rutina.
          </Alert>
        ) : null}
        {conInactivos ? (
          <Alert tone="warning" title="Hay ejercicios desactivados">
            Actívalos o quítalos para poder guardar y publicar la rutina.
          </Alert>
        ) : null}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_20rem]">
        <CoverUploader
          routineId={rutina.id}
          slug={rutina.slug}
          rutaInicial={rutina.coverPath}
        />
        <aside className="flex flex-col gap-4">
          <Card className="flex flex-col gap-3">
            <h2 className="text-lg font-semibold">
              {rutina.published ? "Ocultar" : "Publicar"}
            </h2>
            <p className="text-sm text-muted">
              {rutina.published
                ? "Los usuarios dejan de verla en Rutinas. Las copias que ya tienen siguen funcionando."
                : "Los usuarios podrán verla y usarla. Se comprueba que no haya días vacíos ni ejercicios desactivados."}
            </p>
            <form action={cambiarPublicacion}>
              <input type="hidden" name="id" value={rutina.id} />
              <input
                type="hidden"
                name="publicar"
                value={rutina.published ? "false" : "true"}
              />
              <Button type="submit" variant="secondary" fullWidth>
                {rutina.published ? "Ocultar rutina" : "Publicar rutina"}
              </Button>
            </form>
          </Card>
          <Card className="flex flex-col gap-3">
            <h2 className="text-lg font-semibold">Duplicar</h2>
            <p className="text-sm text-muted">
              Crea una copia oculta para hacer una variante sin empezar de cero.
            </p>
            <form action={duplicarRutina}>
              <input type="hidden" name="id" value={rutina.id} />
              <Button type="submit" variant="secondary" fullWidth>
                Duplicar rutina
              </Button>
            </form>
          </Card>
          <Link
            href={`/rutinas/${rutina.slug}`}
            className="text-sm font-semibold text-accent hover:underline"
          >
            Ver como la ven los usuarios →
          </Link>
        </aside>
      </div>

      <RoutineEditor inicial={rutinaADraft(rutina)} />
    </div>
  );
}

export default function EditarRutinaPage({ params, searchParams }: PageProps) {
  return (
    <PageContainer>
      <Suspense
        fallback={<div className="h-96 animate-pulse rounded-3xl bg-surface-2" />}
      >
        <EditarRutina params={params} searchParams={searchParams} />
      </Suspense>
    </PageContainer>
  );
}