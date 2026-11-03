import { useEffect, useState, type RefObject } from "react";

// Temporizador con la hora real: es exacto aunque cambies de pestaña.
// "alTerminarRef" lo rellena quien lo usa; se ejecuta cuando llega a cero.
export function useTemporizador(alTerminarRef: RefObject<() => void>) {
  const [fin, setFin] = useState<number | null>(null);
  const [total, setTotal] = useState(0);
  const [restante, setRestante] = useState(0);

  useEffect(() => {
    if (fin === null) return;
    const id = window.setInterval(() => {
      const resto = fin - Date.now();
      setRestante(Math.max(0, Math.ceil(resto / 1000)));
      if (resto <= 0) {
        window.clearInterval(id);
        alTerminarRef.current();
      }
    }, 200);
    return () => window.clearInterval(id);
  }, [fin, alTerminarRef]);

  function empezar(segundos: number) {
    setTotal(segundos);
    setRestante(segundos);
    setFin(Date.now() + segundos * 1000);
  }

  function sumar(segundos: number) {
    setFin((valor) => (valor ?? Date.now()) + segundos * 1000);
    setTotal((valor) => valor + segundos);
    setRestante((valor) => valor + segundos);
  }

  function parar() {
    setFin(null);
  }

  return { restante, total, empezar, sumar, parar };
}