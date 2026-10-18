import type { ReactNode } from "react";
import { Logo } from "../../components/brand/Logo";
import { Card } from "../../components/ui/Card";

// Estructura de las pantallas de acceso: una tarjeta centrada, sin barra lateral.
export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <main className="flex min-h-full flex-1 items-center justify-center px-4 py-10">
      <div className="flex w-full max-w-md flex-col gap-6">
        <Logo size="lg" className="justify-center" />
        <Card className="p-6 sm:p-8">{children}</Card>
      </div>
    </main>
  );
}