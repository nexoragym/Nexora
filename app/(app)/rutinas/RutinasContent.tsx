import Link from "next/link";
import { connection } from "next/server";
import { Alert } from "../../../components/ui/Alert";
import { Badge } from "../../../components/ui/Badge";
import { Button } from "../../../components/ui/Button";
import { ButtonLink } from "../../../components/ui/ButtonLink";
import { Input } from "../../../components/ui/Input";
import { Select } from "../../../components/ui/Select";
import {
  DIFFICULTIES,
  DIFFICULTY_LABELS,
} from "../../../lib/exercises";
import {
  DAYS_OPTIONS,
  FOCUSES,
  FOCUS_LABELS,
  GOALS,
  GOAL_LABELS,
} from "../../../lib/questionnaire";
import {
  MATERIALES_FILTRO,
  MATERIAL_FILTRO_LABELS,
  filtrarRutinas,
  leerFiltrosRutinas,
  leerRutinasPublicadas,
  paginar,
  portadaListada,
  type FiltrosRutinas,
} from "../../../lib/routines/filtros";
import { createClient } from "../../../lib/supabase/server";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

const OPCIONES_OBJETIVO = GOALS.map((v) => ({ value: v, label: GOAL_LABELS[v] }));
const OPCIONES_NIVEL = DIFFICULTIES.map((v) => ({ value: v, label: DIFFICULTY_LABELS[v] }));
const OPCIONES_MATERIAL = MATERIALES_FILTRO.map((v) => ({
  value: v,
  label: MATERIAL_FILTRO_LABELS[v],
}));
const OPCIONES_ENFOQUE = FOCUSES.map((v) => ({ value: v, label: FOCUS_LABELS[v] }));

// Dirección de otra página conservando los filtros.
function hrefPagina(filtros: FiltrosRutinas, pagina: number): string {
  const params = new URLSearchParams();
  if (filtros.q) params.set("q", filtros.q);
  if (filtros.goal) params.set("objetivo", filtros.goal);
  if (filtros.level) params.set("nivel", filtros.level);
  if (filtros.days !== null) params.set("dias", String(filtros.days));
  if (filtros.material) params.set("material", filtros.material);
  if (filtros.focus) params.set("enfoque", filtros.focus);
  if (pagina > 1) params.set("pagina", String(pagina));
  const texto = params.toString();
  return texto ? `/rutinas?${texto}` : "/rutinas";
}

export async function RutinasContent({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  await connection();

  const filtros = leerFiltrosRutinas(await searchParams);
  const supabase = await createClient();

  const { rutinas, error: errorLista } = await leerRutinasPublicadas(supabase);

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

  const filtradas = filtrarRutinas(rutinas, filtros);
  const { items, pagina, totalPaginas } = paginar(filtradas, filtros.page);
  const hayFiltros =
    filtros.q !== "" ||
    filtros.goal !== "" ||
    filtros.level !== "" ||
    filtros.days !== null ||
    filtros.material !== "" ||
    filtros.focus !== "";

  return (
    <div className="flex flex-col gap-6">
      <form method="get" className="flex flex-col gap-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-6">
          <Input
            name="q"
            type="search"
            label="Buscar"
            placeholder="Por ejemplo, pecho"
            defaultValue={filtros.q}
            maxLength={50}
            autoComplete="off"
          />
          <Select
            name="objetivo"
            label="Objetivo"
            placeholder="Todos"
            options={OPCIONES_OBJETIVO}
            defaultValue={filtros.goal}
          />
          <Select
            name="nivel"
            label="Nivel"
            placeholder="Todos"
            options={OPCIONES_NIVEL}
            defaultValue={filtros.level}
          />
          <Select
            name="dias"
            label="Días por semana"
            placeholder="Cualquiera"
            options={DAYS_OPTIONS}
            defaultValue={filtros.days === null ? "" : String(filtros.days)}
          />
          <Select
            name="material"
            label="Mi material"
            placeholder="Todo"
            options={OPCIONES_MATERIAL}
            defaultValue={filtros.material}
          />
          <Select
            name="enfoque"
            label="Enfoque"
            placeholder="Todos"
            options={OPCIONES_ENFOQUE}
            defaultValue={filtros.focus}
          />
        </div>
        <div className="flex flex-wrap gap-3">
          <Button type="submit">Buscar</Button>
          {hayFiltros ? (
            <ButtonLink href="/rutinas" variant="secondary" size="md">
              Quitar filtros
            </ButtonLink>
          ) : null}
        </div>
      </form>

      <p className="text-sm text-muted" aria-live="polite">
        {filtradas.length} {filtradas.length === 1 ? "rutina" : "rutinas"}
      </p>

      {filtradas.length === 0 ? (
        <Alert tone="info" title="Sin resultados">
          No hay rutinas con esos filtros. Prueba a quitar alguno.
        </Alert>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {items.map((rutina) => {
            const fondo =
              "linear-gradient(to top, rgb(11 11 13 / 0.85), rgb(11 11 13 / 0.1)), " +
              `url("${portadaListada(rutina)}"), ` +
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
      )}

      {totalPaginas > 1 ? (
        <nav
          aria-label="Páginas de rutinas"
          className="flex flex-wrap items-center justify-between gap-3"
        >
          {pagina > 1 ? (
            <ButtonLink href={hrefPagina(filtros, pagina - 1)} variant="secondary" size="md">
              ← Anterior
            </ButtonLink>
          ) : (
            <span />
          )}
          <span className="text-sm text-muted">
            Página {pagina} de {totalPaginas}
          </span>
          {pagina < totalPaginas ? (
            <ButtonLink href={hrefPagina(filtros, pagina + 1)} variant="secondary" size="md">
              Siguiente →
            </ButtonLink>
          ) : (
            <span />
          )}
        </nav>
      ) : null}
    </div>
  );
}