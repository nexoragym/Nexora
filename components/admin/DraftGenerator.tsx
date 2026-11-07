"use client";

import Link from "next/link";
import { useState } from "react";
import {
  crearBorradores,
  ocultarBorradoresAuto,
  previsualizarBorradores,
  publicarBorradoresAuto,
} from "../../app/(app)/admin/rutinas/generar-actions";
import {
  DIFFICULTIES,
  DIFFICULTY_LABELS,
  type Difficulty,
} from "../../lib/exercises";
import {
  FOCUSES,
  FOCUS_LABELS,
  GOALS,
  GOAL_LABELS,
  type Focus,
  type Goal,
} from "../../lib/questionnaire";
import {
  DIAS_BORRADOR,
  MATERIALES_BORRADOR,
  MATERIAL_BORRADOR,
  MAX_BORRADORES,
  OPCIONES_POR_DEFECTO,
  TAM_LOTE_BORRADORES,
  type MaterialBorrador,
  type ResultadoPublicacion,
  type VistaBorradores,
} from "../../lib/routines/borradores";
import { Alert } from "../ui/Alert";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";
import { Input } from "../ui/Input";

type Fase = "reposo" | "revisando" | "creando";

type Acumulado = {
  creadas: number;
  yaExistian: number;
  sinEjercicios: number;
  errores: number;
};

function alternar<T>(lista: T[], valor: T): T[] {
  return lista.includes(valor) ? lista.filter((v) => v !== valor) : [...lista, valor];
}

type GrupoProps<T extends string | number> = {
  titulo: string;
  opciones: { value: T; label: string }[];
  marcados: T[];
  onCambio: (valores: T[]) => void;
};

function GrupoChecks<T extends string | number>({
  titulo,
  opciones,
  marcados,
  onCambio,
}: GrupoProps<T>) {
  return (
    <fieldset className="flex flex-col gap-2">
      <legend className="text-sm font-medium">{titulo}</legend>
      <div className="mt-1 flex flex-wrap gap-2">
        {opciones.map((opcion) => (
          <label
            key={String(opcion.value)}
            className="flex cursor-pointer items-center gap-2 rounded-xl border border-border bg-surface-2 px-3 py-2 text-sm transition-colors hover:border-muted has-[:checked]:border-accent has-[:checked]:bg-accent/10"
          >
            <input
              type="checkbox"
              checked={marcados.includes(opcion.value)}
              onChange={() => onCambio(alternar(marcados, opcion.value))}
              className="size-4 accent-accent"
            />
            {opcion.label}
          </label>
        ))}
      </div>
    </fieldset>
  );
}

export function DraftGenerator() {
  const [goals, setGoals] = useState<Goal[]>(OPCIONES_POR_DEFECTO.goals);
  const [levels, setLevels] = useState<Difficulty[]>(OPCIONES_POR_DEFECTO.levels);
  const [days, setDays] = useState<number[]>(OPCIONES_POR_DEFECTO.days);
  const [materials, setMaterials] = useState<MaterialBorrador[]>(OPCIONES_POR_DEFECTO.materials);
  const [focuses, setFocuses] = useState<Focus[]>(OPCIONES_POR_DEFECTO.focuses);
  const [max, setMax] = useState(String(OPCIONES_POR_DEFECTO.max));

  const [fase, setFase] = useState<Fase>("reposo");
  const [vista, setVista] = useState<VistaBorradores | null>(null);
  const [progreso, setProgreso] = useState({ hechas: 0, total: 0 });
  const [resultado, setResultado] = useState<Acumulado | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [confirmando, setConfirmando] = useState<"publicar" | "ocultar" | null>(null);
  const [ocupadoBloque, setOcupadoBloque] = useState(false);
  const [resultadoBloque, setResultadoBloque] = useState<
    (ResultadoPublicacion & { accion: "publicar" | "ocultar" }) | null
  >(null);

  const ocupado = fase !== "reposo";

  // Al cambiar cualquier opción, la revisión anterior ya no vale.
  function cambiado() {
    setVista(null);
    setResultado(null);
    setError(null);
  }

  async function revisar() {
    setFase("revisando");
    setError(null);
    setResultado(null);
    setVista(null);
    try {
      const respuesta = await previsualizarBorradores({
        goals,
        levels,
        days,
        materials,
        focuses,
        max: Number(max),
      });
      if (!respuesta.ok) {
        setError(respuesta.error ?? "No se pudo revisar.");
      } else {
        setVista(respuesta);
      }
    } catch {
      setError("No se pudo revisar. Comprueba tu conexión e inténtalo de nuevo.");
    }
    setFase("reposo");
  }

  async function crear() {
    if (!vista) return;
    const pendientes = vista.pendientes;
    const total = pendientes.length;
    const acumulado: Acumulado = { creadas: 0, yaExistian: 0, sinEjercicios: 0, errores: 0 };

    setFase("creando");
    setError(null);
    setResultado(null);
    setProgreso({ hechas: 0, total });

    try {
      for (let i = 0; i < total; i += TAM_LOTE_BORRADORES) {
        const lote = pendientes.slice(i, i + TAM_LOTE_BORRADORES);
        const respuesta = await crearBorradores(lote);
        if (!respuesta.ok) {
          setError(respuesta.error ?? "No se pudo crear un grupo de rutinas.");
          break;
        }
        acumulado.creadas += respuesta.creadas;
        acumulado.yaExistian += respuesta.yaExistian;
        acumulado.sinEjercicios += respuesta.sinEjercicios;
        acumulado.errores += respuesta.errores;
        setProgreso({ hechas: Math.min(i + TAM_LOTE_BORRADORES, total), total });
      }
    } catch {
      setError("Se cortó la conexión. Lo que ya se creó se ha guardado: pulsa Revisar para ver lo que falta.");
    }

    setResultado(acumulado);
    setVista(null);
    setFase("reposo");
  }

  async function ejecutarBloque(accion: "publicar" | "ocultar") {
    setOcupadoBloque(true);
    setResultadoBloque(null);
    try {
      const respuesta =
        accion === "publicar" ? await publicarBorradoresAuto() : await ocultarBorradoresAuto();
      setResultadoBloque({ ...respuesta, accion });
    } catch {
      setResultadoBloque({
        ok: false,
        error: "No se pudo completar. Comprueba tu conexión e inténtalo de nuevo.",
        cantidad: 0,
        pendientes: 0,
        accion,
      });
    }
    setConfirmando(null);
    setOcupadoBloque(false);
  }

  const porcentaje =
    progreso.total > 0 ? Math.round((progreso.hechas / progreso.total) * 100) : 0;

  return (
    <div className="flex flex-col gap-6">
      <Card className="flex flex-col gap-6">
        <h2 className="text-xl font-semibold">1. Qué rutinas quieres</h2>
        <GrupoChecks
          titulo="Objetivo"
          opciones={GOALS.map((v) => ({ value: v, label: GOAL_LABELS[v] }))}
          marcados={goals}
          onCambio={(v) => {
            setGoals(v);
            cambiado();
          }}
        />
        <GrupoChecks
          titulo="Nivel"
          opciones={DIFFICULTIES.map((v) => ({ value: v, label: DIFFICULTY_LABELS[v] }))}
          marcados={levels}
          onCambio={(v) => {
            setLevels(v);
            cambiado();
          }}
        />
        <GrupoChecks
          titulo="Días por semana (se respeta el máximo de cada nivel)"
          opciones={DIAS_BORRADOR.map((v) => ({ value: v as number, label: `${v} días` }))}
          marcados={days}
          onCambio={(v) => {
            setDays(v);
            cambiado();
          }}
        />
        <GrupoChecks
          titulo="Material"
          opciones={MATERIALES_BORRADOR.map((v) => ({
            value: v,
            label: MATERIAL_BORRADOR[v].largo,
          }))}
          marcados={materials}
          onCambio={(v) => {
            setMaterials(v);
            cambiado();
          }}
        />
        <GrupoChecks
          titulo="Enfoque"
          opciones={FOCUSES.map((v) => ({ value: v, label: FOCUS_LABELS[v] }))}
          marcados={focuses}
          onCambio={(v) => {
            setFocuses(v);
            cambiado();
          }}
        />
        <div className="max-w-xs">
          <Input
            name="max"
            type="number"
            label="Máximo de rutinas automáticas"
            hint={`De 1 a ${MAX_BORRADORES}. Cuenta también las que ya existen.`}
            min={1}
            max={MAX_BORRADORES}
            value={max}
            onChange={(evento) => {
              setMax(evento.target.value);
              cambiado();
            }}
          />
        </div>
        <div>
          <Button size="lg" onClick={() => void revisar()} disabled={ocupado}>
            {fase === "revisando" ? "Revisando…" : "Revisar"}
          </Button>
        </div>
      </Card>

      {error ? (
        <Alert tone="danger" title="No se pudo completar">
          {error}
        </Alert>
      ) : null}

      {vista ? (
        <Card className="flex flex-col gap-4">
          <h2 className="text-xl font-semibold">2. Resultado de la revisión</h2>
          <div className="flex flex-wrap items-center gap-2">
            <Badge>{vista.resumen.biblioteca} ejercicios en el generador</Badge>
            <Badge>{vista.resumen.posibles} combinaciones posibles</Badge>
            <Badge tone="success">{vista.resumen.aCrear} nuevas</Badge>
            <Badge tone="warning">{vista.resumen.yaExisten} ya existen</Badge>
            <Badge>{vista.resumen.duplicadas} repetidas descartadas</Badge>
            <Badge>{vista.resumen.sinEjercicios} sin ejercicios suficientes</Badge>
          </div>

          {vista.ejemplos.length > 0 ? (
            <div className="flex flex-col gap-1">
              <p className="text-sm text-muted">Algunos ejemplos:</p>
              <ul className="flex list-disc flex-col gap-1 pl-5 text-sm">
                {vista.ejemplos.map((nombre) => (
                  <li key={nombre}>{nombre}</li>
                ))}
              </ul>
            </div>
          ) : null}

          <p className="text-sm text-muted">
            Se crean <strong>ocultas</strong>: nadie las ve hasta que las
            publiques. No se guarda nada hasta que pulses el botón.
          </p>
          <div>
            <Button
              size="lg"
              onClick={() => void crear()}
              disabled={ocupado || vista.resumen.aCrear === 0}
            >
              {vista.resumen.aCrear === 0
                ? "No hay nada nuevo que crear"
                : `Crear ${vista.resumen.aCrear} rutinas ocultas`}
            </Button>
          </div>
        </Card>
      ) : null}

      {fase === "creando" ? (
        <Card className="flex flex-col gap-3">
          <p className="font-medium">
            Creando rutinas… {progreso.hechas} de {progreso.total}. No cierres la página.
          </p>
          <div
            role="progressbar"
            aria-label="Progreso de la creación"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={porcentaje}
            className="h-2 w-full overflow-hidden rounded-full bg-surface-2"
          >
            <div
              className="h-full rounded-full bg-linear-to-r from-accent to-orange-500 transition-[width] duration-300"
              style={{ width: `${porcentaje}%` }}
            />
          </div>
        </Card>
      ) : null}

      {resultado ? (
        <Alert
          tone={resultado.errores > 0 ? "warning" : "success"}
          title="Creación terminada"
        >
          Creadas: {resultado.creadas} · Ya existían: {resultado.yaExistian} · Sin
          ejercicios suficientes: {resultado.sinEjercicios} · Con error:{" "}
          {resultado.errores}.{" "}
          <Link href="/admin/rutinas" className="font-semibold underline">
            Ver la lista de rutinas
          </Link>
        </Alert>
      ) : null}

      <Card className="flex flex-col gap-4">
        <h2 className="text-xl font-semibold">3. Publicar u ocultar las automáticas</h2>
        <p className="text-sm text-muted">
          Afecta a todas las rutinas automáticas a la vez (las que empiezan por «auto-»).
          Al publicar se comprueba que no tengan días vacíos ni ejercicios
          desactivados; las que no pasen se quedan ocultas. Las 6 rutinas de
          siempre y las que hagas a mano no se tocan.
        </p>

        {confirmando ? (
          <div className="flex flex-col gap-3">
            <p className="text-sm font-medium">
              {confirmando === "publicar"
                ? "¿Seguro? Los usuarios podrán ver y usar todas las rutinas automáticas completas."
                : "¿Seguro? Los usuarios dejarán de ver todas las rutinas automáticas. Las copias que ya tengan siguen funcionando."}
            </p>
            <div className="flex flex-wrap gap-2">
              <Button onClick={() => void ejecutarBloque(confirmando)} disabled={ocupadoBloque}>
                {ocupadoBloque ? "Un momento…" : "Sí, continuar"}
              </Button>
              <Button
                variant="secondary"
                onClick={() => setConfirmando(null)}
                disabled={ocupadoBloque}
              >
                Cancelar
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            <Button onClick={() => setConfirmando("publicar")} disabled={ocupado}>
              Publicar las automáticas
            </Button>
            <Button
              variant="secondary"
              onClick={() => setConfirmando("ocultar")}
              disabled={ocupado}
            >
              Ocultar todas las automáticas
            </Button>
          </div>
        )}

        {resultadoBloque ? (
          resultadoBloque.ok ? (
            <Alert tone="success" title="Hecho">
              {resultadoBloque.accion === "publicar"
                ? `Rutinas publicadas: ${resultadoBloque.cantidad}. Siguen ocultas por no estar completas: ${resultadoBloque.pendientes}.`
                : `Rutinas ocultadas: ${resultadoBloque.cantidad}.`}
            </Alert>
          ) : (
            <Alert tone="danger" title="No se pudo completar">
              {resultadoBloque.error}
            </Alert>
          )
        ) : null}
      </Card>
    </div>
  );
}