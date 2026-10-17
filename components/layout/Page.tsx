import type { ReactNode } from "react";

// Contenedor común de todas las pantallas de la app.
export function PageContainer({ children }: { children: ReactNode }) {
  return (
    <main className="flex w-full flex-1 flex-col gap-8 px-4 py-8 sm:px-8 lg:px-12">
      {children}
    </main>
  );
}

type PageHeaderProps = {
  title: string;
  description?: string;
};

export function PageHeader({ title, description }: PageHeaderProps) {
  return (
    <header className="flex flex-col gap-2">
      <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
      {description ? (
        <p className="max-w-2xl text-lg leading-8 text-muted">{description}</p>
      ) : null}
    </header>
  );
}