"use client";

import {
  ejercicioNuevo,
  moverElemento,
  type DiaDraft,
  type EjercicioDraft,
  type Num,
  type ResultadoBusqueda,
} from "../../lib/admin/routine-form";
import { esPorTiempo } from "../../lib/routines/catalog";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";
import { Input } from "../ui/Input";
import { ExercisePicker } from "./ExercisePicker";

type RoutineDayEditorProps = {
  indice: number;
  total: number;
  dia: DiaDraft;
  onCambiar: (dia: DiaDraft) => void;
  onMover: (delta: -1 | 1) => void;
  onQuitar: () => void;
};

type CampoNumeroProps = {
  etiqueta: string;
  valor: Num;
  min: number;
  max: number;
  onCambio: (valor: Num) => void;
};

function CampoNumero({ etiqueta, valor, min, max, onCambio }: CampoNumeroProps) {
  return (
    <label className="flex flex-col gap-1 text-xs text-muted">
      {etiqueta}
      <input
        type="number"
        inputMode="numeric"
        min={min}
        max={max}
        value={valor}
        onChange={(evento) =>
          onCambio(evento.target.value === "" ? "" : Number(evento.target.value))
        }
        className="h-10 w-20 rounded-xl border border-border bg-surface-2 px-2 text-base text-foreground hover:border-muted focus-visible:border-accent"
      />
    </label>
  );
}

export function RoutineDayEditor({
  indice,
  total,
  dia,
  onCambiar,
  onMover,
  onQuitar,
}: RoutineDayEditorProps) {
  const usados = new Set(dia.exercises.map((e) => e.exerciseId));

  function cambiarEjercicio(j: number, parcial: Partial<EjercicioDraft>) {
    onCambiar({
      ...dia,
      exercises: dia.exercises.map((e, k) => (k === j ? { ...e, ...parcial } : e)),
    });
  }

  function anadir(resultado: ResultadoBusqueda) {
    onCambiar({ ...dia, exercises: [...dia.exercises, ejercicioNuevo(resultado)] });
  }

  return (
    <Card className="flex flex-col gap-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <h3 className="text-xl font-semibold">Día {indice + 1}</h3>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            size="sm"
            variant="secondary"
            aria-label={`Subir el día ${indice + 1}`}
            disabled={indice === 0}
            onClick={() => onMover(-1)}
          >
            ↑ Subir
          </Button>
          <Button
            type="button"
            size="sm"
            variant="secondary"
            aria-label={`Bajar el día ${indice + 1}`}
            disabled={indice === total - 1}
            onClick={() => onMover(1)}
          >
            ↓ Bajar
          </Button>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            disabled={total <= 1}
            onClick={onQuitar}
          >
            Quitar día
          </Button>
        </div>
      </div>

      <Input
        name={`dia-${indice}-nombre`}
        label="Nombre del día"
        hint="Por ejemplo: Cuerpo completo, o Parte superior (pecho, espalda y brazos)."
        value={dia.name}
        onChange={(evento) => onCambiar({ ...dia, name: evento.target.value })}
        maxLength={80}
        autoComplete="off"
      />

      {dia.exercises.length === 0 ? (
        <p className="text-sm text-muted">
          Este día todavía no tiene ejercicios. Búscalos abajo y pulsa «Añadir».
        </p>
      ) : (
        <ol className="flex flex-col gap-3">
          {dia.exercises.map((e, j) => {
            const porTiempo = esPorTiempo(e.slug);
            return (
              <li
                key={e.exerciseId}
                className="flex flex-col gap-3 rounded-2xl border border-border bg-surface-2 p-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-medium">
                      {j + 1}. {e.name}
                    </span>
                    {e.active ? null : <Badge tone="danger">Desactivado</Badge>}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      type="button"
                      size="sm"
                      variant="secondary"
                      aria-label={`Subir ${e.name}`}
                      disabled={j === 0}
                      onClick={() =>
                        onCambiar({
                          ...dia,
                          exercises: moverElemento(dia.exercises, j, -1),
                        })
                      }
                    >
                      ↑
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="secondary"
                      aria-label={`Bajar ${e.name}`}
                      disabled={j === dia.exercises.length - 1}
                      onClick={() =>
                        onCambiar({
                          ...dia,
                          exercises: moverElemento(dia.exercises, j, 1),
                        })
                      }
                    >
                      ↓
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() =>
                        onCambiar({
                          ...dia,
                          exercises: dia.exercises.filter((_, k) => k !== j),
                        })
                      }
                    >
                      Quitar
                    </Button>
                  </div>
                </div>
                <div className="flex flex-wrap gap-3">
                  <CampoNumero
                    etiqueta="Series"
                    valor={e.sets}
                    min={1}
                    max={10}
                    onCambio={(valor) => cambiarEjercicio(j, { sets: valor })}
                  />
                  <CampoNumero
                    etiqueta={porTiempo ? "Seg. mín." : "Rep. mín."}
                    valor={e.repsMin}
                    min={1}
                    max={100}
                    onCambio={(valor) => cambiarEjercicio(j, { repsMin: valor })}
                  />
                  <CampoNumero
                    etiqueta={porTiempo ? "Seg. máx." : "Rep. máx."}
                    valor={e.repsMax}
                    min={1}
                    max={100}
                    onCambio={(valor) => cambiarEjercicio(j, { repsMax: valor })}
                  />
                  <CampoNumero
                    etiqueta="Descanso (s)"
                    valor={e.rest}
                    min={0}
                    max={600}
                    onCambio={(valor) => cambiarEjercicio(j, { rest: valor })}
                  />
                </div>
              </li>
            );
          })}
        </ol>
      )}

      <ExercisePicker idBase={`dia-${indice}`} yaUsados={usados} onAnadir={anadir} />
    </Card>
  );
}