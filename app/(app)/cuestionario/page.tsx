import type { Metadata } from "next";
import { Suspense } from "react";
import { PageContainer, PageHeader } from "../../../components/layout/Page";
import { QuestionnaireContent } from "./QuestionnaireContent";

export const metadata: Metadata = { title: "Cuestionario" };

// Lo que se ve mientras se carga el cuestionario.
function CuestionarioCargando() {
  return (
    <div aria-busy="true" className="flex max-w-4xl flex-col gap-6">
      <span className="sr-only">Cargando cuestionario…</span>
      <div className="h-32 animate-pulse rounded-3xl bg-surface-2" />
      <div className="h-32 animate-pulse rounded-3xl bg-surface-2" />
      <div className="h-32 animate-pulse rounded-3xl bg-surface-2" />
    </div>
  );
}

export default function CuestionarioPage() {
  return (
    <PageContainer>
      <PageHeader
        title="Tu cuestionario"
        description="Cuéntanos cómo entrenas para preparar tu rutina. Puedes cambiarlo cuando quieras."
      />
      <Suspense fallback={<CuestionarioCargando />}>
        <QuestionnaireContent />
      </Suspense>
    </PageContainer>
  );
}