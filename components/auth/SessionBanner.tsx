import { connection } from "next/server";
import { cerrarSesion } from "../../app/(auth)/actions";
import { createClient } from "../../lib/supabase/server";
import { Alert } from "../ui/Alert";
import { Button } from "../ui/Button";
import { ButtonLink } from "../ui/ButtonLink";
import { BannerPlegable } from "./BannerPlegable";

// Saludo con tu nombre, tu correo, y los botones de perfil y cerrar sesión.
// Aparece al entrar y se pliega solo. Depende de cada usuario, así que se
// prepara en el momento de la petición.
export async function SessionBanner() {
  await connection();

  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const correo =
    typeof data?.claims?.email === "string" ? data.claims.email : null;

  const { data: perfil } = await supabase
    .from("profiles")
    .select("display_name")
    .maybeSingle();
  const nombre: string | null = perfil?.display_name ?? null;

  return (
    <BannerPlegable clave={correo ?? "usuario"}>
      <Alert
        tone="success"
        title={nombre ? `Hola, ${nombre}` : "Sesión iniciada"}
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <span>Has entrado como {correo ?? "usuario"}.</span>
          <div className="flex flex-wrap items-center gap-2">
            <ButtonLink href="/perfil" variant="secondary" size="md">
              Mi perfil
            </ButtonLink>
            <form action={cerrarSesion}>
              <Button type="submit" variant="secondary" size="md">
                Cerrar sesión
              </Button>
            </form>
          </div>
        </div>
      </Alert>
    </BannerPlegable>
  );
}

// Lo que se ve mientras se comprueba la sesión.
export function SessionBannerFallback() {
  return <Alert tone="info">Comprobando la sesión…</Alert>;
}