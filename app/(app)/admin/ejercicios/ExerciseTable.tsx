import Link from "next/link";
import { Badge, type BadgeTone } from "../../../../components/ui/Badge";
import { ALIAS_RECOMENDADOS } from "../../../../lib/admin/exercise-form";
import {
  DIFFICULTY_LABELS,
  EQUIPMENT_LABELS,
  MUSCLE_LABELS,
  type Difficulty,
  type Equipment,
  type Muscle,
} from "../../../../lib/exercises";

export type FilaEjercicioTabla = {
  id: string;
  slug: string;
  name: string;
  primary_muscles: Muscle[];
  equipment: Equipment;
  difficulty: Difficulty;
  aliases: string[] | null;
  use_in_generator: boolean | null;
  popularity: number | null;
  is_active: boolean;
  image_path: string | null;
  video_path: string | null;
};

const tonoNivel: Record<Difficulty, BadgeTone> = {
  beginner: "success",
  intermediate: "warning",
  advanced: "danger",
};

export function ExerciseTable({ ejercicios }: { ejercicios: FilaEjercicioTabla[] }) {
  return (
    <div className="overflow-x-auto rounded-3xl border border-border bg-surface">
      <table className="w-full min-w-[68rem] text-left text-sm">
        <thead className="border-b border-border text-muted">
          <tr>
            <th className="px-4 py-3 font-medium">Ejercicio</th>
            <th className="px-4 py-3 font-medium">Músculo</th>
            <th className="px-4 py-3 font-medium">Material</th>
            <th className="px-4 py-3 font-medium">Nivel</th>
            <th className="px-4 py-3 font-medium">Otros nombres</th>
            <th className="px-4 py-3 font-medium">Rutinas auto.</th>
            <th className="px-4 py-3 font-medium">Medios</th>
            <th className="px-4 py-3 font-medium">Estado</th>
            <th className="px-4 py-3 font-medium">
              <span className="sr-only">Acciones</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {ejercicios.map((fila) => {
            const numAlias = (fila.aliases ?? []).length;
            const enGenerador = fila.use_in_generator ?? true;
            return (
              <tr
                key={fila.id}
                className="border-b border-border last:border-0 hover:bg-surface-2/50"
              >
                <td className="px-4 py-3">
                  <div className="font-medium">{fila.name}</div>
                  <div className="text-xs text-muted">{fila.slug}</div>
                </td>
                <td className="px-4 py-3 text-muted">
                  {fila.primary_muscles
                    .map((musculo) => MUSCLE_LABELS[musculo])
                    .join(", ")}
                </td>
                <td className="px-4 py-3 text-muted">
                  {EQUIPMENT_LABELS[fila.equipment]}
                </td>
                <td className="px-4 py-3">
                  <Badge tone={tonoNivel[fila.difficulty]}>
                    {DIFFICULTY_LABELS[fila.difficulty]}
                  </Badge>
                </td>
                <td
                  className={
                    numAlias >= ALIAS_RECOMENDADOS
                      ? "px-4 py-3 text-success"
                      : "px-4 py-3 text-warning"
                  }
                >
                  {numAlias}
                </td>
                <td className="px-4 py-3 text-xs">
                  <div className={enGenerador ? "text-success" : "text-muted"}>
                    {enGenerador ? "Sí" : "Solo a mano"}
                  </div>
                  <div className="text-muted">
                    Popularidad {fila.popularity ?? 0}
                  </div>
                </td>
                <td className="px-4 py-3 text-xs">
                  <div className={fila.image_path ? "text-success" : "text-muted"}>
                    {fila.image_path ? "Imagen" : "Sin imagen"}
                  </div>
                  <div className={fila.video_path ? "text-success" : "text-muted"}>
                    {fila.video_path ? "Vídeo" : "Sin vídeo"}
                  </div>
                </td>
                <td className="px-4 py-3">
                  {fila.is_active ? (
                    <Badge tone="success">Activo</Badge>
                  ) : (
                    <Badge>Desactivado</Badge>
                  )}
                </td>
                <td className="px-4 py-3 text-right">
                  <Link
                    href={`/admin/ejercicios/${fila.id}`}
                    className="font-semibold text-accent hover:underline"
                  >
                    Editar
                  </Link>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}