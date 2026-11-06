import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { Suspense } from "react";
import { PageContainer, PageHeader } from "../../../components/layout/Page";
import { Card } from "../../../components/ui/Card";
import { StatCard } from "../../../components/ui/StatCard";
import {
  describirDetalles,
  etiquetaAccion,
  formatearFechaAdmin,
} from "../../../lib/admin/audit";
import { exigirSuperadmin } from "../../../lib/admin/guard";
import { ZONA_HORARIA } from "../../../lib/stats";

export const metadata: Metadata = { title: "Administración" };

type FilaHistorial = {
  id: number;
  action: string;
  details: unknown;
  created_at: string;
};

async function AdminInicio() {
  await connection();
  const supabase = await exigirSuperadmin();

  const [activos, inactivos, sinImagen, historial] = await Promise.all([
    supabase
      .from("exercises")
      .select("id", { count: "exact", head: true })
      .eq("is_active", true),
    supabase
      .from("exercises")
      .select("id", { count: "exact", head: true })
      .eq("is_active", false),
    supabase
      .from("exercises")
      .select("id", { count: "exact", head: true })
      .eq("is_active", true)
      .is("image_path", null),
    supabase
      .from("admin_audit_log")
      .select("id, action, details, created_at")
      .order("created_at", { ascending: false })
      .limit(5),
  ]);

  const numActivos = activos.count ?? 0;
  const numInactivos = inactivos.count ?? 0;
  const numSinImagen = sinImagen.count ?? 0;
  const ultimos = (historial.data ?? []) as FilaHistorial[];

  return (
    <div className="flex flex-col gap-8">
      <section aria-labelledby="resumen" className="flex flex-col gap-4">
        <h2 id="resumen" className="text-xl font-semibold">
          Resumen de la biblioteca
        </h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Ejercicios activos"
            value={String(numActivos)}
            hint="Visibles en la Biblioteca"
          />
          <StatCard
            label="Desactivados"
            value={String(numInactivos)}
            hint="Ocultos para los usuarios"
          />
          <StatCard
            label="Total"
            value={String(numActivos + numInactivos)}
            hint="En la base de datos"
          />
          <StatCard
            label="Sin imagen"
            value={String(numSinImagen)}
            hint="Ejercicios activos sin foto"
            tone={numSinImagen === 0 ? "success" : undefined}
          />
        </div>
      </section>

      <section aria-labelledby="secciones" className="flex flex-col gap-4">
        <h2 id="secciones" className="text-xl font-semibold">
          Qué puedes hacer
        </h2>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
          <Link
            href="/admin/ejercicios"
            className="flex flex-col gap-2 rounded-3xl border border-border bg-surface p-5 transition duration-200 hover:-translate-y-0.5 hover:border-accent/60 hover:bg-surface-2"
          >
            <span className="text-lg font-semibold">Ejercicios</span>
            <span className="text-sm text-muted">
              Crea, edita, duplica, activa y desactiva ejercicios.
            </span>
          </Link>
          <Link
            href="/admin/ejercicios?medios=sin_imagen&estado=activos"
            className="flex flex-col gap-2 rounded-3xl border border-border bg-surface p-5 transition duration-200 hover:-translate-y-0.5 hover:border-accent/60 hover:bg-surface-2"
          >
            <span className="text-lg font-semibold">Imágenes y vídeos</span>
            <span className="text-sm text-muted">
              Mira qué ejercicios no tienen imagen y súbela desde el editor.
            </span>
          </Link>
          <Link
            href="/admin/rutinas"
            className="flex flex-col gap-2 rounded-3xl border border-border bg-surface p-5 transition duration-200 hover:-translate-y-0.5 hover:border-accent/60 hover:bg-surface-2"
          >
            <span className="text-lg font-semibold">Rutinas estándar</span>
            <span className="text-sm text-muted">
              Publica, oculta y duplica las rutinas del catálogo.
            </span>
          </Link>
          <Link
            href="/admin/historial"
            className="flex flex-col gap-2 rounded-3xl border border-border bg-surface p-5 transition duration-200 hover:-translate-y-0.5 hover:border-accent/60 hover:bg-surface-2"
          >
            <span className="text-lg font-semibold">Historial</span>
            <span className="text-sm text-muted">
              Quién cambió qué y cuándo.
            </span>
          </Link>
        </div>
      </section>

      <section aria-labelledby="ultimos" className="flex flex-col gap-4">
        <h2 id="ultimos" className="text-xl font-semibold">
          Últimos cambios
        </h2>
        {ultimos.length === 0 ? (
          <Card>
            <p className="text-muted">Todavía no hay cambios registrados.</p>
          </Card>
        ) : (
          <ul className="flex flex-col gap-2">
            {ultimos.map((fila) => (
              <li
                key={fila.id}
                className="flex flex-col gap-1 rounded-2xl border border-border bg-surface px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <span>
                  <span className="font-medium">{etiquetaAccion(fila.action)}</span>
                  <span className="text-muted">
                    {" "}
                    · {describirDetalles(fila.details)}
                  </span>
                </span>
                <span className="text-sm text-muted">
                  {formatearFechaAdmin(fila.created_at, ZONA_HORARIA)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

export default function AdminPage() {
  return (
    <PageContainer>
      <PageHeader
        title="Administración"
        description="Panel privado: solo lo ves tú."
      />
      <Suspense
        fallback={<div className="h-64 animate-pulse rounded-3xl bg-surface-2" />}
      >
        <AdminInicio />
      </Suspense>
    </PageContainer>
  );
}