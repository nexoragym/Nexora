// Secciones de la barra de navegación. Para añadir una pantalla nueva,
// se añade una línea aquí y se crea su carpeta con su page.tsx.
export type NavIconName =
  | "home"
  | "routines"
  | "train"
  | "progress"
  | "components";

export type NavItem = {
  href: string;
  label: string;
  icon: NavIconName;
};

export const navItems: NavItem[] = [
  { href: "/dashboard", label: "Inicio", icon: "home" },
  { href: "/rutinas", label: "Rutinas", icon: "routines" },
  { href: "/entrenar", label: "Entrenar", icon: "train" },
  { href: "/progreso", label: "Progreso", icon: "progress" },
  // Sección temporal de pruebas: se eliminará cuando ya no haga falta.
  { href: "/componentes", label: "Componentes", icon: "components" },
];