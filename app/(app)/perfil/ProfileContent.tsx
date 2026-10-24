import { connection } from "next/server";
import { ProfileAvatar } from "../../../components/profile/ProfileAvatar";
import { Button } from "../../../components/ui/Button";
import { Card } from "../../../components/ui/Card";
import { createClient } from "../../../lib/supabase/server";
import { cerrarSesion } from "../../(auth)/actions";
import { ProfileForm } from "./ProfileForm";

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

  const nombre = perfil?.display_name ?? null;

  return (
    <div className="flex w-full flex-col gap-6">
      <Card className="flex flex-col items-center gap-6 sm:flex-row sm:p-8">
        <ProfileAvatar nombre={nombre} correo={correo} />
        <div className="flex min-w-0 flex-col items-center gap-1 text-center sm:items-start sm:text-left">
          <p className="max-w-full truncate text-3xl font-semibold tracking-tight">
            {nombre ?? "Tu perfil"}
          </p>
          <p className="max-w-full truncate text-muted">{correo ?? "—"}</p>
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="flex flex-col gap-4">
          <h2 className="text-xl font-semibold">Nombre</h2>
          <ProfileForm nombreInicial={nombre ?? ""} />
        </Card>

        <Card className="flex flex-col gap-4">
          <h2 className="text-xl font-semibold">Sesión</h2>
          <p className="text-muted">
            Cierra la sesión en este dispositivo cuando termines.
          </p>
          <form action={cerrarSesion}>
            <Button type="submit" variant="secondary">
              Cerrar sesión
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}