import { hoyEnZona } from "../../../../lib/stats";
import { createClient } from "../../../../lib/supabase/server";

const TAM_PAGINA = 100;
const MAX_PAGINAS = 100;

const RUTINAS_SELECT =
  "id, name, source, catalog_slug, goal, focus, program_weeks, days_per_week, is_active, " +
  "start_date, notes, warnings, created_at, " +
  "routine_days(day_number, name, " +
  "routine_day_exercises(sort_order, target_sets, reps_min, reps_max, rest_seconds, notes, " +
  "exercises(slug, name)))";

const SESIONES_SELECT =
  "id, routine_name, day_name, status, week_number, started_at, ended_at, " +
  "workout_sets(exercise_name, set_number, weight_kg, reps, is_completed)";

// Descarga todos los datos de la persona que lo pide (la base de datos solo le deja ver los suyos).
export async function GET() {
  const supabase = await createClient();
  const { data: claims } = await supabase.auth.getClaims();
  const cuenta = claims?.claims;
  if (!cuenta?.sub) {
    return new Response("No autorizado", { status: 401 });
  }

  const [perfil, preferencias, rutinas] = await Promise.all([
    supabase.from("profiles").select("*").maybeSingle(),
    supabase.from("training_preferences").select("*").maybeSingle(),
    supabase.from("routines").select(RUTINAS_SELECT).order("created_at"),
  ]);

  if (perfil.error || preferencias.error || rutinas.error) {
    console.error(
      "[exportar] error de Supabase:",
      perfil.error?.code ?? preferencias.error?.code ?? rutinas.error?.code ?? "sin código",
    );
    return new Response("No se pudo exportar", { status: 500 });
  }

  const entrenamientos: unknown[] = [];
  for (let pagina = 0; pagina < MAX_PAGINAS; pagina += 1) {
    const { data, error } = await supabase
      .from("workout_sessions")
      .select(SESIONES_SELECT)
      .order("started_at", { ascending: true })
      .order("id")
      .range(pagina * TAM_PAGINA, pagina * TAM_PAGINA + TAM_PAGINA - 1);

    if (error) {
      console.error("[exportar] error al leer sesiones:", error.code ?? "sin código");
      return new Response("No se pudo exportar", { status: 500 });
    }
    const lote = (data ?? []) as unknown[];
    entrenamientos.push(...lote);
    if (lote.length < TAM_PAGINA) break;
  }

  const cuerpo = JSON.stringify(
    {
      exportado_el: new Date().toISOString(),
      cuenta: {
        id: cuenta.sub,
        correo: typeof cuenta.email === "string" ? cuenta.email : null,
      },
      perfil: perfil.data,
      preferencias_de_entrenamiento: preferencias.data,
      rutinas: rutinas.data ?? [],
      entrenamientos,
    },
    null,
    2,
  );

  return new Response(cuerpo, {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": `attachment; filename="nexora-mis-datos-${hoyEnZona()}.json"`,
      "Cache-Control": "no-store",
    },
  });
}