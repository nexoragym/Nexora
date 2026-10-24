import type { Metadata } from "next";
import { Suspense } from "react";
import { PageContainer, PageHeader } from "../../../components/layout/Page";
import { ProgressContent } from "./ProgressContent";

export const metadata: Metadata = { title: "Progreso" };

// Lo que se ve mientras se cargan tus datos.
function ProgresoCargando() {
  return (
    <div aria-busy="true" className="flex flex-col gap-6">
      <span className="sr-only">Cargando tu progreso…</span>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, indice) => (
          <div
            key={indice}
            className="h-28 animate-pulse rounded-3xl bg-surface-2"
          />
        ))}
      </div>
      <div className="h-72 animate-pulse rounded-3xl bg-surface-2" />
      <div className="h-72 animate-pulse rounded-3xl bg-surface-2" />
    </div>
  );
}

export default function ProgresoPage() {
  return (
    <PageContainer>
      <PageHeader
        title="Progreso"
        description="Tu evolución con datos reales de tus entrenamientos."
      />
      <Suspense fallback={<ProgresoCargando />}>
        <ProgressContent />
      </Suspense>
    </PageContainer>
  );
}