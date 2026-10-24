import type { Metadata } from "next";
import { Suspense } from "react";
import { SessionBanner } from "../../../components/auth/SessionBanner";
import { PageContainer, PageHeader } from "../../../components/layout/Page";
import { DashboardContent } from "./DashboardContent";

export const metadata: Metadata = { title: "Inicio" };

// Lo que se ve mientras se cargan tus datos.
function InicioCargando() {
  return (
    <div aria-busy="true" className="flex flex-col gap-6">
      <span className="sr-only">Cargando tu inicio…</span>
      <div className="h-8 w-56 animate-pulse rounded-xl bg-surface-2" />
      <div className="h-48 animate-pulse rounded-3xl bg-surface-2" />
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, indice) => (
          <div
            key={indice}
            className="h-28 animate-pulse rounded-3xl bg-surface-2"
          />
        ))}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <PageContainer>
      <PageHeader title="Inicio" description="Tu resumen de hoy." />
      <Suspense fallback={null}>
        <SessionBanner />
      </Suspense>
      <Suspense fallback={<InicioCargando />}>
        <DashboardContent />
      </Suspense>
    </PageContainer>
  );
}