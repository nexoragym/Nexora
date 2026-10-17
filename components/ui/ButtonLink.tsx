import Link from "next/link";
import type { ComponentProps } from "react";
import { cn } from "../../lib/cn";

type ButtonLinkProps = ComponentProps<typeof Link> & {
  variant?: "primary" | "secondary";
  size?: "md" | "lg" | "xl";
  fullWidth?: boolean;
};

const base =
  "inline-flex items-center justify-center gap-2 rounded-2xl font-semibold " +
  "transition duration-150 select-none active:scale-[0.98]";

const variants = {
  primary:
    "bg-linear-to-br from-accent to-accent-hover text-accent-foreground " +
    "shadow-lg shadow-accent/20 hover:brightness-110",
  secondary: "border border-border bg-surface-2 text-foreground hover:bg-border",
};

const sizes = {
  md: "h-11 px-5 text-base",
  lg: "h-12 px-6 text-base",
  xl: "h-14 px-8 text-lg",
};

// Enlace con el mismo aspecto que un botón, para navegar entre páginas.
export function ButtonLink({
  variant = "primary",
  size = "lg",
  fullWidth = false,
  className,
  ...props
}: ButtonLinkProps) {
  return (
    <Link
      className={cn(
        base,
        variants[variant],
        sizes[size],
        fullWidth && "w-full",
        className,
      )}
      {...props}
    />
  );
}