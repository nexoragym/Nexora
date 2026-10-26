import { Suspense, type ReactNode } from "react";
import { connection } from "next/server";
import { AppShell } from "../../components/layout/AppShell";
import { createClient } from "../../lib/supabase/server";

// Pregunta a la base de datos si eres superadministrador para mostrar el menú Admin.
async function ShellConPermisos({ children }: { children: ReactNode }) {
  await connection();

  const supabase = await createClient();
  const { data } = await supabase.rpc("is_superadmin");

  return <AppShell esAdmin={data === true}>{children}</AppShell>;
}

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={<AppShell>{null}</AppShell>}>
      <ShellConPermisos>{children}</ShellConPermisos>
    </Suspense>
  );
}