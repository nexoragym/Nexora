"use client";

import { useEffect, useState, type ReactNode } from "react";
import { cn } from "../../lib/cn";

type Fase = "oculto" | "visible" | "plegando";

const TIEMPO_VISIBLE = 6000; // ms que se ve el banner
const TIEMPO_PLEGADO = 600; // ms que dura la animación de plegado

type BannerPlegableProps = {
  clave: string;
  children: ReactNode;
};

// Muestra su contenido al entrar, y lo pliega solo pasados unos segundos.
// Una vez visto, no vuelve a salir mientras no cierres la pestaña.
export function BannerPlegable({ clave, children }: BannerPlegableProps) {
  const [fase, setFase] = useState<Fase>("oculto");

  useEffect(() => {
    const almacen = `nexora-banner:${clave}`;
    let yaVisto = false;
    try {
      yaVisto = window.sessionStorage.getItem(almacen) === "1";
    } catch {
      yaVisto = false;
    }
    if (yaVisto) return;

    const t1 = window.setTimeout(() => setFase("visible"), 50);
    const t2 = window.setTimeout(() => {
      setFase("plegando");
      try {
        window.sessionStorage.setItem(almacen, "1");
      } catch {
        // Sin almacenamiento disponible: no pasa nada.
      }
    }, TIEMPO_VISIBLE);
    const t3 = window.setTimeout(
      () => setFase("oculto"),
      TIEMPO_VISIBLE + TIEMPO_PLEGADO,
    );

    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      window.clearTimeout(t3);
    };
  }, [clave]);

  if (fase === "oculto") return null;

  return (
    <div
      className={cn(
        "nx-fade-up grid transition-[grid-template-rows,opacity] duration-500 ease-out",
        fase === "visible"
          ? "grid-rows-[1fr] opacity-100"
          : "grid-rows-[0fr] opacity-0",
      )}
    >
      <div className="min-h-0 overflow-hidden">{children}</div>
    </div>
  );
}