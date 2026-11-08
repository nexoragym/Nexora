import Link from "next/link";
import { connection } from "next/server";
import { Alert } from "../../../components/ui/Alert";
import { Badge } from "../../../components/ui/Badge";
import { Button } from "../../../components/ui/Button";
import { ButtonLink } from "../../../components/ui/ButtonLink";
import { Card } from "../../../components/ui/Card";
import { DeleteRoutineButton } from "../../../components/routines/DeleteRoutineButton";
import { puedeCrearRutinasPersonalizadas } from "../../../lib/features";
import { GOAL_LABELS, type Goal } from "../../../lib/questionnaire";
import { MAX_RUTINAS_PERSONALES } from "../../../lib/routines/custom";
import { createClient } from "../../../lib/supabase/server";
import { activarRutinaPersonal } from "./actions";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

type Fila = {
  id: string;
  name: string;
  goal: Goal | null;
  program_weeks: number | null;
  days_per_week: number | null;
  is_active: boolean;
  routine_days: { id: string }[] | null;
};

function primero(valor: string | string[] | undefined): string {
  return Array.isArray(valor) ? (valor[0] ?? "") : (valor ?? "");
}

export async function MisRutinasContent({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  await connection();

  const aviso = primero((await searchParams).aviso);
  const supabase = await createClient();
  const puede = await puedeCrearRutinasPersonalizadas(supabase);

  const { data, error } = await supabase
    .from("routines")
    .select("id, name, goal, program_weeks, days_per_week, is_active, routine_days(id)")
    .eq("source", "custom")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[mis rutinas] error de Supabase:", error.code ?? "sin código");
    return (
      <Alert tone="danger" title="No se pudieron cargar tus rutinas">
        Inténtalo de nuevo en unos instantes.
      </Alert>
    );
  }

  const rutinas = (data ?? []) as unknown as Fila[];
  const llena = rutinas.length >= MAX_RUTINAS_PERSONALES;

  return (
    <div className="flex flex-col gap-6">
      {aviso === "guardada" ? (
        <Alert tone="success" title="Rutina guardada">
          Ya está en tu lista. Pulsa «Usar» cuando quieras empezar con ella.
        </Alert>
      ) : null}
      {aviso === "eliminada" ? (
        <Alert tone="success" title="Rutina eliminada">
          Tu historial de entrenamientos se conserva.
        </Alert>
      ) : null}
      {!puede ? (
        <Alert tone="info" title="Función no disponible">
          Ahora mismo no puedes crear rutinas propias. Si acabas de actualizar la
          aplicación, comprueba que has ejecutado la migración 0018 en Supabase.
        </Alert>
      ) : null}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted">
          {rutinas.length} de {MAX_RUTINAS_PERSONALES} rutinas
        </p>
        {puede && !llena ? (
          <ButtonLink href="/mis-rutinas/nueva" size="lg">
            Crear una rutina
          </ButtonLink>
        ) : null}
      </div>

      {llena ? (
        <Alert tone="warning" title="Has llegado al máximo">
          Elimina alguna rutina para poder crear otra.
        </Alert>
      ) : null}

      {rutinas.length === 0 ? (
        <Card className="flex flex-col gap-3">
          <h2 className="text-xl font-semibold">Todavía no tienes rutinas propias</h2>
          <p className="text-muted">
            Crea la tuya eligiendo los ejercicios, las series y los descansos. Si
            prefieres una lista, mira las <Link href="/rutinas" className="font-semibold text-accent hover:underline">rutinas listas para usar</Link>.
          </p>
        </Card>
      ) : (
        <ul className="flex flex-col gap-3">
          {rutinas.map((rutina) => (
            <li key={rutina.id}>
              <Card className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    {rutina.is_active ? <Badge tone="accent">Activa</Badge> : null}
                    {rutina.goal ? <Badge>{GOAL_LABELS[rutina.goal]}</Badge> : null}
                    <Badge>{rutina.program_weeks ?? 1} semanas</Badge>
                    <Badge>{(rutina.routine_days ?? []).length} días por semana</Badge>
                  </div>
                  <h2 className="text-xl font-semibold tracking-tight">{rutina.name}</h2>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {rutina.is_active ? null : (
                    <form action={activarRutinaPersonal}>
                      <input type="hidden" name="id" value={rutina.id} />
                      <Button type="submit" size="sm">
                        Usar
                      </Button>
                    </form>
                  )}
                  <ButtonLink
                    href={`/mis-rutinas/${rutina.id}`}
                    variant="secondary"
                    size="md"
                  >
                    Editar
                  </ButtonLink>
                  <DeleteRoutineButton id={rutina.id} name={rutina.name} />
                </div>
              </Card>
            </li>
          ))}
        </ul>
      )}

      <p className="text-sm text-muted">
        Usar una rutina sustituye a la que tengas activa. Tu historial de
        entrenamientos se conserva.
      </p>
    </div>
  );
}