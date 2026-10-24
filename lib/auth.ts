export type AuthFieldErrors = {
  nombre?: string;
  correo?: string;
  contrasena?: string;
  repetir?: string;
};

export type AuthFormState = {
  error?: string;
  info?: string;
  nombre?: string;
  correo?: string;
  fieldErrors?: AuthFieldErrors;
};

export const NOMBRE_MINIMO = 2;
export const NOMBRE_MAXIMO = 50;
export const CONTRASENA_MINIMA = 8;
export const CONTRASENA_MAXIMA = 72;

const REGEX_CORREO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function limpiarNombre(nombre: string): string {
  return nombre.trim().replace(/\s+/g, " ");
}

export function esCorreoValido(correo: string): boolean {
  return correo.length <= 254 && REGEX_CORREO.test(correo);
}

export function validarInicioSesion(
  correo: string,
  contrasena: string,
): AuthFieldErrors {
  const errores: AuthFieldErrors = {};

  if (!esCorreoValido(correo)) {
    errores.correo = "Escribe un correo electrónico válido.";
  }
  if (contrasena.length === 0) {
    errores.contrasena = "Escribe tu contraseña.";
  }

  return errores;
}

export function validarRegistro(
  nombre: string,
  correo: string,
  contrasena: string,
  repetir: string,
): AuthFieldErrors {
  const errores: AuthFieldErrors = {};
  const limpio = limpiarNombre(nombre);

  if (limpio.length < NOMBRE_MINIMO || limpio.length > NOMBRE_MAXIMO) {
    errores.nombre = `Escribe tu nombre (entre ${NOMBRE_MINIMO} y ${NOMBRE_MAXIMO} caracteres).`;
  }
  if (!esCorreoValido(correo)) {
    errores.correo = "Escribe un correo electrónico válido.";
  }
  if (contrasena.length < CONTRASENA_MINIMA) {
    errores.contrasena = `La contraseña debe tener al menos ${CONTRASENA_MINIMA} caracteres.`;
  } else if (contrasena.length > CONTRASENA_MAXIMA) {
    errores.contrasena = `La contraseña no puede superar los ${CONTRASENA_MAXIMA} caracteres.`;
  }
  if (repetir !== contrasena) {
    errores.repetir = "Las contraseñas no coinciden.";
  }

  return errores;
}

export function hayErrores(errores: AuthFieldErrors): boolean {
  return Object.keys(errores).length > 0;
}