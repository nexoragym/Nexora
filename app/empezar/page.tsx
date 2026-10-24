import type { Metadata } from "next";
import { OnboardingFlow } from "./OnboardingFlow";

export const metadata: Metadata = { title: "Crea tu plan de entrenamiento" };

export default function EmpezarPage() {
  return <OnboardingFlow />;
}