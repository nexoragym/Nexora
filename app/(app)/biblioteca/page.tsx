import type { Metadata } from "next";
import { Suspense } from "react";
import { PageContainer, PageHeader } from "../../../components/layout/Page";
import { LibraryContent } from "./LibraryContent";

export const metadata: Metadata = { title: "Biblioteca" };

// Lo que se ve mientras se cargan los ejercicios.
function BibliotecaCargando() {
  return (
    <div
      aria-busy="true"
      className="grid grid-cols-1 gap-3 lg:grid-cols-2 2xl:grid-cols-3"
    >
      <span className="sr-only">Cargando ejercicios…</span>
      {Array.from({ length: 6 }).map((_, indice) => (
        <div
          key={indice}
          className="h-40 animate-pulse rounded-3xl bg-surface-2"
        />
      ))}
    </div>
  );
}

export default function BibliotecaPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  return (
    <PageContainer>
      <PageHeader
        title="Biblioteca"
        description="Busca ejercicios por nombre, músculo, material o nivel."
      />
      <Suspense fallback={<BibliotecaCargando />}>
        <LibraryContent searchParams={searchParams} />
      </Suspense>
    </PageContainer>
  );
}