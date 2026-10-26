"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "../../lib/cn";

const secciones = [
  { href: "/admin", label: "Inicio", exacto: true },
  { href: "/admin/ejercicios", label: "Ejercicios", exacto: false },
  { href: "/admin/historial", label: "Historial", exacto: false },
];

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Secciones del panel de administración"
      className="flex flex-wrap gap-2"
    >
      {secciones.map((seccion) => {
        const activo = seccion.exacto
          ? pathname === seccion.href
          : pathname === seccion.href || pathname.startsWith(`${seccion.href}/`);
        return (
          <Link
            key={seccion.href}
            href={seccion.href}
            aria-current={activo ? "page" : undefined}
            className={cn(
              "rounded-xl px-4 py-2 text-sm font-medium transition-colors",
              activo
                ? "bg-accent/15 text-foreground"
                : "text-muted hover:bg-surface-2 hover:text-foreground",
            )}
          >
            {seccion.label}
          </Link>
        );
      })}
    </nav>
  );
}