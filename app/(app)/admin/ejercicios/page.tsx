import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { Suspense } from "react";
import { PageContainer, PageHeader } from "../../../../components/layout/Page";
import { Alert } from "../../../../components/ui/Alert";
import { Badge, type BadgeTone } from "../../../../components/ui/Badge";
import { Button } from "../../../../components/ui/Button";
import { ButtonLink } from "../../../../components/ui/ButtonLink";
import { Input } from "../../../../components/ui/Input";
import { Select } from "../../../../components/ui/Select";
import { ALIAS_RECOMENDADOS } from "../../../../lib/admin/exercise-form";
import { exigirSuperadmin } from "../../../../lib/admin/guard";
import {
  DIFFICULTY_LABELS,
  DIFFICULTY_OPTIONS,
  EQUIPMENT_LABELS,
  EQUIPMENT_OPTIONS,
  MUSCLE_LABELS,
  MUSCLE_OPTIONS,
  escaparBusqueda,
  leerFiltros,
  palabrasDeBusqueda,
  type Difficulty,
  type Equipment,
  type Muscle,
} from "../../../../lib/exercises";

export const metadata: Metadata = { title: "Ejercicios · Admin" };

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

type FilaEjercicio = {
  id: string;
  slug: string;
  name: string;
  primary_muscles: Muscle[];
  equipment: Equipment;
  difficulty: Difficulty;
  aliases: string[] | null;
  is_active: boolean;
};

const tonoNivel: Record<Difficulty, BadgeTone> = {
  beginner: "success",
  intermediate: "warning",
  advanced: "danger",
};

const OPCIONES_ESTADO = [
  { value: "activos", label: "Activos" },
  { value: "inactivos", label: "Desactivados" },
];

function leerEstado(
  params: Record<string, string | string[] | undefined>,
): "todos" | "activos" | "inactivos" {
  const valor = Array.isArray(params.estado) ? params.estado[0] : params.estado;
  return valor === "activos" || valor === "inactivos" ? valor : "todos";
}

async function ListaEjercicios({ searchParams }: { searchParams: SearchParams }) {
  await connection();
  const supabase = await exigirSuperadmin();

  const params = await searchParams;
  const filtros = leerFiltros(params);
  const estado = leerEstado(params);

  let consulta = supabase
    .from("exercises")
    .select("id, slug, name, primary_muscles, equipment, difficulty, aliases, is_active")
    .order("name")
    .limit(500);

  for (const palabra of palabrasDeBusqueda(filtros.q)) {
    consulta = consulta.ilike("search_text", `%${escaparBusqueda(palabra)}%`);
  }
  if (filtros.muscle) consulta = consulta.contains("primary_muscles", [filtros.muscle]);
  if (filtros.equipment) consulta = consulta.eq("equipment", filtros.equipment);
  if (filtros.difficulty) consulta = consulta.eq("difficulty", filtros.difficulty);
  if (estado === "activos") consulta = consulta.eq("is_active", true);
  if (estado === "inactivos") consulta = consulta.eq("is_active", false);

  const { data, error } = await consulta;
  if (error) {
    console.error("[admin] error al listar ejercicios:", error.code ?? error.message);
  }
  const ejercicios = (data ?? []) as FilaEjercicio[];

  return (
    <div className="flex flex-col gap-6">
      <form method="get" className="flex flex-col gap-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
          <Input
            name="q"
            type="search"
            label="Buscar"
            placeholder="Nombre u otro nombre"
            defaultValue={filtros.q}
            maxLength={50}
            autoComplete="off"
          />
          <Select
            name="musculo"
            label="Músculo"
            placeholder="Todos"
            options={MUSCLE_OPTIONS}
            defaultValue={filtros.muscle}
          />
          <Select
            name="material"
            label="Material"
            placeholder="Todo"
            options={EQUIPMENT_OPTIONS}
            defaultValue={filtros.equipment}
          />
          <Select
            name="nivel"
            label="Nivel"
            placeholder="Todos"
            options={DIFFICULTY_OPTIONS}
            defaultValue={filtros.difficulty}
          />
          <Select
            name="estado"
            label="Estado"
            placeholder="Todos"
            options={OPCIONES_ESTADO}
            defaultValue={estado === "todos" ? "" : estado}
          />
        </div>
        <div className="flex flex-wrap gap-3">
          <Button type="submit">Buscar</Button>
          <ButtonLink href="/admin/ejercicios" variant="secondary" size="md">
            Quitar filtros
          </ButtonLink>
        </div>
      </form>

      {error ? (
        <Alert tone="danger" title="No se pudo cargar la lista">
          Inténtalo de nuevo en unos instantes.
        </Alert>
      ) : ejercicios.length === 0 ? (
        <Alert tone="info" title="Sin resultados">
          No hay ejercicios con esa búsqueda.
        </Alert>
      ) : (
        <section aria-label="Resultados" className="flex flex-col gap-3">
          <p className="text-sm text-muted">
            {ejercicios.length}{" "}
            {ejercicios.length === 1 ? "ejercicio" : "ejercicios"}
          </p>
          <div className="overflow-x-auto rounded-3xl border border-border bg-surface">
            <table className="w-full min-w-[56rem] text-left text-sm">
              <thead className="border-b border-border text-muted">
                <tr>
                  <th className="px-4 py-3 font-medium">Ejercicio</th>
                  <th className="px-4 py-3 font-medium">Músculo</th>
                  <th className="px-4 py-3 font-medium">Material</th>
                  <th className="px-4 py-3 font-medium">Nivel</th>
                  <th className="px-4 py-3 font-medium">Otros nombres</th>
                  <th className="px-4 py-3 font-medium">Estado</th>
                  <th className="px-4 py-3 font-medium">
                    <span className="sr-only">Acciones</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {ejercicios.map((fila) => {
                  const numAlias = (fila.aliases ?? []).length;
                  return (
                    <tr
                      key={fila.id}
                      className="border-b border-border last:border-0 hover:bg-surface-2/50"
                    >
                      <td className="px-4 py-3">
                        <div className="font-medium">{fila.name}</div>
                        <div className="text-xs text-muted">{fila.slug}</div>
                      </td>
                      <td className="px-4 py-3 text-muted">
                        {fila.primary_muscles
                          .map((musculo) => MUSCLE_LABELS[musculo])
                          .join(", ")}
                      </td>
                      <td className="px-4 py-3 text-muted">
                        {EQUIPMENT_LABELS[fila.equipment]}
                      </td>
                      <td className="px-4 py-3">
                        <Badge tone={tonoNivel[fila.difficulty]}>
                          {DIFFICULTY_LABELS[fila.difficulty]}
                        </Badge>
                      </td>
                      <td
                        className={
                          numAlias >= ALIAS_RECOMENDADOS
                            ? "px-4 py-3 text-success"
                            : "px-4 py-3 text-warning"
                        }
                      >
                        {numAlias}
                      </td>
                      <td className="px-4 py-3">
                        {fila.is_active ? (
                          <Badge tone="success">Activo</Badge>
                        ) : (
                          <Badge>Desactivado</Badge>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Link
                          href={`/admin/ejercicios/${fila.id}`}
                          className="font-semibold text-accent hover:underline"
                        >
                          Editar
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}

export default function AdminEjerciciosPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  return (
    <PageContainer>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <PageHeader
          title="Ejercicios"
          description="Todos los ejercicios de la biblioteca, también los desactivados."
        />
        <ButtonLink href="/admin/ejercicios/nuevo" size="lg">
          Nuevo ejercicio
        </ButtonLink>
      </div>
      <Suspense
        fallback={<div className="h-96 animate-pulse rounded-3xl bg-surface-2" />}
      >
        <ListaEjercicios searchParams={searchParams} />
      </Suspense>
    </PageContainer>
  );
}