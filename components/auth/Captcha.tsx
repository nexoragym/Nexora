"use client";

import { useEffect, useRef, useState } from "react";

type OpcionesTurnstile = {
  sitekey: string;
  theme?: "light" | "dark" | "auto";
  callback?: (token: string) => void;
  "expired-callback"?: () => void;
  "error-callback"?: () => void;
};

type TurnstileApi = {
  render: (contenedor: HTMLElement, opciones: OpcionesTurnstile) => string;
  remove: (id: string) => void;
};

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? "";
const URL_SCRIPT =
  "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";

// Verificación anti-bots de Cloudflare (gratis). Si no hay clave, no se muestra nada.
// El resultado viaja en un campo oculto llamado «captcha». Cada resultado sirve una sola vez:
// el formulario que lo usa vuelve a crear este componente después de cada envío.
export function Captcha() {
  const contenedor = useRef<HTMLDivElement>(null);
  const [token, setToken] = useState("");

  useEffect(() => {
    const elemento = contenedor.current;
    if (!SITE_KEY || !elemento) return;

    let id: string | null = null;
    let cancelado = false;

    function pintar() {
      if (cancelado || !elemento || !window.turnstile || id !== null) return;
      id = window.turnstile.render(elemento, {
        sitekey: SITE_KEY,
        theme: "dark",
        callback: (resultado) => setToken(resultado),
        "expired-callback": () => setToken(""),
        "error-callback": () => setToken(""),
      });
    }

    let script = document.querySelector<HTMLScriptElement>("script[data-turnstile]");
    if (window.turnstile) {
      pintar();
    } else {
      if (!script) {
        script = document.createElement("script");
        script.src = URL_SCRIPT;
        script.async = true;
        script.defer = true;
        script.dataset.turnstile = "1";
        document.head.appendChild(script);
      }
      script.addEventListener("load", pintar);
    }

    return () => {
      cancelado = true;
      script?.removeEventListener("load", pintar);
      if (id !== null && window.turnstile) window.turnstile.remove(id);
    };
  }, []);

  if (!SITE_KEY) return null;

  return (
    <div className="flex flex-col gap-1">
      <div ref={contenedor} />
      <input type="hidden" name="captcha" value={token} />
    </div>
  );
}