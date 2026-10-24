"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { navItems } from "../../lib/navigation";
import { cn } from "../../lib/cn";
import { Logo } from "../brand/Logo";
import { NavIcon } from "./NavIcon";

type SidebarProps = {
  collapsed: boolean;
  onToggle: () => void;
};

// Barra lateral fija de escritorio y tablet. En móvil se oculta
// y se usa la barra inferior (BottomNav).
export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-30 hidden flex-col border-r border-border bg-surface transition-[width] duration-200 md:flex",
        collapsed ? "w-20" : "w-64",
      )}
    >
      <div className="flex h-16 items-center px-5">
        <Link href="/dashboard" className="nx-logo rounded-xl">
          <Logo showName={!collapsed} />
        </Link>
      </div>

      <nav
        aria-label="Navegación principal"
        className="flex flex-1 flex-col gap-1 px-3 py-2"
      >
        {navItems.map((item) => {
          const activo =
            pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={activo ? "page" : undefined}
              title={collapsed ? item.label : undefined}
              className={cn(
                "flex h-12 items-center gap-3 rounded-xl px-3 font-medium transition-colors",
                collapsed && "justify-center",
                activo
                  ? "bg-accent/15 text-foreground"
                  : "text-muted hover:bg-surface-2 hover:text-foreground",
              )}
            >
              <NavIcon
                name={item.icon}
                className={cn("shrink-0", activo && "text-accent")}
              />
              {collapsed ? (
                <span className="sr-only">{item.label}</span>
              ) : (
                <span>{item.label}</span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-border p-3">
        <button
          type="button"
          onClick={onToggle}
          aria-label={
            collapsed ? "Expandir barra lateral" : "Reducir barra lateral"
          }
          aria-expanded={!collapsed}
          className="flex h-11 w-full items-center justify-center gap-2 rounded-xl text-muted transition-colors hover:bg-surface-2 hover:text-foreground"
        >
          <svg
            viewBox="0 0 24 24"
            width="20"
            height="20"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
            className={cn("transition-transform", collapsed && "rotate-180")}
          >
            <path d="M15 6l-6 6 6 6" />
          </svg>
          {collapsed ? null : <span className="text-sm">Reducir</span>}
        </button>
      </div>
    </aside>
  );
}