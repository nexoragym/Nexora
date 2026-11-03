import {
  COLUMNAS_EXPORTAR,
  filaAJson,
  type FilaExportable,
} from "../../../../../lib/admin/exercise-import";
import { esSuperadmin } from "../../../../../lib/admin/guard";
import { hoyEnZona } from "../../../../../lib/stats";
import { createClient } from "../../../../../lib/supabase/server";

const TAM_PAGINA = 1000;

// Descarga toda la biblioteca (también los desactivados) en el mismo formato del importador.
export async function GET() {
  const supabase = await createClient();
  if (!(await esSuperadmin(supabase))) {
    return new Response("No encontrado", { status: 404 });
  }

  const filas: FilaExportable[] = [];
  for (let desde = 0; ; desde += TAM_PAGINA) {
    const { data, error } = await supabase
      .from("exercises")
      .select(COLUMNAS_EXPORTAR)
      .order("slug")
      .range(desde, desde + TAM_PAGINA - 1);

    if (error) {
      console.error("[admin] error al exportar:", error.code ?? "sin código");
      return new Response("No se pudo exportar", { status: 500 });
    }
    const lote = (data ?? []) as unknown as FilaExportable[];
    filas.push(...lote);
    if (lote.length < TAM_PAGINA) break;
  }

  const cuerpo = JSON.stringify(filas.map(filaAJson), null, 2);
  return new Response(cuerpo, {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": `attachment; filename="nexora-ejercicios-${hoyEnZona()}.json"`,
      "Cache-Control": "no-store",
    },
  });
}