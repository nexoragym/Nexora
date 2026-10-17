import type { HTMLAttributes } from "react";
import { cn } from "../../lib/cn";

export type AlertTone = "info" | "success" | "warning" | "danger";

type AlertProps = HTMLAttributes<HTMLDivElement> & {
  tone?: AlertTone;
  title?: string;
};

const estilos: Record<AlertTone, string> = {
  info: "border-border bg-surface-2",
  success: "border-success/40 bg-success/10",
  warning: "border-warning/40 bg-warning/10",
  danger: "border-danger/40 bg-danger/10",
};

const colorTitulo: Record<AlertTone, string> = {
  info: "text-foreground",
  success: "text-success",
  warning: "text-warning",
  danger: "text-danger",
};

// Mensaje destacado. Los avisos y errores se anuncian a los lectores de pantalla.
export function Alert({
  tone = "info",
  title,
  className,
  children,
  ...props
}: AlertProps) {
  const rol = tone === "danger" || tone === "warning" ? "alert" : "status";

  return (
    <div
      role={rol}
      className={cn("rounded-2xl border p-4", estilos[tone], className)}
      {...props}
    >
      {title ? (
        <p className={cn("font-semibold", colorTitulo[tone])}>{title}</p>
      ) : null}
      <div className="text-sm text-muted">{children}</div>
    </div>
  );
}