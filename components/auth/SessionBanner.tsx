import { connection } from "next/server";
import { cerrarSesion } from "../../app/(auth)/actions";
import { createClient } from "../../lib/supabase/server";
import { Alert } from "../ui/Alert";
import { Button } from "../ui/Button";

// Muestra con qué cuenta se ha entrado y el botón de cerrar sesión.
// Depende de cada usuario, así que se prepara en el momento de la petición.
export async function SessionBanner() {
  await connection();

  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const correo =
    typeof data?.claims?.email === "string" ? data.claims.email : null;

  return (
    <Alert tone="success" title="Sesión iniciada">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <span>Has entrado como {correo ?? "usuario"}.</span>
        <form action={cerrarSesion}>
          <Button type="submit" variant="secondary" size="sm">
            Cerrar sesión
          </Button>
        </form>
      </div>
    </Alert>
  );
}

// Lo que se ve mientras se comprueba la sesión.
export function SessionBannerFallback() {
  return <Alert tone="info">Comprobando la sesión…</Alert>;
}