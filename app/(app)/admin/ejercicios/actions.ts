"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { anotarAccionAdmin } from "../../../../lib/admin/audit";
import { esSuperadmin } from "../../../../lib/admin/guard";
import {
  leerFormularioEjercicio,
  type EjercicioFormulario,
  type EstadoFormulario,
} from "../../../../lib/admin/exercise-form";
import { createClient } from "../../../../lib/supabase/server";

const UUID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const NO_AUTORIZADO = "No tienes permiso para hacer esto.";
const ERROR_GENERICO = "No se pudo guardar. Inténtalo de nuevo.";

const SELECT_EJERCICIO =
  "name, primary_muscles, secondary_muscles, equipment, movement_pattern, difficulty, instructions, common_mistakes, aliases, use_in_generator, popularity, is_active";

function columnas(valores: EjercicioFormulario) {
  return {
    name: valores.name,
    primary_muscles: valores.primaryMuscles,
    secondary_muscles: valores.secondaryMuscles,
    equipment: valores.equipment,
    movement_pattern: valores.movementPattern,
    difficulty: valores.difficulty,
    instructions: valores.instructions,
    common_mistakes: valores.commonMistakes,
    aliases: valores.aliases,
    use_in_generator: valores.useInGenerator,
    popularity: valores.popularity,
    is_active: valores.isActive,
  };
}

type Campo = keyof ReturnType<typeof columnas>;

const CAMPOS: Campo[] = [
  "name",
  "primary_muscles",
  "secondary_muscles",
  "equipment",
  "movement_pattern",
  "difficulty",
  "instructions",
  "common_mistakes",
  "aliases",
  "use_in_generator",
  "popularity",
  "is_active",
];

function refrescar(id?: string) {
  revalidatePath("/admin");
  revalidatePath("/admin/ejercicios");
  revalidatePath("/admin/historial");
  revalidatePath("/biblioteca");
  if (id) revalidatePath(`/admin/ejercicios/${id}`);
}

export async function crearEjercicio(
  _previo: EstadoFormulario,
  formData: FormData,
): Promise<EstadoFormulario> {
  const supabase = await createClient();
  if (!(await esSuperadmin(supabase))) return { error: NO_AUTORIZADO };

  const { valores, errores } = leerFormularioEjercicio(formData, "crear");
  if (!valores) return { errores };

  const { data, error } = await supabase
    .from("exercises")
    .insert({ slug: valores.slug, ...columnas(valores) })
    .select("id")
    .single();

  if (error || !data) {
    if (error?.code === "23505") {
      return {
        errores: {
          slug: "Ya existe un ejercicio con ese identificador. Cambia el nombre o el identificador.",
        },
      };
    }
    console.error("[admin] error al crear el ejercicio:", error?.code ?? "sin código");
    return { error: ERROR_GENERICO };
  }

  const id = data.id as string;
  await anotarAccionAdmin(supabase, "exercise.create", id, {
    slug: valores.slug,
    name: valores.name,
  });
  refrescar(id);
  redirect(`/admin/ejercicios/${id}?creado=1`);
}

export async function guardarEjercicio(
  _previo: EstadoFormulario,
  formData: FormData,
): Promise<EstadoFormulario> {
  const supabase = await createClient();
  if (!(await esSuperadmin(supabase))) return { error: NO_AUTORIZADO };

  const id = formData.get("id");
  if (typeof id !== "string" || !UUID.test(id)) return { error: ERROR_GENERICO };

  const { valores, errores } = leerFormularioEjercicio(formData, "editar");
  if (!valores) return { errores };

  const { data: previo, error: errorLectura } = await supabase
    .from("exercises")
    .select(SELECT_EJERCICIO)
    .eq("id", id)
    .maybeSingle();

  const anterior = previo as unknown as Record<string, unknown> | null;
  if (errorLectura || !anterior) {
    console.error("[admin] error al leer el ejercicio:", errorLectura?.code ?? "no existe");
    return { error: ERROR_GENERICO };
  }

  const nuevo = columnas(valores);
  const cambios = CAMPOS.filter(
    (campo) => JSON.stringify(anterior[campo]) !== JSON.stringify(nuevo[campo]),
  );
  if (cambios.length === 0) return { ok: true };

  const { data: actualizado, error } = await supabase
    .from("exercises")
    .update(nuevo)
    .eq("id", id)
    .select("id");

  if (error || !actualizado || actualizado.length === 0) {
    console.error("[admin] error al guardar el ejercicio:", error?.code ?? "sin filas");
    return { error: ERROR_GENERICO };
  }

  await anotarAccionAdmin(supabase, "exercise.update", id, {
    name: valores.name,
    changed: cambios,
  });
  refrescar(id);
  return { ok: true };
}

// Activa o desactiva un ejercicio (no se borra: las rutinas que lo usan siguen funcionando).
export async function cambiarActivoEjercicio(formData: FormData): Promise<void> {
  const supabase = await createClient();
  if (!(await esSuperadmin(supabase))) return;

  const id = formData.get("id");
  const activo = formData.get("activo") === "true";
  if (typeof id !== "string" || !UUID.test(id)) return;

  const { data, error } = await supabase
    .from("exercises")
    .update({ is_active: activo })
    .eq("id", id)
    .select("name");

  if (error || !data || data.length === 0) {
    console.error("[admin] error al cambiar el estado:", error?.code ?? "sin filas");
    return;
  }

  await anotarAccionAdmin(
    supabase,
    activo ? "exercise.activate" : "exercise.deactivate",
    id,
    { name: data[0].name },
  );
  refrescar(id);
}

// Crea una copia desactivada del ejercicio, para hacer una variante sin empezar de cero.
export async function duplicarEjercicio(formData: FormData): Promise<void> {
  const supabase = await createClient();
  if (!(await esSuperadmin(supabase))) return;

  const id = formData.get("id");
  if (typeof id !== "string" || !UUID.test(id)) return;

  const { data, error } = await supabase
    .from("exercises")
    .select(`slug, ${SELECT_EJERCICIO}`)
    .eq("id", id)
    .maybeSingle();

  const original = data as unknown as
    | (Record<string, unknown> & { slug: string; name: string })
    | null;
  if (error || !original) {
    console.error("[admin] error al leer el ejercicio a duplicar:", error?.code ?? "no existe");
    return;
  }

  const base = `${original.slug}-copia`.slice(0, 70);
  const { data: existentes } = await supabase
    .from("exercises")
    .select("slug")
    .like("slug", `${base}%`);
  const usados = new Set(
    ((existentes ?? []) as { slug: string }[]).map((fila) => fila.slug),
  );
  let nuevoSlug = base;
  let numero = 2;
  while (usados.has(nuevoSlug)) {
    nuevoSlug = `${base}-${numero}`;
    numero += 1;
  }

  const { data: creado, error: errorCrear } = await supabase
    .from("exercises")
    .insert({
      slug: nuevoSlug,
      name: `${original.name} (copia)`.slice(0, 100),
      primary_muscles: original.primary_muscles,
      secondary_muscles: original.secondary_muscles,
      equipment: original.equipment,
      movement_pattern: original.movement_pattern,
      difficulty: original.difficulty,
      instructions: original.instructions,
      common_mistakes: original.common_mistakes,
      aliases: original.aliases,
      use_in_generator: original.use_in_generator,
      popularity: original.popularity,
      is_active: false,
    })
    .select("id")
    .single();

  if (errorCrear || !creado) {
    console.error("[admin] error al duplicar:", errorCrear?.code ?? "sin código");
    return;
  }

  const nuevoId = creado.id as string;
  await anotarAccionAdmin(supabase, "exercise.duplicate", nuevoId, {
    slug: nuevoSlug,
    name: `${original.name} (copia)`,
  });
  refrescar(nuevoId);
  redirect(`/admin/ejercicios/${nuevoId}?creado=1`);
}