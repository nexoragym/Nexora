import type { ReactNode } from "react";
import { LEGAL } from "../../lib/legal";

export function LegalSection({
  titulo,
  children,
}: {
  titulo: string;
  children: ReactNode;
}) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-xl font-semibold">{titulo}</h2>
      <div className="flex flex-col gap-3 text-muted">{children}</div>
    </section>
  );
}

// Quién es el titular, con los datos que se hayan rellenado.
export function Responsable() {
  return (
    <p>
      El titular de esta web y responsable del tratamiento de tus datos es{" "}
      <strong className="text-foreground">{LEGAL.titular}</strong>
      {LEGAL.nif ? ` (NIF ${LEGAL.nif})` : ""}
      {LEGAL.domicilio ? `, con domicilio en ${LEGAL.domicilio}` : ""}. Puedes
      escribirle a{" "}
      <a
        href={`mailto:${LEGAL.email}`}
        className="font-semibold text-accent hover:underline"
      >
        {LEGAL.email}
      </a>
      .
    </p>
  );
}