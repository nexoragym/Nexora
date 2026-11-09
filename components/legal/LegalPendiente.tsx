import { legalPendiente } from "../../lib/legal";
import { Alert } from "../ui/Alert";

// Aviso que desaparece solo cuando se rellenan los datos de lib/legal.ts.
export function LegalPendiente() {
  if (!legalPendiente()) return null;
  return (
    <Alert tone="warning" title="Borrador: faltan los datos del titular">
      Rellena tu nombre y tu correo de contacto en el archivo lib/legal.ts. Este
      aviso desaparece solo cuando lo hagas.
    </Alert>
  );
}