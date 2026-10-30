"use client";

import { useState } from "react";
import { cn } from "../../lib/cn";
import { ETAPAS, type EtapaRacha } from "../../lib/streak";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";
import { StreakEvolution } from "./StreakEvolution";
import { StreakFlame } from "./StreakFlame";

type StreakGalleryProps = {
  racha: number;
};

type Vista = {
  desde: EtapaRacha;
  hasta: EtapaRacha;
  dias: number;
};

function rango(etapa: EtapaRacha): string {
  if (etapa.hasta === null) return `${etapa.desde}+ días`;
  if (etapa.hasta === etapa.desde) {
    return etapa.desde === 1 ? "1 día" : `${etapa.desde} días`;
  }
  return `${etapa.desde}–${etapa.hasta} días`;
}

// Todas las etapas de la racha, con un botón para ver cada animación de evolución.
export function StreakGallery({ racha }: StreakGalleryProps) {
  const [vista, setVista] = useState<Vista | null>(null);
  const actual = [...ETAPAS].reverse().find((etapa) => racha >= etapa.desde);

  return (
    <>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
        {ETAPAS.map((etapa, indice) => {
          const desbloqueada = racha >= etapa.desde;
          const esActual = actual?.id === etapa.id;
          return (
            <Card
              key={etapa.id}
              className={cn(
                "flex flex-col items-center gap-3 p-4 text-center",
                esActual && "border-accent",
              )}
            >
              <StreakFlame etapa={etapa} size={72} />
              <div className="flex flex-col gap-0.5">
                <p className="font-semibold">{etapa.nombre}</p>
                <p className="text-xs text-muted">{rango(etapa)}</p>
              </div>
              {esActual ? (
                <Badge tone="accent">Estás aquí</Badge>
              ) : desbloqueada ? (
                <Badge tone="success">Conseguida</Badge>
              ) : (
                <Badge>Bloqueada</Badge>
              )}
              {indice > 0 ? (
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() =>
                    setVista({
                      desde: ETAPAS[indice - 1],
                      hasta: etapa,
                      dias: etapa.desde,
                    })
                  }
                >
                  Ver evolución
                </Button>
              ) : null}
            </Card>
          );
        })}
      </div>

      {vista ? (
        <StreakEvolution
          key={`${vista.desde.id}-${vista.hasta.id}`}
          desde={vista.desde}
          hasta={vista.hasta}
          dias={vista.dias}
          onClose={() => setVista(null)}
        />
      ) : null}
    </>
  );
}