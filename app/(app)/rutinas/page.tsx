import type { Metadata } from "next";
import { PageContainer, PageHeader } from "../../../components/layout/Page";
import { RoutineCard } from "../../../components/ui/RoutineCard";

export const metadata: Metadata = { title: "Rutinas" };

export default function RutinasPage() {
  return (
    <PageContainer>
      <PageHeader
        title="Rutinas"
        description="Pantalla de demostración: estas rutinas son de prueba y el botón Iniciar aún no lleva a ninguna pantalla."
      />
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2 xl:grid-cols-3">
        <RoutineCard
          title="Pecho"
          level="Principiante"
          exercises={3}
          sets={10}
          duration="45 min"
        />
        <RoutineCard
          title="Espalda"
          level="Intermedio"
          exercises={3}
          sets={8}
          duration="40 min"
        />
        <RoutineCard
          title="Pierna"
          level="Avanzado"
          exercises={3}
          sets={6}
          duration="35 min"
        />
      </div>
    </PageContainer>
  );
}