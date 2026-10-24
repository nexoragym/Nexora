import type { Metadata } from "next";
import { PageContainer, PageHeader } from "../../../components/layout/Page";
import { Badge } from "../../../components/ui/Badge";
import { ButtonLink } from "../../../components/ui/ButtonLink";
import { Card } from "../../../components/ui/Card";

export const metadata: Metadata = { title: "Progreso" };

export default function ProgresoPage() {
  return (
    <PageContainer>
      <PageHeader
        title="Progreso"
        description="Tus gráficas, rachas y fuerza por músculo."
      />
      <Card className="flex flex-col gap-4 p-8">
        <Badge className="self-start">Próximamente</Badge>
        <h2 className="text-2xl font-semibold tracking-tight">
          Aquí verás tu evolución
        </h2>
        <p className="max-w-2xl text-muted">
          Cuando puedas registrar tus entrenamientos (series, kilos y
          repeticiones), esta pantalla mostrará tus datos reales. Hasta
          entonces no enseñamos números de ejemplo.
        </p>
        <div>
          <ButtonLink href="/entrenar" variant="secondary">
            Ir a Entrenar
          </ButtonLink>
        </div>
      </Card>
    </PageContainer>
  );
}