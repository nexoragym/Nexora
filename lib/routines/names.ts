// Nombres de sesión sin jerga: traduce los nombres antiguos del generador
// ("Empuje A", "Tirón", "Tren superior"...) a nombres que se entienden.
const NOMBRES: Record<string, string> = {
  "cuerpo completo": "Cuerpo completo",
  "tren superior": "Parte superior (pecho, espalda y brazos)",
  "tren inferior": "Parte inferior (piernas y glúteos)",
  empuje: "Pecho, hombros y tríceps",
  "tirón": "Espalda y bíceps",
  piernas: "Piernas y glúteos",
};

export function nombreSesion(nombre: string): string {
  // Quita la letra final (A, B o C) de los nombres antiguos.
  const limpio = nombre.trim().replace(/\s+[A-C]$/, "");
  return NOMBRES[limpio.toLowerCase()] ?? nombre;
}