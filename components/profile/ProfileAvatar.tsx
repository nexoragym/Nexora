import { cn } from "../../lib/cn";

type ProfileAvatarProps = {
  nombre: string | null;
  correo: string | null;
  className?: string;
};

// Letra que se muestra: la inicial del nombre (o del correo si no hay nombre).
function obtenerInicial(nombre: string | null, correo: string | null): string {
  const texto = (nombre ?? "").trim() || (correo ?? "").trim();
  const primera = Array.from(texto)[0];
  return primera ? primera.toUpperCase() : "N";
}

// Avatar con inicial, fondo de colores cambiante y aro con brillo.
// Al pasar el cursor por encima gira un poco y los colores van más rápido.
export function ProfileAvatar({ nombre, correo, className }: ProfileAvatarProps) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "nx-avatar nx-avatar-ring inline-flex rounded-full border-2 border-accent/60 p-1.5",
        "transition duration-300 hover:scale-105 hover:rotate-3",
        className,
      )}
    >
      <div className="nx-avatar-bg flex size-28 items-center justify-center rounded-full text-5xl font-semibold text-white">
        {obtenerInicial(nombre, correo)}
      </div>
    </div>
  );
}