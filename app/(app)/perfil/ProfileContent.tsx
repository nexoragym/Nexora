import Link from "next/link";
import { connection } from "next/server";
import { ProfileAvatar } from "../../../components/profile/ProfileAvatar";
import { StreakFlame } from "../../../components/streak/StreakFlame";
import { StreakGallery } from "../../../components/streak/StreakGallery";
import { Badge } from "../../../components/ui/Badge";
import { Button } from "../../../components/ui/Button";
import { ButtonLink } from "../../../components/ui/ButtonLink";
import { Card } from "../../../components/ui/Card";
import { StatCard } from "../../../components/ui/StatCard";
import { cn } from "../../../lib/cn";
import {
  etiquetaFecha,
  formatearKg,
  leerProgreso,
} from "../../../lib/progress";
import {
  ACTIVE_ROUTINE_SELECT,
  type ActiveRoutine,
} from "../../../lib/routines/queries";
import { calcularRacha, hoyEnZona, ZONA_HORARIA } from "../../../lib/stats";
import {
  PALETAS,
  calcularMejorRacha,
  diasHastaSiguienteEtapa,
  etapaDeRacha,
  progresoEnEtapa,
  semanaDeFechas,
  siguienteEtapa,
} from "../../../lib/streak";
import { createClient } from "../../../lib/supabase/server";
import { cerrarSesion } from "../../(auth)/actions";
import { ProfileForm } from "./ProfileForm";

type FilaEstadisticas = {
  completed_sessions: number | string;
  total_volume_kg: number | string;
  training_days: string[] | null;
};

function plural(numero: number, singular: string, pluralTexto: string): string {
  return numero === 1 ? singular : pluralTexto;
}

export async function ProfileContent() {
  await connection();

  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const correo =
    typeof data?.claims?.email === "string" ? data.claims.email : null;

  const [perfilRes, statsRes, progresoRes, rutinaRes] = await Promise.all([
    supabase.from("profiles").select("display_name, created_at").maybeSingle(),
    supabase.rpc("get_my_stats", { p_timezone: ZONA_HORARIA }),
    supabase.rpc("get_my_progress", { p_timezone: ZONA_HORARIA, p_weeks: 1 }),
    supabase
      .from("routines")
      .select(ACTIVE_ROUTINE_SELECT)
      .eq("is_active", true)
      .maybeSingle(),
  ]);

  if (statsRes.error) {
    console.error("[perfil] error en estadísticas:", statsRes.error.code ?? "sin código");
  }
  if (progresoRes.error) {
    console.error("[perfil] error en progreso:", progresoRes.error.code ?? "sin código");
  }

  const perfil = perfilRes.data as {
    display_name: string | null;
    created_at: string | null;
  } | null;
  const nombre = perfil?.display_name ?? null;
  const miembroDesde = perfil?.created_at
    ? new Date(perfil.created_at).toLocaleDateString("es-ES", {
        month: "long",
        year: "numeric",
        timeZone: ZONA_HORARIA,
      })
    : null;

  // ---- Estadísticas y racha ----
  const filaStats = (
    (statsRes.data as unknown as FilaEstadisticas[] | null) ?? []
  )[0];
  const entrenamientos = filaStats ? Number(filaStats.completed_sessions) : 0;
  const volumen = filaStats ? Math.round(Number(filaStats.total_volume_kg)) : 0;
  const fechas = filaStats?.training_days ?? [];

  const hoy = hoyEnZona();
  const racha = calcularRacha(fechas, hoy);
  const mejorRacha = Math.max(calcularMejorRacha(fechas), racha);
  const etapa = etapaDeRacha(racha);
  const siguiente = siguienteEtapa(etapa);
  const faltan = diasHastaSiguienteEtapa(racha);
  const progresoRacha = progresoEnEtapa(racha);
  const semana = semanaDeFechas(fechas, hoy);
  const diasEstaSemana = semana.filter((dia) => dia.entrenado).length;
  const entrenoHoy = fechas.includes(hoy);
  const paleta = PALETAS[etapa.tier];

  const mensajeRacha =
    racha === 0
      ? etapa.descripcion
      : entrenoHoy
        ? "¡Hoy ya has entrenado! Tu racha sigue viva."
        : "Entrena pronto para mantener tu racha viva.";

  // ---- Récords: los 3 pesos más altos ----
  const records = [...leerProgreso(progresoRes.data).records]
    .sort((a, b) => b.weightKg - a.weightKg)
    .slice(0, 3);

  // ---- Programa activo ----
  const rutina = (rutinaRes.data as unknown as ActiveRoutine | null) ?? null;
  let diasHechos = 0;
  let diasTotal = 0;

  if (rutina) {
    const semanas = Math.max(rutina.program_weeks ?? 1, 1);
    diasTotal = semanas * rutina.routine_days.length;

    const { data: hechas } = await supabase
      .from("workout_sessions")
      .select("routine_day_id, week_number")
      .eq("routine_id", rutina.id)
      .eq("status", "completed");

    const idsDias = new Set(rutina.routine_days.map((dia) => dia.id));
    const completadas = new Set<string>();
    for (const fila of (hechas ?? []) as {
      routine_day_id: string | null;
      week_number: number | null;
    }[]) {
      if (
        fila.routine_day_id &&
        fila.week_number &&
        idsDias.has(fila.routine_day_id) &&
        fila.week_number >= 1 &&
        fila.week_number <= semanas
      ) {
        completadas.add(`${fila.routine_day_id}:${fila.week_number}`);
      }
    }
    diasHechos = completadas.size;
  }
  const porcentajePrograma =
    diasTotal > 0 ? Math.round((diasHechos / diasTotal) * 100) : 0;

  return (
    <div className="flex w-full flex-col gap-6">
      {/* Cabecera */}
      <Card className="flex flex-col items-center gap-6 sm:flex-row sm:p-8">
        <ProfileAvatar nombre={nombre} correo={correo} />
        <div className="flex min-w-0 flex-col items-center gap-1 text-center sm:items-start sm:text-left">
          <p className="max-w-full truncate text-3xl font-semibold tracking-tight">
            {nombre ?? "Tu perfil"}
          </p>
          <p className="max-w-full truncate text-muted">{correo ?? "—"}</p>
          {miembroDesde ? (
            <p className="text-sm text-muted">Miembro desde {miembroDesde}</p>
          ) : null}
        </div>
        <div className="flex items-center gap-3 sm:ml-auto">
          <StreakFlame etapa={etapa} size={56} />
          <div className="flex flex-col">
            <span className="text-2xl font-bold tabular-nums">{racha}</span>
            <span className="text-xs text-muted">
              {plural(racha, "día de racha", "días de racha")}
            </span>
          </div>
        </div>
      </Card>

      {/* Racha */}
      <Card
        className="relative overflow-hidden p-6 sm:p-8"
        style={{
          backgroundImage: `radial-gradient(circle at 15% 45%, ${paleta.brillo}22, transparent 60%)`,
        }}
      >
        <div className="flex flex-col items-center gap-6 sm:flex-row sm:gap-10">
          <StreakFlame etapa={etapa} size={150} />
          <div className="flex w-full min-w-0 flex-1 flex-col gap-4 text-center sm:text-left">
            <div className="flex flex-col gap-1">
              <p className="text-sm uppercase tracking-widest text-muted">
                Tu racha
              </p>
              <p className="text-5xl font-bold tabular-nums">
                {racha}{" "}
                <span className="text-2xl font-semibold text-muted">
                  {plural(racha, "día", "días")}
                </span>
              </p>
              <p className="text-lg font-semibold">{etapa.nombre}</p>
              <p className="text-sm text-muted">{mensajeRacha}</p>
            </div>

            {siguiente && faltan !== null ? (
              <div className="flex flex-col gap-2">
                <div
                  role="progressbar"
                  aria-label={`Progreso hacia ${siguiente.nombre}`}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={Math.round(progresoRacha * 100)}
                  className="h-2 w-full overflow-hidden rounded-full bg-surface-2"
                >
                  <div
                    className="h-full rounded-full transition-[width] duration-700"
                    style={{
                      width: `${Math.round(progresoRacha * 100)}%`,
                      backgroundImage: `linear-gradient(to right, ${paleta.brillo}, ${paleta.chispa})`,
                    }}
                  />
                </div>
                <p className="text-sm text-muted">
                  Faltan {faltan} {plural(faltan, "día", "días")} para «
                  {siguiente.nombre}»
                </p>
              </div>
            ) : (
              <p className="text-sm text-muted">
                Has llegado a la etapa más alta por ahora.
              </p>
            )}

            <p className="text-sm text-muted">
              Mejor racha:{" "}
              <span className="font-semibold text-foreground">{mejorRacha}</span>{" "}
              {plural(mejorRacha, "día", "días")}
            </p>
            <p className="text-xs text-muted">
              Cuenta tus días de entrenamiento seguidos, sin más de 2 días de
              descanso entre uno y otro.
            </p>
          </div>
        </div>
      </Card>

      {/* Esta semana */}
      <Card className="flex flex-col gap-4">
        <div className="flex items-baseline justify-between gap-3">
          <h2 className="text-xl font-semibold">Esta semana</h2>
          <span className="text-sm text-muted">
            {diasEstaSemana}{" "}
            {plural(diasEstaSemana, "día entrenado", "días entrenados")}
          </span>
        </div>
        <div className="grid grid-cols-7 gap-2">
          {semana.map((dia) => (
            <div key={dia.fecha} className="flex flex-col items-center gap-2">
              <span className="text-xs text-muted">{dia.letra}</span>
              <span
                className={cn(
                  "flex size-10 items-center justify-center rounded-full border text-sm",
                  dia.entrenado
                    ? "border-transparent bg-linear-to-br from-accent to-accent-hover text-white"
                    : "border-border bg-surface-2 text-muted",
                  dia.futuro && "opacity-50",
                  dia.esHoy &&
                    "ring-2 ring-accent ring-offset-2 ring-offset-background",
                )}
              >
                {dia.entrenado ? (
                  <svg
                    viewBox="0 0 24 24"
                    width="18"
                    height="18"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-label="Entrenado"
                  >
                    <path d="M5 13l4 4L19 7" />
                  </svg>
                ) : null}
              </span>
            </div>
          ))}
        </div>
      </Card>

      {/* Estadísticas */}
      <section aria-labelledby="estadisticas" className="flex flex-col gap-4">
        <h2 id="estadisticas" className="text-xl font-semibold">
          Tus números
        </h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <StatCard
            label="Entrenamientos"
            value={String(entrenamientos)}
            hint="Completados en total"
          />
          <StatCard
            label="Kilos totales"
            value={`${volumen.toLocaleString("es-ES")} kg`}
            hint="Peso × repeticiones"
          />
          <StatCard
            label="Mejor racha"
            value={`${mejorRacha} ${plural(mejorRacha, "día", "días")}`}
            hint="Tu récord de constancia"
          />
        </div>
      </section>

      {/* Récords y programa */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <Card className="flex flex-col gap-4">
          <div className="flex items-baseline justify-between gap-3">
            <h2 className="text-xl font-semibold">Tus récords</h2>
            <Link
              href="/progreso"
              className="text-sm font-semibold text-accent hover:underline"
            >
              Ver todo →
            </Link>
          </div>
          {records.length === 0 ? (
            <p className="text-muted">
              Cuando registres peso en tus ejercicios, aquí verás tus mejores
              marcas.
            </p>
          ) : (
            <ul className="flex flex-col gap-2">
              {records.map((registro) => (
                <li
                  key={registro.exerciseId}
                  className="flex items-center justify-between gap-4 rounded-2xl border border-border bg-surface-2 px-4 py-3"
                >
                  <div className="flex min-w-0 flex-col">
                    <span className="truncate font-medium">{registro.name}</span>
                    <span className="text-xs text-muted">
                      {etiquetaFecha(registro.day)}
                    </span>
                  </div>
                  <span className="shrink-0 text-lg font-semibold tabular-nums">
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
        </Card>

        <Card className="flex flex-col gap-4">
          <h2 className="text-xl font-semibold">Tu programa</h2>
          {rutina ? (
            <>
              <p className="text-lg font-medium">{rutina.name}</p>
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between text-sm text-muted">
                  <span>
                    {diasHechos} de {diasTotal} días completados
                  </span>
                  <span>{porcentajePrograma}%</span>
                </div>
                <div
                  role="progressbar"
                  aria-label="Días completados del programa"
                  aria-valuemin={0}
                  aria-valuemax={diasTotal}
                  aria-valuenow={diasHechos}
                  className="h-2 w-full overflow-hidden rounded-full bg-surface-2"
                >
                  <div
                    className="h-full rounded-full bg-linear-to-r from-accent to-orange-500 transition-[width] duration-700"
                    style={{ width: `${porcentajePrograma}%` }}
                  />
                </div>
              </div>
              <div>
                <ButtonLink href="/entrenar" variant="secondary">
                  Ir a entrenar
                </ButtonLink>
              </div>
            </>
          ) : (
            <>
              <p className="text-muted">
                Todavía no tienes ninguna rutina activa.
              </p>
              <div>
                <ButtonLink href="/rutinas">Ver rutinas</ButtonLink>
              </div>
            </>
          )}
        </Card>
      </div>

      {/* Logros (reservado) */}
      <Card className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-xl font-semibold">Logros</h2>
          <Badge>Próximamente</Badge>
        </div>
        <p className="text-muted">
          Aquí aparecerán tus insignias y retos, por ejemplo entrenar una
          semana completa o llegar a un peso en un ejercicio.
        </p>
      </Card>

      {/* Galería de etapas */}
      <section aria-labelledby="etapas" className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <h2 id="etapas" className="text-xl font-semibold">
            Etapas de la racha
          </h2>
          <p className="text-sm text-muted">
            Así evoluciona tu fuego. Pulsa «Ver evolución» para ver la
            animación de cada cambio.
          </p>
        </div>
        <StreakGallery racha={racha} />
      </section>

      {/* Cuenta */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="flex flex-col gap-4">
          <h2 className="text-xl font-semibold">Nombre</h2>
          <ProfileForm nombreInicial={nombre ?? ""} />
        </Card>

        <Card className="flex flex-col gap-4">
          <h2 className="text-xl font-semibold">Sesión</h2>
          <p className="text-muted">
            Cierra la sesión en este dispositivo cuando termines.
          </p>
          <form action={cerrarSesion}>
            <Button type="submit" variant="secondary">
              Cerrar sesión
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}