import { siteConfig } from "../lib/site";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { ProgressBar } from "../components/ui/ProgressBar";
import { StatCard } from "../components/ui/StatCard";

export default function Home() {
  return (
    <main className="flex w-full flex-1 flex-col gap-10 px-6 py-12 sm:px-10 lg:px-16">
      <header className="flex flex-col gap-3">
        <p className="text-sm font-medium uppercase tracking-widest text-muted">
          Sistema visual · Entrega 2
        </p>
        <h1 className="text-4xl font-semibold tracking-tight">
          {siteConfig.name}
        </h1>
        <p className="max-w-xl text-lg leading-8 text-muted">
          Página provisional de pruebas. Todos los valores que aparecen aquí
          son datos de demostración.
        </p>
      </header>

      <section aria-labelledby="botones" className="flex flex-col gap-4">
        <h2 id="botones" className="text-xl font-semibold">
          Botones
        </h2>
        <div className="flex flex-wrap items-center gap-3">
          <Button>Principal</Button>
          <Button variant="secondary">Secundario</Button>
          <Button variant="ghost">Discreto</Button>
          <Button disabled>Desactivado</Button>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button size="sm">Pequeño</Button>
          <Button size="md">Mediano</Button>
          <Button size="lg">Grande</Button>
        </div>
      </section>

      <section aria-labelledby="estadisticas" className="flex flex-col gap-4">
        <h2 id="estadisticas" className="text-xl font-semibold">
          Tarjetas de estadísticas
        </h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
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

      <section aria-labelledby="progreso" className="flex flex-col gap-4">
        <h2 id="progreso" className="text-xl font-semibold">
          Barras de progreso
        </h2>
        <Card className="flex flex-col gap-5">
          <ProgressBar label="Objetivo semanal (demostración)" value={3} max={4} />
          <ProgressBar label="Rutina completada (demostración)" value={40} />
        </Card>
      </section>

      <section aria-labelledby="etiquetas" className="flex flex-col gap-4">
        <h2 id="etiquetas" className="text-xl font-semibold">
          Etiquetas
        </h2>
        <div className="flex flex-wrap gap-2">
          <Badge>Neutral</Badge>
          <Badge tone="accent">Acento</Badge>
          <Badge tone="success">Completada</Badge>
          <Badge tone="warning">Pendiente</Badge>
          <Badge tone="danger">Error</Badge>
        </div>
      </section>
    </main>
  );
}