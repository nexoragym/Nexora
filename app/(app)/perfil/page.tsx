import type { Metadata } from "next";
import { Suspense } from "react";
import { PageContainer, PageHeader } from "../../../components/layout/Page";
import { ProfileContent } from "./ProfileContent";

export const metadata: Metadata = { title: "Perfil" };

// Lo que se ve mientras se cargan tus datos.
function PerfilCargando() {
  return (
    <div aria-busy="true" className="flex flex-col gap-6">
      <span className="sr-only">Cargando tu perfil…</span>
      <div className="h-40 animate-pulse rounded-3xl bg-surface-2" />
      <div className="h-64 animate-pulse rounded-3xl bg-surface-2" />
      <div className="h-32 animate-pulse rounded-3xl bg-surface-2" />
    </div>
  );
}

export default function PerfilPage() {
  return (
    <PageContainer>
      <PageHeader
        title="Perfil"
        description="Tu racha, tu progreso y los datos de tu cuenta."
      />
      <Suspense fallback={<PerfilCargando />}>
        <ProfileContent />
      </Suspense>
    </PageContainer>
  );
}