import { cn } from "../../lib/cn";
import { siteConfig } from "../../lib/site";

type LogoMarkProps = {
  className?: string;
};

// Símbolo de NEXORA: una N atravesada por una flecha ascendente y una pesa rusa.
// Los colores salen de la paleta de la web (globals.css).
export function LogoMark({ className }: LogoMarkProps) {
  return (
    <svg viewBox="0 0 100 100" aria-hidden="true" className={className}>
      {/* La N */}
      <polygon
        className="fill-foreground"
        points="8,14 22,14 58,60 58,14 72,14 72,86 58,86 22,40 22,86 8,86"
      />
      {/* Flecha: primero un borde del color del fondo para separarla de la N */}
      <path
        d="M4 82 L26 58 L38 70 L82 22"
        fill="none"
        strokeWidth="12"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="stroke-background"
      />
      <polygon
        points="92,11 76,17 88,28"
        strokeWidth="6"
        strokeLinejoin="round"
        className="fill-background stroke-background"
      />
      {/* Flecha en el color de acento */}
      <path
        d="M4 82 L26 58 L38 70 L82 22"
        fill="none"
        strokeWidth="6"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="stroke-accent"
      />
      <polygon
        points="92,11 76,17 88,28"
        strokeWidth="1"
        strokeLinejoin="round"
        className="fill-accent stroke-accent"
      />
      {/* Pesa rusa */}
      <circle cx="86" cy="80" r="9" className="fill-foreground" />
      <path
        d="M80 73 v-4 a6 6 0 0 1 12 0 v4"
        fill="none"
        strokeWidth="3"
        strokeLinecap="round"
        className="stroke-foreground"
      />
    </svg>
  );
}

type LogoProps = {
  size?: "md" | "lg";
  showName?: boolean;
  className?: string;
};

const tamanos = {
  md: { marca: "h-9 w-9", nombre: "text-xl" },
  lg: { marca: "h-11 w-11", nombre: "text-2xl" },
};

// Símbolo + nombre. Con showName={false} solo se ve el símbolo,
// pero el nombre sigue disponible para lectores de pantalla.
export function Logo({ size = "md", showName = true, className }: LogoProps) {
  const t = tamanos[size];

  return (
    <span className={cn("inline-flex items-center gap-3", className)}>
      <LogoMark className={cn("shrink-0", t.marca)} />
      <span
        className={
          showName ? cn("font-semibold tracking-wide", t.nombre) : "sr-only"
        }
      >
        {siteConfig.name}
      </span>
    </span>
  );
}