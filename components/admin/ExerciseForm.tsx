"use client";

import {
  startTransition,
  useActionState,
  useState,
  type FormEvent,
} from "react";
import {
  crearEjercicio,
  guardarEjercicio,
} from "../../app/(app)/admin/ejercicios/actions";
import {
  ALIAS_RECOMENDADOS,
  POPULARIDAD_OPCIONES,
  lineas,
  type EstadoFormulario,
} from "../../lib/admin/exercise-form";
import {
  DIFFICULTY_OPTIONS,
  EQUIPMENT_OPTIONS,
  MOVEMENT_LABELS,
  MOVEMENT_PATTERNS,
  type Difficulty,
  type Equipment,
  type MovementPattern,
  type Muscle,
} from "../../lib/exercises";
import { Alert } from "../ui/Alert";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";
import { Input } from "../ui/Input";
import { Select } from "../ui/Select";
import { CampoTexto, GrupoMusculos } from "./form-fields";

export type EjercicioEditable = {
  id: string;
  slug: string;
  name: string;
  primaryMuscles: Muscle[];
  secondaryMuscles: Muscle[];
  equipment: Equipment;
  movementPattern: MovementPattern;
  difficulty: Difficulty;
  instructions: string[];
  commonMistakes: string[];
  aliases: string[];
  useInGenerator: boolean;
  popularity: number;
  isActive: boolean;
};

type ExerciseFormProps = {
  modo: "crear" | "editar";
  ejercicio?: EjercicioEditable;
};

const OPCIONES_MOVIMIENTO = MOVEMENT_PATTERNS.map((valor) => ({
  value: valor,
  label: MOVEMENT_LABELS[valor],
}));

export function ExerciseForm({ modo, ejercicio }: ExerciseFormProps) {
  const [estado, accion, pendiente] = useActionState<EstadoFormulario, FormData>(
    modo === "crear" ? crearEjercicio : guardarEjercicio,
    {},
  );
  const [numAlias, setNumAlias] = useState(() => ejercicio?.aliases.length ?? 0);

  const errores = estado.errores ?? {};
  const hayErrores = Object.keys(errores).length > 0;

  // Se envía a mano para que el formulario no se vacíe si hay algún error.
  function enviar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    const datos = new FormData(evento.currentTarget);
    startTransition(() => accion(datos));
  }

  return (
    <form onSubmit={enviar} className="flex flex-col gap-6">
      {ejercicio ? <input type="hidden" name="id" value={ejercicio.id} /> : null}

      {estado.error ? (
        <Alert tone="danger" title="No se pudo guardar">
          {estado.error}
        </Alert>
      ) : null}
      {hayErrores ? (
        <Alert tone="warning" title="Revisa el formulario">
          Hay campos que corregir. Están marcados en rojo.
        </Alert>
      ) : null}
      {estado.ok ? (
        <Alert tone="success" title="Guardado">
          Los cambios ya se ven en la Biblioteca.
        </Alert>
      ) : null}

      <Card className="flex flex-col gap-5">
        <h2 className="text-xl font-semibold">Datos básicos</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Input
            name="name"
            label="Nombre del ejercicio"
            defaultValue={ejercicio?.name ?? ""}
            maxLength={100}
            error={errores.name}
            autoComplete="off"
          />
          {modo === "crear" ? (
            <Input
              name="slug"
              label="Identificador (opcional)"
              hint="Se genera solo a partir del nombre. No se podrá cambiar después."
              maxLength={80}
              error={errores.slug}
              autoComplete="off"
            />
          ) : (
            <Input
              name="slug"
              label="Identificador"
              hint="No se puede cambiar: las rutinas lo usan."
              defaultValue={ejercicio?.slug ?? ""}
              disabled
            />
          )}
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <Select
            name="equipment"
            label="Material"
            placeholder="Elige una opción"
            options={EQUIPMENT_OPTIONS}
            defaultValue={ejercicio?.equipment ?? ""}
            error={errores.equipment}
          />
          <Select
            name="movement_pattern"
            label="Tipo de movimiento"
            placeholder="Elige una opción"
            options={OPCIONES_MOVIMIENTO}
            defaultValue={ejercicio?.movementPattern ?? ""}
            error={errores.movement_pattern}
          />
          <Select
            name="difficulty"
            label="Nivel"
            placeholder="Elige una opción"
            options={DIFFICULTY_OPTIONS}
            defaultValue={ejercicio?.difficulty ?? ""}
            error={errores.difficulty}
          />
        </div>
      </Card>

      <Card className="flex flex-col gap-5">
        <h2 className="text-xl font-semibold">Músculos</h2>
        <GrupoMusculos
          nombre="primary_muscles"
          titulo="Principales (al menos uno)"
          marcados={ejercicio?.primaryMuscles ?? []}
          error={errores.primary_muscles}
        />
        <GrupoMusculos
          nombre="secondary_muscles"
          titulo="Secundarios (opcional)"
          marcados={ejercicio?.secondaryMuscles ?? []}
        />
      </Card>

      <Card className="flex flex-col gap-5">
        <h2 className="text-xl font-semibold">Explicación</h2>
        <CampoTexto
          name="instructions"
          label="Cómo se hace"
          hint="Un paso por línea."
          defaultValue={ejercicio?.instructions.join("\n") ?? ""}
          error={errores.instructions}
          rows={7}
        />
        <CampoTexto
          name="common_mistakes"
          label="Errores habituales"
          hint="Un error por línea (opcional)."
          defaultValue={ejercicio?.commonMistakes.join("\n") ?? ""}
          error={errores.common_mistakes}
          rows={4}
        />
      </Card>

      <Card className="flex flex-col gap-5">
        <h2 className="text-xl font-semibold">Otros nombres para el buscador</h2>
        <CampoTexto
          name="aliases"
          label="Otras formas de escribirlo"
          hint="Una por línea: sinónimos, nombres en inglés, jerga. No hace falta poner tildes."
          defaultValue={ejercicio?.aliases.join("\n") ?? ""}
          error={errores.aliases}
          rows={8}
          onTexto={(valor) => setNumAlias(lineas(valor).length)}
          extra={
            <p
              className={
                numAlias >= ALIAS_RECOMENDADOS
                  ? "text-sm text-success"
                  : "text-sm text-warning"
              }
            >
              {numAlias} escritas. Mínimo recomendado: {ALIAS_RECOMENDADOS}.
            </p>
          }
        />
      </Card>

      <Card className="flex flex-col gap-5">
        <h2 className="text-xl font-semibold">Rutinas automáticas</h2>
        <label className="flex cursor-pointer items-start gap-3">
          <input
            type="checkbox"
            name="use_in_generator"
            defaultChecked={ejercicio ? ejercicio.useInGenerator : true}
            className="mt-1 size-5 accent-accent"
          />
          <span>
            Usar en rutinas automáticas
            <span className="block text-sm text-muted">
              Si lo desmarcas, el generador no lo elegirá, pero seguirá en la
              Biblioteca y se podrá elegir en rutinas hechas a mano.
            </span>
          </span>
        </label>
        <div className="max-w-md">
          <Select
            name="popularity"
            label="Popularidad"
            options={POPULARIDAD_OPCIONES}
            defaultValue={String(ejercicio?.popularity ?? 0)}
            hint="Más adelante el generador preferirá los más conocidos."
            error={errores.popularity}
          />
        </div>
      </Card>

      <Card className="flex flex-col gap-3">
        <h2 className="text-xl font-semibold">Estado</h2>
        <label className="flex cursor-pointer items-center gap-3">
          <input
            type="checkbox"
            name="is_active"
            defaultChecked={ejercicio ? ejercicio.isActive : true}
            className="size-5 accent-accent"
          />
          <span>Activo (aparece en la Biblioteca y se puede elegir en rutinas)</span>
        </label>
      </Card>

      <div>
        <Button type="submit" size="lg" disabled={pendiente}>
          {pendiente
            ? "Guardando…"
            : modo === "crear"
              ? "Crear ejercicio"
              : "Guardar cambios"}
        </Button>
      </div>
    </form>
  );
}