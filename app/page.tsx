import type { Metadata } from "next";
import { Logo } from "../components/brand/Logo";
import { Badge } from "../components/ui/Badge";
import { ButtonLink } from "../components/ui/ButtonLink";
import { Card } from "../components/ui/Card";
import { DayTile } from "../components/ui/DayTile";
import { ProgressRing } from "../components/ui/ProgressRing";
import { siteConfig } from "../lib/site";

export const metadata: Metadata = {
  title: { absolute: `${siteConfig.name} · Entrenamiento, planificación y progreso` },
};

const pasos = [
  {
    numero: 1,
    titulo: "Responde un cuestionario",
    texto:
      "Cuéntanos tu experiencia, tu objetivo, los días que puedes entrenar y el material que tienes.",
  },
  {
    numero: 2,
    titulo: "Recibe tu rutina",
    texto:
      "Generamos una rutina adaptada a tus respuestas con reglas programadas, sin inteligencia artificial generativa.",
  },
  {
    numero: 3,
    titulo: "Registra y mejora",
    texto:
      "Anota tus series, kilos y repeticiones, y consulta tu historial y tu progreso.",
  },
];

export default function Home() {
  return (
    <div className="flex min-h-full flex-1 flex-col">
      <header className="flex items-center justify-between gap-4 px-4 py-5 sm:px-10 lg:px-16">
        <Logo size="lg" />
        <nav aria-label="Acceso" className="flex items-center gap-2">
          <ButtonLink href="/login" variant="secondary" size="md">
            Iniciar sesión
          </ButtonLink>
          <ButtonLink href="/registro" size="md" className="hidden sm:inline-flex">
            Crear cuenta
          </ButtonLink>
        </nav>
      </header>

      <main className="flex flex-1 flex-col gap-16 px-4 pb-16 pt-8 sm:px-10 lg:px-16">
        <section
          aria-labelledby="titulo-principal"
          className="grid items-center gap-10 lg:grid-cols-2"
        >
          <div className="flex flex-col items-start gap-6">
            <Badge tone="accent">Beta en desarrollo</Badge>
            <h1
              id="titulo-principal"
              className="text-4xl font-semibold leading-tight tracking-tight sm:text-5xl"
            >
              Planifica tus entrenamientos y mide tu progreso
            </h1>
            <p className="max-w-xl text-lg leading-8 text-muted">
              {siteConfig.name} te ayuda a organizar tu rutina, registrar cada
              sesión y ver cómo evolucionas, tanto si empiezas como si ya
              entrenas desde hace tiempo.
            </p>
            <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
              <ButtonLink href="/registro" size="xl">
                Crear cuenta
              </ButtonLink>
              <ButtonLink href="/login" variant="secondary" size="xl">
                Iniciar sesión
              </ButtonLink>
            </div>
          </div>

          <Card className="flex flex-col gap-5">
            <div className="flex items-center justify-between gap-3">
              <p className="text-lg font-semibold">Tu semana</p>
              <Badge>Ejemplo</Badge>
            </div>
            <div className="flex items-center gap-5">
              <ProgressRing
                value={3}
                max={4}
                size={96}
                strokeWidth={8}
                label="Ejemplo: 3 de 4 entrenamientos completados"
              >
                <span className="text-2xl font-semibold tabular-nums">3/4</span>
              </ProgressRing>
              <p className="text-sm text-muted">
                3 de 4 entrenamientos completados esta semana.
              </p>
            </div>
            <div className="grid grid-cols-4 gap-2">
              <DayTile day={1} status="done" label="Pecho" />
              <DayTile day={2} status="done" label="Abdomen" />
              <DayTile day={3} status="done" label="Brazo" />
              <DayTile day={4} status="today" label="Pecho" />
            </div>
            <p className="text-xs text-muted">
              Vista previa de ejemplo con datos ficticios.
            </p>
          </Card>
        </section>

        <section aria-labelledby="como-funciona" className="flex flex-col gap-6">
          <h2 id="como-funciona" className="text-2xl font-semibold tracking-tight">
            Cómo funciona
          </h2>
          <ol className="grid gap-3 md:grid-cols-3">
            {pasos.map((paso) => (
              <li key={paso.numero}>
                <Card className="flex h-full flex-col gap-3">
                  <span
                    aria-hidden="true"
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-accent/15 text-lg font-semibold"
                  >
                    {paso.numero}
                  </span>
                  <h3 className="text-lg font-semibold">{paso.titulo}</h3>
                  <p className="text-muted">{paso.texto}</p>
                </Card>
              </li>
            ))}
          </ol>
        </section>
      </main>

      <footer className="border-t border-border px-4 py-6 text-sm text-muted sm:px-10 lg:px-16">
        <p>
          {siteConfig.name} está en desarrollo. Las recomendaciones de
          entrenamiento son orientativas y no sustituyen el consejo de un
          profesional.
        </p>
      </footer>
    </div>
  );
}