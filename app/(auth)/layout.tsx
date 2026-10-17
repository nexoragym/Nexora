import type { ReactNode } from "react";
import { Card } from "../../components/ui/Card";
import { siteConfig } from "../../lib/site";

// Estructura de las pantallas de acceso: una tarjeta centrada, sin barra lateral.
export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <main className="flex min-h-full flex-1 items-center justify-center px-4 py-10">
      <div className="flex w-full max-w-md flex-col gap-6">
        <div className="flex items-center justify-center gap-3">
          <span
            aria-hidden="true"
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-linear-to-br from-accent to-accent-hover text-lg font-bold text-accent-foreground"
          >
            N
          </span>
          <span className="text-2xl font-semibold tracking-wide">
            {siteConfig.name}
          </span>
        </div>
        <Card className="p-6 sm:p-8">{children}</Card>
      </div>
    </main>
  );
}