import { connection } from "next/server";
import { Button } from "../../../components/ui/Button";
import { ButtonLink } from "../../../components/ui/ButtonLink";
import { Card } from "../../../components/ui/Card";
import { createClient } from "../../../lib/supabase/server";
import { cerrarSesion } from "../../(auth)/actions";
import { ProfileForm } from "./ProfileForm";

// Datos del perfil leídos de la base de datos. Depende de cada usuario,
// así que se declara dinámico antes de hacer cualquier otra cosa.
export async function ProfileContent() {
  await connection();

  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const correo =
    typeof data?.claims?.email === "string" ? data.claims.email : null;

  const { data: perfil } = await supabase
    .from("profiles")
    .select("display_name")
    .maybeSingle();

  return (
    <div className="flex max-w-2xl flex-col gap-6">
      <Card className="flex flex-col gap-4">
        <h2 className="text-xl font-semibold">Nombre</h2>
        <ProfileForm nombreInicial={perfil?.display_name ?? ""} />
      </Card>

      <Card className="flex flex-col gap-4">
        <h2 className="text-xl font-semibold">Preferencias de entrenamiento</h2>
        <p className="text-muted">
          Tu nivel, tu objetivo, los días que puedes entrenar y el material que
          tienes. Con ellas prepararemos tu rutina.
        </p>
        <div>
          <ButtonLink href="/cuestionario" size="md">
            Rellenar o cambiar el cuestionario
          </ButtonLink>
        </div>
      </Card>

      <Card className="flex flex-col gap-4">
        <h2 className="text-xl font-semibold">Tu cuenta</h2>
        <p className="text-muted">
          Correo: <span className="text-foreground">{correo ?? "—"}</span>
        </p>
        <form action={cerrarSesion}>
          <Button type="submit" variant="secondary">
            Cerrar sesión
          </Button>
        </form>
      </Card>
    </div>
  );
}