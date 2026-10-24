import { connection } from "next/server";
import { Alert } from "../../../components/ui/Alert";
import { Badge } from "../../../components/ui/Badge";
import { ButtonLink } from "../../../components/ui/ButtonLink";
import { Card } from "../../../components/ui/Card";
import { cn } from "../../../lib/cn";
import {
  FOCUS_LABELS,
  GOAL_LABELS,
  type Focus,
  type Goal,
} from "../../../lib/questionnaire";
import { nombreSesion } from "../../../lib/routines/names";
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
        <Card className="flex flex-col gap-4 border-accent/40 p-8">
          <Badge tone="accent" className="self-start">
            Recomendado para empezar
          </Badge>
          <h2 className="text-2xl font-semibold tracking-tight">
            Elegir una rutina
          </h2>
          <p className="text-muted">
            Rutinas listas para usar: ganar músculo, definir, fuerza…
          </p>
          <div>
            <ButtonLink href="/rutinas" size="lg">
              Ver rutinas
            </ButtonLink>
          </div>
        </Card>
        <Card className="flex flex-col gap-4 p-8">
          <h2 className="text-2xl font-semibold tracking-tight">
            Crear rutina personalizada
          </h2>
          <p className="text-muted">
            Responde unas preguntas y preparamos un programa a tu medida.
          </p>
          <div>
            <ButtonLink href="/empezar" variant="secondary" size="lg">
              Empezar
            </ButtonLink>
          </div>
        </Card>
      </div>
    </div>
  );
}

function IconoHecho() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="18"
      height="18"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M5 13l4 4L19 7" />
    </svg>
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
  const porSemana = dias.length;
  const semanas = Math.max(rutina.program_weeks ?? 1, 1);

  // Días ya completados: pareja (día de la rutina, semana del programa).
  const { data: hechas, error: errorHechas } = await supabase
    .from("workout_sessions")
    .select("routine_day_id, week_number")
    .eq("routine_id", rutina.id)
    .eq("status", "completed");

  if (errorHechas) {
    console.error(
      "[entrenar] error al leer sesiones:",
      errorHechas.code ?? "sin código",
    );
  }

  const completadas = new Set<string>();
  for (const fila of (hechas ?? []) as {
    routine_day_id: string | null;
    week_number: number | null;
  }[]) {
    if (fila.routine_day_id && fila.week_number) {
      completadas.add(`${fila.routine_day_id}:${fila.week_number}`);
    }
  }

  const lista = Array.from({ length: semanas }, (_, i) => i + 1).flatMap(
    (semana) =>
      dias.map((dia, indice) => ({
        semana,
        dia,
        numero: (semana - 1) * porSemana + indice + 1,
        hecho: completadas.has(`${dia.id}:${semana}`),
      })),
  );

  const siguiente = lista.find((item) => !item.hecho) ?? null;
  const hechosTotal = lista.filter((item) => item.hecho).length;
  const porcentaje =
    lista.length > 0 ? Math.round((hechosTotal / lista.length) * 100) : 0;

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
          <Badge>{semanas} semanas</Badge>
          <Badge>{porSemana} días por semana</Badge>
        </div>
        <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          {rutina.name}
        </h2>

        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between text-sm text-muted">
            <span>
              {siguiente
                ? `Vas por la semana ${siguiente.semana} de ${semanas}`
                : "Programa completado"}
            </span>
            <span>
              {hechosTotal} de {lista.length} días completados
            </span>
          </div>
          <div
            role="progressbar"
            aria-label="Días completados del programa"
            aria-valuemin={0}
            aria-valuemax={lista.length}
            aria-valuenow={hechosTotal}
            className="h-2 w-full overflow-hidden rounded-full bg-surface-2"
          >
            <div
              className="h-full rounded-full bg-linear-to-r from-accent to-orange-500 transition-[width] duration-700"
              style={{ width: `${porcentaje}%` }}
            />
          </div>
        </div>

        {rutina.notes.length > 0 ? (
          <details className="max-w-3xl text-sm text-muted">
            <summary className="cursor-pointer select-none">
              Notas del plan
            </summary>
            <ul className="mt-2 flex list-disc flex-col gap-1 pl-5">
              {rutina.notes.map((nota, indice) => (
                <li key={indice}>{nota}</li>
              ))}
            </ul>
          </details>
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

      {Array.from({ length: semanas }, (_, i) => i + 1).map((semana) => {
        const deLaSemana = lista.filter((item) => item.semana === semana);
        const hechosSemana = deLaSemana.filter((item) => item.hecho).length;

        return (
          <section
            key={semana}
            aria-labelledby={`semana-${semana}`}
            className="flex flex-col gap-4"
          >
            <div className="flex items-baseline justify-between gap-3">
              <h3 id={`semana-${semana}`} className="text-xl font-semibold">
                Semana {semana}
              </h3>
              <span className="text-sm text-muted">
                {hechosSemana}/{porSemana} días
              </span>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {deLaSemana.map((item) => {
                const ejercicios = [...item.dia.routine_day_exercises].sort(
                  (a, b) => a.sort_order - b.sort_order,
                );
                const esSiguiente = siguiente?.numero === item.numero;

                return (
                  <div
                    key={item.dia.id}
                    className={cn(
                      "flex flex-col gap-4 rounded-3xl border p-5 transition duration-200",
                      item.hecho
                        ? "border-border bg-surface-2/50 text-muted"
                        : "border-accent/30 bg-linear-to-br from-accent/30 via-accent/10 to-surface",
                      esSiguiente && "ring-2 ring-accent",
                    )}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span
                        className={cn(
                          "text-2xl font-semibold tracking-tight",
                          item.hecho ? "text-muted" : "text-foreground",
                        )}
                      >
                        Día {item.numero}
                      </span>
                      {item.hecho ? (
                        <span className="inline-flex items-center gap-1 text-sm text-success">
                          <IconoHecho />
                          Hecho
                        </span>
                      ) : esSiguiente ? (
                        <Badge tone="accent">Te toca</Badge>
                      ) : null}
                    </div>

                    <div className="flex flex-col gap-1">
                      <span className="font-medium">
                        {nombreSesion(item.dia.name)}
                      </span>
                      <span className="text-sm text-muted">
                        {ejercicios.length} ejercicios
                      </span>
                    </div>

                    <details className="text-sm">
                      <summary className="cursor-pointer select-none text-muted">
                        Ver ejercicios
                      </summary>
                      <ol className="mt-3 flex flex-col gap-2">
                        {ejercicios.map((ej) => (
                          <li key={ej.id} className="flex flex-col">
                            <span className="font-medium text-foreground">
                              {ej.sort_order}. {ej.exercises?.name ?? "Ejercicio"}
                            </span>
                            <span className="text-muted">
                              {ej.target_sets} series · {ej.reps_min}-
                              {ej.reps_max} {ej.notes ? "segundos" : "repeticiones"}
                            </span>
                          </li>
                        ))}
                      </ol>
                    </details>

                    {item.hecho ? (
                      <p className="mt-auto text-sm">Completado</p>
                    ) : (
                      <ButtonLink
                        href={`/sesion/${item.dia.id}/${item.semana}`}
                        fullWidth
                        className="mt-auto"
                      >
                        Iniciar rutina
                      </ButtonLink>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
}