"use client";

import { useActionState } from "react";
import { Alert } from "../../../components/ui/Alert";
import { Button } from "../../../components/ui/Button";
import { OptionCard } from "../../../components/ui/OptionCard";
import { Select } from "../../../components/ui/Select";
import {
  DIFFICULTIES,
  DIFFICULTY_LABELS,
  EQUIPMENT,
  EQUIPMENT_LABELS,
} from "../../../lib/exercises";
import {
  DAYS_OPTIONS,
  EXPERIENCE_DESCRIPTIONS,
  GOALS,
  GOAL_DESCRIPTIONS,
  GOAL_LABELS,
  LIMITATIONS,
  LIMITATION_LABELS,
  MINUTES_OPTIONS,
  type QuestionnaireDraft,
  type QuestionnaireFormState,
} from "../../../lib/questionnaire";
import { guardarCuestionario } from "./actions";

const estadoInicial: QuestionnaireFormState = {};

function MensajeError({ id, texto }: { id: string; texto?: string }) {
  if (!texto) return null;
  return (
    <p id={id} role="alert" className="text-sm text-danger">
      {texto}
    </p>
  );
}

export function QuestionnaireForm({ inicial }: { inicial: QuestionnaireDraft }) {
  const [estado, accion, pendiente] = useActionState(
    guardarCuestionario,
    estadoInicial,
  );

  // Si ya se envió el formulario, se conservan las respuestas del usuario.
  const draft = estado.draft ?? inicial;
  const errores = estado.fieldErrors ?? {};

  return (
    <form action={accion} noValidate className="flex max-w-4xl flex-col gap-10">
      {estado.ok ? (
        <Alert tone="success" title="Guardado">
          Tus respuestas están guardadas. Puedes volver aquí cuando quieras para
          cambiarlas.
        </Alert>
      ) : null}
      {estado.error ? (
        <Alert tone="danger" title="No se pudo guardar">
          {estado.error}
        </Alert>
      ) : null}

      <fieldset className="flex flex-col gap-3">
        <legend className="mb-1 text-lg font-semibold">
          1. ¿Cuánta experiencia tienes entrenando?
        </legend>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {DIFFICULTIES.map((valor) => (
            <OptionCard
              key={valor}
              name="experiencia"
              value={valor}
              title={DIFFICULTY_LABELS[valor]}
              description={EXPERIENCE_DESCRIPTIONS[valor]}
              defaultChecked={draft.experience === valor}
            />
          ))}
        </div>
        <MensajeError id="error-experiencia" texto={errores.experience} />
      </fieldset>

      <fieldset className="flex flex-col gap-3">
        <legend className="mb-1 text-lg font-semibold">
          2. ¿Cuál es tu objetivo principal?
        </legend>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {GOALS.map((valor) => (
            <OptionCard
              key={valor}
              name="objetivo"
              value={valor}
              title={GOAL_LABELS[valor]}
              description={GOAL_DESCRIPTIONS[valor]}
              defaultChecked={draft.goal === valor}
            />
          ))}
        </div>
        <MensajeError id="error-objetivo" texto={errores.goal} />
      </fieldset>

      <section aria-labelledby="tiempo" className="flex flex-col gap-3">
        <h2 id="tiempo" className="text-lg font-semibold">
          3. ¿Cuánto tiempo tienes?
        </h2>
        <div className="grid max-w-xl grid-cols-1 gap-4 sm:grid-cols-2">
          <Select
            name="dias"
            label="Días por semana"
            placeholder="Elige una opción"
            options={DAYS_OPTIONS}
            defaultValue={draft.days}
            error={errores.days}
          />
          <Select
            name="minutos"
            label="Duración de cada sesión"
            placeholder="Elige una opción"
            options={MINUTES_OPTIONS}
            defaultValue={draft.minutes}
            error={errores.minutes}
          />
        </div>
      </section>

      <fieldset className="flex flex-col gap-3">
        <legend className="mb-1 text-lg font-semibold">
          4. ¿Qué material tienes? (elige todo el que puedas usar)
        </legend>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {EQUIPMENT.map((valor) => (
            <OptionCard
              key={valor}
              type="checkbox"
              name="material"
              value={valor}
              title={EQUIPMENT_LABELS[valor]}
              defaultChecked={draft.equipment.includes(valor)}
            />
          ))}
        </div>
        <MensajeError id="error-material" texto={errores.equipment} />
      </fieldset>

      <fieldset className="flex flex-col gap-3">
        <legend className="mb-1 text-lg font-semibold">
          5. ¿Hay alguna zona que quieras cuidar? (opcional)
        </legend>
        <p className="max-w-2xl text-sm text-muted">
          Solo tú puedes ver esta información, y la usaremos únicamente para
          ajustar tu rutina. NEXORA no da consejo médico: si tienes una lesión o
          dolor, consulta con un profesional sanitario antes de entrenar.
        </p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-5">
          {LIMITATIONS.map((valor) => (
            <OptionCard
              key={valor}
              type="checkbox"
              name="limitaciones"
              value={valor}
              title={LIMITATION_LABELS[valor]}
              defaultChecked={draft.limitations.includes(valor)}
            />
          ))}
        </div>
      </fieldset>

      <div className="max-w-xl">
        <Button type="submit" size="lg" fullWidth disabled={pendiente}>
          {pendiente ? "Guardando…" : "Guardar mis respuestas"}
        </Button>
      </div>
    </form>
  );
}