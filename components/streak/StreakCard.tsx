import { cn } from "../../lib/cn";
import { etapaDeRacha } from "../../lib/streak";
import { Card } from "../ui/Card";
import { StreakFlame } from "./StreakFlame";

type StreakCardProps = {
  racha: number;
  hayDatos: boolean;
  hint: string;
};

// Tarjeta de Racha del Inicio: número, etapa y la llama.
export function StreakCard({ racha, hayDatos, hint }: StreakCardProps) {
  const etapa = etapaDeRacha(hayDatos ? racha : 0);

  return (
    <Card className="flex items-center justify-between gap-3">
      <div className="flex min-w-0 flex-col gap-1">
        <span className="text-sm text-muted">Racha</span>
        <span
          className={cn(
            "text-3xl font-semibold tabular-nums",
            hayDatos && racha >= 3 && "text-success",
          )}
        >
          {hayDatos ? racha : "—"}
        </span>
        {hayDatos ? (
          <span className="text-sm font-medium">{etapa.nombre}</span>
        ) : null}
        <span className="text-sm text-muted">{hint}</span>
      </div>
      <StreakFlame etapa={etapa} size={56} />
    </Card>
  );
}