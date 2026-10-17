import type { Metadata } from "next";
import { PageContainer, PageHeader } from "../../../components/layout/Page";
import { Button } from "../../../components/ui/Button";
import { Card } from "../../../components/ui/Card";
import { DayTile } from "../../../components/ui/DayTile";
import { ProgressRing } from "../../../components/ui/ProgressRing";
import { StatCard } from "../../../components/ui/StatCard";

export const metadata: Metadata = { title: "Inicio" };

export default function DashboardPage() {
  return (
    <PageContainer>
      <PageHeader
        title="Inicio"
        description="Pantalla de demostración: todos los valores son de prueba."
      />

      <Card className="flex flex-col gap-6 sm:flex-row sm:items-center">
        <ProgressRing
          value={3}
          max={4}
          size={128}
          label="Entrenamientos de la semana (demostración)"
          className="self-center"
        >
          <span className="text-3xl font-semibold tabular-nums">3/4</span>
          <span className="text-xs text-muted">esta semana</span>
        </ProgressRing>
        <div className="flex flex-1 flex-col gap-4">
          <div>
            <p className="text-sm text-muted">
              Próximo entrenamiento · demostración
            </p>
            <p className="text-2xl font-semibold tracking-tight">
              Pecho y tríceps
            </p>
          </div>
          <Button size="xl" fullWidth>
            Comenzar
          </Button>
        </div>
      </Card>

      <section aria-labelledby="semana" className="flex flex-col gap-4">
        <h2 id="semana" className="text-xl font-semibold">
          Tu semana (demostración)
        </h2>
        <div className="grid max-w-3xl grid-cols-4 gap-2 sm:grid-cols-7">
          <DayTile day={1} status="done" label="Pecho" />
          <DayTile day={2} status="done" label="Abdomen" />
          <DayTile day={3} status="done" label="Brazo" />
          <DayTile day={4} status="today" label="Pecho" />
          <DayTile day={5} status="pending" label="Abdomen" />
          <DayTile day={6} status="pending" label="Brazo" />
          <DayTile day={7} status="locked" />
        </div>
      </section>

      <section aria-labelledby="resumen" className="flex flex-col gap-4">
        <h2 id="resumen" className="text-xl font-semibold">
          Resumen (demostración)
        </h2>
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
      </section>
    </PageContainer>
  );
}