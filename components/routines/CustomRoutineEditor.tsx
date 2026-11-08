"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { guardarRutinaPersonal } from "../../app/(app)/mis-rutinas/actions";
import { MAX_DIAS, moverElemento, type DiaDraft } from "../../lib/admin/routine-form";
import { GOALS, GOAL_LABELS, type Goal } from "../../lib/questionnaire";
import type { RutinaPersonalDraft } from "../../lib/routines/custom";
import { RoutineDayEditor } from "../admin/RoutineDayEditor";
import { Alert } from "../ui/Alert";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";
import { Input } from "../ui/Input";
import { Select } from "../ui/Select";
import { CustomExercisePicker } from "./CustomExercisePicker";

const OPCIONES_OBJETIVO = GOALS.map((valor) => ({
  value: valor,
  label: GOAL_LABELS[valor],
}));

type CustomRoutineEditorProps = {
  inicial: RutinaPersonalDraft;
  // Nombre de la rutina que tienes activa ahora (para avisar de que se sustituye).
  rutinaActivaNombre: string | null;
};

export function CustomRoutineEditor({
  inicial,
  rutinaActivaNombre,
}: CustomRoutineEditorProps) {
  const router = useRouter();
  const [rutina, setRutina] = useState<RutinaPersonalDraft>(inicial);
  const [errores, setErrores] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [guardado, setGuardado] = useState(false);
  const [confirmando, setConfirmando] = useState(false);
  const [pendiente, startTransition] = useTransition();

  const esNueva = rutina.id === null;

  function cambiar(parcial: Partial<RutinaPersonalDraft>) {
    setRutina((actual) => ({ ...actual, ...parcial }));
    setGuardado(false);
  }

  function cambiarDia(i: number, dia: DiaDraft) {
    cambiar({ days: rutina.days.map((d, k) => (k === i ? dia : d)) });
  }

  function guardar(activar: boolean) {
    setErrores([]);
    setError(null);
    setGuardado(false);
    setConfirmando(false);
    startTransition(async () => {
      try {
        const respuesta = await guardarRutinaPersonal(rutina, activar);
        if (!respuesta.ok) {
          setErrores(respuesta.errores ?? []);
          setError(respuesta.error ?? null);
          return;
        }
        if (esNueva) {
          router.push(activar ? "/entrenar" : "/mis-rutinas?aviso=guardada");
          return;
        }
        setGuardado(true);
        router.refresh();
      } catch {
        setError("No se pudo guardar. Comprueba tu conexión e inténtalo de nuevo.");
      }
    });
  }

  function pulsarUsar() {
    if (rutinaActivaNombre) {
      setConfirmando(true);
      return;
    }
    guardar(true);
  }

  return (
    <div className="flex flex-col gap-6">
      <Card className="flex flex-col gap-5">
        <h2 className="text-xl font-semibold">Datos de tu rutina</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <Input
            name="nombre"
            label="Nombre"
            placeholder="Por ejemplo, Mi rutina de pecho"
            value={rutina.name}
            onChange={(evento) => cambiar({ name: evento.target.value })}
            maxLength={80}
            autoComplete="off"
          />
          <Select
            name="objetivo"
            label="Objetivo"
            placeholder="Elige una opción"
            options={OPCIONES_OBJETIVO}
            value={rutina.goal}
            onChange={(evento) => cambiar({ goal: evento.target.value as Goal | "" })}
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
        <p className="text-sm text-muted">
          Puedes elegir cualquier ejercicio de la biblioteca. Las series,
          repeticiones y descansos son cosa tuya: elige pesos con los que
          mantengas una buena técnica.
        </p>
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
            Buscador={CustomExercisePicker}
            onCambiar={(nuevo) => cambiarDia(i, nuevo)}
            onMover={(delta) => cambiar({ days: moverElemento(rutina.days, i, delta) })}
            onQuitar={() => cambiar({ days: rutina.days.filter((_, k) => k !== i) })}
          />
        ))}
        <div>
          <Button
            type="button"
            variant="secondary"
            disabled={rutina.days.length >= MAX_DIAS}
            onClick={() =>
              cambiar({
                days: [...rutina.days, { name: "Cuerpo completo", exercises: [] }],
              })
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
          Los cambios ya están en tu rutina.
        </Alert>
      ) : null}

      {confirmando ? (
        <Alert tone="warning" title="Ya tienes una rutina activa">
          <div className="flex flex-col gap-3">
            <p>
              Tu rutina actual es «{rutinaActivaNombre}». Si continúas, esta la
              sustituye. Tu historial de entrenamientos se conserva.
            </p>
            <div className="flex flex-wrap gap-2">
              <Button onClick={() => guardar(true)} disabled={pendiente}>
                {pendiente ? "Guardando…" : "Sí, guardar y usarla"}
              </Button>
              <Button
                variant="secondary"
                onClick={() => setConfirmando(false)}
                disabled={pendiente}
              >
                Cancelar
              </Button>
            </div>
          </div>
        </Alert>
      ) : esNueva ? (
        <div className="flex flex-wrap gap-3">
          <Button
            type="button"
            size="lg"
            variant="secondary"
            onClick={() => guardar(false)}
            disabled={pendiente}
          >
            {pendiente ? "Guardando…" : "Guardar"}
          </Button>
          <Button type="button" size="lg" onClick={pulsarUsar} disabled={pendiente}>
            Guardar y usarla
          </Button>
        </div>
      ) : (
        <div>
          <Button type="button" size="lg" onClick={() => guardar(false)} disabled={pendiente}>
            {pendiente ? "Guardando…" : "Guardar cambios"}
          </Button>
        </div>
      )}
    </div>
  );
}