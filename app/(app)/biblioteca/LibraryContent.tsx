import { connection } from "next/server";
import { ExerciseCard } from "../../../components/exercises/ExerciseCard";
import { Alert } from "../../../components/ui/Alert";
import { Button } from "../../../components/ui/Button";
import { ButtonLink } from "../../../components/ui/ButtonLink";
import { Input } from "../../../components/ui/Input";
import { Select } from "../../../components/ui/Select";
import {
  DIFFICULTY_OPTIONS,
  EQUIPMENT_OPTIONS,
  MUSCLE_OPTIONS,
  escaparBusqueda,
  leerFiltros,
  type Exercise,
} from "../../../lib/exercises";
import { createClient } from "../../../lib/supabase/server";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export async function LibraryContent({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  // Depende de cada petición: se declara dinámico antes de hacer nada más.
  await connection();

  const filtros = leerFiltros(await searchParams);
  const supabase = await createClient();

  let consulta = supabase
    .from("exercises")
    .select(
      "id, slug, name, primary_muscles, secondary_muscles, equipment, movement_pattern, difficulty, instructions, common_mistakes",
    )
    .eq("is_active", true)
    .order("name")
    .limit(100);

  if (filtros.q) {
    consulta = consulta.ilike("name", `%${escaparBusqueda(filtros.q)}%`);
  }
  if (filtros.muscle) {
    consulta = consulta.contains("primary_muscles", [filtros.muscle]);
  }
  if (filtros.equipment) {
    consulta = consulta.eq("equipment", filtros.equipment);
  }
  if (filtros.difficulty) {
    consulta = consulta.eq("difficulty", filtros.difficulty);
  }

  const { data, error } = await consulta;

  if (error) {
    console.error("[biblioteca] error de Supabase:", error.code ?? error.message);
  }

  const ejercicios = (data ?? []) as Exercise[];

  return (
    <div className="flex flex-col gap-6">
      <form method="get" className="flex flex-col gap-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Input
            name="q"
            type="search"
            label="Buscar por nombre"
            placeholder="Por ejemplo: sentadilla"
            defaultValue={filtros.q}
            maxLength={50}
            autoComplete="off"
          />
          <Select
            name="musculo"
            label="Músculo principal"
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
        </div>
        <div className="flex flex-wrap gap-3">
          <Button type="submit">Buscar</Button>
          <ButtonLink href="/biblioteca" variant="secondary" size="md">
            Quitar filtros
          </ButtonLink>
        </div>
      </form>

      {error ? (
        <Alert tone="danger" title="No se pudo cargar la biblioteca">
          Inténtalo de nuevo en unos instantes.
        </Alert>
      ) : ejercicios.length === 0 ? (
        <Alert tone="info" title="Sin resultados">
          No hay ejercicios con esos filtros. Prueba a quitar alguno.
        </Alert>
      ) : (
        <section aria-label="Resultados" className="flex flex-col gap-3">
          <p className="text-sm text-muted">
            {ejercicios.length}{" "}
            {ejercicios.length === 1 ? "ejercicio" : "ejercicios"}
          </p>
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-2 2xl:grid-cols-3">
            {ejercicios.map((ejercicio) => (
              <ExerciseCard key={ejercicio.id} exercise={ejercicio} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}