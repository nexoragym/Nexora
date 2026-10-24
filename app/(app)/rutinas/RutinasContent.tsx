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
import { rutinaImagen } from "../../../lib/routines/images";
import {
  ACTIVE_ROUTINE_SELECT,
  type ActiveRoutine,
} from "../../../lib/routines/queries";
import { createClient } from "../../../lib/supabase/server";

export async function RutinasContent() {
  await connection();

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("routines")
    .select(ACTIVE_ROUTINE_SELECT)
    .eq("is_active", true)
    .maybeSingle();

  if (error) {
    console.error("[rutinas] error de Supabase:", error.code ?? "sin código");
    return (
      <Alert tone="danger" title="No se pudieron cargar tus rutinas">
        Inténtalo de nuevo en unos instantes.
      </Alert>
    );
  }

  const rutina = (data as unknown as ActiveRoutine | null) ?? null;

  if (!rutina) {
    return (
      <Card className="flex flex-col gap-4 border-accent/40 p-8">
        <Badge tone="accent" className="self-start">
          Primer paso
        </Badge>
        <h2 className="text-2xl font-semibold tracking-tight">
          Crea tu plan personalizado
        </h2>
        <p className="max-w-2xl text-muted">
          Todavía no tienes ninguna rutina.
        </p>
        <div>
          <ButtonLink href="/empezar" size="lg">
            Crear mi plan
          </ButtonLink>
        </div>
      </Card>
    );
  }

  // Sexo opcional: solo sirve para elegir la imagen de la tarjeta.
  const { data: preferencias } = await supabase
    .from("training_preferences")
    .select("sex")
    .maybeSingle();
  const sexo: string | null = preferencias?.sex ?? null;

  const imagen = rutinaImagen(sexo, rutina.focus);
  const fondo =
    "linear-gradient(to top, rgb(11 11 13 / 0.9), rgb(11 11 13 / 0.1)), " +
    `url(${imagen}), ` +
    "linear-gradient(135deg, #7f1d1d, #e11d2e 55%, #0b0b0d)";

  const objetivo = rutina.goal ? GOAL_LABELS[rutina.goal as Goal] : null;
  const enfoque =
    rutina.focus && rutina.focus !== "balanced"
      ? FOCUS_LABELS[rutina.focus as Focus]
      : null;
  const totalEjercicios = rutina.routine_days.reduce(
    (suma, dia) => suma + dia.routine_day_exercises.length,
    0,
  );

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3">
      <Card className="group flex flex-col overflow-hidden p-0 transition duration-200 hover:-translate-y-1 hover:border-accent/60">
        <div
          aria-hidden="true"
          className="h-56 bg-cover bg-center transition duration-500 group-hover:scale-[1.03]"
          style={{ backgroundImage: fondo }}
        />
        <div className="flex flex-col gap-4 p-6">
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone="accent">Activa</Badge>
            {objetivo ? <Badge>{objetivo}</Badge> : null}
            {enfoque ? <Badge>{enfoque}</Badge> : null}
          </div>
          <h2 className="text-2xl font-semibold tracking-tight">
            {rutina.name}
          </h2>
          <p className="text-sm text-muted">
            {rutina.program_weeks ? `${rutina.program_weeks} semanas` : null}
            {rutina.program_weeks && rutina.days_per_week ? " · " : null}
            {rutina.days_per_week
              ? `${rutina.days_per_week} sesiones por semana`
              : null}
            {" · "}
            {totalEjercicios} ejercicios
          </p>
          <div>
            <ButtonLink href="/entrenar" size="lg">
              Ver sesiones
            </ButtonLink>
          </div>
        </div>
      </Card>
    </div>
  );
}
