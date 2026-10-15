// Une nombres de clases CSS ignorando los valores vacíos.
export function cn(
  ...clases: Array<string | false | null | undefined>
): string {
  return clases.filter(Boolean).join(" ");
}