import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { Suspense } from "react";
import { ExerciseImporter } from "../../../../../components/admin/ExerciseImporter";
import { PageContainer, PageHeader } from "../../../../../components/layout/Page";
import { Card } from "../../../../../components/ui/Card";
import { MAX_FILAS_IMPORTACION } from "../../../../../lib/admin/exercise-import";
import { exigirSuperadmin } from "../../../../../lib/admin/guard";
import {
  DIFFICULTIES,
  EQUIPMENT,
  MOVEMENT_PATTERNS,
  MUSCLES,
} from "../../../../../lib/exercises";

export const metadata: Metadata = { title: "Importar ejercicios · Admin" };

const EJEMPLO = `[
  {
    "slug": "remo-con-barra",
    "name": "Remo con barra",
    "primary_muscles": ["lats", "upper_back"],
    "secondary_muscles": ["biceps"],
    "equipment": "barbell",
    "movement_pattern": "pull",
    "difficulty": "intermediate",
    "instructions": ["Paso 1", "Paso 2", "Paso 3"],
    "common_mistakes": ["Error 1", "Error 2", "Error 3"],
    "aliases": ["barbell row", "remo barra", "remo inclinado"],
    "use_in_generator": true,
    "popularity": 3,
    "is_active": true
  }
]`;

async function Contenido() {
  await connection();
  await exigirSuperadmin();
  return <ExerciseImporter />;
}

export default function ImportarEjerciciosPage() {
  return (
    <PageContainer>
      <div className="flex flex-col gap-4">
        <Link
          href="/admin/ejercicios"
          className="text-sm text-muted transition hover:text-foreground"
        >
          ← Volver a Ejercicios
        </Link>
        <PageHeader
          title="Importar ejercicios"
          description={`Pega una lista en formato JSON (hasta ${MAX_FILAS_IMPORTACION} ejercicios cada vez), revísala y guárdala.`}
        />
      </div>

      <Card className="flex flex-col gap-3">
        <h2 className="text-xl font-semibold">Formato</h2>
        <p className="text-sm text-muted">
          «slug», «secondary_muscles», «common_mistakes», «aliases»,
          «use_in_generator» (por defecto true), «popularity» (0 a 3, por
          defecto 0) e «is_active» (por defecto true) son opcionales. Si falta
          el «slug», se crea a partir del nombre.
        </p>
        <pre className="overflow-x-auto rounded-xl bg-surface-2 p-4 text-xs">
          {EJEMPLO}
        </pre>
        <ul className="flex flex-col gap-1 text-sm text-muted">
          <li>Músculos: {MUSCLES.join(", ")}</li>
          <li>Material: {EQUIPMENT.join(", ")}</li>
          <li>Movimiento: {MOVEMENT_PATTERNS.join(", ")}</li>
          <li>Nivel: {DIFFICULTIES.join(", ")}</li>
        </ul>
      </Card>

      <Suspense
        fallback={<div className="h-96 animate-pulse rounded-3xl bg-surface-2" />}
      >
        <Contenido />
      </Suspense>
    </PageContainer>
  );
}