import { Card } from "./Card";
import { cn } from "../../lib/cn";

type StatCardProps = {
  label: string;
  value: string;
  hint?: string;
  tone?: "default" | "success";
};

export function StatCard({
  label,
  value,
  hint,
  tone = "default",
}: StatCardProps) {
  return (
    <Card className="flex flex-col gap-1">
      <p className="text-sm text-muted">{label}</p>
      <p className="text-3xl font-semibold tracking-tight tabular-nums">
        {value}
      </p>
      {hint ? (
        <p
          className={cn(
            "text-sm",
            tone === "success" ? "text-success" : "text-muted",
          )}
        >
          {hint}
        </p>
      ) : null}
    </Card>
  );
}