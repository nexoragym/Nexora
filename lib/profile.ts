export const NOMBRE_MAXIMO = 50;

export type ProfileFormState = {
  error?: string;
  ok?: boolean;
  nombre?: string;
};

// Limpia y valida el nombre. Vacío significa "sin nombre" y es válido.
export function validarNombre(crudo: string): {
  nombre: string | null;
  error?: string;
} {
  const nombre = crudo.trim().replace(/\s+/g, " ");

  if (nombre.length === 0) {
    return { nombre: null };
  }
  if (nombre.length > NOMBRE_MAXIMO) {
    return {
      nombre: null,
      error: `El nombre no puede superar los ${NOMBRE_MAXIMO} caracteres.`,
    };
  }
  return { nombre };
}