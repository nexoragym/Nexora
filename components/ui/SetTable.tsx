import { cn } from "../../lib/cn";

export type SetData = {
  previa: string;
  kg: string;
  repes: string;
};

type SetTableProps = {
  sets: SetData[];
};

const columnas =
  "grid grid-cols-[2.75rem_minmax(0,1fr)_4rem_4rem_2.75rem] items-center gap-2";

const campo =
  "h-11 w-full rounded-xl border border-border bg-surface px-2 text-center " +
  "text-base font-semibold tabular-nums text-foreground";

export function SetTable({ sets }: SetTableProps) {
  return (
    <div className="flex w-full max-w-2xl flex-col gap-2">
      <div
        className={cn(
          columnas,
          "px-2 text-xs uppercase tracking-wide text-muted",
        )}
      >
        <span>Serie</span>
        <span>Previa</span>
        <span className="text-center">Kg</span>
        <span className="text-center">Repes</span>
        <span className="sr-only">Completada</span>
      </div>

      {sets.map((serie, indice) => {
        const numero = indice + 1;
        return (
          <div
            key={numero}
            className={cn(columnas, "rounded-2xl bg-surface-2 px-2 py-2")}
          >
            <span className="font-semibold tabular-nums">{numero}</span>
            <span className="text-xs tabular-nums text-muted">
              {serie.previa}
            </span>
            <input
              type="text"
              inputMode="decimal"
              defaultValue={serie.kg}
              aria-label={`Kilos de la serie ${numero}`}
              className={campo}
            />
            <input
              type="text"
              inputMode="numeric"
              defaultValue={serie.repes}
              aria-label={`Repeticiones de la serie ${numero}`}
              className={campo}
            />
            <label className="flex h-11 w-11 cursor-pointer items-center justify-center">
              <input
                type="checkbox"
                className="peer sr-only"
                aria-label={`Serie ${numero} completada`}
              />
              <span className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-surface text-muted transition-colors peer-checked:border-transparent peer-checked:bg-accent peer-checked:text-accent-foreground peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-accent">
                <svg
                  viewBox="0 0 24 24"
                  width="20"
                  height="20"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M5 12.5l4.5 4.5L19 7.5" />
                </svg>
              </span>
            </label>
          </div>
        );
      })}
    </div>
  );
}