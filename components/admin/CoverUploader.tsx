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
  guardarPortada,
  quitarPortada,
} from "../../app/(app)/admin/rutinas/portada-actions";
import { cn } from "../../lib/cn";
import {
  BUCKET_MEDIA,
  LIMITE_BYTES,
  extensionDeTipo,
  formatearTamano,
  urlPublicaMedia,
  validarArchivoMedia,
} from "../../lib/media";
import { rutaNuevaPortada } from "../../lib/routines/portada";
import { createClient } from "../../lib/supabase/client";
import { Alert } from "../ui/Alert";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";

type CoverUploaderProps = {
  routineId: string;
  slug: string;
  rutaInicial: string | null;
};

function traeArchivos(evento: DragEvent<HTMLElement>): boolean {
  return Array.from(evento.dataTransfer.types).includes("Files");
}

export function CoverUploader({ routineId, slug, rutaInicial }: CoverUploaderProps) {
  const router = useRouter();
  const entrada = useRef<HTMLInputElement>(null);
  const [ruta, setRuta] = useState<string | null>(rutaInicial);
  const [ocupado, setOcupado] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);
  const [confirmando, setConfirmando] = useState(false);
  const [arrastrando, setArrastrando] = useState(false);

  const url = urlPublicaMedia(ruta);

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

  async function subir(archivo: File) {
    setError(null);
    setAviso(null);
    setConfirmando(false);

    const problema = validarArchivoMedia("image", archivo);
    const extension = extensionDeTipo("image", archivo.type);
    if (problema || !extension) {
      setError(problema ?? "Formato no permitido.");
      return;
    }

    setOcupado(true);
    const nueva = rutaNuevaPortada(routineId, extension, Date.now());
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
          "No se pudo subir el archivo. Comprueba que tu cuenta es superadmin.",
        );
        setOcupado(false);
        return;
      }

      const resultado = await guardarPortada(routineId, nueva);
      if (!resultado.ok) {
        await supabase.storage.from(BUCKET_MEDIA).remove([nueva]);
        setError(resultado.error ?? "No se pudo guardar.");
        setOcupado(false);
        return;
      }

      setRuta(nueva);
      setAviso("Portada subida. Ya se ve en Rutinas.");
      router.refresh();
    } catch {
      setError("No se pudo subir. Comprueba tu conexión e inténtalo de nuevo.");
    }
    setOcupado(false);
  }

  function alElegir(evento: ChangeEvent<HTMLInputElement>) {
    const archivo = evento.target.files?.[0];
    evento.target.value = "";
    if (archivo) void subir(archivo);
  }

  function alSoltar(evento: DragEvent<HTMLDivElement>) {
    if (!traeArchivos(evento)) return;
    evento.preventDefault();
    setArrastrando(false);
    if (ocupado) return;
    const archivo = evento.dataTransfer.files[0];
    if (!archivo) {
      setError(
        "No se pudo leer el archivo. Si lo arrastras desde una página web, guárdalo primero en tu ordenador.",
      );
      return;
    }
    void subir(archivo);
  }

  function alPegar(evento: ClipboardEvent<HTMLDivElement>) {
    const archivo = evento.clipboardData.files[0];
    if (!archivo) return;
    evento.preventDefault();
    if (!ocupado) void subir(archivo);
  }

  async function quitar() {
    setOcupado(true);
    setError(null);
    setAviso(null);
    try {
      const resultado = await quitarPortada(routineId);
      if (resultado.ok) {
        setRuta(null);
        setAviso("Portada quitada.");
        router.refresh();
      } else {
        setError(resultado.error ?? "No se pudo quitar.");
      }
    } catch {
      setError("No se pudo quitar. Comprueba tu conexión e inténtalo de nuevo.");
    }
    setConfirmando(false);
    setOcupado(false);
  }

  return (
    <Card className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <h2 className="text-lg font-semibold">Portada</h2>
        <p className="text-sm text-muted">
          JPG, PNG o WebP. Lo ideal: horizontal 2:1 (por ejemplo 1200×600) y
          menos de 300 KB.
        </p>
      </div>

      <div
        role="group"
        tabIndex={0}
        aria-label="Recuadro de portada: arrastra una imagen aquí o pégala con Ctrl+V"
        onDragOver={(evento) => {
          if (!traeArchivos(evento)) return;
          evento.preventDefault();
          evento.dataTransfer.dropEffect = ocupado ? "none" : "copy";
          if (!ocupado) setArrastrando(true);
        }}
        onDragLeave={() => setArrastrando(false)}
        onDrop={alSoltar}
        onPaste={alPegar}
        className={cn(
          "relative aspect-[2/1] w-full max-w-xl overflow-hidden rounded-2xl border bg-surface-2 outline-none transition-colors",
          arrastrando
            ? "border-2 border-dashed border-accent bg-accent/10"
            : "border-border focus-visible:border-accent",
        )}
      >
        {url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={url}
            alt="Vista previa de la portada"
            className="pointer-events-none size-full object-cover"
          />
        ) : (
          <div className="pointer-events-none flex size-full flex-col items-center justify-center gap-2 px-4 text-center text-sm text-muted">
            <span>Arrastra aquí la portada</span>
            <span className="text-xs">
              Sin portada subida se usa public/images/rutinas/{slug}.jpg si existe.
            </span>
          </div>
        )}
        {arrastrando ? (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-accent/20 text-base font-semibold">
            Suelta para {ruta ? "reemplazar" : "subir"}
          </div>
        ) : null}
        {ocupado ? (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-background/70 text-sm font-medium">
            Un momento… no cierres la página
          </div>
        ) : null}
      </div>

      <input
        ref={entrada}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={alElegir}
        className="sr-only"
        tabIndex={-1}
        aria-label="Elegir portada"
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
            ¿Seguro? Se borrará el archivo subido. Si existe una imagen en
            public/images/rutinas, volverá a usarse esa.
          </p>
          <div className="flex flex-wrap gap-2">
            <Button onClick={() => void quitar()} disabled={ocupado}>
              Sí, quitar
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
            {ruta ? "Cambiar portada" : "Subir portada"}
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
            Máximo {formatearTamano(LIMITE_BYTES.image)}
          </span>
        </div>
      )}
    </Card>
  );
}