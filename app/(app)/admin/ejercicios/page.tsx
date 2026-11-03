import type { Metadata } from "next";
import { connection } from "next/server";
import { Suspense } from "react";
import { PageContainer, PageHeader } from "../../../../components/layout/Page";
import { Alert } from "../../../../components/ui/Alert";
import { Button } from "../../../../components/ui/Button";
import { ButtonLink } from "../../../../components/ui/ButtonLink";
import { Input } from "../../../../components/ui/Input";
import { Select } from "../../../../components/ui/Select";
import { exigirSuperadmin } from "../../../../lib/admin/guard";
import {
  DIFFICULTY_OPTIONS,
  EQUIPMENT_OPTIONS,
  MUSCLE_OPTIONS,
  escaparBusqueda,
  leerFiltros,
  palabrasDeBusqueda,
} from "../../../../lib/exercises";
import { ExerciseTable, type FilaEjercicioTabla } from "./ExerciseTable";

export const metadata: Metadata = { title: "Ejercicios · Admin" };

type SearchParams = Promise<Record<string, string | string[] | undefined>>;
type Params = Record<string, string | string[] | undefined>;

const OPCIONES_ESTADO = [
  { value: "activos", label: "Activos" },
  { value: "inactivos", label: "Desactivados" },
];

const OPCIONES_MEDIOS = [
  { value: "sin_imagen", label: "Sin imagen" },
  { value: "sin_video", label: "Sin vídeo" },
  { value: "completos", label: "Con imagen y vídeo" },
];

function primero(valor: string | string[] | undefined): string {
  return Array.isArray(valor) ? (valor[0] ?? "") : (valor ?? "");
}

function leerEstado(params: Params): "todos" | "activos" | "inactivos" {
  const valor = primero(params.estado);
  return valor === "activos" || valor === "inactivos" ? valor : "todos";
}

function leerMedios(
  params: Params,
): "todos" | "sin_imagen" | "sin_video" | "completos" {
  const valor = primero(params.medios);
  return valor === "sin_imagen" || valor === "sin_video" || valor === "completos"
    ? valor
    : "todos";
}

async function ListaEjercicios({ searchParams }: { searchParams: SearchParams }) {
  await connection();
  const supabase = await exigirSuperadmin();

  const params = await searchParams;
  const filtros = leerFiltros(params);
  const estado = leerEstado(params);
  const medios = leerMedios(params);

  let consulta = supabase
    .from("exercises")
    .select(
      "id, slug, name, primary_muscles, equipment, difficulty, aliases, use_in_generator, popularity, is_active, image_path, video_path",
    )
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
  if (medios === "sin_imagen") consulta = consulta.is("image_path", null);
  if (medios === "sin_video") consulta = consulta.is("video_path", null);
  if (medios === "completos") {
    consulta = consulta.not("image_path", "is", null).not("video_path", "is", null);
  }

  const { data, error } = await consulta;
  if (error) {
    console.error("[admin] error al listar ejercicios:", error.code ?? error.message);
  }
  const ejercicios = (data ?? []) as FilaEjercicioTabla[];

  return (
    <div className="flex flex-col gap-6">
      <form method="get" className="flex flex-col gap-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-6">
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
          <Select
            name="medios"
            label="Imagen y vídeo"
            placeholder="Todos"
            options={OPCIONES_MEDIOS}
            defaultValue={medios === "todos" ? "" : medios}
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
          Si acabas de actualizar la aplicación, comprueba que has ejecutado la
          migración 0014 en Supabase.
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
          <ExerciseTable ejercicios={ejercicios} />
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
        <div className="flex flex-wrap gap-3">
          <ButtonLink href="/admin/ejercicios/importar" variant="secondary" size="lg">
            Importar JSON
          </ButtonLink>
          {/* Enlace normal (no Link): es una descarga de archivo */}
          <a
            href="/admin/ejercicios/exportar"
            download
            className="inline-flex items-center justify-center rounded-2xl border border-border bg-surface-2 px-6 py-3 text-lg font-semibold text-foreground transition hover:bg-border"
          >
            Exportar JSON
          </a>
          <ButtonLink href="/admin/ejercicios/nuevo" size="lg">
            Nuevo ejercicio
          </ButtonLink>
        </div>
      </div>
      <Suspense
        fallback={<div className="h-96 animate-pulse rounded-3xl bg-surface-2" />}
      >
        <ListaEjercicios searchParams={searchParams} />
      </Suspense>
    </PageContainer>
  );
}