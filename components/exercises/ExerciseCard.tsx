import {
  DIFFICULTY_LABELS,
  EQUIPMENT_LABELS,
  MOVEMENT_LABELS,
  MUSCLE_LABELS,
  type Difficulty,
  type Exercise,
} from "../../lib/exercises";
import { Badge, type BadgeTone } from "../ui/Badge";
import { Card } from "../ui/Card";

const tonoNivel: Record<Difficulty, BadgeTone> = {
  beginner: "success",
  intermediate: "warning",
  advanced: "danger",
};

export function ExerciseCard({ exercise }: { exercise: Exercise }) {
  const principales = exercise.primary_muscles
    .map((musculo) => MUSCLE_LABELS[musculo])
    .join(", ");
  const secundarios = exercise.secondary_muscles
    .map((musculo) => MUSCLE_LABELS[musculo])
    .join(", ");

  return (
    <Card className="flex flex-col gap-4">
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-lg font-semibold tracking-tight">
          {exercise.name}
        </h3>
        <Badge tone={tonoNivel[exercise.difficulty]}>
          {DIFFICULTY_LABELS[exercise.difficulty]}
        </Badge>
      </div>

      <div className="flex flex-wrap gap-2">
        <Badge>{EQUIPMENT_LABELS[exercise.equipment]}</Badge>
        <Badge>{MOVEMENT_LABELS[exercise.movement_pattern]}</Badge>
      </div>

      <dl className="flex flex-col gap-1 text-sm">
        <div>
          <dt className="inline text-muted">Músculos principales: </dt>
          <dd className="inline">{principales}</dd>
        </div>
        {secundarios ? (
          <div>
            <dt className="inline text-muted">Secundarios: </dt>
            <dd className="inline">{secundarios}</dd>
          </div>
        ) : null}
      </dl>

      <details className="rounded-2xl bg-surface-2 p-4">
        <summary className="cursor-pointer py-1 font-medium">
          Ver instrucciones
        </summary>
        <div className="mt-3 flex flex-col gap-4 text-sm">
          <div>
            <h4 className="font-semibold">Cómo se hace</h4>
            <ol className="mt-2 list-decimal space-y-1 pl-5 text-muted">
              {exercise.instructions.map((paso, indice) => (
                <li key={indice}>{paso}</li>
              ))}
            </ol>
          </div>
          {exercise.common_mistakes.length > 0 ? (
            <div>
              <h4 className="font-semibold">Errores habituales</h4>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-muted">
                {exercise.common_mistakes.map((error, indice) => (
                  <li key={indice}>{error}</li>
                ))}
              </ul>
            </div>
          ) : null}
          <p className="text-xs text-muted">
            Orientación general: no sustituye el consejo de un profesional.
          </p>
        </div>
      </details>
    </Card>
  );
}