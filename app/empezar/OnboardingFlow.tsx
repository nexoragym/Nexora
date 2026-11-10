"use client";

import Link from "next/link";
import { useState, type ReactNode } from "react";
import { Logo } from "../../components/brand/Logo";
import { PlanLoading } from "../../components/onboarding/PlanLoading";
import { Alert } from "../../components/ui/Alert";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { ButtonLink } from "../../components/ui/ButtonLink";
import { Card } from "../../components/ui/Card";
import { OptionCard } from "../../components/ui/OptionCard";
import { Select } from "../../components/ui/Select";
import {
  DIFFICULTIES,
  DIFFICULTY_LABELS,
  EQUIPMENT,
  EQUIPMENT_LABELS,
} from "../../lib/exercises";
import {
  BORRADOR_VACIO,
  DAYS_OPTIONS,
  EXPERIENCE_DESCRIPTIONS,
  FOCUSES,
  FOCUS_DESCRIPTIONS,
  FOCUS_LABELS,
  GOALS,
  GOAL_DESCRIPTIONS,
  GOAL_LABELS,
  LIMITATIONS,
  LIMITATION_LABELS,
  MINUTES_OPTIONS,
  ONBOARDING_STORAGE_KEY,
  PROGRAM_WEEKS,
  PROGRAM_WEEKS_LABELS,
  SEXES,
  SEX_LABELS,
  validarRespuestas,
  type OnboardingDraft,
  type QuestionnaireValues,
} from "../../lib/questionnaire";
import { generateRoutine } from "../../lib/routines/generator";

const PASOS = [
  { id: "goal", titulo: "¿Qué quieres conseguir?" },
  { id: "focus", titulo: "¿Quieres enfocarte en alguna zona?" },
  { id: "sex", titulo: "Cuéntanos un poco sobre ti" },
  { id: "experience", titulo: "¿Cuánta experiencia tienes entrenando?" },
  { id: "time", titulo: "¿Cuánto tiempo tienes?" },
  { id: "equipment", titulo: "¿Qué material tienes? (elige todo el que uses)" },
  { id: "weeks", titulo: "¿Cuánto durará tu programa?" },
  { id: "limitations", titulo: "¿Hay alguna zona que quieras cuidar? (opcional)" },
] as const;

type CampoTexto = "goal" | "focus" | "sex" | "experience" | "days" | "minutes" | "weeks";
type CampoLista = "equipment" | "limitations";

function Pantalla({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-full flex-1 flex-col px-4 py-6 sm:px-10">
      <header className="flex items-center justify-between">
        <Link href="/" aria-label="Volver al inicio">
          <Logo />
        </Link>
        <Link href="/" className="text-sm text-muted underline underline-offset-4">
          Salir
        </Link>
      </header>
      <main className="flex flex-1 items-center justify-center py-10">
        <div className="w-full">{children}</div>
      </main>
    </div>
  );
}

function Resultado({ valores }: { valores: QuestionnaireValues }) {
  // Sin ejercicios todavía: solo para mostrar el resumen del plan.
  const plan = generateRoutine(valores, []);

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
      <Badge tone="success" className="self-start">
        Tu plan está listo
      </Badge>
      <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
        {plan.name}
      </h1>
      <div className="flex flex-wrap gap-2">
        <Badge tone="accent">{plan.sessionsPerWeek} sesiones por semana</Badge>
        <Badge>{plan.programWeeks} semanas</Badge>
        <Badge>{GOAL_LABELS[valores.goal]}</Badge>
      </div>
      <Card className="flex flex-col gap-3">
        <p className="font-semibold">Qué incluye tu plan</p>
        <ul className="flex flex-col gap-2 text-muted">
          <li>✓ Ejercicios elegidos para tu nivel y tu material</li>
          <li>✓ Series, repeticiones y descansos para tu objetivo</li>
          <li>✓ Tus sesiones repartidas por semana</li>
        </ul>
      </Card>
      <p className="text-muted">
        Crea tu cuenta gratis para ver tus ejercicios y empezar.
      </p>
      <div className="flex flex-col gap-3 sm:flex-row">
        <ButtonLink href="/registro" size="xl">
          Crear cuenta y ver mi rutina
        </ButtonLink>
        <ButtonLink href="/login" variant="secondary" size="xl">
          Ya tengo cuenta
        </ButtonLink>
      </div>
      <p className="text-xs text-muted">
        Tus respuestas se guardan solo en este dispositivo hasta que crees tu
        cuenta.
      </p>
    </div>
  );
}

export function OnboardingFlow() {
  const [draft, setDraft] = useState<OnboardingDraft>(BORRADOR_VACIO);
  const [paso, setPaso] = useState(0);
  const [fase, setFase] = useState<"preguntas" | "cargando" | "resultado">(
    "preguntas",
  );
  const [valores, setValores] = useState<QuestionnaireValues | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);

  const actual = PASOS[paso];

  const poner = (campo: CampoTexto, valor: string) =>
    setDraft((d) => ({ ...d, [campo]: valor }));

  const alternar = (campo: CampoLista, valor: string) =>
    setDraft((d) => ({
      ...d,
      [campo]: d[campo].includes(valor)
        ? d[campo].filter((v) => v !== valor)
        : [...d[campo], valor],
    }));

  function puedeContinuar(): boolean {
    switch (actual.id) {
      case "goal":
        return draft.goal !== "";
      case "focus":
        return draft.focus !== "";
      case "experience":
        return draft.experience !== "";
      case "time":
        return draft.days !== "" && draft.minutes !== "";
      case "equipment":
        return draft.equipment.length > 0;
      case "weeks":
        return draft.weeks !== "";
      default:
        return true;
    }
  }

  function siguiente() {
    setAviso(null);
    if (paso < PASOS.length - 1) {
      setPaso(paso + 1);
      return;
    }
    const { values } = validarRespuestas(draft);
    if (!values) {
      setAviso("Falta alguna respuesta. Vuelve atrás y revísala.");
      return;
    }
    try {
      localStorage.setItem(ONBOARDING_STORAGE_KEY, JSON.stringify(draft));
    } catch {
      // Sin almacenamiento disponible: se continúa igualmente.
    }
    setValores(values);
    setFase("cargando");
  }

  if (fase === "cargando") {
    return (
      <Pantalla>
        <PlanLoading listo onDone={() => setFase("resultado")} />
      </Pantalla>
    );
  }

  if (fase === "resultado" && valores) {
    return (
      <Pantalla>
        <Resultado valores={valores} />
      </Pantalla>
    );
  }

  return (
    <Pantalla>
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-8">
        <div className="flex flex-col gap-3">
          <p className="text-sm text-muted">
            Paso {paso + 1} de {PASOS.length}
          </p>
          <div
            role="progressbar"
            aria-label="Progreso del cuestionario"
            aria-valuemin={0}
            aria-valuemax={PASOS.length}
            aria-valuenow={paso + 1}
            className="h-2 w-full overflow-hidden rounded-full bg-surface-2"
          >
            <div
              className="h-full rounded-full bg-accent transition-[width] duration-500"
              style={{ width: `${((paso + 1) / PASOS.length) * 100}%` }}
            />
          </div>
        </div>

        <fieldset key={actual.id} className="flex flex-col gap-5">
          <legend className="mb-2 text-2xl font-semibold tracking-tight sm:text-3xl">
            {actual.titulo}
          </legend>

          {actual.id === "goal" ? (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {GOALS.map((valor) => (
                <OptionCard
                  key={valor}
                  name="goal"
                  value={valor}
                  title={GOAL_LABELS[valor]}
                  description={GOAL_DESCRIPTIONS[valor]}
                  checked={draft.goal === valor}
                  onChange={() => poner("goal", valor)}
                />
              ))}
            </div>
          ) : null}

          {actual.id === "focus" ? (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {FOCUSES.map((valor) => (
                <OptionCard
                  key={valor}
                  name="focus"
                  value={valor}
                  title={FOCUS_LABELS[valor]}
                  description={FOCUS_DESCRIPTIONS[valor]}
                  checked={draft.focus === valor}
                  onChange={() => poner("focus", valor)}
                />
              ))}
            </div>
          ) : null}

          {actual.id === "sex" ? (
            <>
              <p className="max-w-2xl text-muted">
                Es opcional. Solo lo usamos para personalizar las imágenes y el
                contenido que verás.
              </p>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                {SEXES.map((valor) => (
                  <OptionCard
                    key={valor}
                    name="sex"
                    value={valor}
                    title={SEX_LABELS[valor]}
                    checked={draft.sex === valor}
                    onChange={() => poner("sex", valor)}
                  />
                ))}
                <OptionCard
                  name="sex"
                  value="none"
                  title="Prefiero no decirlo"
                  checked={draft.sex === "none"}
                  onChange={() => poner("sex", "none")}
                />
              </div>
            </>
          ) : null}

          {actual.id === "experience" ? (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              {DIFFICULTIES.map((valor) => (
                <OptionCard
                  key={valor}
                  name="experience"
                  value={valor}
                  title={DIFFICULTY_LABELS[valor]}
                  description={EXPERIENCE_DESCRIPTIONS[valor]}
                  checked={draft.experience === valor}
                  onChange={() => poner("experience", valor)}
                />
              ))}
            </div>
          ) : null}

          {actual.id === "time" ? (
            <div className="grid max-w-xl grid-cols-1 gap-4 sm:grid-cols-2">
              <Select
                name="days"
                label="Días por semana"
                placeholder="Elige una opción"
                options={DAYS_OPTIONS}
                value={draft.days}
                onChange={(e) => poner("days", e.target.value)}
              />
              <Select
                name="minutes"
                label="Duración de cada sesión"
                placeholder="Elige una opción"
                options={MINUTES_OPTIONS}
                value={draft.minutes}
                onChange={(e) => poner("minutes", e.target.value)}
              />
            </div>
          ) : null}

          {actual.id === "equipment" ? (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {EQUIPMENT.map((valor) => (
                <OptionCard
                  key={valor}
                  type="checkbox"
                  name="equipment"
                  value={valor}
                  title={EQUIPMENT_LABELS[valor]}
                  checked={draft.equipment.includes(valor)}
                  onChange={() => alternar("equipment", valor)}
                />
              ))}
            </div>
          ) : null}

          {actual.id === "weeks" ? (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              {PROGRAM_WEEKS.map((valor) => (
                <OptionCard
                  key={valor}
                  name="weeks"
                  value={String(valor)}
                  title={PROGRAM_WEEKS_LABELS[valor]}
                  checked={draft.weeks === String(valor)}
                  onChange={() => poner("weeks", String(valor))}
                />
              ))}
            </div>
          ) : null}

          {actual.id === "limitations" ? (
            <>
              <div className="flex max-w-2xl flex-col gap-2 text-sm text-muted">
                <p>
                  Es totalmente opcional. Si marcas alguna zona, aceptas que
                  usemos esa información, que puede considerarse un dato de
                  salud, solo para evitar ejercicios que suelen cargarla al
                  preparar tu plan. Solo tú puedes verla y puedes borrarla
                  eliminando tu cuenta desde tu Perfil. Más información en la{" "}
                  <Link
                    href="/privacidad"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-foreground underline underline-offset-4"
                  >
                    política de privacidad
                  </Link>
                  .
                </p>
                <p>
                  NEXORA no da consejo médico: si tienes una lesión o dolor,
                  consulta con un profesional sanitario antes de entrenar.
                </p>
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-5">
                {LIMITATIONS.map((valor) => (
                  <OptionCard
                    key={valor}
                    type="checkbox"
                    name="limitations"
                    value={valor}
                    title={LIMITATION_LABELS[valor]}
                    checked={draft.limitations.includes(valor)}
                    onChange={() => alternar("limitations", valor)}
                  />
                ))}
              </div>
            </>
          ) : null}
        </fieldset>

        {aviso ? <Alert tone="warning">{aviso}</Alert> : null}

        <div className="flex items-center justify-between gap-3">
          <Button
            type="button"
            variant="ghost"
            onClick={() => setPaso(paso - 1)}
            disabled={paso === 0}
          >
            Atrás
          </Button>
          <Button
            type="button"
            size="lg"
            onClick={siguiente}
            disabled={!puedeContinuar()}
          >
            {paso === PASOS.length - 1 ? "Crear mi plan" : "Continuar"}
          </Button>
        </div>
      </div>
    </Pantalla>
  );
}