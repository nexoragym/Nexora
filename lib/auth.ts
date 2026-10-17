export type AuthFieldErrors = {
  correo?: string;
  contrasena?: string;
  repetir?: string;
};

export type AuthFormState = {
  error?: string;
  info?: string;
  correo?: string;
  fieldErrors?: AuthFieldErrors;
};

export const CONTRASENA_MINIMA = 8;
export const CONTRASENA_MAXIMA = 72;

const REGEX_CORREO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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
  correo: string,
  contrasena: string,
  repetir: string,
): AuthFieldErrors {
  const errores: AuthFieldErrors = {};

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