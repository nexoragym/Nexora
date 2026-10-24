import type { ReactNode } from "react";

// A diferencia del layout, el template se vuelve a montar en cada cambio de
// pestaña, así que la animación se repite al navegar.
export default function AppTemplate({ children }: { children: ReactNode }) {
  return <div className="nx-page-in flex flex-1 flex-col">{children}</div>;
}