"use client";

import { useRouter } from "next/navigation";
import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type ClipboardEvent,
  type DragEvent,
} from "react";
import {
  guardarMedia,
  quitarMedia,
} from "../../app/(app)/admin/ejercicios/media-actions";
import { cn } from "../../lib/cn";
import {
  BUCKET_MEDIA,
  LIMITE_BYTES,
  extensionDeTipo,
  formatearTamano,
  rutaNuevaMedia,
  urlPublicaMedia,
  validarArchivoMedia,
  type TipoMedia,
} from "../../lib/media";
import { createClient } from "../../lib/supabase/client";
import { Alert } from "../ui/Alert";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";

type MediaUploaderProps = {
  exerciseId: string;
  tipo: TipoMedia;
  rutaInicial: string | null;
  titulo: string;
  ayuda: string;
};

type Estado = "reposo" | "subiendo" | "quitando";

const ACEPTA: Record<TipoMedia, string> = {
  image: "image/jpeg,image/png,image/webp",
  video: "video/mp4,video/webm",
};

// ¿Lo que se está arrastrando son archivos?
function traeArchivos(evento: DragEvent<HTMLElement>): boolean {
  return Array.from(evento.dataTransfer.types).includes("Files");
}

export function MediaUploader({
  exerciseId,
  tipo,
  rutaInicial,
  titulo,
  ayuda,
}: MediaUploaderProps) {
  const router = useRouter();
  const entrada = useRef<HTMLInputElement>(null);
  const profundidad = useRef(0);
  const [ruta, setRuta] = useState<string | null>(rutaInicial);
  const [estado, setEstado] = useState<Estado>("reposo");
  const [error, setError] = useState<string | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);
  const [confirmando, setConfirmando] = useState(false);
  const [arrastrando, setArrastrando] = useState(false);

  const url = urlPublicaMedia(ruta);
  const ocupado = estado !== "reposo";
  const nombreTipo = tipo === "image" ? "imagen" : "vídeo";

  // Si se suelta un archivo fuera del recuadro, el navegador no debe abrirlo.
  useEffect(() => {
    function evitarApertura(evento: globalThis.DragEvent) {
      if (
        evento.dataTransfer &&
        Array.from(evento.dataTransfer.types).includes("Files")
      ) {
        evento.preventDefault();
      }
    }
    window.addEventListener("dragover", evitarApertura);
    window.addEventListener("drop", evitarApertura);
    return () => {
      window.removeEventListener("dragover", evitarApertura);
      window.removeEventListener("drop", evitarApertura);
    };
  }, []);

  // Sube un archivo, venga del botón, de arrastrarlo o de pegarlo.
  async function subirArchivo(archivo: File, variosArchivos: boolean) {
    setError(null);
    setAviso(null);
    setConfirmando(false);

    if (tipo === "image" && archivo.type.startsWith("video/")) {
      setError("Eso es un vídeo. Suéltalo en el recuadro de Vídeo.");
      return;
    }
    if (tipo === "video" && archivo.type.startsWith("image/")) {
      setError("Eso es una imagen. Suéltala en el recuadro de Imagen.");
      return;
    }

    const problema = validarArchivoMedia(tipo, archivo);
    const extension = extensionDeTipo(tipo, archivo.type);
    if (problema || !extension) {
      setError(problema ?? "Formato no permitido.");
      return;
    }

    setEstado("subiendo");
    const nueva = rutaNuevaMedia(exerciseId, tipo, extension, Date.now());

    try {
      const supabase = createClient();
      const { error: errorSubida } = await supabase.storage
        .from(BUCKET_MEDIA)
        .upload(nueva, archivo, {
          contentType: archivo.type,
          cacheControl: "31536000",
          upsert: false,
        });

      if (errorSubida) {
        setError(
          "No se pudo subir el archivo. Comprueba que has ejecutado la migración 0013 y que tu cuenta es superadmin.",
        );
        setEstado("reposo");
        return;
      }

      const resultado = await guardarMedia(exerciseId, tipo, nueva);
      if (!resultado.ok) {
        // Si no se pudo guardar, se borra el archivo recién subido para no dejar basura.
        await supabase.storage.from(BUCKET_MEDIA).remove([nueva]);
        setError(resultado.error ?? "No se pudo guardar.");
        setEstado("reposo");
        return;
      }

      setRuta(nueva);
      setAviso(
        variosArchivos
          ? "Subido y guardado. Solo se sube un archivo a la vez: se ha usado el primero."
          : "Subido y guardado. Ya se ve en la aplicación.",
      );
      router.refresh();
    } catch {
      setError("No se pudo subir. Comprueba tu conexión e inténtalo de nuevo.");
    }
    setEstado("reposo");
  }

  function alElegir(evento: ChangeEvent<HTMLInputElement>) {
    const archivo = evento.target.files?.[0];
    evento.target.value = "";
    if (!archivo) return;
    void subirArchivo(archivo, false);
  }

  // ----- Arrastrar y soltar -----
  function alEntrarArrastre(evento: DragEvent<HTMLDivElement>) {
    if (!traeArchivos(evento)) return;
    evento.preventDefault();
    profundidad.current += 1;
    if (!ocupado) setArrastrando(true);
  }

  function alSobreArrastre(evento: DragEvent<HTMLDivElement>) {
    if (!traeArchivos(evento)) return;
    evento.preventDefault();
    evento.dataTransfer.dropEffect = ocupado ? "none" : "copy";
  }

  function alSalirArrastre(evento: DragEvent<HTMLDivElement>) {
    if (!traeArchivos(evento)) return;
    profundidad.current = Math.max(0, profundidad.current - 1);
    if (profundidad.current === 0) setArrastrando(false);
  }

  function alSoltar(evento: DragEvent<HTMLDivElement>) {
    if (!traeArchivos(evento)) return;
    evento.preventDefault();
    profundidad.current = 0;
    setArrastrando(false);
    if (ocupado) return;

    const archivos = Array.from(evento.dataTransfer.files);
    if (archivos.length === 0) {
      setError(
        "No se pudo leer el archivo. Si lo arrastras desde una página web, guárdalo primero en tu ordenador.",
      );
      return;
    }
    void subirArchivo(archivos[0], archivos.length > 1);
  }

  // ----- Pegar con Ctrl+V -----
  function alPegar(evento: ClipboardEvent<HTMLDivElement>) {
    const archivos = Array.from(evento.clipboardData.files);
    if (archivos.length === 0) return;
    evento.preventDefault();
    if (ocupado) return;
    void subirArchivo(archivos[0], archivos.length > 1);
  }

  async function quitar() {
    setEstado("quitando");
    setError(null);
    setAviso(null);
    try {
      const resultado = await quitarMedia(exerciseId, tipo);
      if (!resultado.ok) {
        setError(resultado.error ?? "No se pudo quitar.");
      } else {
        setRuta(null);
        setAviso(`Se ha quitado ${tipo === "image" ? "la" : "el"} ${nombreTipo}.`);
        router.refresh();
      }
    } catch {
      setError("No se pudo quitar. Comprueba tu conexión e inténtalo de nuevo.");
    }
    setConfirmando(false);
    setEstado("reposo");
  }

  return (
    <Card className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <h3 className="text-lg font-semibold">{titulo}</h3>
        <p className="text-sm text-muted">{ayuda}</p>
      </div>

      <div
        role="group"
        tabIndex={0}
        aria-label={`Recuadro de ${nombreTipo}: arrastra un archivo aquí o pégalo con Ctrl+V`}
        onDragEnter={alEntrarArrastre}
        onDragOver={alSobreArrastre}
        onDragLeave={alSalirArrastre}
        onDrop={alSoltar}
        onPaste={alPegar}
        className={cn(
          "relative aspect-[4/3] w-full overflow-hidden rounded-2xl border bg-surface-2 outline-none transition-colors",
          arrastrando
            ? "border-2 border-dashed border-accent bg-accent/10"
            : "border-border focus-visible:border-accent",
        )}
      >
        {url ? (
          tipo === "image" ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={url}
              alt="Vista previa de la imagen del ejercicio"
              className="size-full object-cover"
            />
          ) : (
            <video
              key={url}
              src={url}
              controls
              muted
              loop
              playsInline
              preload="metadata"
              className="size-full object-cover"
            />
          )
        ) : (
          <div className="flex size-full flex-col items-center justify-center gap-2 px-4 text-center text-sm text-muted">
            <svg
              viewBox="0 0 24 24"
              width="32"
              height="32"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M12 16V4m0 0l-4 4m4-4l4 4M4 16v3a1 1 0 001 1h14a1 1 0 001-1v-3" />
            </svg>
            <span>Arrastra aquí tu {nombreTipo}</span>
            <span className="text-xs">o pulsa «Subir {nombreTipo}»</span>
          </div>
        )}

        {arrastrando && !ocupado ? (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-accent/20 text-base font-semibold">
            {ruta ? "Suelta para reemplazar" : "Suelta para subir"}
          </div>
        ) : null}

        {estado === "subiendo" ? (
          <div className="absolute inset-0 flex items-center justify-center bg-background/70 text-sm font-medium">
            Subiendo… no cierres la página
          </div>
        ) : null}
      </div>

      <p className="text-xs text-muted">
        {tipo === "image"
          ? "Arrastra el archivo al recuadro o usa el botón. También puedes copiar una imagen y pegarla con Ctrl+V después de hacer clic en el recuadro."
          : "Arrastra el archivo al recuadro o usa el botón."}
      </p>

      <input
        ref={entrada}
        type="file"
        accept={ACEPTA[tipo]}
        onChange={alElegir}
        className="sr-only"
        tabIndex={-1}
        aria-label={`Elegir ${nombreTipo}`}
      />

      {error ? (
        <Alert tone="danger" title="No se pudo completar">
          {error}
        </Alert>
      ) : null}
      {aviso ? (
        <Alert tone="success" title="Hecho">
          {aviso}
        </Alert>
      ) : null}

      {confirmando ? (
        <div className="flex flex-col gap-3">
          <p className="text-sm text-muted">
            ¿Seguro? Se borrará el archivo y dejará de verse en la aplicación.
          </p>
          <div className="flex flex-wrap gap-2">
            <Button onClick={() => void quitar()} disabled={ocupado}>
              {estado === "quitando" ? "Quitando…" : "Sí, quitar"}
            </Button>
            <Button
              variant="secondary"
              onClick={() => setConfirmando(false)}
              disabled={ocupado}
            >
              Cancelar
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex flex-wrap items-center gap-2">
          <Button onClick={() => entrada.current?.click()} disabled={ocupado}>
            {ruta ? `Cambiar ${nombreTipo}` : `Subir ${nombreTipo}`}
          </Button>
          {ruta ? (
            <Button
              variant="secondary"
              onClick={() => setConfirmando(true)}
              disabled={ocupado}
            >
              Quitar
            </Button>
          ) : null}
          <span className="text-xs text-muted">
            Máximo {formatearTamano(LIMITE_BYTES[tipo])}
          </span>
        </div>
      )}
    </Card>
  );
}