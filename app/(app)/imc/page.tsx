import type { Metadata } from "next";
import { ImcCalculator } from "../../../components/tools/ImcCalculator";
import { PageContainer, PageHeader } from "../../../components/layout/Page";

export const metadata: Metadata = { title: "Calculadora de IMC" };

export default function ImcPage() {
  return (
    <PageContainer>
      <PageHeader
        title="Calculadora de IMC"
        description="Calcula tu índice de masa corporal. Es una orientación, no un diagnóstico."
      />
      <ImcCalculator />
    </PageContainer>
  );
}