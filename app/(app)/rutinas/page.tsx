import type { Metadata } from "next";
import { Suspense } from "react";
import { PageContainer, PageHeader } from "../../../components/layout/Page";
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
      <PageHeader
        title="Rutinas"
        description="Rutinas listas para usar. Busca la tuya, elige una y empieza."
      />
      <Suspense fallback={<RutinasCargando />}>
        <RutinasContent searchParams={searchParams} />
      </Suspense>
    </PageContainer>
  );
}