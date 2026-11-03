export const KG_MAX = 500;

export function formatearTiempo(total: number): string {
  const minutos = Math.floor(total / 60);
  const segundos = total % 60;
  return `${minutos}:${String(segundos).padStart(2, "0")}`;
}

export function redondear(valor: number): number {
  return Math.round(valor * 100) / 100;
}

export function formatearNumero(valor: number): string {
  return valor.toLocaleString("es-ES", { maximumFractionDigits: 2 });
}