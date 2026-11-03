"use client";

import { CabeceraSesion } from "./player/CabeceraSesion";
import { DialogoSalida } from "./player/DialogoSalida";
import { PantallaDescanso } from "./player/PantallaDescanso";
import { PantallaEjercicio } from "./player/PantallaEjercicio";
import { PantallaFin } from "./player/PantallaFin";
import { PantallaIntro } from "./player/PantallaIntro";
import { useWorkoutSession } from "./player/useWorkoutSession";
import type { SessionInfo } from "./types";

export function WorkoutPlayer({ data }: { data: SessionInfo }) {
  const s = useWorkoutSession(data);

  if (s.fase === "intro") {
    return (
      <PantallaIntro
        data={data}
        error={s.error}
        iniciando={s.iniciando}
        onComenzar={() => void s.comenzar()}
      />
    );
  }

  if (s.fase === "fin") {
    return (
      <PantallaFin
        data={data}
        registros={s.registros}
        resumen={s.resumen}
        evolucionAbierta={s.evolucionAbierta}
        onCerrarEvolucion={s.cerrarEvolucion}
        onReintentar={s.reintentar}
        onVolver={s.volver}
      />
    );
  }

  return (
    <div className="flex min-h-dvh flex-col">
      <CabeceraSesion
        data={data}
        idxEj={s.idxEj}
        porcentaje={s.porcentaje}
        sonido={s.sonido}
        onSalir={() => s.setConfirmarSalida(true)}
        onSonido={() => s.setSonido((valor) => !valor)}
      />

      {s.fase === "descanso" ? (
        <PantallaDescanso
          idxEj={s.idxEj}
          idxSerie={s.idxSerie}
          restante={s.restante}
          totalTemp={s.totalTemp}
          siguiente={s.siguiente}
          onSaltar={() => s.avanzar()}
          onSumar={s.sumarQuince}
        />
      ) : (
        <PantallaEjercicio
          ejercicio={s.ejercicio}
          idxEj={s.idxEj}
          idxSerie={s.idxSerie}
          kg={s.kg}
          reps={s.reps}
          sinPeso={s.sinPeso}
          aguantando={s.aguantando}
          restante={s.restante}
          totalTemp={s.totalTemp}
          onKg={s.setKg}
          onReps={s.setReps}
          onTerminado={() => s.registrarSerie(s.kg, s.reps)}
          onEmpezarAguantar={s.empezarAguantar}
          onTerminarAguantar={s.terminarAguantar}
        />
      )}

      {s.confirmarSalida ? (
        <DialogoSalida
          saliendo={s.saliendo}
          onSeguir={() => s.setConfirmarSalida(false)}
          onSalir={() => void s.salir()}
        />
      ) : null}
    </div>
  );
}