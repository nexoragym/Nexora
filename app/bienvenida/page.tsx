import type { Metadata } from "next";
import { BienvenidaClient } from "./BienvenidaClient";

export const metadata: Metadata = { title: "Preparando tu plan" };

export default function BienvenidaPage() {
  return (
    <main className="flex min-h-full flex-1 items-center justify-center px-4 py-10">
      <BienvenidaClient />
    </main>
  );
}