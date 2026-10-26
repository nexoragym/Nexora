// Secciones de la barra de navegación. Para añadir una pantalla nueva,
// se añade una línea aquí y se crea su carpeta con su page.tsx.
export type NavIconName =
  | "home"
  | "routines"
  | "train"
  | "progress"
  | "library"
  | "profile"
  | "admin";

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
  { href: "/biblioteca", label: "Biblioteca", icon: "library" },
  { href: "/perfil", label: "Perfil", icon: "profile" },
];

// Entrada del panel de administración: solo se muestra a la cuenta superadministradora.
export const adminItem: NavItem = {
  href: "/admin",
  label: "Admin",
  icon: "admin",
};