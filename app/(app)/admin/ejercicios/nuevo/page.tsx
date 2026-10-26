import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { Suspense } from "react";
import { ExerciseForm } from "../../../../../components/admin/ExerciseForm";
import { PageContainer, PageHeader } from "../../../../../components/layout/Page";
import { exigirSuperadmin } from "../../../../../lib/admin/guard";

export const metadata: Metadata = { title: "Nuevo ejercicio · Admin" };

async function FormularioNuevo() {
  await connection();
  await exigirSuperadmin();
  return <ExerciseForm modo="crear" />;
}

export default function NuevoEjercicioPage() {
  return (
    <PageContainer>
      <div className="flex flex-col gap-4">
        <Link
          href="/admin/ejercicios"
          className="text-sm text-muted transition hover:text-foreground"
        >
          ← Volver a Ejercicios
        </Link>
        <PageHeader
          title="Nuevo ejercicio"
          description="Rellena los datos. Después podrás editarlo cuando quieras."
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