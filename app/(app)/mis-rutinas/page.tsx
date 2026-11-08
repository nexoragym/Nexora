import type { Metadata } from "next";
import { Suspense } from "react";
import { PageContainer, PageHeader } from "../../../components/layout/Page";
import { MisRutinasContent } from "./MisRutinasContent";

export const metadata: Metadata = { title: "Mis rutinas" };

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default function MisRutinasPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  return (
    <PageContainer>
      <PageHeader
        title="Mis rutinas"
        description="Las rutinas que has creado tú. Elige cualquier ejercicio de la biblioteca."
      />
      <Suspense
        fallback={<div className="h-64 animate-pulse rounded-3xl bg-surface-2" />}
      >
        <MisRutinasContent searchParams={searchParams} />
      </Suspense>
    </PageContainer>
  );
}