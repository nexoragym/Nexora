import type { Metadata } from "next";
import { PageContainer, PageHeader } from "../../../components/layout/Page";
import { Button } from "../../../components/ui/Button";
import { SetTable } from "../../../components/ui/SetTable";

export const metadata: Metadata = { title: "Entrenar" };

export default function EntrenarPage() {
  return (
    <PageContainer>
      <PageHeader
        title="Entrenar"
        description="Pantalla de demostración: los campos y las casillas se pueden tocar, pero todavía no guardan nada."
      />
      <section aria-labelledby="ejercicio" className="flex flex-col gap-4">
        <h2 id="ejercicio" className="text-2xl font-semibold tracking-tight">
          Press de banca plano
        </h2>
        <SetTable
          sets={[
            { previa: "62 kg x 12", kg: "62,5", repes: "12" },
            { previa: "62 kg x 12", kg: "62,5", repes: "12" },
            { previa: "62 kg x 12", kg: "62,5", repes: "12" },
          ]}
        />
        <div className="w-full max-w-2xl">
          <Button variant="secondary" fullWidth>
            + Añadir serie
          </Button>
        </div>
      </section>
    </PageContainer>
  );
}