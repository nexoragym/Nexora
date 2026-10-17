import type { Metadata } from "next";
import { PageContainer, PageHeader } from "../../../components/layout/Page";
import { Card } from "../../../components/ui/Card";
import { ProgressBar } from "../../../components/ui/ProgressBar";
import { StatCard } from "../../../components/ui/StatCard";

export const metadata: Metadata = { title: "Progreso" };

export default function ProgresoPage() {
  return (
    <PageContainer>
      <PageHeader
        title="Progreso"
        description="Pantalla de demostración: todos los valores son de prueba."
      />
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard label="Entrenamientos" value="12" hint="Demostración" />
        <StatCard
          label="Racha"
          value="4 días"
          hint="Demostración"
          tone="success"
        />
        <StatCard label="Volumen" value="8.450 kg" hint="Demostración" />
      </div>
      <Card className="flex max-w-2xl flex-col gap-5">
        <ProgressBar label="Objetivo semanal (demostración)" value={3} max={4} />
        <ProgressBar label="Rutina completada (demostración)" value={40} />
      </Card>
    </PageContainer>
  );
}