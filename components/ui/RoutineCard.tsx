import { Badge, type BadgeTone } from "./Badge";
import { Button } from "./Button";
import { Card } from "./Card";

export type RoutineLevel = "Principiante" | "Intermedio" | "Avanzado";

type RoutineCardProps = {
  title: string;
  level: RoutineLevel;
  exercises: number;
  sets: number;
  duration: string;
};

const levelTone: Record<RoutineLevel, BadgeTone> = {
  Principiante: "success",
  Intermedio: "warning",
  Avanzado: "danger",
};

export function RoutineCard({
  title,
  level,
  exercises,
  sets,
  duration,
}: RoutineCardProps) {
  return (
    <Card className="flex flex-col gap-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm text-muted">
            {exercises} ejercicios · {sets} series
          </p>
          <h3 className="mt-1 text-xl font-semibold uppercase tracking-tight">
            {title}
          </h3>
        </div>
        <Badge tone={levelTone[level]}>{level}</Badge>
      </div>
      <div className="flex items-center justify-between gap-3">
        <Button>Iniciar</Button>
        <p className="text-sm tabular-nums text-muted">{duration}</p>
      </div>
    </Card>
  );
}