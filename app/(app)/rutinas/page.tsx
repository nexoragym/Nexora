import type { Metadata } from "next";
import { Suspense } from "react";
import { PageContainer, PageHeader } from "../../../components/layout/Page";
import { RutinasContent } from "./RutinasContent";

export const metadata: Metadata = { title: "Rutinas" };

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

export default function RutinasPage() {
  return (
    <PageContainer>
      <PageHeader
        title="Rutinas"
        description="Rutinas listas para usar. Elige una, cámbiale algún ejercicio si quieres y empieza."
      />
      <Suspense fallback={<RutinasCargando />}>
        <RutinasContent />
      </Suspense>
    </PageContainer>
  );
}