import { connection } from "next/server";
import { BarChart } from "../../../components/charts/BarChart";
import { Alert } from "../../../components/ui/Alert";
import { Badge } from "../../../components/ui/Badge";
import { ButtonLink } from "../../../components/ui/ButtonLink";
import { Card } from "../../../components/ui/Card";
import { StatCard } from "../../../components/ui/StatCard";
import {
  etiquetaFecha,
  formatearKg,
  leerProgreso,
  type SemanaProgreso,
} from "../../../lib/progress";
import { ZONA_HORARIA } from "../../../lib/stats";
import { createClient } from "../../../lib/supabase/server";
import { ExerciseProgress } from "./ExerciseProgress";

function compararSemanas(actual: number, anterior: number): string {
  if (anterior <= 0) {
    return actual > 0
      ? "Sin kilos la semana anterior"
      : "Aún sin kilos esta semana";
  }
  const cambio = Math.round(((actual - anterior) / anterior) * 100);
  return `${cambio > 0 ? "+" : ""}${cambio} % respecto a la semana anterior`;
}

export async function ProgressContent() {
  await connection();

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("get_my_progress", {
    p_timezone: ZONA_HORARIA,
    p_weeks: 8,
  });

  if (error) {
    console.error("[progreso] error de Supabase:", error.code ?? "sin código");
    return (
      <Alert tone="danger" title="No se pudo cargar tu progreso">
        Inténtalo de nuevo en unos instantes.
      </Alert>
    );
  }

  const { weekly, records, history } = leerProgreso(data);
  const hayDatos = weekly.some((s) => s.sessions > 0) || records.length > 0;

  if (!hayDatos || weekly.length === 0) {
    return (
      <Card className="flex flex-col gap-4 p-8">
        <Badge className="self-start">Aún sin datos</Badge>
        <h2 className="text-2xl font-semibold tracking-tight">
          Completa tu primer entrenamiento
        </h2>
        <p className="max-w-2xl text-muted">
          En cuanto termines un día de tu rutina, aquí verás tus gráficas, tus
          récords y la evolución de tus pesos.
        </p>
        <div>
          <ButtonLink href="/entrenar" size="lg">
            Ir a Entrenar
          </ButtonLink>
        </div>
      </Card>
    );
  }

  const actual: SemanaProgreso = weekly[weekly.length - 1];
  const anterior: SemanaProgreso | undefined = weekly[weekly.length - 2];
  const mejor = weekly.reduce(
    (m, semana) => (semana.volumeKg > m.volumeKg ? semana : m),
    weekly[0],
  );

  const kilosPorSemana = weekly.map((s) => ({
    label: etiquetaFecha(s.weekStart),
    value: Math.round(s.volumeKg),
  }));
  const sesionesPorSemana = weekly.map((s) => ({
    label: etiquetaFecha(s.weekStart),
    value: s.sessions,
  }));

  return (
    <div className="flex flex-col gap-8">
      <section aria-labelledby="semana" className="flex flex-col gap-4">
        <h2 id="semana" className="text-xl font-semibold">
          Esta semana
        </h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <StatCard
            label="Entrenamientos"
            value={String(actual.sessions)}
            hint="Desde el lunes"
          />
          <StatCard
            label="Kilos levantados"
            value={`${Math.round(actual.volumeKg).toLocaleString("es-ES")} kg`}
            hint={compararSemanas(actual.volumeKg, anterior?.volumeKg ?? 0)}
          />
          <StatCard
            label="Mejor semana"
            value={`${Math.round(mejor.volumeKg).toLocaleString("es-ES")} kg`}
            hint={
              mejor.volumeKg > 0
                ? `Semana del ${etiquetaFecha(mejor.weekStart)}`
                : "Aún sin kilos"
            }
          />
        </div>
      </section>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <Card className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <h2 className="text-xl font-semibold">Kilos por semana</h2>
            <p className="text-sm text-muted">
              Peso × repeticiones de todas tus series. Cada barra es una semana
              (empieza en lunes).
            </p>
          </div>
          <BarChart
            data={kilosPorSemana}
            unit="kg"
            ariaLabel="Gráfica de kilos levantados por semana en las últimas 8 semanas"
          />
        </Card>

        <Card className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <h2 className="text-xl font-semibold">Entrenamientos por semana</h2>
            <p className="text-sm text-muted">
              Días de entrenamiento que has completado en cada semana.
            </p>
          </div>
          <BarChart
            data={sesionesPorSemana}
            unit="entrenamientos"
            ariaLabel="Gráfica de entrenamientos completados por semana en las últimas 8 semanas"
          />
        </Card>
      </div>

      <section aria-labelledby="evolucion" className="flex flex-col gap-4">
        <h2 id="evolucion" className="text-xl font-semibold">
          Evolución por ejercicio
        </h2>
        <ExerciseProgress history={history} />
      </section>

      <section aria-labelledby="records" className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <h2 id="records" className="text-xl font-semibold">
            Tus récords
          </h2>
          <p className="text-sm text-muted">
            Tu mayor peso en cada ejercicio, con las repeticiones de esa serie.
            Los ejercicios sin peso no aparecen aquí.
          </p>
        </div>
        {records.length === 0 ? (
          <Card>
            <p className="text-muted">
              Todavía no has registrado peso en ningún ejercicio. Pon el peso con
              los botones + y − durante el entrenamiento y aparecerá aquí.
            </p>
          </Card>
        ) : (
          <ul className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
            {records.map((registro) => (
              <li
                key={registro.exerciseId}
                className="flex items-center justify-between gap-4 rounded-3xl border border-border bg-surface p-5"
              >
                <div className="flex min-w-0 flex-col">
                  <span className="truncate font-medium">{registro.name}</span>
                  <span className="text-sm text-muted">
                    {etiquetaFecha(registro.day)}
                  </span>
                </div>
                <span className="shrink-0 text-xl font-semibold tabular-nums">
                  {formatearKg(registro.weightKg)}
                  <span className="text-sm font-normal text-muted">
                    {" "}
                    × {registro.reps}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}