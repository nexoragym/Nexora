"use client";

import {
  startTransition,
  useActionState,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
import {
  crearEjercicio,
  guardarEjercicio,
} from "../../app/(app)/admin/ejercicios/actions";
import {
  ALIAS_RECOMENDADOS,
  lineas,
  type EstadoFormulario,
} from "../../lib/admin/exercise-form";
import {
  DIFFICULTY_OPTIONS,
  EQUIPMENT_OPTIONS,
  MOVEMENT_LABELS,
  MOVEMENT_PATTERNS,
  MUSCLES,
  MUSCLE_LABELS,
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

type CampoTextoProps = {
  name: string;
  label: string;
  defaultValue: string;
  hint?: string;
  error?: string;
  rows?: number;
  placeholder?: string;
  extra?: ReactNode;
  onTexto?: (valor: string) => void;
};

function CampoTexto({
  name,
  label,
  defaultValue,
  hint,
  error,
  rows = 6,
  placeholder,
  extra,
  onTexto,
}: CampoTextoProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={name} className="text-sm font-medium">
        {label}
      </label>
      <textarea
        id={name}
        name={name}
        rows={rows}
        defaultValue={defaultValue}
        placeholder={placeholder}
        aria-invalid={error ? true : undefined}
        onChange={onTexto ? (evento) => onTexto(evento.target.value) : undefined}
        className={
          "w-full rounded-xl border bg-surface-2 px-4 py-3 text-base text-foreground " +
          "placeholder:text-muted/70 transition-colors " +
          (error
            ? "border-danger"
            : "border-border hover:border-muted focus-visible:border-accent")
        }
      />
      {hint ? <p className="text-sm text-muted">{hint}</p> : null}
      {extra}
      {error ? (
        <p role="alert" className="text-sm text-danger">
          {error}
        </p>
      ) : null}
    </div>
  );
}

type GrupoMusculosProps = {
  nombre: string;
  titulo: string;
  marcados: Muscle[];
  error?: string;
};

function GrupoMusculos({ nombre, titulo, marcados, error }: GrupoMusculosProps) {
  return (
    <fieldset className="flex flex-col gap-2">
      <legend className="text-sm font-medium">{titulo}</legend>
      <div className="mt-1 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
        {MUSCLES.map((musculo) => (
          <label
            key={musculo}
            className="flex cursor-pointer items-center gap-2 rounded-xl border border-border bg-surface-2 px-3 py-2 text-sm transition-colors hover:border-muted has-[:checked]:border-accent has-[:checked]:bg-accent/10"
          >
            <input
              type="checkbox"
              name={nombre}
              value={musculo}
              defaultChecked={marcados.includes(musculo)}
              className="size-4 accent-accent"
            />
            {MUSCLE_LABELS[musculo]}
          </label>
        ))}
      </div>
      {error ? (
        <p role="alert" className="text-sm text-danger">
          {error}
        </p>
      ) : null}
    </fieldset>
  );
}

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

      <Card className="flex flex-col gap-3">
        <h2 className="text-xl font-semibold">Estado</h2>
        <label className="flex cursor-pointer items-center gap-3">
          <input
            type="checkbox"
            name="is_active"
            defaultChecked={ejercicio ? ejercicio.isActive : true}
            className="size-5 accent-accent"
          />
          <span>
            Activo (aparece en la Biblioteca y se puede usar en las rutinas
            automáticas)
          </span>
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