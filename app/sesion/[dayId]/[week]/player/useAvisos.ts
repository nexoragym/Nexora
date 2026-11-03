import { useRef } from "react";

// Sonido y vibración de los avisos (fin de descanso, etc.).
export function useAvisos(sonido: boolean) {
  const audioRef = useRef<AudioContext | null>(null);

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

  return { prepararAudio, avisar };
}