import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { Suspense } from "react";
import { DraftGenerator } from "../../../../../components/admin/DraftGenerator";
import { PageContainer, PageHeader } from "../../../../../components/layout/Page";
import { Card } from "../../../../../components/ui/Card";
import { exigirSuperadmin } from "../../../../../lib/admin/guard";

export const metadata: Metadata = { title: "Generar borradores · Admin" };

async function Contenido() {
  await connection();
  await exigirSuperadmin();
  return <DraftGenerator />;
}

export default function GenerarBorradoresPage() {
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
          title="Generar borradores"
          description="Crea muchas rutinas de una vez con tu biblioteca de ejercicios."
        />
      </div>

      <Card className="flex flex-col gap-2">
        <h2 className="text-lg font-semibold">Cómo funciona</h2>
        <ol className="flex list-decimal flex-col gap-1 pl-5 text-sm text-muted">
          <li>Marca qué tipos de rutina quieres y pulsa «Revisar».</li>
          <li>Se crean ocultas. Puedes abrir cualquiera desde la lista y editarla.</li>
          <li>Cuando las hayas mirado, las publicas todas de una vez.</li>
        </ol>
        <p className="text-sm text-muted">
          Las rutinas son orientativas y generales: debe revisarlas un profesional
          antes de abrir la aplicación al público.
        </p>
      </Card>

      <Suspense
        fallback={<div className="h-96 animate-pulse rounded-3xl bg-surface-2" />}
      >
        <Contenido />
      </Suspense>
    </PageContainer>
  );
}