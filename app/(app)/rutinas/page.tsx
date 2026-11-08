import type { Metadata } from "next";
import { Suspense } from "react";
import { PageContainer, PageHeader } from "../../../components/layout/Page";
import { ButtonLink } from "../../../components/ui/ButtonLink";
import { RutinasContent } from "./RutinasContent";

export const metadata: Metadata = { title: "Rutinas" };

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

// Lo que se ve mientras se carga el catálogo.
function RutinasCargando() {
  return (
    <div
      aria-busy="true"
      className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3"
    >
      <span className="sr-only">Cargando las rutinas…</span>
      {Array.from({ length: 3 }).map((_, indice) => (
        <div
          key={indice}
          className="h-80 animate-pulse rounded-3xl bg-surface-2"
        />
      ))}
    </div>
  );
}

export default function RutinasPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  return (
    <PageContainer>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <PageHeader
          title="Rutinas"
          description="Rutinas listas para usar. Busca la tuya, elige una y empieza."
        />
        <div className="flex flex-wrap gap-3">
          <ButtonLink href="/mis-rutinas" variant="secondary" size="lg">
            Mis rutinas
          </ButtonLink>
          <ButtonLink href="/mis-rutinas/nueva" size="lg">
            Crear mi rutina
          </ButtonLink>
        </div>
      </div>
      <Suspense fallback={<RutinasCargando />}>
        <RutinasContent searchParams={searchParams} />
      </Suspense>
    </PageContainer>
  );
}