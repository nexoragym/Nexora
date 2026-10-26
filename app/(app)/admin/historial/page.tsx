import type { Metadata } from "next";
import { connection } from "next/server";
import { Suspense } from "react";
import { PageContainer, PageHeader } from "../../../../components/layout/Page";
import { Alert } from "../../../../components/ui/Alert";
import {
  describirDetalles,
  etiquetaAccion,
  formatearFechaAdmin,
} from "../../../../lib/admin/audit";
import { exigirSuperadmin } from "../../../../lib/admin/guard";
import { ZONA_HORARIA } from "../../../../lib/stats";

export const metadata: Metadata = { title: "Historial · Admin" };

type FilaHistorial = {
  id: number;
  action: string;
  details: unknown;
  created_at: string;
};

async function TablaHistorial() {
  await connection();
  const supabase = await exigirSuperadmin();

  const { data, error } = await supabase
    .from("admin_audit_log")
    .select("id, action, details, created_at")
    .order("created_at", { ascending: false })
    .limit(200);

  if (error) {
    console.error("[admin] error al leer el historial:", error.code ?? error.message);
    return (
      <Alert tone="danger" title="No se pudo cargar el historial">
        Inténtalo de nuevo en unos instantes.
      </Alert>
    );
  }

  const filas = (data ?? []) as FilaHistorial[];

  if (filas.length === 0) {
    return (
      <Alert tone="info" title="Sin cambios todavía">
        Cuando crees o edites algo desde el panel, aparecerá aquí.
      </Alert>
    );
  }

  return (
    <div className="overflow-x-auto rounded-3xl border border-border bg-surface">
      <table className="w-full min-w-[40rem] text-left text-sm">
        <thead className="border-b border-border text-muted">
          <tr>
            <th className="px-4 py-3 font-medium">Fecha</th>
            <th className="px-4 py-3 font-medium">Acción</th>
            <th className="px-4 py-3 font-medium">Detalle</th>
          </tr>
        </thead>
        <tbody>
          {filas.map((fila) => (
            <tr
              key={fila.id}
              className="border-b border-border last:border-0 hover:bg-surface-2/50"
            >
              <td className="whitespace-nowrap px-4 py-3 text-muted">
                {formatearFechaAdmin(fila.created_at, ZONA_HORARIA)}
              </td>
              <td className="px-4 py-3 font-medium">
                {etiquetaAccion(fila.action)}
              </td>
              <td className="px-4 py-3 text-muted">
                {describirDetalles(fila.details)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function HistorialPage() {
  return (
    <PageContainer>
      <PageHeader
        title="Historial"
        description="Los últimos 200 cambios hechos desde el panel."
      />
      <Suspense
        fallback={<div className="h-64 animate-pulse rounded-3xl bg-surface-2" />}
      >
        <TablaHistorial />
      </Suspense>
    </PageContainer>
  );
}