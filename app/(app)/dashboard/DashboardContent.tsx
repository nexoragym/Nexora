import { connection } from "next/server";
import { Alert } from "../../../components/ui/Alert";
import { Badge } from "../../../components/ui/Badge";
import { ButtonLink } from "../../../components/ui/ButtonLink";
import { Card } from "../../../components/ui/Card";
import { StatCard } from "../../../components/ui/StatCard";
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

const MS_POR_DIA = 86_400_000;

// Semana del programa en la que estás, según el calendario (1 a total).
function semanaActual(inicio: string, total: number): number {
  const fecha = new Date(`${inicio}T00:00:00`);
  const dias = Math.floor((Date.now() - fecha.getTime()) / MS_POR_DIA);
  if (Number.isNaN(dias)) return 1;
  return Math.min(Math.max(Math.floor(dias / 7) + 1, 1), total);
}

export async function DashboardContent() {
  await connection();

  const supabase = await createClient();

  const { data: perfil } = await supabase
    .from("profiles")
    .select("display_name")
    .maybeSingle();
  const nombre: string | null = perfil?.display_name ?? null;

  const { data, error } = await supabase
    .from("routines")
    .select(ACTIVE_ROUTINE_SELECT)
    .eq("is_active", true)
    .maybeSingle();

  if (error) {
    console.error("[inicio] error de Supabase:", error.code ?? "sin código");
  }

  const rutina = error
    ? null
    : ((data as unknown as ActiveRoutine | null) ?? null);

  const objetivo = rutina?.goal ? GOAL_LABELS[rutina.goal as Goal] : null;
  const enfoque =
    rutina?.focus && rutina.focus !== "balanced"
      ? FOCUS_LABELS[rutina.focus as Focus]
      : null;

  const totalSemanas = rutina?.program_weeks ?? null;
  const semana =
    rutina && totalSemanas
      ? semanaActual(rutina.start_date, totalSemanas)
      : null;
  const porcentaje =
    semana && totalSemanas ? Math.round((semana / totalSemanas) * 100) : 0;

  return (
    <div className="flex flex-col gap-8">
      <h2 className="text-3xl font-semibold tracking-tight">
        {nombre ? `Hola, ${nombre}` : "Hola"}
      </h2>

      {error ? (
        <Alert tone="danger" title="No se pudo cargar tu programa">
          Inténtalo de nuevo en unos instantes.
        </Alert>
      ) : rutina ? (
        <Card className="flex flex-col gap-5 p-6 sm:p-8">
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone="accent">Programa activo</Badge>
            {objetivo ? <Badge>{objetivo}</Badge> : null}
            {enfoque ? <Badge>{enfoque}</Badge> : null}
          </div>
          <h3 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            {rutina.name}
          </h3>

          {semana && totalSemanas ? (
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between text-sm text-muted">
                <span>
                  Semana {semana} de {totalSemanas}
                </span>
                <span>{porcentaje}% del calendario</span>
              </div>
              <div
                role="progressbar"
                aria-label="Progreso del programa según el calendario"
                aria-valuemin={0}
                aria-valuemax={totalSemanas}
                aria-valuenow={semana}
                className="h-2 w-full overflow-hidden rounded-full bg-surface-2"
              >
                <div
                  className="h-full rounded-full bg-linear-to-r from-accent to-orange-500 transition-[width] duration-700"
                  style={{ width: `${porcentaje}%` }}
                />
              </div>
            </div>
          ) : null}

          <div>
            <ButtonLink href="/entrenar" size="xl">
              Ir a entrenar
            </ButtonLink>
          </div>
        </Card>
      ) : (
        <Card className="flex flex-col gap-4 border-accent/40 p-6 sm:p-8">
          <Badge tone="accent" className="self-start">
            Primer paso
          </Badge>
          <h3 className="text-2xl font-semibold tracking-tight">
            Elige tu rutina
          </h3>
          <p className="max-w-2xl text-muted">
            Todavía no tienes ninguna rutina activa. Elige una rutina lista
            para usar o crea un plan personalizado.
          </p>
          <div className="flex flex-wrap gap-3">
            <ButtonLink href="/rutinas" size="lg">
              Ver rutinas
            </ButtonLink>
            <ButtonLink href="/empezar" variant="secondary" size="lg">
              Crear plan personalizado
            </ButtonLink>
          </div>
        </Card>
      )}

      <section aria-labelledby="resumen" className="flex flex-col gap-4">
        <h3 id="resumen" className="text-xl font-semibold">
          Tu resumen
        </h3>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Entrenamientos"
            value="—"
            hint="Se activa al registrar tu primer entrenamiento"
          />
          <StatCard
            label="Racha"
            value="—"
            hint="Se activa al registrar tu primer entrenamiento"
          />
          <StatCard
            label="Kilos totales"
            value="—"
            hint="Se activa al registrar tu primer entrenamiento"
          />
          <StatCard
            label="Días de descanso"
            value="—"
            hint="Se activa al registrar tu primer entrenamiento"
          />
        </div>
      </section>
    </div>
  );
}