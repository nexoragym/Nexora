"use client";

import { useRef, useState } from "react";
import { buscarEjerciciosUsuario } from "../../app/(app)/mis-rutinas/actions";
import type { ResultadoBusqueda } from "../../lib/admin/routine-form";
import {
  DIFFICULTY_LABELS,
  EQUIPMENT_LABELS,
  EQUIPMENT_OPTIONS,
  MUSCLE_LABELS,
  MUSCLE_OPTIONS,
} from "../../lib/exercises";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { Select } from "../ui/Select";

type CustomExercisePickerProps = {
  idBase: string;
  yaUsados: ReadonlySet<string>;
  onAnadir: (ejercicio: ResultadoBusqueda) => void;
};

// Buscador de ejercicios para tu rutina: por nombre, músculo y material.
export function CustomExercisePicker({
  idBase,
  yaUsados,
  onAnadir,
}: CustomExercisePickerProps) {
  const [texto, setTexto] = useState("");
  const [musculo, setMusculo] = useState("");
  const [material, setMaterial] = useState("");
  const [resultados, setResultados] = useState<ResultadoBusqueda[]>([]);
  const [buscando, setBuscando] = useState(false);
  const [fallo, setFallo] = useState(false);
  const temporizador = useRef<number | null>(null);
  const turno = useRef(0);

  const hayBusqueda = texto.trim().length >= 2 || musculo !== "" || material !== "";

  function programar(nuevoTexto: string, nuevoMusculo: string, nuevoMaterial: string) {
    if (temporizador.current !== null) window.clearTimeout(temporizador.current);
    turno.current += 1;
    const miTurno = turno.current;

    const conTexto = nuevoTexto.trim().length >= 2;
    if (!conTexto && !nuevoMusculo && !nuevoMaterial) {
      setResultados([]);
      setBuscando(false);
      setFallo(false);
      return;
    }

    setBuscando(true);
    temporizador.current = window.setTimeout(async () => {
      try {
        const respuesta = await buscarEjerciciosUsuario({
          texto: conTexto ? nuevoTexto : "",
          muscle: nuevoMusculo,
          equipment: nuevoMaterial,
        });
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
      <p className="text-sm font-medium">Añadir un ejercicio</p>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Input
          name={`buscar-${idBase}`}
          type="search"
          label="Buscar"
          placeholder="Por ejemplo, remo"
          value={texto}
          onChange={(evento) => {
            setTexto(evento.target.value);
            programar(evento.target.value, musculo, material);
          }}
          maxLength={50}
          autoComplete="off"
        />
        <Select
          name={`musculo-${idBase}`}
          label="Músculo"
          placeholder="Todos"
          options={MUSCLE_OPTIONS}
          value={musculo}
          onChange={(evento) => {
            setMusculo(evento.target.value);
            programar(texto, evento.target.value, material);
          }}
        />
        <Select
          name={`material-${idBase}`}
          label="Material"
          placeholder="Todo"
          options={EQUIPMENT_OPTIONS}
          value={material}
          onChange={(evento) => {
            setMaterial(evento.target.value);
            programar(texto, musculo, evento.target.value);
          }}
        />
      </div>

      {!hayBusqueda ? (
        <p className="text-sm text-muted">
          Escribe el nombre (al menos 2 letras) o elige un músculo o un material.
        </p>
      ) : null}
      {buscando ? <p className="text-sm text-muted">Buscando…</p> : null}
      {fallo ? (
        <p role="alert" className="text-sm text-danger">
          No se pudo buscar. Inténtalo de nuevo.
        </p>
      ) : null}
      {hayBusqueda && !buscando && !fallo && resultados.length === 0 ? (
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