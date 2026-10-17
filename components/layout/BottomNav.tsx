"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { navItems } from "../../lib/navigation";
import { cn } from "../../lib/cn";
import { NavIcon } from "./NavIcon";

// Barra inferior para móvil: cómoda de usar con el pulgar.
export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Navegación principal"
      className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-surface/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden"
    >
      <ul className="flex">
        {navItems.map((item) => {
          const activo =
            pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <li key={item.href} className="flex-1">
              <Link
                href={item.href}
                aria-current={activo ? "page" : undefined}
                className={cn(
                  "flex h-16 flex-col items-center justify-center gap-1 text-[11px] font-medium transition-colors",
                  activo ? "text-foreground" : "text-muted hover:text-foreground",
                )}
              >
                <NavIcon
                  name={item.icon}
                  className={activo ? "text-accent" : undefined}
                />
                <span>{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}