// Datos legales de la web. Se rellenan UNA vez, aquí.
// Mientras el titular o el correo empiecen por «[», las páginas legales muestran un aviso.
export type DatosLegales = {
  titular: string;
  email: string;
  // Opcionales: si los dejas vacíos, no se muestran. Si la web llega a tener
  // actividad económica (por ejemplo, Premium), conviene rellenarlos.
  nif: string;
  domicilio: string;
  ultimaActualizacion: string;
  edadMinima: number;
};

export const LEGAL: DatosLegales = {
  titular: "[TU NOMBRE Y APELLIDOS]",
  email: "[TU CORREO DE CONTACTO]",
  nif: "",
  domicilio: "",
  ultimaActualizacion: "9 de noviembre de 2026",
  edadMinima: 14,
};

export function legalPendiente(): boolean {
  return LEGAL.titular.startsWith("[") || LEGAL.email.startsWith("[");
}