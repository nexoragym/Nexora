import type { Metadata } from "next";
import { Suspense } from "react";
import { PageContainer, PageHeader } from "../../../components/layout/Page";
import { RutinasContent } from "./RutinasContent";

export const metadata: Metadata = { title: "Rutinas" };

// Lo que se ve mientras se carga tu rutina.
function RutinasCargando() {
  return (
    <div aria-busy="true" className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3">
      <span className="sr-only">Cargando tus rutinas…</span>
      <div className="h-96 animate-pulse rounded-3xl bg-surface-2" />
    </div>
  );
}

export default function RutinasPage() {
  return (
    <PageContainer>
      <PageHeader title="Rutinas" description="Tus programas de entrenamiento." />
      <Suspense fallback={<RutinasCargando />}>
        <RutinasContent />
      </Suspense>
    </PageContainer>
  );
}