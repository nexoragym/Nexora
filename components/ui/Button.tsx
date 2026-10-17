import type { ButtonHTMLAttributes } from "react";
import { cn } from "../../lib/cn";

export type ButtonVariant = "primary" | "secondary" | "ghost";
export type ButtonSize = "sm" | "md" | "lg" | "xl";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
};

const base =
  "inline-flex items-center justify-center gap-2 rounded-2xl font-semibold " +
  "transition duration-150 select-none " +
  "disabled:cursor-not-allowed disabled:opacity-50 enabled:active:scale-[0.98]";

const variants: Record<ButtonVariant, string> = {
  primary:
    "bg-linear-to-br from-accent to-accent-hover text-accent-foreground " +
    "shadow-lg shadow-accent/20 enabled:hover:brightness-110",
  secondary:
    "border border-border bg-surface-2 text-foreground enabled:hover:bg-border",
  ghost: "text-muted enabled:hover:bg-surface-2 enabled:hover:text-foreground",
};

// Los tamaños "md", "lg" y "xl" miden al menos 44 px de alto: cómodos al tacto.
const sizes: Record<ButtonSize, string> = {
  sm: "h-9 px-3 text-sm",
  md: "h-11 px-5 text-base",
  lg: "h-12 px-6 text-base",
  xl: "h-14 px-8 text-lg uppercase tracking-wide",
};

export function Button({
  variant = "primary",
  size = "md",
  fullWidth = false,
  type = "button",
  className,
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
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