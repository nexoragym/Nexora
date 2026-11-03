import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { Suspense } from "react";
import { ExerciseForm, type EjercicioEditable } from "../../../../../components/admin/ExerciseForm";
import { MediaUploader } from "../../../../../components/admin/MediaUploader";
import { PageContainer } from "../../../../../components/layout/Page";
import { Alert } from "../../../../../components/ui/Alert";
import { Badge } from "../../../../../components/ui/Badge";
import { Button } from "../../../../../components/ui/Button";
import { Card } from "../../../../../components/ui/Card";
import { exigirSuperadmin } from "../../../../../lib/admin/guard";
import { formatearFechaAdmin } from "../../../../../lib/admin/audit";
import type {
  Difficulty,
  Equipment,
  MovementPattern,
  Muscle,
} from "../../../../../lib/exercises";
import { ZONA_HORARIA } from "../../../../../lib/stats";
import { cambiarActivoEjercicio, duplicarEjercicio } from "../actions";

export const metadata: Metadata = { title: "Editar ejercicio · Admin" };

const UUID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

type FilaEjercicio = {
  id: string;
  slug: string;
  name: string;
  primary_muscles: Muscle[];
  secondary_muscles: Muscle[];
  equipment: Equipment;
  movement_pattern: MovementPattern;
  difficulty: Difficulty;
  instructions: string[];
  common_mistakes: string[];
  aliases: string[] | null;
  use_in_generator: boolean | null;
  popularity: number | null;
  is_active: boolean;
  image_path: string | null;
  video_path: string | null;
  created_at: string;
  updated_at: string;
};

type PageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

async function EditarEjercicio({ params, searchParams }: PageProps) {
  await connection();
  const supabase = await exigirSuperadmin();

  const { id } = await params;
  if (!UUID.test(id)) notFound();

  const { data, error } = await supabase
    .from("exercises")
    .select(
      "id, slug, name, primary_muscles, secondary_muscles, equipment, movement_pattern, difficulty, instructions, common_mistakes, aliases, use_in_generator, popularity, is_active, image_path, video_path, created_at, updated_at",
    )
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.error("[admin] error al leer el ejercicio:", error.code ?? error.message);
    return (
      <Alert tone="danger" title="No se pudo cargar el ejercicio">
        Inténtalo de nuevo en unos instantes.
      </Alert>
    );
  }

  const fila = (data as unknown as FilaEjercicio | null) ?? null;
  if (!fila) notFound();

  const recien = (await searchParams).creado === "1";

  const ejercicio: EjercicioEditable = {
    id: fila.id,
    slug: fila.slug,
    name: fila.name,
    primaryMuscles: fila.primary_muscles,
    secondaryMuscles: fila.secondary_muscles,
    equipment: fila.equipment,
    movementPattern: fila.movement_pattern,
    difficulty: fila.difficulty,
    instructions: fila.instructions,
    commonMistakes: fila.common_mistakes,
    aliases: fila.aliases ?? [],
    useInGenerator: fila.use_in_generator ?? true,
    popularity: fila.popularity ?? 0,
    isActive: fila.is_active,
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4">
        <Link
          href="/admin/ejercicios"
          className="text-sm text-muted transition hover:text-foreground"
        >
          ← Volver a Ejercicios
        </Link>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-3xl font-semibold tracking-tight">{fila.name}</h1>
          {fila.is_active ? (
            <Badge tone="success">Activo</Badge>
          ) : (
            <Badge>Desactivado</Badge>
          )}
        </div>
        <p className="text-sm text-muted">
          Identificador: {fila.slug} · Creado el{" "}
          {formatearFechaAdmin(fila.created_at, ZONA_HORARIA)} · Última edición{" "}
          {formatearFechaAdmin(fila.updated_at, ZONA_HORARIA)}
        </p>
        {recien ? (
          <Alert tone="success" title="Ejercicio creado">
            Ya puedes seguir editándolo.
            {fila.is_active
              ? ""
              : " Esta copia está desactivada: actívala cuando esté lista."}
          </Alert>
        ) : null}
      </div>

      <section aria-labelledby="medios" className="flex flex-col gap-4">
        <h2 id="medios" className="text-xl font-semibold">
          Imagen y vídeo
        </h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <MediaUploader
            exerciseId={fila.id}
            tipo="image"
            rutaInicial={fila.image_path}
            titulo="Imagen"
            ayuda="JPG, PNG o WebP. Lo ideal: horizontal 4:3 (por ejemplo 1200×900) y menos de 300 KB."
          />
          <MediaUploader
            exerciseId={fila.id}
            tipo="video"
            rutaInicial={fila.video_path}
            titulo="Vídeo o animación"
            ayuda="MP4 o WebM. Lo ideal: bucle de 5 a 8 segundos, 720p, sin sonido y menos de 5 MB."
          />
        </div>
      </section>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_20rem]">
        <ExerciseForm modo="editar" ejercicio={ejercicio} />

        <aside className="flex flex-col gap-4 xl:sticky xl:top-6 xl:self-start">
          <Card className="flex flex-col gap-3">
            <h2 className="text-lg font-semibold">
              {fila.is_active ? "Desactivar" : "Activar"}
            </h2>
            <p className="text-sm text-muted">
              {fila.is_active
                ? "Desaparece de la Biblioteca y del generador. Las rutinas que ya lo usan siguen funcionando."
                : "Volverá a aparecer en la Biblioteca y en el generador."}
            </p>
            <form action={cambiarActivoEjercicio}>
              <input type="hidden" name="id" value={fila.id} />
              <input
                type="hidden"
                name="activo"
                value={fila.is_active ? "false" : "true"}
              />
              <Button type="submit" variant="secondary" fullWidth>
                {fila.is_active ? "Desactivar ejercicio" : "Activar ejercicio"}
              </Button>
            </form>
          </Card>

          <Card className="flex flex-col gap-3">
            <h2 className="text-lg font-semibold">Duplicar</h2>
            <p className="text-sm text-muted">
              Crea una copia desactivada para hacer una variante sin empezar de
              cero. La copia no incluye imagen ni vídeo.
            </p>
            <form action={duplicarEjercicio}>
              <input type="hidden" name="id" value={fila.id} />
              <Button type="submit" variant="secondary" fullWidth>
                Duplicar ejercicio
              </Button>
            </form>
          </Card>

          {fila.is_active ? (
            <Link
              href={`/biblioteca?q=${encodeURIComponent(fila.name)}`}
              className="text-sm font-semibold text-accent hover:underline"
            >
              Ver en la Biblioteca →
            </Link>
          ) : null}
        </aside>
      </div>
    </div>
  );
}

export default function EditarEjercicioPage({ params, searchParams }: PageProps) {
  return (
    <PageContainer>
      <Suspense
        fallback={<div className="h-96 animate-pulse rounded-3xl bg-surface-2" />}
      >
        <EditarEjercicio params={params} searchParams={searchParams} />
      </Suspense>
    </PageContainer>
  );
}