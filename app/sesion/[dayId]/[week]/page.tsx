import type { Metadata } from "next";
import { Suspense } from "react";
import { SessionLoader } from "./SessionLoader";

export const metadata: Metadata = { title: "Entrenamiento" };

type SesionPageProps = {
  params: Promise<{ dayId: string; week: string }>;
};

export default function SesionPage({ params }: SesionPageProps) {
  return (
    <Suspense
      fallback={
        <div
          aria-busy="true"
          className="flex min-h-dvh items-center justify-center text-muted"
        >
          Preparando tu entrenamiento…
        </div>
      }
    >
      <SessionLoader params={params} />
    </Suspense>
  );
}