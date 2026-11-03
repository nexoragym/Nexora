import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { etapaDeRacha } from "../../../../../lib/streak";
import {
  guardarSerie,
  iniciarSesion,
  rachaActual,
  terminarSesion,
} from "../actions";
import type { SessionExercise, SessionInfo } from "../types";
import type { Evolucion, Fase, Registro, Resumen } from "./tipos";
import { useAvisos } from "./useAvisos";
import { useTemporizador } from "./useTemporizador";
import { useWakeLock } from "./useWakeLock";

// Toda la lógica del entrenamiento (las pantallas solo dibujan).
export function useWorkoutSession(data: SessionInfo) {
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
  const [aguantando, setAguantando] = useState(false);
  const [resumen, setResumen] = useState<Resumen | null>(null);
  const [evolucionAbierta, setEvolucionAbierta] = useState(false);

  const inicioRef = useRef(0);
  const duracionRef = useRef(0);
  const fallidasRef = useRef<Registro[]>([]);
  const rachaAntesRef = useRef<number | null>(null);
  const evolucionMostradaRef = useRef(false);
  const alTerminarRef = useRef<() => void>(() => {});

  const { prepararAudio, avisar } = useAvisos(sonido);
  const temporizador = useTemporizador(alTerminarRef);

  const ejercicio: SessionExercise =
    data.exercises[Math.min(idxEj, data.exercises.length - 1)];
  const totalSeries = data.exercises.reduce((suma, e) => suma + e.sets, 0);
  const porcentaje =
    totalSeries > 0 ? Math.round((registros.length / totalSeries) * 100) : 0;
  const enCurso = fase === "ejercicio" || fase === "descanso";
  const sinPeso = ejercicio.equipment === "bodyweight";

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

  useWakeLock(enCurso);

  // Descarga por adelantado la imagen del siguiente ejercicio.
  useEffect(() => {
    const siguienteEjercicio = data.exercises[idxEj + 1];
    if (!siguienteEjercicio?.imageUrl) return;
    const imagen = new window.Image();
    imagen.src = siguienteEjercicio.imageUrl;
  }, [data.exercises, idxEj]);

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
    temporizador.parar();
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
      rachaAntesRef.current = resultado.rachaAntes ?? null;
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
    temporizador.parar();
    if (idxSerie + 1 < ejercicio.sets) {
      prepararSerie(idxEj, idxSerie + 1, previos);
    } else {
      prepararSerie(idxEj + 1, 0, previos);
    }
    setFase("ejercicio");
  }

  async function finalizar(guardadoPendiente: Promise<void>) {
    setFase("fin");
    temporizador.parar();
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
    let completada = false;
    try {
      const resultado = sessionId
        ? await terminarSesion(sessionId, "completed")
        : { ok: false };
      if (resultado.ok) {
        completada = true;
      } else {
        aviso = true;
      }
    } catch {
      aviso = true;
    }

    // Racha después de entrenar: ¿cambias de etapa?
    let racha: number | null = null;
    let evolucion: Evolucion | null = null;
    if (completada) {
      try {
        const actual = await rachaActual();
        if (actual.ok && typeof actual.racha === "number") {
          racha = actual.racha;
          const antes = rachaAntesRef.current;
          if (antes !== null) {
            const desde = etapaDeRacha(antes);
            const hasta = etapaDeRacha(actual.racha);
            if (hasta.desde > desde.desde) {
              evolucion = { desde, hasta, dias: actual.racha };
            }
          }
        }
      } catch {
        // Sin racha: la pantalla final se ve igual, sin la llama.
      }
    }

    if (evolucion && !evolucionMostradaRef.current) {
      evolucionMostradaRef.current = true;
      setEvolucionAbierta(true);
    }
    setResumen({ duracion: duracionRef.current, aviso, racha, evolucion });
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
    temporizador.empezar(ejercicio.restSeconds);
    setFase("descanso");
  }

  function empezarAguantar() {
    prepararAudio();
    temporizador.empezar(reps);
    setAguantando(true);
  }

  function terminarAguantar() {
    const mantenido = Math.max(1, temporizador.total - temporizador.restante);
    registrarSerie(0, mantenido);
  }

  function sumarQuince() {
    temporizador.sumar(15);
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

  function volver() {
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
        registrarSerie(0, temporizador.total);
      }
    };
  });

  return {
    fase,
    ejercicio,
    siguiente,
    idxEj,
    idxSerie,
    kg,
    reps,
    setKg,
    setReps,
    sinPeso,
    aguantando,
    restante: temporizador.restante,
    totalTemp: temporizador.total,
    registros,
    resumen,
    error,
    iniciando,
    sonido,
    setSonido,
    confirmarSalida,
    setConfirmarSalida,
    saliendo,
    porcentaje,
    evolucionAbierta,
    cerrarEvolucion: () => setEvolucionAbierta(false),
    comenzar,
    registrarSerie,
    empezarAguantar,
    terminarAguantar,
    avanzar,
    sumarQuince,
    salir,
    volver,
    reintentar: () => void finalizar(Promise.resolve()),
  };
}