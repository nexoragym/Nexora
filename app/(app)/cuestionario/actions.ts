"use server";

import {
  validarCuestionario,
  type QuestionnaireDraft,
  type QuestionnaireFormState,
} from "../../../lib/questionnaire";
import { createClient } from "../../../lib/supabase/server";

function textoDe(formData: FormData, campo: string): string {
  const valor = formData.get(campo);
  return typeof valor === "string" ? valor : "";
}

function listaDe(formData: FormData, campo: string): string[] {
  return formData
    .getAll(campo)
    .filter((valor): valor is string => typeof valor === "string");
}

export async function guardarCuestionario(
  _estado: QuestionnaireFormState,
  formData: FormData,
): Promise<QuestionnaireFormState> {
  const draft: QuestionnaireDraft = {
    experience: textoDe(formData, "experiencia"),
    goal: textoDe(formData, "objetivo"),
    days: textoDe(formData, "dias"),
    minutes: textoDe(formData, "minutos"),
    equipment: listaDe(formData, "material"),
    limitations: listaDe(formData, "limitaciones"),
  };

  // Se valida en el servidor, aunque el navegador ya haya comprobado algo.
  const { values, fieldErrors } = validarCuestionario(draft);
  if (!values) {
    return { draft, fieldErrors };
  }

  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const userId = data?.claims?.sub;

  if (!userId) {
    return { draft, error: "Tu sesión ha caducado. Vuelve a iniciar sesión." };
  }

  const columnas = {
    experience_level: values.experience,
    primary_goal: values.goal,
    days_per_week: values.days,
    session_minutes: values.minutes,
    equipment: values.equipment,
    limitations: values.limitations,
  };

  // Solo hay una fila por persona: si ya existe se actualiza, y si no, se crea.
  const { data: existente, error: errorLectura } = await supabase
    .from("training_preferences")
    .select("user_id")
    .maybeSingle();

  if (errorLectura) {
    console.error("[cuestionario] error al leer:", errorLectura.code ?? "sin código");
    return {
      draft,
      error: "No se pudieron guardar tus respuestas. Inténtalo de nuevo.",
    };
  }

  const resultado = existente
    ? await supabase
        .from("training_preferences")
        .update(columnas)
        .eq("user_id", userId)
        .select("user_id")
    : await supabase
        .from("training_preferences")
        .insert({ user_id: userId, ...columnas })
        .select("user_id");

  if (resultado.error || !resultado.data || resultado.data.length === 0) {
    // El código del error no contiene datos personales y ayuda a diagnosticar.
    console.error(
      "[cuestionario] error al guardar:",
      resultado.error?.code ?? "sin filas",
    );
    return {
      draft,
      error: "No se pudieron guardar tus respuestas. Inténtalo de nuevo.",
    };
  }

  return { ok: true, draft };
}