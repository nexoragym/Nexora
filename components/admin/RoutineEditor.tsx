"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { guardarRutina } from "../../app/(app)/admin/rutinas/editor-actions";
import {
  MAX_DIAS,
  moverElemento,
  type DiaDraft,
  type RutinaDraft,
} from "../../lib/admin/routine-form";
import {
  DIFFICULTY_OPTIONS,
  EQUIPMENT,
  EQUIPMENT_LABELS,
  type Equipment,
} from "../../lib/exercises";
import { GOALS, GOAL_LABELS, type Goal } from "../../lib/questionnaire";
import { Alert } from "../ui/Alert";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";
import { Input } from "../ui/Input";
import { Select } from "../ui/Select";
import { CampoTexto } from "./form-fields";
import { RoutineDayEditor } from "./RoutineDayEditor";

const OPCIONES_OBJETIVO = GOALS.map((valor) => ({
  value: valor,
  label: GOAL_LABELS[valor],
}));

export function RoutineEditor({ inicial }: { inicial: RutinaDraft }) {
  const router = useRouter();
  const [rutina, setRutina] = useState<RutinaDraft>(inicial);
  const [errores, setErrores] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [guardado, setGuardado] = useState(false);
  const [pendiente, startTransition] = useTransition();

  const esNueva = rutina.id === null;

  function cambiar(parcial: Partial<RutinaDraft>) {
    setRutina((actual) => ({ ...actual, ...parcial }));
    setGuardado(false);
  }

  function cambiarDia(i: number, dia: DiaDraft) {
    cambiar({ days: rutina.days.map((d, k) => (k === i ? dia : d)) });
  }

  function alternarMaterial(material: Equipment) {
    cambiar({
      equipment: rutina.equipment.includes(material)
        ? rutina.equipment.filter((m) => m !== material)
        : [...rutina.equipment, material],
    });
  }

  function guardar() {
    setErrores([]);
    setError(null);
    setGuardado(false);
    startTransition(async () => {
      try {
        const respuesta = await guardarRutina(rutina);
        if (!respuesta.ok) {
          setErrores(respuesta.errores ?? []);
          setError(respuesta.error ?? null);
          return;
        }
        if (esNueva && respuesta.id) {
          router.push(`/admin/rutinas/${respuesta.id}?creada=1`);
          return;
        }
        setGuardado(true);
        router.refresh();
      } catch {
        setError("No se pudo guardar. Comprueba tu conexión e inténtalo de nuevo.");
      }
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <Card className="flex flex-col gap-5">
        <h2 className="text-xl font-semibold">Datos de la rutina</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Input
            name="nombre"
            label="Nombre"
            value={rutina.name}
            onChange={(evento) => cambiar({ name: evento.target.value })}
            maxLength={80}
            autoComplete="off"
          />
          {esNueva ? (
            <Input
              name="identificador"
              label="Identificador (opcional)"
              hint="Se genera solo a partir del nombre. No se podrá cambiar después."
              value={rutina.slug}
              onChange={(evento) => cambiar({ slug: evento.target.value })}
              maxLength={60}
              autoComplete="off"
            />
          ) : (
            <Input
              name="identificador"
              label="Identificador"
              hint="No se puede cambiar: las rutinas de los usuarios lo recuerdan."
              value={rutina.slug}
              disabled
              readOnly
            />
          )}
        </div>
        <CampoTexto
          name="descripcion"
          label="Descripción"
          hint="Es lo que se ve en la tarjeta de Rutinas (máximo 300 caracteres)."
          defaultValue={inicial.description}
          rows={3}
          onTexto={(valor) => cambiar({ description: valor })}
        />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <Select
            name="objetivo"
            label="Objetivo"
            placeholder="Elige una opción"
            options={OPCIONES_OBJETIVO}
            value={rutina.goal}
            onChange={(evento) => cambiar({ goal: evento.target.value as Goal | "" })}
          />
          <Select
            name="nivel"
            label="Nivel"
            placeholder="Elige una opción"
            options={DIFFICULTY_OPTIONS}
            value={rutina.level}
            onChange={(evento) =>
              cambiar({ level: evento.target.value as RutinaDraft["level"] })
            }
          />
          <Input
            name="semanas"
            type="number"
            label="Semanas del programa"
            min={1}
            max={52}
            value={rutina.weeks}
            onChange={(evento) =>
              cambiar({
                weeks: evento.target.value === "" ? "" : Number(evento.target.value),
              })
            }
          />
        </div>
        <fieldset className="flex flex-col gap-2">
          <legend className="text-sm font-medium">
            Material con el que se puede hacer (al menos uno)
          </legend>
          <div className="mt-1 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {EQUIPMENT.map((material) => (
              <label
                key={material}
                className="flex cursor-pointer items-center gap-2 rounded-xl border border-border bg-surface-2 px-3 py-2 text-sm transition-colors hover:border-muted has-[:checked]:border-accent has-[:checked]:bg-accent/10"
              >
                <input
                  type="checkbox"
                  checked={rutina.equipment.includes(material)}
                  onChange={() => alternarMaterial(material)}
                  className="size-4 accent-accent"
                />
                {EQUIPMENT_LABELS[material]}
              </label>
            ))}
          </div>
        </fieldset>
      </Card>

      <Card className="flex flex-col gap-5">
        <h2 className="text-xl font-semibold">Notas y avisos</h2>
        <CampoTexto
          name="notas"
          label="Notas del plan"
          hint="Una por línea. Al usar la rutina se añaden solas las notas generales."
          defaultValue={inicial.notes}
          rows={4}
          onTexto={(valor) => cambiar({ notes: valor })}
        />
        <CampoTexto
          name="avisos"
          label="Avisos"
          hint="Una por línea (por ejemplo, el de los topes de seguridad con barra). El aviso general de consultar con un profesional se añade solo."
          defaultValue={inicial.warnings}
          rows={3}
          onTexto={(valor) => cambiar({ warnings: valor })}
        />
      </Card>

      <section aria-labelledby="dias" className="flex flex-col gap-4">
        <h2 id="dias" className="text-xl font-semibold">
          Días y ejercicios
        </h2>
        {rutina.days.map((dia, i) => (
          <RoutineDayEditor
            key={i}
            indice={i}
            total={rutina.days.length}
            dia={dia}
            onCambiar={(nuevo) => cambiarDia(i, nuevo)}
            onMover={(delta) => cambiar({ days: moverElemento(rutina.days, i, delta) })}
            onQuitar={() =>
              cambiar({ days: rutina.days.filter((_, k) => k !== i) })
            }
          />
        ))}
        <div>
          <Button
            type="button"
            variant="secondary"
            disabled={rutina.days.length >= MAX_DIAS}
            onClick={() =>
              cambiar({ days: [...rutina.days, { name: "", exercises: [] }] })
            }
          >
            Añadir un día
          </Button>
        </div>
      </section>

      {error ? (
        <Alert tone="danger" title="No se pudo guardar">
          {error}
        </Alert>
      ) : null}
      {errores.length > 0 ? (
        <Alert tone="warning" title="Revisa estos puntos">
          <ul className="flex list-disc flex-col gap-1 pl-5">
            {errores.map((mensaje, i) => (
              <li key={i}>{mensaje}</li>
            ))}
          </ul>
        </Alert>
      ) : null}
      {guardado ? (
        <Alert tone="success" title="Guardado">
          Los cambios ya están en la rutina.
        </Alert>
      ) : null}

      <div>
        <Button type="button" size="lg" onClick={guardar} disabled={pendiente}>
          {pendiente
            ? "Guardando…"
            : esNueva
              ? "Crear rutina"
              : "Guardar cambios"}
        </Button>
      </div>
    </div>
  );
}