"use client";

import { useState, type ReactNode } from "react";
import { cn } from "../../lib/cn";
import { BottomNav } from "./BottomNav";
import { Sidebar } from "./Sidebar";

// Estructura común de las pantallas de la app: barra lateral + contenido.
export function AppShell({ children }: { children: ReactNode }) {
  const [reducida, setReducida] = useState(false);

  return (
    <div className="flex min-h-full flex-1">
      <Sidebar
        collapsed={reducida}
        onToggle={() => setReducida((valor) => !valor)}
      />
      <div
        className={cn(
          "flex min-w-0 flex-1 flex-col pb-20 transition-[padding] duration-200 md:pb-0",
          reducida ? "md:pl-20" : "md:pl-64",
        )}
      >
        {children}
      </div>
      <BottomNav />
    </div>
  );
}