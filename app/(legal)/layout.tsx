import Link from "next/link";
import type { ReactNode } from "react";
import { siteConfig } from "../../lib/site";

export default function LegalLayout({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-3xl flex-col gap-8 px-4 py-8">
      <header>
        <Link href="/" className="text-xl font-bold tracking-tight">
          {siteConfig.name}
        </Link>
      </header>
      <main className="flex flex-1 flex-col gap-8">{children}</main>
      <footer className="flex flex-wrap gap-x-6 gap-y-2 border-t border-border pt-6 text-sm text-muted">
        <Link href="/privacidad" className="hover:text-foreground">
          Política de privacidad
        </Link>
        <Link href="/condiciones" className="hover:text-foreground">
          Condiciones de uso
        </Link>
        <Link href="/" className="hover:text-foreground">
          Volver al inicio
        </Link>
      </footer>
    </div>
  );
}