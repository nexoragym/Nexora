"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Alert } from "../../../../components/ui/Alert";
import { Button } from "../../../../components/ui/Button";
import { ProgressRing } from "../../../../components/ui/ProgressRing";
import { guardarSerie, iniciarSesion, terminarSesion } from "./actions";
import type { SessionExercise, SessionInfo } from "./types";

type Fase = "intro" | "ejercicio" | "descanso" | "fin";

type Registro = {
  exerciseId: string;
  exerciseName: string;
  setNumber: number;
  kg: number;
  reps: number;
};

type Resumen = { duracion: number; aviso: boolean };

const KG_MAX = 500;

function formatearTiempo(total: number): string {
  const minutos = Math.floor(total / 60);
  const segundos = total % 60;
  return `${minutos}:${String(segundos).padStart(2, "0")}`;
}

function redondear(valor: number): number {
  return Math.round(valor * 100) / 100;
}

function formatearNumero(valor: number): string {
  return valor.toLocaleString("es-ES", { maximumFractionDigits: 2 });
}

// ---------- Iconos ----------
function IconoCerrar() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}

function IconoSonido({ activo }: { activo: boolean }) {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M11 5L6 9H3v6h3l5 4V5z" />
      {activo ? (
        <path d="M15.5 8.5a5 5 0 010 7M18.5 5.5a9 9 0 010 13" />
      ) : (
        <path d="M16 9l5 6M21 9l-5 6" />
      )}
    </svg>
  );
}

function IconoPesa({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" width="64" height="64" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={className}>
      <path d="M6.5 6.5v11M17.5 6.5v11M3.5 9v6M20.5 9v6M6.5 12h11" />
    </svg>
  );
}

function IconoCheck() {
  return (
    <svg viewBox="0 0 24 24" width="56" height="56" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M5 13l4 4L19 7" />
    </svg>
  );
}

// ---------- Piezas de la pantalla ----------
type StepperProps = {
  label: string;
  value: number;
  step: number;
  min: number;
  max: number;
  onChange: (valor: number) => void;
};

function Stepper({ label, value, step, min, max, onChange }: StepperProps) {
  const cambiar = (delta: number) =>
    onChange(Math.min(max, Math.max(min, redondear(value + delta))));

  const botones =
    "flex size-12 shrink-0 items-center justify-center rounded-2xl border border-border bg-surface-2 text-2xl transition duration-150 hover:bg-border active:scale-95";

  return (
    <div className="flex flex-col gap-2 rounded-3xl border border-border bg-surface p-4">
      <span className="text-sm text-muted">{label}</span>
      <div className="flex items-center justify-between gap-2">
        <button
          type="button"
          aria-label={`Bajar ${label.toLowerCase()}`}
          onClick={() => cambiar(-step)}
          className={botones}
        >
          −
        </button>
        <span className="text-3xl font-semibold tabular-nums">
          {formatearNumero(value)}
        </span>
        <button
          type="button"
          aria-label={`Subir ${label.toLowerCase()}`}
          onClick={() => cambiar(step)}
          className={botones}
        >
          +
        </button>
      </div>
    </div>
  );
}

// Hueco para la imagen o animación del ejercicio. Cuando pongas el archivo
// public/images/ejercicios/<nombre-interno>.jpg, aparece solo.
function ImagenEjercicio({ slug }: { slug: string }) {
  return (
    <div className="relative aspect-[4/3] w-full overflow-hidden rounded-3xl border border-border bg-linear-to-br from-accent/40 via-surface-2 to-surface">
      <div
        aria-hidden="true"
        className="absolute inset-0 flex items-center justify-center text-accent/70"
      >
        <IconoPesa />
      </div>
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(/images/ejercicios/${slug}.jpg)` }}
      />
    </div>
  );
}

// ---------- Pantalla principal ----------
export function WorkoutPlayer({ data }: { data: SessionInfo }) {
  const router = useRouter();

  const [fase, setFase] = useState<Fase>("intro");
  const [idxEj, setIdxEj] = useState(0);
  const [idxSerie, setIdxSerie] = useState(0);
  const [kg, setKg] = useState(0);
  const [reps, setReps] = useState(0);
  const [registros, setRegistros] = useState<Registro[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [iniciando, setIniciando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sonido, setSonido] = useState(true);
  const [confirmarSalida, setConfirmarSalida] = useState(false);
  const [saliendo, setSaliendo] = useState(false);

  // Temporizador (sirve para el descanso y para mantener la posición)
  const [finTemp, setFinTemp] = useState<number | null>(null);
  const [totalTemp, setTotalTemp] = useState(0);
  const [restante, setRestante] = useState(0);
  const [aguantando, setAguantando] = useState(false);

  const [resumen, setResumen] = useState<Resumen | null>(null);

  const inicioRef = useRef(0);
  const duracionRef = useRef(0);
  const fallidasRef = useRef<Registro[]>([]);
  const audioRef = useRef<AudioContext | null>(null);
  const alTerminarRef = useRef<() => void>(() => {});

  const ejercicio: SessionExercise =
    data.exercises[Math.min(idxEj, data.exercises.length - 1)];
  const totalSeries = data.exercises.reduce((suma, e) => suma + e.sets, 0);
  const porcentaje =
    totalSeries > 0 ? Math.round((registros.length / totalSeries) * 100) : 0;
  const enCurso = fase === "ejercicio" || fase === "descanso";
  const sinPeso = ejercicio.equipment === "bodyweight";

  // ----- Avisos (sonido y vibración) -----
  function prepararAudio() {
    try {
      if (!audioRef.current) {
        const Constructor =
          window.AudioContext ??
          (window as unknown as { webkitAudioContext?: typeof AudioContext })
            .webkitAudioContext;
        if (Constructor) audioRef.current = new Constructor();
      }
      void audioRef.current?.resume();
    } catch {
      // Sin audio disponible: no pasa nada.
    }
  }

  function avisar() {
    if (sonido) {
      try {
        const ctx = audioRef.current;
        if (ctx) {
          const oscilador = ctx.createOscillator();
          const volumen = ctx.createGain();
          oscilador.type = "sine";
          oscilador.frequency.value = 880;
          volumen.gain.setValueAtTime(0.0001, ctx.currentTime);
          volumen.gain.exponentialRampToValueAtTime(0.25, ctx.currentTime + 0.02);
          volumen.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.35);
          oscilador.connect(volumen);
          volumen.connect(ctx.destination);
          oscilador.start();
          oscilador.stop(ctx.currentTime + 0.4);
        }
      } catch {
        // Sin audio disponible: no pasa nada.
      }
    }
    try {
      navigator.vibrate?.(200);
    } catch {
      // Sin vibración disponible: no pasa nada.
    }
  }

  // ----- El temporizador usa la hora real: es exacto aunque cambies de pestaña -----
  useEffect(() => {
    if (finTemp === null) return;
    const id = window.setInterval(() => {
      const resto = finTemp - Date.now();
      setRestante(Math.max(0, Math.ceil(resto / 1000)));
      if (resto <= 0) {
        window.clearInterval(id);
        alTerminarRef.current();
      }
    }, 200);
    return () => window.clearInterval(id);
  }, [finTemp]);

  // ----- Mantiene la pantalla encendida mientras entrenas (si el navegador lo permite) -----
  useEffect(() => {
    if (!enCurso) return;
    let bloqueo: WakeLockSentinel | null = null;
    let activo = true;

    async function pedir() {
      try {
        if ("wakeLock" in navigator) {
          const nuevo = await navigator.wakeLock.request("screen");
          if (activo) {
            bloqueo = nuevo;
          } else {
            await nuevo.release();
          }
        }
      } catch {
        // El navegador no lo permite: no pasa nada.
      }
    }

    function alVolver() {
      if (document.visibilityState === "visible") void pedir();
    }

    void pedir();
    document.addEventListener("visibilitychange", alVolver);
    return () => {
      activo = false;
      document.removeEventListener("visibilitychange", alVolver);
      bloqueo?.release().catch(() => {});
    };
  }, [enCurso]);

  // ----- Guardado de series -----
  async function guardar(registro: Registro, id: string | null) {
    if (!id) {
      fallidasRef.current.push(registro);
      return;
    }
    try {
      const resultado = await guardarSerie(
        id,
        registro.exerciseId,
        registro.setNumber,
        registro.kg,
        registro.reps,
      );
      if (!resultado.ok) fallidasRef.current.push(registro);
    } catch {
      fallidasRef.current.push(registro);
    }
  }

  async function reintentarFallidas(id: string | null) {
    const pendientes = fallidasRef.current;
    fallidasRef.current = [];
    for (const registro of pendientes) {
      await guardar(registro, id);
    }
  }

  // ----- Flujo del entrenamiento -----
  function prepararSerie(i: number, s: number, previos: Registro[]) {
    const ej = data.exercises[i];
    if (!ej) return;
    const deEste = previos.filter((r) => r.exerciseId === ej.exerciseId);
    const ultimo = deEste[deEste.length - 1];
    setIdxEj(i);
    setIdxSerie(s);
    setKg(ej.equipment === "bodyweight" ? 0 : (ultimo?.kg ?? ej.lastWeightKg ?? 0));
    setReps(ej.repsMax);
    setAguantando(false);
    setFinTemp(null);
  }

  function empezarTemporizador(segundos: number) {
    setTotalTemp(segundos);
    setRestante(segundos);
    setFinTemp(Date.now() + segundos * 1000);
  }

  async function comenzar() {
    setIniciando(true);
    setError(null);
    prepararAudio();
    try {
      const resultado = await iniciarSesion(data.dayId, data.week);
      if (!resultado.ok || !resultado.sessionId) {
        setError(resultado.error ?? "No se pudo empezar el entrenamiento.");
        setIniciando(false);
        return;
      }
      setSessionId(resultado.sessionId);
      inicioRef.current = Date.now();
      prepararSerie(0, 0, []);
      setFase("ejercicio");
      setIniciando(false);
    } catch {
      setError("No se pudo empezar. Comprueba tu conexión e inténtalo de nuevo.");
      setIniciando(false);
    }
  }

  function avanzar(previos: Registro[] = registros) {
    setFinTemp(null);
    if (idxSerie + 1 < ejercicio.sets) {
      prepararSerie(idxEj, idxSerie + 1, previos);
    } else {
      prepararSerie(idxEj + 1, 0, previos);
    }
    setFase("ejercicio");
  }

  async function finalizar(guardadoPendiente: Promise<void>) {
    setFase("fin");
    setFinTemp(null);
    setAguantando(false);
    setResumen(null);
    if (duracionRef.current === 0) {
      duracionRef.current = Math.max(
        1,
        Math.round((Date.now() - inicioRef.current) / 1000),
      );
    }
    await guardadoPendiente;
    await reintentarFallidas(sessionId);
    let aviso = fallidasRef.current.length > 0;
    try {
      const resultado = sessionId
        ? await terminarSesion(sessionId, "completed")
        : { ok: false };
      if (!resultado.ok) aviso = true;
    } catch {
      aviso = true;
    }
    setResumen({ duracion: duracionRef.current, aviso });
  }

  function registrarSerie(kgSerie: number, repsSerie: number) {
    const registro: Registro = {
      exerciseId: ejercicio.exerciseId,
      exerciseName: ejercicio.name,
      setNumber: idxSerie + 1,
      kg: kgSerie,
      reps: repsSerie,
    };
    const nuevos = [...registros, registro];
    setRegistros(nuevos);
    const guardado = guardar(registro, sessionId);

    const ultimaSerie = idxSerie + 1 >= ejercicio.sets;
    const ultimoEjercicio = idxEj + 1 >= data.exercises.length;
    if (ultimaSerie && ultimoEjercicio) {
      void finalizar(guardado);
      return;
    }
    if (ejercicio.restSeconds <= 0) {
      avanzar(nuevos);
      return;
    }
    empezarTemporizador(ejercicio.restSeconds);
    setFase("descanso");
  }

  function empezarAguantar() {
    prepararAudio();
    empezarTemporizador(reps);
    setAguantando(true);
  }

  function terminarAguantar() {
    const mantenido = Math.max(1, totalTemp - restante);
    registrarSerie(0, mantenido);
  }

  function sumarQuince() {
    setFinTemp((valor) => (valor ?? Date.now()) + 15000);
    setTotalTemp((valor) => valor + 15);
    setRestante((valor) => valor + 15);
  }

  async function salir() {
    setSaliendo(true);
    try {
      if (sessionId) {
        await reintentarFallidas(sessionId);
        await terminarSesion(sessionId, "abandoned");
      }
    } catch {
      // Si no se puede cerrar ahora, la sesión queda sin completar.
    }
    router.push("/entrenar");
    router.refresh();
  }

  // Lo que pasa cuando el temporizador llega a cero
  useEffect(() => {
    alTerminarRef.current = () => {
      avisar();
      if (fase === "descanso") {
        avanzar();
      } else if (fase === "ejercicio" && aguantando) {
        registrarSerie(0, totalTemp);
      }
    };
  });

  // ---------- PANTALLA: antes de empezar ----------
  if (fase === "intro") {
    return (
      <main className="nx-page-in mx-auto flex min-h-dvh w-full max-w-xl flex-col gap-6 px-4 py-8">
        <Link
          href="/entrenar"
          className="text-sm text-muted transition hover:text-foreground"
        >
          ← Volver a Entrenar
        </Link>
        <div className="flex flex-col gap-1">
          <p className="text-sm text-muted">
            Semana {data.week} · {data.routineName}
          </p>
          <h1 className="text-4xl font-bold tracking-tight">
            Día {data.dayNumber}
          </h1>
          <p className="text-lg text-muted">{data.dayName}</p>
        </div>
        <ol className="flex flex-col gap-3">
          {data.exercises.map((ej, i) => (
            <li
              key={ej.exerciseId}
              className="flex items-center gap-4 rounded-3xl border border-border bg-surface p-4"
            >
              <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-accent/15 font-semibold text-accent">
                {i + 1}
              </span>
              <div className="flex min-w-0 flex-col">
                <span className="font-medium">{ej.name}</span>
                <span className="text-sm text-muted">
                  {ej.sets} series · {ej.repsMin}-{ej.repsMax}{" "}
                  {ej.timed ? "segundos" : "repeticiones"}
                </span>
              </div>
            </li>
          ))}
        </ol>
        {error ? (
          <Alert tone="danger" title="No se pudo empezar">
            {error}
          </Alert>
        ) : null}
        <div className="mt-auto pt-4">
          <Button
            size="xl"
            fullWidth
            onClick={() => void comenzar()}
            disabled={iniciando}
          >
            {iniciando ? "Preparando…" : "Empezar entrenamiento"}
          </Button>
        </div>
      </main>
    );
  }

  // ---------- PANTALLA: entrenamiento terminado ----------
  if (fase === "fin") {
    const volumen = Math.round(
      registros.reduce((suma, r) => suma + r.kg * r.reps, 0),
    );
    const porEjercicio = data.exercises
      .map((ej) => ({
        nombre: ej.name,
        series: registros.filter((r) => r.exerciseId === ej.exerciseId).length,
      }))
      .filter((item) => item.series > 0);

    return (
      <main className="mx-auto flex min-h-dvh w-full max-w-xl flex-col items-center gap-6 px-4 py-10">
        <div className="relative flex size-28 items-center justify-center">
          <span className="absolute inset-0 animate-[ping_1s_cubic-bezier(0,0,0.2,1)_2] rounded-full bg-accent/30" />
          <span className="nx-fade-up relative flex size-28 items-center justify-center rounded-full bg-linear-to-br from-accent to-accent-hover text-white shadow-lg shadow-accent/30">
            <IconoCheck />
          </span>
        </div>
        <div className="nx-fade-up flex flex-col items-center gap-1 text-center">
          <h1 className="text-3xl font-bold tracking-tight">¡Entrenamiento completado!</h1>
          <p className="text-muted">
            Día {data.dayNumber} · {data.dayName}
          </p>
        </div>

        {resumen ? (
          <div className="nx-fade-up grid w-full grid-cols-3 gap-3">
            <div className="flex flex-col items-center gap-1 rounded-3xl border border-border bg-surface p-4">
              <span className="text-2xl font-semibold tabular-nums">
                {formatearTiempo(resumen.duracion)}
              </span>
              <span className="text-xs text-muted">Duración</span>
            </div>
            <div className="flex flex-col items-center gap-1 rounded-3xl border border-border bg-surface p-4">
              <span className="text-2xl font-semibold tabular-nums">
                {registros.length}
              </span>
              <span className="text-xs text-muted">Series</span>
            </div>
            <div className="flex flex-col items-center gap-1 rounded-3xl border border-border bg-surface p-4">
              <span className="text-2xl font-semibold tabular-nums">
                {volumen > 0 ? formatearNumero(volumen) : "—"}
              </span>
              <span className="text-xs text-muted">Kilos totales</span>
            </div>
          </div>
        ) : (
          <p className="text-muted" aria-live="polite">
            Guardando tu entrenamiento…
          </p>
        )}

        {resumen?.aviso ? (
          <Alert tone="warning" title="No se pudo guardar todo">
            <div className="flex flex-col gap-3">
              <p>
                Comprueba tu conexión y pulsa Reintentar. Hasta entonces el día
                no quedará marcado como completado.
              </p>
              <div>
                <Button
                  variant="secondary"
                  onClick={() => void finalizar(Promise.resolve())}
                >
                  Reintentar
                </Button>
              </div>
            </div>
          </Alert>
        ) : null}

        <ul className="flex w-full flex-col gap-2 text-sm text-muted">
          {porEjercicio.map((item) => (
            <li
              key={item.nombre}
              className="flex items-center justify-between rounded-2xl border border-border bg-surface px-4 py-3"
            >
              <span className="text-foreground">{item.nombre}</span>
              <span>{item.series} series</span>
            </li>
          ))}
        </ul>

        <div className="mt-auto w-full pt-4">
          <Button
            size="xl"
            fullWidth
            disabled={resumen === null}
            onClick={() => {
              router.push("/entrenar");
              router.refresh();
            }}
          >
            Volver a Entrenar
          </Button>
        </div>
      </main>
    );
  }

  // ---------- PANTALLAS: ejercicio y descanso ----------
  const siguiente =
    idxSerie + 1 < ejercicio.sets
      ? { nombre: ejercicio.name, serie: idxSerie + 2, de: ejercicio.sets }
      : data.exercises[idxEj + 1]
        ? {
            nombre: data.exercises[idxEj + 1].name,
            serie: 1,
            de: data.exercises[idxEj + 1].sets,
          }
        : null;

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="sticky top-0 z-20 border-b border-border bg-background/90 pt-[env(safe-area-inset-top)] backdrop-blur">
        <div className="mx-auto flex w-full max-w-xl items-center justify-between gap-3 px-4 py-3">
          <button
            type="button"
            aria-label="Salir del entrenamiento"
            onClick={() => setConfirmarSalida(true)}
            className="flex size-11 items-center justify-center rounded-2xl text-muted transition hover:bg-surface-2 hover:text-foreground"
          >
            <IconoCerrar />
          </button>
          <div className="min-w-0 text-center">
            <p className="truncate text-sm font-semibold">
              Día {data.dayNumber} · Semana {data.week}
            </p>
            <p className="text-xs text-muted">
              Ejercicio {idxEj + 1} de {data.exercises.length}
            </p>
          </div>
          <button
            type="button"
            aria-label={sonido ? "Silenciar los avisos" : "Activar los avisos"}
            aria-pressed={sonido}
            onClick={() => setSonido((valor) => !valor)}
            className="flex size-11 items-center justify-center rounded-2xl text-muted transition hover:bg-surface-2 hover:text-foreground"
          >
            <IconoSonido activo={sonido} />
          </button>
        </div>
        <div
          role="progressbar"
          aria-label="Progreso del entrenamiento"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={porcentaje}
          className="h-1 w-full bg-surface-2"
        >
          <div
            className="h-full bg-linear-to-r from-accent to-orange-500 transition-[width] duration-500"
            style={{ width: `${porcentaje}%` }}
          />
        </div>
      </header>

      {fase === "descanso" ? (
        <>
          <main
            key={`descanso-${idxEj}-${idxSerie}`}
            className="nx-page-in mx-auto flex w-full max-w-xl flex-1 flex-col items-center gap-6 px-4 py-8"
          >
            <p className="text-sm font-semibold uppercase tracking-widest text-muted">
              Descanso
            </p>
            <ProgressRing
              value={restante}
              max={Math.max(totalTemp, 1)}
              size={260}
              strokeWidth={14}
              label="Tiempo de descanso restante"
            >
              <span className="text-6xl font-semibold tabular-nums">
                {formatearTiempo(restante)}
              </span>
            </ProgressRing>
            {siguiente ? (
              <div className="w-full rounded-3xl border border-border bg-surface p-5 text-center">
                <p className="text-sm text-muted">A continuación</p>
                <p className="text-lg font-semibold">{siguiente.nombre}</p>
                <p className="text-sm text-muted">
                  Serie {siguiente.serie} de {siguiente.de}
                </p>
              </div>
            ) : null}
          </main>
          <div className="sticky bottom-0 z-10 bg-linear-to-t from-background via-background to-transparent px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-6">
            <div className="mx-auto flex w-full max-w-xl flex-col gap-3">
              <Button size="xl" fullWidth onClick={() => avanzar()}>
                Saltar descanso
              </Button>
              <Button variant="secondary" fullWidth onClick={sumarQuince}>
                +15 segundos
              </Button>
            </div>
          </div>
        </>
      ) : (
        <>
          <main
            key={`ejercicio-${idxEj}-${idxSerie}`}
            className="nx-page-in mx-auto flex w-full max-w-xl flex-1 flex-col gap-5 px-4 py-6"
          >
            <ImagenEjercicio slug={ejercicio.slug} />

            <div className="flex flex-col gap-3">
              <h1 className="text-3xl font-bold tracking-tight">
                {ejercicio.name}
              </h1>
              <div className="flex flex-wrap items-center gap-2 text-sm">
                <span className="rounded-full bg-accent/15 px-3 py-1 font-semibold text-accent">
                  Serie {idxSerie + 1} de {ejercicio.sets}
                </span>
                <span className="rounded-full border border-border bg-surface px-3 py-1 text-muted">
                  Objetivo: {ejercicio.repsMin}-{ejercicio.repsMax}{" "}
                  {ejercicio.timed ? "segundos" : "repeticiones"}
                </span>
              </div>
            </div>

            {ejercicio.timed ? (
              aguantando ? (
                <div className="flex justify-center py-2">
                  <ProgressRing
                    value={restante}
                    max={Math.max(totalTemp, 1)}
                    size={220}
                    strokeWidth={14}
                    label="Tiempo restante del ejercicio"
                  >
                    <span className="text-5xl font-semibold tabular-nums">
                      {formatearTiempo(restante)}
                    </span>
                  </ProgressRing>
                </div>
              ) : (
                <Stepper
                  label="Segundos a mantener"
                  value={reps}
                  step={5}
                  min={5}
                  max={600}
                  onChange={setReps}
                />
              )
            ) : (
              <div
                className={
                  sinPeso ? "grid grid-cols-1 gap-3" : "grid grid-cols-2 gap-3"
                }
              >
                {sinPeso ? null : (
                  <Stepper
                    label="Peso (kg)"
                    value={kg}
                    step={2.5}
                    min={0}
                    max={KG_MAX}
                    onChange={setKg}
                  />
                )}
                <Stepper
                  label="Repeticiones"
                  value={reps}
                  step={1}
                  min={1}
                  max={100}
                  onChange={setReps}
                />
              </div>
            )}

            {ejercicio.instructions.length > 0 ? (
              <details className="rounded-3xl border border-border bg-surface p-4 text-sm">
                <summary className="cursor-pointer select-none font-medium">
                  Cómo se hace
                </summary>
                <ol className="mt-3 flex list-decimal flex-col gap-2 pl-5 text-muted">
                  {ejercicio.instructions.map((paso, indice) => (
                    <li key={indice}>{paso}</li>
                  ))}
                </ol>
              </details>
            ) : null}
          </main>

          <div className="sticky bottom-0 z-10 bg-linear-to-t from-background via-background to-transparent px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-6">
            <div className="mx-auto w-full max-w-xl">
              {ejercicio.timed ? (
                aguantando ? (
                  <Button size="xl" fullWidth onClick={terminarAguantar}>
                    Terminado
                  </Button>
                ) : (
                  <Button size="xl" fullWidth onClick={empezarAguantar}>
                    Empezar
                  </Button>
                )
              ) : (
                <Button
                  size="xl"
                  fullWidth
                  onClick={() => registrarSerie(kg, reps)}
                >
                  Terminado
                </Button>
              )}
            </div>
          </div>
        </>
      )}

      {confirmarSalida ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Salir del entrenamiento"
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-4 sm:items-center"
        >
          <div className="nx-fade-up flex w-full max-w-md flex-col gap-4 rounded-3xl border border-border bg-surface p-6">
            <h2 className="text-xl font-semibold">¿Salir del entrenamiento?</h2>
            <p className="text-muted">
              Se guardan las series que ya has hecho, pero el día no quedará
              marcado como completado.
            </p>
            <div className="flex flex-col gap-3">
              <Button
                fullWidth
                onClick={() => setConfirmarSalida(false)}
                disabled={saliendo}
              >
                Seguir entrenando
              </Button>
              <Button
                variant="secondary"
                fullWidth
                onClick={() => void salir()}
                disabled={saliendo}
              >
                {saliendo ? "Saliendo…" : "Salir"}
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}