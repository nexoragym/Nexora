import type { Metadata } from "next";
import { Suspense } from "react";
import { PageContainer, PageHeader } from "../../../components/layout/Page";
import { TrainContent } from "./TrainContent";

export const metadata: Metadata = { title: "Entrenar" };

// Lo que se ve mientras se carga tu rutina.
function EntrenarCargando() {
  return (
    <div aria-busy="true" className="flex flex-col gap-6">
      <span className="sr-only">Cargando tu rutina…</span>
      <div className="h-40 animate-pulse rounded-3xl bg-surface-2" />
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 3 }).map((_, indice) => (
          <div
            key={indice}
            className="h-64 animate-pulse rounded-3xl bg-surface-2"
          />
        ))}
      </div>
    </div>
  );
}

export default function EntrenarPage() {
  return (
    <PageContainer>
      <PageHeader title="Entrenar" description="Tu rutina y tus sesiones." />
      <Suspense fallback={<EntrenarCargando />}>
        <TrainContent />
      </Suspense>
    </PageContainer>
  );
}