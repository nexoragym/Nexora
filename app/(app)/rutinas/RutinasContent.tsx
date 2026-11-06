import Link from "next/link";
import { connection } from "next/server";
import { Alert } from "../../../components/ui/Alert";
import { Badge } from "../../../components/ui/Badge";
import { DIFFICULTY_LABELS } from "../../../lib/exercises";
import { GOAL_LABELS } from "../../../lib/questionnaire";
import { listarRutinasCatalogo } from "../../../lib/routines/catalog";
import { portadaDeRutina } from "../../../lib/routines/portada";
import { createClient } from "../../../lib/supabase/server";

export async function RutinasContent() {
  await connection();

  const supabase = await createClient();
  const { rutinas, error: errorLista } = await listarRutinasCatalogo(supabase, {
    soloPublicadas: true,
  });

  // Solo para marcar cuál de las rutinas del catálogo es la que estás usando.
  const { data, error } = await supabase
    .from("routines")
    .select("catalog_slug")
    .eq("is_active", true)
    .maybeSingle();

  if (error) {
    console.error("[rutinas] error de Supabase:", error.code ?? "sin código");
  }
  const slugActivo: string | null = error ? null : (data?.catalog_slug ?? null);

  if (errorLista) {
    return (
      <Alert tone="danger" title="No se pudieron cargar las rutinas">
        Inténtalo de nuevo en unos instantes.
      </Alert>
    );
  }

  if (rutinas.length === 0) {
    return (
      <Alert tone="info" title="Todavía no hay rutinas publicadas">
        Vuelve a mirar pronto. Mientras tanto, puedes crear un plan
        personalizado.
      </Alert>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
      {rutinas.map((rutina) => {
        const fondo =
          "linear-gradient(to top, rgb(11 11 13 / 0.85), rgb(11 11 13 / 0.1)), " +
          `url("${portadaDeRutina(rutina.slug, rutina.coverPath)}"), ` +
          "linear-gradient(135deg, #7f1d1d, #e11d2e 55%, #0b0b0d)";

        return (
          <Link
            key={rutina.id}
            href={`/rutinas/${rutina.slug}`}
            className="group flex flex-col overflow-hidden rounded-3xl border border-border bg-surface transition duration-200 hover:-translate-y-1 hover:border-accent/60"
          >
            <div
              aria-hidden="true"
              className="h-44 bg-cover bg-center transition duration-500 group-hover:scale-[1.03]"
              style={{ backgroundImage: fondo }}
            />
            <div className="flex flex-1 flex-col gap-3 p-6">
              <div className="flex flex-wrap items-center gap-2">
                {slugActivo === rutina.slug ? (
                  <Badge tone="accent">Activa</Badge>
                ) : null}
                <Badge>{GOAL_LABELS[rutina.goal]}</Badge>
                <Badge>{DIFFICULTY_LABELS[rutina.level]}</Badge>
              </div>
              <h2 className="text-xl font-semibold tracking-tight">
                {rutina.name}
              </h2>
              <p className="text-sm text-muted">{rutina.description}</p>
              <p className="text-sm text-muted">
                {rutina.weeks} semanas · {rutina.daysCount} días por semana
              </p>
              <span className="mt-auto pt-2 text-sm font-semibold text-accent transition group-hover:translate-x-1">
                Ver rutina →
              </span>
            </div>
          </Link>
        );
      })}
    </div>
  );
}