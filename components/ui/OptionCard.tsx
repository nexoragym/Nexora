import type { InputHTMLAttributes } from "react";

type OptionCardProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "type" | "id" | "name" | "value"
> & {
  type?: "radio" | "checkbox";
  name: string;
  value: string;
  title: string;
  description?: string;
};

export function OptionCard({
  type = "radio",
  name,
  value,
  title,
  description,
  ...props
}: OptionCardProps) {
  const id = `${name}-${value}`;

  return (
    <label htmlFor={id} className="relative block cursor-pointer">
      <input
        id={id}
        type={type}
        name={name}
        value={value}
        className="peer sr-only"
        {...props}
      />
      <span className="flex min-h-16 flex-col justify-center gap-0.5 rounded-2xl border-2 border-border bg-surface-2 p-4 pr-12 transition-colors hover:border-muted peer-checked:border-accent peer-checked:bg-accent/10 peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-accent peer-disabled:cursor-not-allowed peer-disabled:opacity-50">
        <span className="font-semibold">{title}</span>
        {description ? (
          <span className="text-sm text-muted">{description}</span>
        ) : null}
      </span>
      <span
        aria-hidden="true"
        className="pointer-events-none absolute right-3 top-3 flex h-6 w-6 items-center justify-center rounded-full bg-accent text-accent-foreground opacity-0 transition-opacity peer-checked:opacity-100"
      >
        <svg
          viewBox="0 0 24 24"
          width="16"
          height="16"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M5 12.5l4.5 4.5L19 7.5" />
        </svg>
      </span>
    </label>
  );
}