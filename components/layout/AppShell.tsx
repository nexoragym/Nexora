"use client";

import { Suspense, useState, type ReactNode } from "react";
import { cn } from "../../lib/cn";
import { BottomNav } from "./BottomNav";
import { Sidebar } from "./Sidebar";

// Estructura común de las pantallas de la app: barra lateral + contenido.
export function AppShell({ children }: { children: ReactNode }) {
  const [reducida, setReducida] = useState(false);

  return (
    <div className="flex min-h-full flex-1">
      <Suspense
        fallback={
          <aside
            aria-hidden="true"
            className={cn(
              "fixed inset-y-0 left-0 z-30 hidden border-r border-border bg-surface md:block",
              reducida ? "w-20" : "w-64",
            )}
          />
        }
      >
        <Sidebar
          collapsed={reducida}
          onToggle={() => setReducida((valor) => !valor)}
        />
      </Suspense>
      <div
        className={cn(
          "flex min-w-0 flex-1 flex-col pb-20 transition-[padding] duration-200 md:pb-0",
          reducida ? "md:pl-20" : "md:pl-64",
        )}
      >
        {children}
      </div>
      <Suspense
        fallback={
          <div
            aria-hidden="true"
            className="fixed inset-x-0 bottom-0 z-30 h-16 border-t border-border bg-surface md:hidden"
          />
        }
      >
        <BottomNav />
      </Suspense>
    </div>
  );
}