import { siteConfig } from "../lib/site";

const colores = [
  { nombre: "Fondo", clase: "bg-background" },
  { nombre: "Superficie", clase: "bg-surface" },
  { nombre: "Superficie 2", clase: "bg-surface-2" },
  { nombre: "Acento", clase: "bg-accent" },
  { nombre: "Éxito", clase: "bg-success" },
  { nombre: "Aviso", clase: "bg-warning" },
  { nombre: "Error", clase: "bg-danger" },
];

export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-10 px-6 py-16">
      <header className="flex flex-col gap-3">
        <p className="text-sm font-medium uppercase tracking-widest text-muted">
          Sistema visual · Entrega 1
        </p>
        <h1 className="text-4xl font-semibold tracking-tight">
          {siteConfig.name}
        </h1>
        <p className="max-w-xl text-lg leading-8 text-muted">
          Plataforma de entrenamiento, planificación y seguimiento del
          progreso. Esta página es provisional: sirve para comprobar la
          paleta de colores.
        </p>
      </header>

      <section aria-labelledby="paleta">
        <h2 id="paleta" className="text-xl font-semibold">
          Paleta de colores
        </h2>
        <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {colores.map((color) => (
            <li
              key={color.nombre}
              className="rounded-xl border border-border bg-surface p-3"
            >
              <div
                className={`h-12 rounded-lg border border-border ${color.clase}`}
              />
              <p className="mt-2 text-sm text-muted">{color.nombre}</p>
            </li>
          ))}
        </ul>
      </section>

      <section
        aria-labelledby="texto"
        className="rounded-xl border border-border bg-surface p-5"
      >
        <h2 id="texto" className="text-xl font-semibold">
          Jerarquía de texto
        </h2>
        <p className="mt-2 text-foreground">
          Texto principal: títulos y contenido importante.
        </p>
        <p className="mt-1 text-muted">
          Texto secundario: descripciones y datos de apoyo.
        </p>
      </section>
    </main>
  );
}