"use client";

import { useRef, useState } from "react";
import { buscarEjerciciosParaRutina } from "../../app/(app)/admin/rutinas/editor-actions";
import type { ResultadoBusqueda } from "../../lib/admin/routine-form";
import {
  DIFFICULTY_LABELS,
  EQUIPMENT_LABELS,
  MUSCLE_LABELS,
} from "../../lib/exercises";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";

type ExercisePickerProps = {
  idBase: string;
  yaUsados: ReadonlySet<string>;
  onAnadir: (ejercicio: ResultadoBusqueda) => void;
};

// Buscador de ejercicios para añadir a un día.
export function ExercisePicker({ idBase, yaUsados, onAnadir }: ExercisePickerProps) {
  const [texto, setTexto] = useState("");
  const [resultados, setResultados] = useState<ResultadoBusqueda[]>([]);
  const [buscando, setBuscando] = useState(false);
  const [fallo, setFallo] = useState(false);
  const temporizador = useRef<number | null>(null);
  const turno = useRef(0);

  function cambiar(valor: string) {
    setTexto(valor);
    if (temporizador.current !== null) window.clearTimeout(temporizador.current);
    turno.current += 1;
    const miTurno = turno.current;

    if (valor.trim().length < 2) {
      setResultados([]);
      setBuscando(false);
      setFallo(false);
      return;
    }

    setBuscando(true);
    temporizador.current = window.setTimeout(async () => {
      try {
        const respuesta = await buscarEjerciciosParaRutina(valor);
        if (turno.current !== miTurno) return;
        setResultados(respuesta.resultados);
        setFallo(!respuesta.ok);
      } catch {
        if (turno.current === miTurno) setFallo(true);
      }
      if (turno.current === miTurno) setBuscando(false);
    }, 300);
  }

  return (
    <div className="flex flex-col gap-3">
      <Input
        name={`buscar-${idBase}`}
        type="search"
        label="Añadir un ejercicio"
        hint="Escribe al menos 2 letras: el nombre o otra forma de escribirlo."
        value={texto}
        onChange={(evento) => cambiar(evento.target.value)}
        maxLength={50}
        autoComplete="off"
      />

      {buscando ? <p className="text-sm text-muted">Buscando…</p> : null}
      {fallo ? (
        <p role="alert" className="text-sm text-danger">
          No se pudo buscar. Inténtalo de nuevo.
        </p>
      ) : null}
      {!buscando && !fallo && texto.trim().length >= 2 && resultados.length === 0 ? (
        <p className="text-sm text-muted">No hay ejercicios con esa búsqueda.</p>
      ) : null}

      {resultados.length > 0 ? (
        <ul className="flex flex-col gap-2">
          {resultados.map((resultado) => {
            const usado = yaUsados.has(resultado.id);
            return (
              <li
                key={resultado.id}
                className="flex items-center justify-between gap-3 rounded-2xl border border-border bg-surface-2 px-4 py-3"
              >
                <div className="flex min-w-0 flex-col">
                  <span className="font-medium">{resultado.name}</span>
                  <span className="text-xs text-muted">
                    {EQUIPMENT_LABELS[resultado.equipment]} ·{" "}
                    {DIFFICULTY_LABELS[resultado.difficulty]} ·{" "}
                    {resultado.muscles.map((m) => MUSCLE_LABELS[m]).join(", ")}
                  </span>
                </div>
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  disabled={usado}
                  onClick={() => onAnadir(resultado)}
                >
                  {usado ? "Ya está" : "Añadir"}
                </Button>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}