import type { Metadata } from "next";
import { Suspense } from "react";
import { PageContainer } from "../../../../components/layout/Page";
import { RoutineDetail } from "./RoutineDetail";

export const metadata: Metadata = { title: "Rutina" };

type RutinaPageProps = {
  params: Promise<{ slug: string }>;
};

export default function RutinaPage({ params }: RutinaPageProps) {
  return (
    <PageContainer>
      <Suspense
        fallback={
          <div
            aria-busy="true"
            className="h-96 animate-pulse rounded-3xl bg-surface-2"
          />
        }
      >
        <RoutineDetail params={params} />
      </Suspense>
    </PageContainer>
  );
}