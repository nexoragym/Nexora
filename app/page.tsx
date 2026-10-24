import type { Metadata } from "next";
import Link from "next/link";
import { Logo } from "../components/brand/Logo";
import { ButtonLink } from "../components/ui/ButtonLink";

export const metadata: Metadata = {
  title: { absolute: "NEXORA · Tu plan de entrenamiento personalizado" },
  description:
    "NEXORA crea tu plan de entrenamiento personalizado según tu objetivo, tu nivel y tu material.",
};

const objetivos = [
  {
    titulo: "Ganar masa muscular",
    texto: "Aumentar el tamaño de tus músculos.",
  },
  {
    titulo: "Definir y perder grasa",
    texto: "Marcar más tu musculatura y reducir grasa.",
  },
  {
    titulo: "Ganar fuerza",
    texto: "Poder levantar cada vez más peso.",
  },
  {
    titulo: "Mejorar mi condición física",
    texto: "Estar en forma y moverte mejor en el día a día.",
  },
];

const pasos = [
  {
    numero: "1",
    titulo: "Elige tu objetivo",
    texto: "Masa muscular, definición, fuerza o condición física.",
  },
  {
    numero: "2",
    titulo: "Recibe tu plan personalizado",
    texto: "Ejercicios, series y descansos pensados para ti.",
  },
  {
    numero: "3",
    titulo: "Entrena",
    texto: "Guarda tu plan con tu cuenta gratuita y síguelo desde Entrenar.",
  },
];

const disponible = [
  "Plan personalizado",
  "Biblioteca de ejercicios con búsqueda y filtros",
  "Adaptado a tu material y a las zonas que quieres cuidar",
];

const proximamente = [
  "Registro de series, kilos y repeticiones",
  "Progreso con gráficas y rachas",
  "Logros y retos",
];

export default function LandingPage() {
  return (
    <div className="relative flex min-h-full flex-1 flex-col overflow-hidden">
      {/* Luces de fondo (decorativas) */}
      <div
        aria-hidden="true"
        className="nx-float pointer-events-none absolute -left-32 top-40 size-96 rounded-full bg-accent/10 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="nx-float pointer-events-none absolute -right-32 top-[48rem] size-96 rounded-full bg-accent/10 blur-3xl"
        style={{ animationDelay: "-4s" }}
      />

      {/* Cabecera */}
      <header className="relative z-10 mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-5 sm:px-8">
        <Logo />
        <nav className="flex items-center gap-2">
          <ButtonLink href="/login" variant="secondary" size="md">
            Iniciar sesión
          </ButtonLink>
        </nav>
      </header>

      <main className="relative z-10 flex flex-1 flex-col">
        {/* Portada */}
        <section className="mx-auto flex w-full max-w-4xl flex-col items-center gap-6 px-4 pb-20 pt-12 text-center sm:px-8 sm:pt-20">
          <span
            className="nx-fade-up rounded-full border border-border bg-surface px-4 py-1.5 text-sm text-muted"
            style={{ animationDelay: "0ms" }}
          >
            Versión beta en desarrollo
          </span>
          <h1
            className="nx-fade-up text-5xl font-bold tracking-tight sm:text-7xl"
            style={{ animationDelay: "100ms" }}
          >
            Tu plan de entrenamiento{" "}
            <span className="bg-linear-to-br from-accent to-orange-500 bg-clip-text text-transparent">
              personalizado
            </span>
          </h1>
          <p
            className="nx-fade-up max-w-2xl text-xl leading-8 text-muted"
            style={{ animationDelay: "200ms" }}
          >
            Hecho para tu objetivo, tu nivel y tu material.
          </p>
          <div
            className="nx-fade-up flex w-full flex-col items-center gap-3 sm:w-auto sm:flex-row"
            style={{ animationDelay: "300ms" }}
          >
            <ButtonLink href="/empezar" size="xl" className="w-full sm:w-auto">
              Crear mi plan gratis
            </ButtonLink>
            <ButtonLink
              href="/login"
              variant="secondary"
              size="xl"
              className="w-full sm:w-auto"
            >
              Ya tengo cuenta
            </ButtonLink>
          </div>
          <p
            className="nx-fade-up text-sm text-muted"
            style={{ animationDelay: "400ms" }}
          >
            Gratis durante la beta.
          </p>
        </section>

        {/* Objetivos */}
        <section
          aria-labelledby="objetivos"
          className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-12 sm:px-8"
        >
          <h2 id="objetivos" className="text-2xl font-semibold sm:text-3xl">
            ¿Qué quieres conseguir?
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {objetivos.map((objetivo) => (
              <Link
                key={objetivo.titulo}
                href="/empezar"
                className="group flex flex-col gap-2 rounded-3xl border border-border bg-surface p-5 transition duration-200 hover:-translate-y-1 hover:border-accent/60 hover:bg-surface-2"
              >
                <span className="text-lg font-semibold">{objetivo.titulo}</span>
                <span className="text-muted">{objetivo.texto}</span>
                <span className="mt-2 text-sm font-semibold text-accent transition group-hover:translate-x-1">
                  Empezar →
                </span>
              </Link>
            ))}
          </div>
        </section>

        {/* Pasos */}
        <section
          aria-labelledby="como-funciona"
          className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-12 sm:px-8"
        >
          <h2 id="como-funciona" className="text-2xl font-semibold sm:text-3xl">
            Así de fácil
          </h2>
          <ol className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {pasos.map((paso) => (
              <li
                key={paso.numero}
                className="flex flex-col gap-3 rounded-3xl border border-border bg-surface p-6"
              >
                <span className="flex size-10 items-center justify-center rounded-full bg-linear-to-br from-accent to-accent-hover text-lg font-bold">
                  {paso.numero}
                </span>
                <h3 className="text-lg font-semibold">{paso.titulo}</h3>
                <p className="text-muted">{paso.texto}</p>
              </li>
            ))}
          </ol>
        </section>

        {/* Qué hay y qué viene */}
        <section
          aria-labelledby="estado"
          className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-12 sm:px-8"
        >
          <h2 id="estado" className="text-2xl font-semibold sm:text-3xl">
            Estado de la beta
          </h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="flex flex-col gap-3 rounded-3xl border border-border bg-surface p-6">
              <h3 className="text-lg font-semibold text-success">
                Ya disponible
              </h3>
              <ul className="flex flex-col gap-2 text-muted">
                {disponible.map((texto) => (
                  <li key={texto}>✓ {texto}</li>
                ))}
              </ul>
            </div>
            <div className="flex flex-col gap-3 rounded-3xl border border-border bg-surface p-6">
              <h3 className="text-lg font-semibold text-warning">
                Próximamente
              </h3>
              <ul className="flex flex-col gap-2 text-muted">
                {proximamente.map((texto) => (
                  <li key={texto}>○ {texto}</li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* Llamada final */}
        <section className="mx-auto flex w-full max-w-4xl flex-col items-center gap-5 px-4 py-20 text-center sm:px-8">
          <h2 className="text-3xl font-bold tracking-tight sm:text-5xl">
            Empieza hoy
          </h2>
          <p className="max-w-xl text-lg text-muted">
            Tu plan personalizado, listo en un momento.
          </p>
          <ButtonLink href="/empezar" size="xl">
            Crear mi plan gratis
          </ButtonLink>
        </section>
      </main>

      <footer className="relative z-10 border-t border-border px-4 py-6 text-center text-sm text-muted sm:px-8">
        <p>
          NEXORA no da consejo médico: si tienes una lesión o dolor, consulta
          con un profesional sanitario antes de entrenar.
        </p>
      </footer>
    </div>
  );
}