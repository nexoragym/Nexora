import { useEffect } from "react";

// Mantiene la pantalla encendida mientras entrenas (si el navegador lo permite).
export function useWakeLock(activo: boolean) {
  useEffect(() => {
    if (!activo) return;
    let bloqueo: WakeLockSentinel | null = null;
    let vivo = true;

    async function pedir() {
      try {
        if ("wakeLock" in navigator) {
          const nuevo = await navigator.wakeLock.request("screen");
          if (vivo) {
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
      vivo = false;
      document.removeEventListener("visibilitychange", alVolver);
      bloqueo?.release().catch(() => {});
    };
  }, [activo]);
}