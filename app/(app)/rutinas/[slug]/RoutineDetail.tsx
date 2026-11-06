import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { Alert } from "../../../../components/ui/Alert";
import { Badge } from "../../../../components/ui/Badge";
import { Card } from "../../../../components/ui/Card";
import {
  DIFFICULTY_LABELS,
  EQUIPMENT_LABELS,
} from "../../../../lib/exercises";
import { GOAL_LABELS } from "../../../../lib/questionnaire";
import {
  esPorTiempo,
  leerRutinaCatalogo,
} from "../../../../lib/routines/catalog";
import { createClient } from "../../../../lib/supabase/server";
import { UseRoutineButton } from "./UseRoutineButton";

type RoutineDetailProps = {
  params: Promise<{ slug: string }>;
};

export async function RoutineDetail({ params }: RoutineDetailProps) {
  await connection();

  const { slug } = await params;
  const supabase = await createClient();

  // Si la rutina está oculta, solo la ve el superadmin; para el resto no existe.
  const { rutina, error } = await leerRutinaCatalogo(supabase, { slug });
  if (error) {
    return (
      <Alert tone="danger" title="No se pudo cargar la rutina">
        Inténtalo de nuevo en unos instantes.
      </Alert>
    );
  }
  if (!rutina) {
    notFound();
  }

  const { data: activa } = await supabase
    .from("routines")
    .select("name")
    .eq("is_active", true)
    .maybeSingle();
  const nombreActiva: string | null = activa?.name ?? null;

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-4">
        <Link
          href="/rutinas"
          className="text-sm text-muted transition hover:text-foreground"
        >
          ← Volver a Rutinas
        </Link>
        <div className="flex flex-wrap items-center gap-2">
          {rutina.published ? null : <Badge tone="warning">Oculta</Badge>}
          <Badge>{GOAL_LABELS[rutina.goal]}</Badge>
          <Badge>{DIFFICULTY_LABELS[rutina.level]}</Badge>
          <Badge>{rutina.weeks} semanas</Badge>
          <Badge>{rutina.days.length} días por semana</Badge>
          {rutina.equipment.map((material) => (
            <Badge key={material}>{EQUIPMENT_LABELS[material]}</Badge>
          ))}
        </div>
        <h1 className="text-3xl font-semibold tracking-tight">{rutina.name}</h1>
        <p className="max-w-3xl text-lg text-muted">{rutina.description}</p>
        {rutina.published ? null : (
          <Alert tone="info" title="Esta rutina está oculta">
            Solo la ves tú, como superadmin. Los usuarios no la encuentran.
          </Alert>
        )}
        {rutina.missing > 0 ? (
          <Alert tone="warning" title="Falta algún ejercicio">
            Algún ejercicio de esta rutina está desactivado o no existe.
            Los usuarios no podrán usarla hasta que lo arregles.
          </Alert>
        ) : null}
        {rutina.warnings.length > 0 ? (
          <Alert tone="warning" title="Ten en cuenta">
            <ul className="flex list-disc flex-col gap-1 pl-5">
              {rutina.warnings.map((aviso) => (
                <li key={aviso}>{aviso}</li>
              ))}
            </ul>
          </Alert>
        ) : null}
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {rutina.days.map((dia) => (
          <Card key={dia.id} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <h2 className="text-2xl font-semibold tracking-tight">
                Día {dia.dayNumber}
              </h2>
              <p className="text-sm text-muted">{dia.name}</p>
            </div>
            <ol className="flex flex-col gap-3">
              {dia.exercises.map((e, j) => (
                <li key={e.id} className="flex flex-col">
                  <span className="font-medium">
                    {j + 1}. {e.name}
                  </span>
                  <span className="text-sm text-muted">
                    {e.sets} series · {e.repsMin}-{e.repsMax}{" "}
                    {esPorTiempo(e.slug) ? "segundos" : "repeticiones"}
                  </span>
                </li>
              ))}
            </ol>
          </Card>
        ))}
      </div>

      <UseRoutineButton slug={rutina.slug} activeRoutineName={nombreActiva} />
    </div>
  );
}