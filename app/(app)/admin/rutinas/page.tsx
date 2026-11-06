import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { Suspense } from "react";
import { PageContainer, PageHeader } from "../../../../components/layout/Page";
import { Alert } from "../../../../components/ui/Alert";
import { Badge } from "../../../../components/ui/Badge";
import { Button } from "../../../../components/ui/Button";
import { exigirSuperadmin } from "../../../../lib/admin/guard";
import { DIFFICULTY_LABELS } from "../../../../lib/exercises";
import { GOAL_LABELS } from "../../../../lib/questionnaire";
import { listarRutinasCatalogo } from "../../../../lib/routines/catalog";
import { cambiarPublicacion, duplicarRutina } from "./actions";

export const metadata: Metadata = { title: "Rutinas · Admin" };

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function primero(valor: string | string[] | undefined): string {
  return Array.isArray(valor) ? (valor[0] ?? "") : (valor ?? "");
}

async function ListaRutinas({ searchParams }: { searchParams: SearchParams }) {
  await connection();
  const supabase = await exigirSuperadmin();

  const aviso = primero((await searchParams).aviso);
  const { rutinas, error } = await listarRutinasCatalogo(supabase, {
    soloPublicadas: false,
  });

  if (error) {
    return (
      <Alert tone="danger" title="No se pudo cargar la lista">
        Si acabas de actualizar la aplicación, comprueba que has ejecutado la
        migración 0016 en Supabase.
      </Alert>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {aviso === "vacia" ? (
        <Alert tone="warning" title="No se puede publicar">
          Algún día de la rutina no tiene ejercicios.
        </Alert>
      ) : null}
      {aviso === "inactivos" ? (
        <Alert tone="warning" title="No se puede publicar">
          La rutina usa ejercicios desactivados o que ya no existen. Actívalos
          o cámbialos y vuelve a intentarlo.
        </Alert>
      ) : null}
      {aviso === "duplicada" ? (
        <Alert tone="success" title="Copia creada">
          La copia está oculta y se llama «(copia)». Búscala en la lista.
        </Alert>
      ) : null}

      {rutinas.length === 0 ? (
        <Alert tone="info" title="Todavía no hay rutinas">
          Ejecuta la migración 0016 para cargar las 6 rutinas estándar.
        </Alert>
      ) : (
        <section aria-label="Rutinas" className="flex flex-col gap-3">
          <p className="text-sm text-muted">
            {rutinas.length} {rutinas.length === 1 ? "rutina" : "rutinas"}
          </p>
          <div className="overflow-x-auto rounded-3xl border border-border bg-surface">
            <table className="w-full min-w-[56rem] text-left text-sm">
              <thead className="border-b border-border text-muted">
                <tr>
                  <th className="px-4 py-3 font-medium">Rutina</th>
                  <th className="px-4 py-3 font-medium">Objetivo</th>
                  <th className="px-4 py-3 font-medium">Nivel</th>
                  <th className="px-4 py-3 font-medium">Semanas</th>
                  <th className="px-4 py-3 font-medium">Días</th>
                  <th className="px-4 py-3 font-medium">Estado</th>
                  <th className="px-4 py-3 font-medium">
                    <span className="sr-only">Acciones</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {rutinas.map((rutina) => (
                  <tr
                    key={rutina.id}
                    className="border-b border-border align-top last:border-0 hover:bg-surface-2/50"
                  >
                    <td className="px-4 py-3">
                      <div className="font-medium">{rutina.name}</div>
                      <div className="text-xs text-muted">{rutina.slug}</div>
                    </td>
                    <td className="px-4 py-3 text-muted">
                      {GOAL_LABELS[rutina.goal]}
                    </td>
                    <td className="px-4 py-3 text-muted">
                      {DIFFICULTY_LABELS[rutina.level]}
                    </td>
                    <td className="px-4 py-3 text-muted">{rutina.weeks}</td>
                    <td className="px-4 py-3 text-muted">{rutina.daysCount}</td>
                    <td className="px-4 py-3">
                      {rutina.published ? (
                        <Badge tone="success">Publicada</Badge>
                      ) : (
                        <Badge>Oculta</Badge>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap items-center justify-end gap-2">
                        <Link
                          href={`/rutinas/${rutina.slug}`}
                          className="font-semibold text-accent hover:underline"
                        >
                          Ver
                        </Link>
                        <form action={cambiarPublicacion}>
                          <input type="hidden" name="id" value={rutina.id} />
                          <input
                            type="hidden"
                            name="publicar"
                            value={rutina.published ? "false" : "true"}
                          />
                          <Button type="submit" size="sm" variant="secondary">
                            {rutina.published ? "Ocultar" : "Publicar"}
                          </Button>
                        </form>
                        <form action={duplicarRutina}>
                          <input type="hidden" name="id" value={rutina.id} />
                          <Button type="submit" size="sm" variant="secondary">
                            Duplicar
                          </Button>
                        </form>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}

export default function AdminRutinasPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  return (
    <PageContainer>
      <PageHeader
        title="Rutinas"
        description="Las rutinas estándar que ven los usuarios en Rutinas."
      />
      <Suspense
        fallback={<div className="h-96 animate-pulse rounded-3xl bg-surface-2" />}
      >
        <ListaRutinas searchParams={searchParams} />
      </Suspense>
    </PageContainer>
  );
}