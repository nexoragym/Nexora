import {
  DIFFICULTY_LABELS,
  EQUIPMENT_LABELS,
  MOVEMENT_LABELS,
  MUSCLE_LABELS,
  type Difficulty,
  type Exercise,
} from "../../lib/exercises";
import { urlPublicaMedia, type ConMedia } from "../../lib/media";
import { Badge, type BadgeTone } from "../ui/Badge";
import { Card } from "../ui/Card";

const tonoNivel: Record<Difficulty, BadgeTone> = {
  beginner: "success",
  intermediate: "warning",
  advanced: "danger",
};

export function ExerciseCard({ exercise }: { exercise: Exercise & ConMedia }) {
  const principales = exercise.primary_muscles
    .map((musculo) => MUSCLE_LABELS[musculo])
    .join(", ");
  const secundarios = exercise.secondary_muscles
    .map((musculo) => MUSCLE_LABELS[musculo])
    .join(", ");
  const otrosNombres = (exercise.aliases ?? []).slice(0, 8).join(", ");
  const imagen = urlPublicaMedia(exercise.image_path);
  const video = urlPublicaMedia(exercise.video_path);

  return (
    <Card className="flex flex-col gap-4">
      {imagen ? (
        <div className="-mx-5 -mt-5 overflow-hidden rounded-t-3xl bg-surface-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imagen}
            alt={`Imagen de ${exercise.name}`}
            loading="lazy"
            className="aspect-[4/3] w-full object-cover"
          />
        </div>
      ) : video ? (
        <div className="-mx-5 -mt-5 overflow-hidden rounded-t-3xl bg-surface-2">
          <video
            src={video}
            controls
            muted
            loop
            playsInline
            preload="metadata"
            aria-label={`Demostración de ${exercise.name}`}
            className="aspect-[4/3] w-full object-cover"
          />
        </div>
      ) : null}

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
          {imagen && video ? (
            <div>
              <h4 className="font-semibold">Demostración</h4>
              <video
                src={video}
                poster={imagen}
                controls
                muted
                loop
                playsInline
                preload="none"
                aria-label={`Demostración de ${exercise.name}`}
                className="mt-2 aspect-[4/3] w-full rounded-2xl bg-surface object-cover"
              />
            </div>
          ) : null}
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
          {otrosNombres ? (
            <div>
              <h4 className="font-semibold">También se conoce como</h4>
              <p className="mt-2 text-muted">{otrosNombres}</p>
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