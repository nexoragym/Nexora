import Link from "next/link";
import { connection } from "next/server";
import { StreakCard } from "../../../components/streak/StreakCard";
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
import { nombreSesion } from "../../../lib/routines/names";
import {
  ACTIVE_ROUTINE_SELECT,
  type ActiveRoutine,
} from "../../../lib/routines/queries";
import {
  calcularDescanso,
  calcularRacha,
  hoyEnZona,
  ZONA_HORARIA,
} from "../../../lib/stats";
import { createClient } from "../../../lib/supabase/server";

type FilaEstadisticas = {
  completed_sessions: number | string;
  total_volume_kg: number | string;
  training_days: string[] | null;
};

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

  // ---- Estadísticas reales ----
  const { data: filasStats, error: errorStats } = await supabase.rpc(
    "get_my_stats",
    { p_timezone: ZONA_HORARIA },
  );
  if (errorStats) {
    console.error("[inicio] error en estadísticas:", errorStats.code ?? "sin código");
  }
  const stats = (
    (filasStats as unknown as FilaEstadisticas[] | null) ?? []
  )[0];
  const entrenamientos = stats ? Number(stats.completed_sessions) : 0;
  const volumen = stats ? Math.round(Number(stats.total_volume_kg)) : 0;
  const fechas = stats?.training_days ?? [];
  const hoy = hoyEnZona();
  const racha = calcularRacha(fechas, hoy);
  const descanso = calcularDescanso(fechas, hoy);
  const hayDatos = !errorStats && entrenamientos > 0;

  // ---- Programa: días completados y siguiente día ----
  let siguiente: {
    semana: number;
    numero: number;
    diaId: string;
    nombreDia: string;
  } | null = null;
  let hechosTotal = 0;
  let diasTotal = 0;
  let semanas = 1;

  if (rutina) {
    const dias = [...rutina.routine_days].sort(
      (a, b) => a.day_number - b.day_number,
    );
    semanas = Math.max(rutina.program_weeks ?? 1, 1);

    const { data: hechas, error: errorHechas } = await supabase
      .from("workout_sessions")
      .select("routine_day_id, week_number")
      .eq("routine_id", rutina.id)
      .eq("status", "completed");

    if (errorHechas) {
      console.error(
        "[inicio] error al leer sesiones:",
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
          numero: (semana - 1) * dias.length + indice + 1,
          hecho: completadas.has(`${dia.id}:${semana}`),
        })),
    );

    diasTotal = lista.length;
    hechosTotal = lista.filter((item) => item.hecho).length;
    const proximo = lista.find((item) => !item.hecho);
    if (proximo) {
      siguiente = {
        semana: proximo.semana,
        numero: proximo.numero,
        diaId: proximo.dia.id,
        nombreDia: nombreSesion(proximo.dia.name),
      };
    }
  }

  const porcentaje =
    diasTotal > 0 ? Math.round((hechosTotal / diasTotal) * 100) : 0;
  const objetivo = rutina?.goal ? GOAL_LABELS[rutina.goal as Goal] : null;
  const enfoque =
    rutina?.focus && rutina.focus !== "balanced"
      ? FOCUS_LABELS[rutina.focus as Focus]
      : null;

  const sinDatos = "Se activa al registrar tu primer entrenamiento";

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
          <div className="flex flex-col gap-1">
            <h3 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              {rutina.name}
            </h3>
            {siguiente ? (
              <p className="text-muted">
                Te toca: Día {siguiente.numero} · {siguiente.nombreDia}
              </p>
            ) : (
              <p className="text-muted">Has completado todo el programa.</p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between text-sm text-muted">
              <span>
                {siguiente
                  ? `Semana ${siguiente.semana} de ${semanas}`
                  : "Programa completado"}
              </span>
              <span>
                {hechosTotal} de {diasTotal} días completados
              </span>
            </div>
            <div
              role="progressbar"
              aria-label="Días completados del programa"
              aria-valuemin={0}
              aria-valuemax={diasTotal}
              aria-valuenow={hechosTotal}
              className="h-2 w-full overflow-hidden rounded-full bg-surface-2"
            >
              <div
                className="h-full rounded-full bg-linear-to-r from-accent to-orange-500 transition-[width] duration-700"
                style={{ width: `${porcentaje}%` }}
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            {siguiente ? (
              <ButtonLink
                href={`/sesion/${siguiente.diaId}/${siguiente.semana}`}
                size="xl"
              >
                Empezar Día {siguiente.numero}
              </ButtonLink>
            ) : (
              <ButtonLink href="/rutinas" size="xl">
                Elegir otra rutina
              </ButtonLink>
            )}
            <ButtonLink href="/entrenar" variant="secondary" size="xl">
              Ver mi programa
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
            value={hayDatos ? String(entrenamientos) : "—"}
            hint={hayDatos ? "Completados en total" : sinDatos}
          />
          <StreakCard
            racha={racha}
            hayDatos={hayDatos}
            hint={
              hayDatos ? "Sin más de 2 días de descanso seguidos" : sinDatos
            }
          />
          <StatCard
            label="Kilos totales"
            value={
              hayDatos ? `${volumen.toLocaleString("es-ES")} kg` : "—"
            }
            hint={
              hayDatos
                ? "Peso × repeticiones. Sin peso cuenta 0"
                : sinDatos
            }
          />
          <StatCard
            label="Días de descanso"
            value={hayDatos ? String(descanso) : "—"}
            hint={hayDatos ? "En los últimos 7 días" : sinDatos}
          />
        </div>
      </section>

      <section aria-labelledby="herramientas" className="flex flex-col gap-4">
        <h3 id="herramientas" className="text-xl font-semibold">
          Herramientas
        </h3>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
          <Link
            href="/mis-rutinas"
            className="flex flex-col gap-2 rounded-3xl border border-border bg-surface p-5 transition duration-200 hover:-translate-y-0.5 hover:border-accent/60 hover:bg-surface-2"
          >
            <span className="text-lg font-semibold">Mis rutinas</span>
            <span className="text-sm text-muted">
              Crea tu propia rutina eligiendo los ejercicios.
            </span>
          </Link>
          <Link
            href="/imc"
            className="flex flex-col gap-2 rounded-3xl border border-border bg-surface p-5 transition duration-200 hover:-translate-y-0.5 hover:border-accent/60 hover:bg-surface-2"
          >
            <span className="text-lg font-semibold">Calculadora de IMC</span>
            <span className="text-sm text-muted">
              Calcula tu índice de masa corporal. Es solo una orientación.
            </span>
          </Link>
        </div>
      </section>
    </div>
  );
}