"use client";

import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import { createPortal } from "react-dom";
import { cn } from "../../lib/cn";
import { PALETAS, cambioDeTier, type EtapaRacha } from "../../lib/streak";
import { Button } from "../ui/Button";
import { StreakFlame } from "./StreakFlame";

type StreakEvolutionProps = {
  desde: EtapaRacha;
  hasta: EtapaRacha;
  dias: number;
  onClose: () => void;
};

// ---------- Nivel de espectáculo: 1 = sencillo, 6 = el mejor ----------
type Nivel = 1 | 2 | 3 | 4 | 5 | 6;

function nivelDeEspectaculo(desde: EtapaRacha, hasta: EtapaRacha): Nivel {
  const cambioColor = cambioDeTier(desde, hasta);
  switch (hasta.tier) {
    case "flame":
      return 2;
    case "fire":
      return cambioColor ? 4 : 3;
    case "purple":
      return cambioColor ? 5 : 4;
    case "blue":
      return 6;
    default:
      return 1;
  }
}

// Lo que lleva cada nivel. Para hacer una animación más corta o más cargada,
// se cambian estos números.
type Perfil = {
  espera: number; // segundos hasta el cambio de llama
  giro: number; // grados que gira la llama
  anillos: number;
  ondas: number; // ondas expansivas gruesas
  chispas: number; // chispas disparadas en el cambio
  brasas: number; // brasas que suben por la pantalla
  estrellas: number;
  rayos: 0 | 1 | 2; // capas de rayos de luz girando
  sacudida: number; // fuerza del temblor de pantalla (0 = nada)
  convergen: number; // partículas que se acercan antes del cambio
  destelloPantalla: boolean; // destello blanco en toda la pantalla
  lavadoViejo: boolean; // el color anterior se apaga poco a poco
  aura: boolean; // aura que respira detrás de la llama nueva
  vibracion: { cuando: number; patron: number[] };
};

const PERFILES: Record<Nivel, Perfil> = {
  1: {
    espera: 0.7,
    giro: 0,
    anillos: 0,
    ondas: 0,
    chispas: 6,
    brasas: 4,
    estrellas: 0,
    rayos: 0,
    sacudida: 0,
    convergen: 0,
    destelloPantalla: false,
    lavadoViejo: false,
    aura: false,
    vibracion: { cuando: 0.5, patron: [60] },
  },
  2: {
    espera: 0.9,
    giro: 360,
    anillos: 1,
    ondas: 0,
    chispas: 9,
    brasas: 6,
    estrellas: 0,
    rayos: 0,
    sacudida: 0,
    convergen: 0,
    destelloPantalla: false,
    lavadoViejo: false,
    aura: false,
    vibracion: { cuando: 0.8, patron: [70, 40, 90] },
  },
  3: {
    espera: 1.1,
    giro: 540,
    anillos: 2,
    ondas: 0,
    chispas: 12,
    brasas: 8,
    estrellas: 0,
    rayos: 0,
    sacudida: 0,
    convergen: 0,
    destelloPantalla: false,
    lavadoViejo: false,
    aura: false,
    vibracion: { cuando: 1.0, patron: [80, 40, 110] },
  },
  4: {
    espera: 1.3,
    giro: 720,
    anillos: 3,
    ondas: 1,
    chispas: 16,
    brasas: 12,
    estrellas: 0,
    rayos: 1,
    sacudida: 1,
    convergen: 0,
    destelloPantalla: false,
    lavadoViejo: false,
    aura: true,
    vibracion: { cuando: 1.2, patron: [90, 50, 140] },
  },
  5: {
    espera: 1.7,
    giro: 900,
    anillos: 3,
    ondas: 2,
    chispas: 20,
    brasas: 16,
    estrellas: 16,
    rayos: 1,
    sacudida: 1.6,
    convergen: 0,
    destelloPantalla: false,
    lavadoViejo: true,
    aura: true,
    vibracion: { cuando: 1.4, patron: [60, 50, 60, 50, 60, 50, 200] },
  },
  6: {
    espera: 2.3,
    giro: 1080,
    anillos: 4,
    ondas: 3,
    chispas: 26,
    brasas: 24,
    estrellas: 32,
    rayos: 2,
    sacudida: 2.2,
    convergen: 22,
    destelloPantalla: true,
    lavadoViejo: true,
    aura: true,
    vibracion: {
      cuando: 1.3,
      patron: [40, 120, 40, 120, 60, 120, 80, 120, 100, 200, 350],
    },
  },
};

// ---------- Partículas (siempre iguales, sin azar) ----------
function pseudo(indice: number, semilla: number): number {
  const x = Math.sin(indice * 12.9898 + semilla * 78.233) * 43758.5453;
  return x - Math.floor(x);
}

function crearRafaga(cantidad: number) {
  return Array.from({ length: cantidad }, (_, i) => {
    const angulo = (i / cantidad) * Math.PI * 2 + pseudo(i, 1) * 0.3;
    const distancia = 90 + pseudo(i, 2) * 130;
    return {
      dx: Math.round(Math.cos(angulo) * distancia),
      dy: Math.round(Math.sin(angulo) * distancia),
      tamano: 5 + Math.round(pseudo(i, 3) * 6),
    };
  });
}

function crearConvergencia(cantidad: number) {
  return Array.from({ length: cantidad }, (_, i) => {
    const angulo = (i / cantidad) * Math.PI * 2 + pseudo(i, 4) * 0.4;
    const distancia = 260 + pseudo(i, 5) * 90;
    return {
      dx: Math.round(Math.cos(angulo) * distancia),
      dy: Math.round(Math.sin(angulo) * distancia),
      tamano: 4 + Math.round(pseudo(i, 6) * 4),
    };
  });
}

function crearBrasas(cantidad: number) {
  return Array.from({ length: cantidad }, (_, i) => ({
    x: Math.round(pseudo(i, 7) * 100),
    tamano: 3 + Math.round(pseudo(i, 8) * 4),
    deriva: Math.round((pseudo(i, 9) - 0.5) * 140),
    duracion: 5 + pseudo(i, 10) * 4,
    retardo: pseudo(i, 11) * 3,
  }));
}

function crearEstrellas(cantidad: number) {
  return Array.from({ length: cantidad }, (_, i) => ({
    x: pseudo(i, 12) * 100,
    y: pseudo(i, 13) * 100,
    tamano: 1 + Math.round(pseudo(i, 14) * 2),
    duracion: 1.5 + pseudo(i, 15) * 2.5,
    retardo: pseudo(i, 16) * 3,
  }));
}

// ---------- Textos ----------
function tituloDeEvolucion(desde: EtapaRacha, hasta: EtapaRacha): string {
  const cambioColor = cambioDeTier(desde, hasta);
  switch (hasta.tier) {
    case "blue":
      return "¡EVOLUCIÓN MÁXIMA!";
    case "purple":
      return cambioColor
        ? "¡Segunda evolución!"
        : "¡Tu fuego morado se intensifica!";
    case "fire":
      return cambioColor
        ? "¡Tu racha ha evolucionado!"
        : "¡Tu fuego se hace más fuerte!";
    case "flame":
      return "¡Tu llama crece!";
    default:
      return "¡Racha encendida!";
  }
}

// ---------- Estilos auxiliares ----------
function estilo(
  variables: Record<string, string | number>,
  extra: CSSProperties = {},
): CSSProperties {
  return { ...extra, ...variables } as unknown as CSSProperties;
}

// Capa enorme y centrada con un degradado de color (el "lavado" de la pantalla).
function estiloLavado(color: string): CSSProperties {
  return {
    left: "50%",
    top: "50%",
    width: "160vmax",
    height: "160vmax",
    margin: "-80vmax 0 0 -80vmax",
    backgroundImage: `radial-gradient(closest-side, ${color}, transparent)`,
  };
}

// Rayos de luz que giran alrededor de la llama.
function estiloRayos(color: string, retardo: number): CSSProperties {
  const mascara = "radial-gradient(closest-side, #000 4%, transparent 55%)";
  return {
    left: "50%",
    top: "50%",
    width: "220vmax",
    height: "220vmax",
    margin: "-110vmax 0 0 -110vmax",
    backgroundImage: `repeating-conic-gradient(from 0deg at 50% 50%, ${color} 0deg 5deg, transparent 5deg 20deg)`,
    WebkitMaskImage: mascara,
    maskImage: mascara,
    animationDelay: `${retardo}s, 0s`,
  };
}

// Todas las animaciones de esta pantalla (los retrasos se ponen en cada elemento).
const ESTILOS = `
@keyframes nx-ev2-out {
  0% { transform: rotate(0deg) scale(1); opacity: 1; filter: brightness(1); }
  55% { transform: rotate(calc(var(--giro) * 0.2)) scale(1.06); opacity: 1; filter: brightness(1.6); }
  100% { transform: rotate(var(--giro)) scale(0.05); opacity: 0; filter: brightness(3.5); }
}
@keyframes nx-ev2-in {
  0% { transform: rotate(calc(var(--giro) * -0.75)) scale(0); opacity: 0; filter: brightness(3); }
  60% { transform: rotate(14deg) scale(1.3); opacity: 1; filter: brightness(1.6); }
  100% { transform: rotate(0deg) scale(1); opacity: 1; filter: brightness(1); }
}
@keyframes nx-ev2-tremble {
  0% { transform: translate(0, 0); }
  25% { transform: translate(calc(-2px * var(--amp, 1)), calc(1px * var(--amp, 1))); }
  50% { transform: translate(calc(2px * var(--amp, 1)), calc(-1px * var(--amp, 1))); }
  75% { transform: translate(calc(-1px * var(--amp, 1)), calc(-2px * var(--amp, 1))); }
  100% { transform: translate(calc(1px * var(--amp, 1)), calc(2px * var(--amp, 1))); }
}
@keyframes nx-ev2-flash {
  0% { opacity: 0; transform: scale(0.2); }
  25% { opacity: 1; }
  100% { opacity: 0; transform: scale(3.6); }
}
@keyframes nx-ev2-pantalla {
  0% { opacity: 0; }
  14% { opacity: 0.92; }
  100% { opacity: 0; }
}
@keyframes nx-ev2-ring {
  0% { opacity: 0.9; transform: scale(0.3); }
  100% { opacity: 0; transform: scale(2.8); }
}
@keyframes nx-ev2-onda {
  0% { opacity: 0.85; transform: scale(0.2); }
  100% { opacity: 0; transform: scale(5); }
}
@keyframes nx-ev2-burst {
  0% { opacity: 1; transform: translate(0, 0) scale(1); }
  100% { opacity: 0; transform: translate(var(--dx), var(--dy)) scale(0.2); }
}
@keyframes nx-ev2-converge {
  0% { opacity: 0; transform: translate(var(--dx), var(--dy)) scale(1); }
  25% { opacity: 1; }
  100% { opacity: 1; transform: translate(0, 0) scale(0.3); }
}
@keyframes nx-ev2-brasa {
  0% { opacity: 0; transform: translate(0, 0) scale(1); }
  10% { opacity: 1; }
  100% { opacity: 0; transform: translate(var(--drift), -115vh) scale(0.4); }
}
@keyframes nx-ev2-sacudida {
  0%, 100% { transform: translate(0, 0); }
  10% { transform: translate(calc(-7px * var(--shake)), calc(4px * var(--shake))); }
  20% { transform: translate(calc(6px * var(--shake)), calc(-5px * var(--shake))); }
  30% { transform: translate(calc(-5px * var(--shake)), calc(-3px * var(--shake))); }
  40% { transform: translate(calc(5px * var(--shake)), calc(4px * var(--shake))); }
  55% { transform: translate(calc(-3px * var(--shake)), calc(2px * var(--shake))); }
  70% { transform: translate(calc(2px * var(--shake)), calc(-2px * var(--shake))); }
  85% { transform: translate(calc(-1px * var(--shake)), calc(1px * var(--shake))); }
}
@keyframes nx-ev2-aparecer { from { opacity: 0; } to { opacity: 1; } }
@keyframes nx-ev2-desvanecer { from { opacity: 1; } to { opacity: 0; } }
@keyframes nx-ev2-girar { to { transform: rotate(360deg); } }
@keyframes nx-ev2-girar-inv { to { transform: rotate(-360deg); } }
@keyframes nx-ev2-estrella {
  0%, 100% { opacity: 0.15; transform: scale(0.8); }
  50% { opacity: 1; transform: scale(1.4); }
}
@keyframes nx-ev2-aura {
  0%, 100% { opacity: 0.5; transform: scale(1); }
  50% { opacity: 0.95; transform: scale(1.18); }
}
@keyframes nx-ev2-letra {
  from { opacity: 0; transform: translateY(22px) scale(1.5); filter: blur(10px); }
  to { opacity: 1; transform: none; filter: blur(0); }
}
.nx-ev2-out { animation: nx-ev2-out var(--dur, 1.3s) ease-in forwards; }
.nx-ev2-in { animation: nx-ev2-in 1.5s cubic-bezier(0.2, 0.9, 0.3, 1.1) both; }
.nx-ev2-tremble { animation: nx-ev2-tremble 0.09s linear infinite; }
.nx-ev2-flash { animation: nx-ev2-flash 0.9s ease-out both; }
.nx-ev2-pantalla { animation: nx-ev2-pantalla 0.9s ease-out both; }
.nx-ev2-ring { animation: nx-ev2-ring 1.5s ease-out both; }
.nx-ev2-onda { animation: nx-ev2-onda 1.7s cubic-bezier(0.1, 0.6, 0.3, 1) both; }
.nx-ev2-burst { animation: nx-ev2-burst 1.2s ease-out both; }
.nx-ev2-converge { animation: nx-ev2-converge 1.5s ease-in both; }
.nx-ev2-brasa { animation: nx-ev2-brasa var(--dur, 7s) linear infinite backwards; }
.nx-ev2-sacudida { animation: nx-ev2-sacudida 0.9s linear both; }
.nx-ev2-aparecer { animation: nx-ev2-aparecer 0.9s ease-out both; }
.nx-ev2-desvanecer { animation: nx-ev2-desvanecer var(--dur, 1s) ease-in forwards; }
.nx-ev2-rayos { animation: nx-ev2-aparecer 1.2s ease-out both, nx-ev2-girar 24s linear infinite; }
.nx-ev2-rayos-inv { animation: nx-ev2-aparecer 1.2s ease-out both, nx-ev2-girar-inv 18s linear infinite; }
.nx-ev2-estrella { animation: nx-ev2-estrella 2.5s ease-in-out infinite backwards; }
.nx-ev2-aura { animation: nx-ev2-aura 2.2s ease-in-out infinite; }
.nx-ev2-letra { animation: nx-ev2-letra 0.7s cubic-bezier(0.2, 0.8, 0.3, 1) both; }
`;

// Pantalla completa: la llama vieja se transforma en la nueva.
// Cuanto más alta la etapa, más espectacular es la animación.
export function StreakEvolution({
  desde,
  hasta,
  dias,
  onClose,
}: StreakEvolutionProps) {
  const [repeticion, setRepeticion] = useState(0);
  const [ventana, setVentana] = useState(() => ({
    ancho: typeof window === "undefined" ? 1024 : window.innerWidth,
    alto: typeof window === "undefined" ? 768 : window.innerHeight,
  }));
  const raiz = useRef<HTMLDivElement>(null);

  const nivel = nivelDeEspectaculo(desde, hasta);
  const perfil = PERFILES[nivel];
  const T = perfil.espera;
  const nueva = PALETAS[hasta.tier];
  const vieja = PALETAS[desde.tier];
  const titulo = tituloDeEvolucion(desde, hasta);

  // Todo se adapta al tamaño de la ventana para que nunca haga falta desplazarse.
  const horizontal = ventana.ancho > ventana.alto * 1.25 && ventana.alto < 560;
  const compacto = !horizontal && ventana.alto < 700;
  const base = horizontal
    ? Math.min(ventana.alto * 0.62, ventana.ancho * 0.36, 320)
    : Math.min(ventana.ancho * 0.74, ventana.alto * (compacto ? 0.34 : 0.4), 352);
  const escenario = Math.max(160, Math.round(base));
  const tamanoVieja = Math.round(escenario * 0.43);
  const tamanoNueva = Math.round(escenario * (nivel >= 5 ? 0.54 : 0.48));
  const tamanoAnillo = Math.round(escenario * 0.45);
  const tamanoDestello = Math.round(escenario * (nivel >= 5 ? 0.62 : 0.45));
  const tamanoTitulo =
    nivel >= 5
      ? "clamp(1.4rem, 5vw, 2.75rem)"
      : "clamp(1.35rem, 4.4vw, 2.2rem)";

  useEffect(() => {
    function alCambiar() {
      setVentana({ ancho: window.innerWidth, alto: window.innerHeight });
    }
    window.addEventListener("resize", alCambiar);
    return () => window.removeEventListener("resize", alCambiar);
  }, []);

  // Mientras está abierta, la página de detrás no se puede mover.
  useEffect(() => {
    const cuerpo = document.body;
    const posicionY = window.scrollY;
    const anteriores = {
      position: cuerpo.style.position,
      top: cuerpo.style.top,
      width: cuerpo.style.width,
      overflow: cuerpo.style.overflow,
      paddingRight: cuerpo.style.paddingRight,
    };
    const anchoBarra = window.innerWidth - document.documentElement.clientWidth;

    cuerpo.style.position = "fixed";
    cuerpo.style.top = `-${posicionY}px`;
    cuerpo.style.width = "100%";
    cuerpo.style.overflow = "hidden";
    if (anchoBarra > 0) cuerpo.style.paddingRight = `${anchoBarra}px`;

    return () => {
      cuerpo.style.position = anteriores.position;
      cuerpo.style.top = anteriores.top;
      cuerpo.style.width = anteriores.width;
      cuerpo.style.overflow = anteriores.overflow;
      cuerpo.style.paddingRight = anteriores.paddingRight;
      window.scrollTo(0, posicionY);
    };
  }, []);

  // La rueda del ratón, el trackpad y el dedo no mueven nada sobre esta pantalla.
  useEffect(() => {
    const elemento = raiz.current;
    if (!elemento) return;
    function bloquear(evento: Event) {
      evento.preventDefault();
    }
    elemento.addEventListener("wheel", bloquear, { passive: false });
    elemento.addEventListener("touchmove", bloquear, { passive: false });
    return () => {
      elemento.removeEventListener("wheel", bloquear);
      elemento.removeEventListener("touchmove", bloquear);
    };
  }, []);

  // Se cierra con la tecla Esc.
  useEffect(() => {
    function alPulsar(evento: KeyboardEvent) {
      if (evento.key === "Escape") onClose();
    }
    window.addEventListener("keydown", alPulsar);
    return () => window.removeEventListener("keydown", alPulsar);
  }, [onClose]);

  // Vibración en el móvil, al ritmo de la animación.
  useEffect(() => {
    const temporizador = window.setTimeout(() => {
      try {
        navigator.vibrate?.(perfil.vibracion.patron);
      } catch {
        // Sin vibración disponible: no pasa nada.
      }
    }, perfil.vibracion.cuando * 1000);

    return () => {
      window.clearTimeout(temporizador);
      try {
        navigator.vibrate?.(0);
      } catch {
        // Sin vibración disponible: no pasa nada.
      }
    };
  }, [perfil, repeticion]);

  if (typeof document === "undefined") return null;

  const rafaga = crearRafaga(perfil.chispas);
  const convergencia = crearConvergencia(perfil.convergen);
  const brasas = crearBrasas(perfil.brasas);
  const estrellas = crearEstrellas(perfil.estrellas);
  const palabras = titulo.split(" ");
  const inicios: number[] = [];
  palabras.reduce((acumulado, palabra) => {
    inicios.push(acumulado);
    return acumulado + Array.from(palabra).length;
  }, 0);

  const contenido = (
    <div
      ref={raiz}
      role="dialog"
      aria-modal="true"
      aria-label="Tu racha ha evolucionado"
      className="fixed inset-0 z-[70] overflow-hidden bg-black text-foreground"
      style={{ touchAction: "none", overscrollBehavior: "none" }}
    >
      <style>{ESTILOS}</style>

      <button
        type="button"
        onClick={onClose}
        className="absolute right-4 top-[max(1rem,env(safe-area-inset-top))] z-30 rounded-xl px-3 py-2 text-sm text-white/70 transition hover:bg-white/10 hover:text-white"
      >
        Saltar
      </button>

      <div key={repeticion} className="absolute inset-0">
        {/* Estrellas */}
        {estrellas.map((estrella, i) => (
          <span
            key={`e${i}`}
            aria-hidden="true"
            className="nx-ev2-estrella pointer-events-none absolute rounded-full bg-white"
            style={{
              left: `${estrella.x}%`,
              top: `${estrella.y}%`,
              width: estrella.tamano,
              height: estrella.tamano,
              animationDelay: `${estrella.retardo}s`,
              animationDuration: `${estrella.duracion}s`,
            }}
          />
        ))}

        {/* Brasas que suben por la pantalla */}
        {brasas.map((brasa, i) => (
          <span
            key={`b${i}`}
            aria-hidden="true"
            className="nx-ev2-brasa pointer-events-none absolute rounded-full"
            style={estilo(
              { "--drift": `${brasa.deriva}px`, "--dur": `${brasa.duracion}s` },
              {
                left: `${brasa.x}%`,
                bottom: -12,
                width: brasa.tamano,
                height: brasa.tamano,
                background: nueva.chispa,
                boxShadow: `0 0 8px ${nueva.brillo}`,
                animationDelay: `${T * 0.6 + brasa.retardo}s`,
              },
            )}
          />
        ))}

        <div
          className={cn(
            "relative z-10 flex h-full w-full items-center justify-center overflow-hidden px-4 py-4",
            horizontal ? "flex-row gap-10" : "flex-col gap-4",
            perfil.sacudida > 0 && "nx-ev2-sacudida",
          )}
          style={
            perfil.sacudida > 0
              ? estilo(
                  { "--shake": perfil.sacudida },
                  { animationDelay: `${T - 0.05}s` },
                )
              : undefined
          }
        >
          {/* Escenario de la llama */}
          <div
            className="relative flex shrink-0 items-center justify-center"
            style={{ width: escenario, height: escenario }}
          >
            {/* El color anterior se apaga */}
            {perfil.lavadoViejo ? (
              <div
                aria-hidden="true"
                className="nx-ev2-desvanecer pointer-events-none absolute"
                style={estilo(
                  { "--dur": `${T}s` },
                  estiloLavado(`${vieja.brillo}55`),
                )}
              />
            ) : null}

            {/* El color nuevo se enciende */}
            <div
              aria-hidden="true"
              className="nx-ev2-aparecer pointer-events-none absolute"
              style={{
                ...estiloLavado(`${nueva.brillo}${nivel >= 4 ? "77" : "44"}`),
                animationDelay: `${T}s`,
              }}
            />

            {/* Rayos de luz */}
            {perfil.rayos >= 1 ? (
              <div
                aria-hidden="true"
                className="nx-ev2-rayos pointer-events-none absolute"
                style={estiloRayos(`${nueva.chispa}55`, T)}
              />
            ) : null}
            {perfil.rayos >= 2 ? (
              <div
                aria-hidden="true"
                className="nx-ev2-rayos-inv pointer-events-none absolute"
                style={estiloRayos(`${nueva.brillo}40`, T + 0.2)}
              />
            ) : null}

            {/* Ondas expansivas gruesas */}
            {Array.from({ length: perfil.ondas }, (_, i) => (
              <div
                key={`o${i}`}
                aria-hidden="true"
                className="nx-ev2-onda pointer-events-none absolute rounded-full"
                style={{
                  width: tamanoAnillo,
                  height: tamanoAnillo,
                  border: `6px solid ${nueva.chispa}`,
                  boxShadow: `0 0 40px ${nueva.brillo}`,
                  animationDelay: `${T + i * 0.28}s`,
                }}
              />
            ))}

            {/* Anillos */}
            {Array.from({ length: perfil.anillos }, (_, i) => (
              <div
                key={`a${i}`}
                aria-hidden="true"
                className="nx-ev2-ring pointer-events-none absolute rounded-full border-2"
                style={{
                  width: tamanoAnillo,
                  height: tamanoAnillo,
                  borderColor: nueva.brillo,
                  animationDelay: `${T + 0.05 + i * 0.22}s`,
                }}
              />
            ))}

            {/* Partículas que se acercan antes del cambio */}
            {convergencia.map((particula, i) => {
              const retardo = 0.15 + i * 0.04;
              return (
                <span
                  key={`c${i}`}
                  aria-hidden="true"
                  className="nx-ev2-converge pointer-events-none absolute left-1/2 top-1/2 rounded-full"
                  style={estilo(
                    { "--dx": `${particula.dx}px`, "--dy": `${particula.dy}px` },
                    {
                      width: particula.tamano,
                      height: particula.tamano,
                      marginLeft: -particula.tamano / 2,
                      marginTop: -particula.tamano / 2,
                      background: nueva.chispa,
                      boxShadow: `0 0 10px ${nueva.brillo}`,
                      animationDelay: `${retardo}s`,
                      animationDuration: `${Math.max(0.6, T - retardo)}s`,
                    },
                  )}
                />
              );
            })}

            {/* Llama vieja: tiembla (en la última), gira y se encoge */}
            <div
              className={cn(
                "absolute inset-0 flex items-center justify-center",
                perfil.convergen > 0 && "nx-ev2-tremble",
              )}
              style={estilo({ "--amp": 3 })}
            >
              <div
                className="nx-ev2-out flex items-center justify-center"
                style={estilo({
                  "--giro": `${perfil.giro}deg`,
                  "--dur": `${T}s`,
                })}
              >
                <StreakFlame etapa={desde} size={tamanoVieja} />
              </div>
            </div>

            {/* Destello */}
            <div
              aria-hidden="true"
              className="nx-ev2-flash pointer-events-none absolute rounded-full"
              style={{
                width: tamanoDestello,
                height: tamanoDestello,
                background: "radial-gradient(circle, #ffffff, transparent 70%)",
                animationDelay: `${T - 0.05}s`,
              }}
            />

            {/* Chispas disparadas */}
            {rafaga.map((particula, i) => (
              <span
                key={`r${i}`}
                aria-hidden="true"
                className="nx-ev2-burst pointer-events-none absolute left-1/2 top-1/2 rounded-full"
                style={estilo(
                  { "--dx": `${particula.dx}px`, "--dy": `${particula.dy}px` },
                  {
                    width: particula.tamano,
                    height: particula.tamano,
                    marginLeft: -particula.tamano / 2,
                    marginTop: -particula.tamano / 2,
                    background: nueva.chispa,
                    boxShadow: `0 0 8px ${nueva.brillo}`,
                    animationDelay: `${T + 0.05}s`,
                  },
                )}
              />
            ))}

            {/* Llama nueva: entra girando y creciendo */}
            <div className="absolute inset-0 flex items-center justify-center">
              {perfil.aura ? (
                <div
                  aria-hidden="true"
                  className="nx-ev2-aparecer pointer-events-none absolute inset-0 flex items-center justify-center"
                  style={{ animationDelay: `${T + 0.5}s` }}
                >
                  <div
                    className="nx-ev2-aura size-[85%] rounded-full"
                    style={{
                      background: `radial-gradient(circle, ${nueva.brillo}77, transparent 65%)`,
                    }}
                  />
                </div>
              ) : null}
              <div
                className="nx-ev2-in"
                style={estilo(
                  { "--giro": `${perfil.giro}deg` },
                  { animationDelay: `${T}s` },
                )}
              >
                <StreakFlame etapa={hasta} size={tamanoNueva} />
              </div>
            </div>
          </div>

          {/* Textos y botones */}
          <div
            className={cn(
              "relative flex shrink-0 flex-col items-center",
              horizontal ? "max-w-sm gap-4" : "max-w-xl gap-3",
            )}
          >
            <div className="flex flex-col items-center gap-1.5 text-center">
              <h2
                aria-label={titulo}
                className="font-bold leading-tight tracking-tight"
                style={{
                  fontSize: tamanoTitulo,
                  textShadow:
                    nivel >= 5 ? `0 0 28px ${nueva.brillo}` : undefined,
                }}
              >
                {nivel === 6 ? (
                  palabras.map((palabra, p) => (
                    <span
                      key={p}
                      aria-hidden="true"
                      className="inline-block whitespace-nowrap"
                    >
                      {Array.from(palabra).map((letra, j) => (
                        <span
                          key={j}
                          className="nx-ev2-letra inline-block"
                          style={{
                            animationDelay: `${T + 0.7 + (inicios[p] + j) * 0.045}s`,
                          }}
                        >
                          {letra}
                        </span>
                      ))}
                      {p < palabras.length - 1 ? "\u00A0" : ""}
                    </span>
                  ))
                ) : (
                  <span
                    className="nx-fade-up inline-block"
                    style={{ animationDelay: `${T + 0.7}s` }}
                  >
                    {titulo}
                  </span>
                )}
              </h2>
              <p
                className="nx-fade-up text-xl font-semibold sm:text-2xl"
                style={{
                  color: nueva.chispa,
                  animationDelay: `${T + 1.0}s`,
                }}
              >
                {hasta.nombre}
              </p>
              {!compacto && !horizontal ? (
                <p
                  className="nx-fade-up text-sm text-muted"
                  style={{ animationDelay: `${T + 1.2}s` }}
                >
                  {hasta.descripcion}
                </p>
              ) : null}
              <p
                className="nx-fade-up text-muted"
                style={{ animationDelay: `${T + 1.35}s` }}
              >
                {dias} {dias === 1 ? "día" : "días"} de racha
              </p>
            </div>

            <div
              className="nx-fade-up flex flex-wrap items-center justify-center gap-3"
              style={{ animationDelay: `${T + 1.7}s` }}
            >
              <Button
                size={compacto || horizontal ? "md" : "lg"}
                onClick={onClose}
                autoFocus
              >
                Continuar
              </Button>
              <Button
                size={compacto || horizontal ? "md" : "lg"}
                variant="secondary"
                onClick={() => setRepeticion((valor) => valor + 1)}
              >
                Ver otra vez
              </Button>
            </div>
          </div>
        </div>

        {/* Destello blanco en toda la pantalla (solo en la mejor evolución) */}
        {perfil.destelloPantalla ? (
          <div
            aria-hidden="true"
            className="nx-ev2-pantalla pointer-events-none absolute inset-0 z-20 bg-white"
            style={{ animationDelay: `${T - 0.1}s` }}
          />
        ) : null}
      </div>
    </div>
  );

  return createPortal(contenido, document.body);
}