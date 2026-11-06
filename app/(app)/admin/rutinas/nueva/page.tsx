import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { Suspense } from "react";
import { RoutineEditor } from "../../../../../components/admin/RoutineEditor";
import { PageContainer, PageHeader } from "../../../../../components/layout/Page";
import { exigirSuperadmin } from "../../../../../lib/admin/guard";
import { DRAFT_VACIO } from "../../../../../lib/admin/routine-form";

export const metadata: Metadata = { title: "Nueva rutina · Admin" };

async function FormularioNuevo() {
  await connection();
  await exigirSuperadmin();
  return <RoutineEditor inicial={DRAFT_VACIO} />;
}

export default function NuevaRutinaPage() {
  return (
    <PageContainer>
      <div className="flex flex-col gap-4">
        <Link
          href="/admin/rutinas"
          className="text-sm text-muted transition hover:text-foreground"
        >
          ← Volver a Rutinas
        </Link>
        <PageHeader
          title="Nueva rutina"
          description="Se crea oculta. Cuando esté lista, la publicas desde su ficha."
        />
      </div>
      <Suspense
        fallback={<div className="h-96 animate-pulse rounded-3xl bg-surface-2" />}
      >
        <FormularioNuevo />
      </Suspense>
    </PageContainer>
  );
}