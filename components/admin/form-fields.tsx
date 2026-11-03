"use client";

import type { ReactNode } from "react";
import { MUSCLES, MUSCLE_LABELS, type Muscle } from "../../lib/exercises";

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

export function CampoTexto({
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

export function GrupoMusculos({
  nombre,
  titulo,
  marcados,
  error,
}: GrupoMusculosProps) {
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