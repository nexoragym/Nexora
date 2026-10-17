import type { InputHTMLAttributes } from "react";
import { cn } from "../../lib/cn";

type InputProps = Omit<InputHTMLAttributes<HTMLInputElement>, "id"> & {
  name: string;
  label: string;
  hint?: string;
  error?: string;
};

// Campo de texto con etiqueta, ayuda opcional y mensaje de error.
// El "name" se usa también como identificador del campo.
export function Input({
  name,
  label,
  hint,
  error,
  className,
  ...props
}: InputProps) {
  const hintId = hint ? `${name}-hint` : undefined;
  const errorId = error ? `${name}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(" ") || undefined;

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={name} className="text-sm font-medium">
        {label}
      </label>
      <input
        id={name}
        name={name}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        className={cn(
          "h-12 w-full rounded-xl border bg-surface-2 px-4 text-base text-foreground " +
            "placeholder:text-muted/70 transition-colors " +
            "disabled:cursor-not-allowed disabled:opacity-50",
          error
            ? "border-danger"
            : "border-border hover:border-muted focus-visible:border-accent",
          className,
        )}
        {...props}
      />
      {hint ? (
        <p id={hintId} className="text-sm text-muted">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={errorId} role="alert" className="text-sm text-danger">
          {error}
        </p>
      ) : null}
    </div>
  );
}