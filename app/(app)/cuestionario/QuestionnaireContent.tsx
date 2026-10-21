import { connection } from "next/server";
import { Alert } from "../../../components/ui/Alert";
import {
  filaABorrador,
  type PreferencesRow,
} from "../../../lib/questionnaire";
import { createClient } from "../../../lib/supabase/server";
import { QuestionnaireForm } from "./QuestionnaireForm";

// Carga tus respuestas guardadas (si las hay) y muestra el formulario.
// Depende de cada usuario, así que se declara dinámico antes de nada.
export async function QuestionnaireContent() {
  await connection();

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("training_preferences")
    .select(
      "experience_level, primary_goal, days_per_week, session_minutes, equipment, limitations",
    )
    .maybeSingle();

  if (error) {
    // El código del error no contiene datos personales y ayuda a diagnosticar.
    console.error("[cuestionario] error al cargar:", error.code ?? "sin código");
  }

  const inicial = filaABorrador((data as PreferencesRow | null) ?? null);

  return (
    <div className="flex flex-col gap-6">
      {error ? (
        <Alert tone="warning" title="No se pudieron cargar tus respuestas">
          Puedes rellenar el cuestionario de nuevo.
        </Alert>
      ) : null}
      <QuestionnaireForm inicial={inicial} />
    </div>
  );
}