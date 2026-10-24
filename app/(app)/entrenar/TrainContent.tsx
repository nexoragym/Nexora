import { connection } from "next/server";
import { Alert } from "../../../components/ui/Alert";
import { Badge } from "../../../components/ui/Badge";
import { ButtonLink } from "../../../components/ui/ButtonLink";
import { Card } from "../../../components/ui/Card";
import {
  FOCUS_LABELS,
  GOAL_LABELS,
  type Focus,
  type Goal,
} from "../../../lib/questionnaire";
import {
  ACTIVE_ROUTINE_SELECT,
  type ActiveRoutine,
} from "../../../lib/routines/queries";
import { createClient } from "../../../lib/supabase/server";

// Lo que se ve cuando todavía no hay ninguna rutina activa.
function SinRutina() {
  return (
    <div className="flex flex-col gap-4">
      <p className="max-w-2xl text-lg text-muted">
        Todavía no tienes ninguna rutina. Elige cómo quieres empezar.
      </p>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Card className="flex flex-col gap-4 p-8">
          <Badge className="self-start">Próximamente</Badge>
          <h2 className="text-2xl font-semibold tracking-tight">
            Crear mi rutina
          </h2>
          <p className="text-muted">
            Elige tú los ejercicios, las series y los días de tu rutina.
          </p>
        </Card>
        <Card className="flex flex-col gap-4 border-accent/40 p-8">
          <Badge tone="accent" className="self-start">
            Recomendado
          </Badge>
          <h2 className="text-2xl font-semibold tracking-tight">
            Crear rutina automática
          </h2>
          <p className="text-muted">
            Responde unas preguntas y preparamos tu programa a medida.
          </p>
          <div>
            <ButtonLink href="/empezar" size="lg">
              Empezar
            </ButtonLink>
          </div>
        </Card>
      </div>
    </div>
  );
}

export async function TrainContent() {
  await connection();

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("routines")
    .select(ACTIVE_ROUTINE_SELECT)
    .eq("is_active", true)
    .maybeSingle();

  if (error) {
    console.error("[entrenar] error de Supabase:", error.code ?? "sin código");
    return (
      <Alert tone="danger" title="No se pudo cargar tu rutina">
        Inténtalo de nuevo en unos instantes.
      </Alert>
    );
  }

  const rutina = (data as unknown as ActiveRoutine | null) ?? null;
  if (!rutina) {
    return <SinRutina />;
  }

  const dias = [...rutina.routine_days].sort(
    (a, b) => a.day_number - b.day_number,
  );
  const objetivo = rutina.goal ? GOAL_LABELS[rutina.goal as Goal] : null;
  const enfoque =
    rutina.focus && rutina.focus !== "balanced"
      ? FOCUS_LABELS[rutina.focus as Focus]
      : null;

  return (
    <div className="flex flex-col gap-8">
      <Card className="flex flex-col gap-4 p-6 sm:p-8">
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone="accent">Rutina activa</Badge>
          {objetivo ? <Badge>{objetivo}</Badge> : null}
          {enfoque ? <Badge>{enfoque}</Badge> : null}
          {rutina.program_weeks ? <Badge>{rutina.program_weeks} semanas</Badge> : null}
          {rutina.days_per_week ? (
            <Badge>{rutina.days_per_week} sesiones por semana</Badge>
          ) : null}
        </div>
        <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          {rutina.name}
        </h2>
        {rutina.notes.length > 0 ? (
          <ul className="flex max-w-3xl list-disc flex-col gap-1 pl-5 text-sm text-muted">
            {rutina.notes.map((nota, indice) => (
              <li key={indice}>{nota}</li>
            ))}
          </ul>
        ) : null}
        {rutina.warnings.length > 0 ? (
          <Alert tone="warning" title="Ten en cuenta">
            <ul className="flex list-disc flex-col gap-1 pl-5">
              {rutina.warnings.map((aviso, indice) => (
                <li key={indice}>{aviso}</li>
              ))}
            </ul>
          </Alert>
        ) : null}
      </Card>

      <section aria-labelledby="sesiones" className="flex flex-col gap-4">
        <h2 id="sesiones" className="text-xl font-semibold">
          Tus sesiones
        </h2>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {dias.map((dia) => {
            const ejercicios = [...dia.routine_day_exercises].sort(
              (a, b) => a.sort_order - b.sort_order,
            );
            return (
              <Card key={dia.id} className="flex flex-col gap-4">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-lg font-semibold">{dia.name}</h3>
                  <Badge>Sesión {dia.day_number}</Badge>
                </div>
                <ol className="flex flex-col gap-3">
                  {ejercicios.map((ej) => (
                    <li key={ej.id} className="flex flex-col gap-0.5">
                      <span className="font-medium">
                        {ej.sort_order}. {ej.exercises?.name ?? "Ejercicio"}
                      </span>
                      <span className="text-sm text-muted">
                        {ej.target_sets} series · {ej.reps_min}-{ej.reps_max}{" "}
                        {ej.notes ? "seg" : "repeticiones"} · descanso{" "}
                        {ej.rest_seconds} s
                      </span>
                    </li>
                  ))}
                </ol>
                <Badge className="self-start">
                  Próximamente: empezar la sesión
                </Badge>
              </Card>
            );
          })}
        </div>
      </section>
    </div>
  );
}