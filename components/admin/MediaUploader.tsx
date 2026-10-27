"use client";

import { useRouter } from "next/navigation";
import { useRef, useState, type ChangeEvent } from "react";
import {
  guardarMedia,
  quitarMedia,
} from "../../app/(app)/admin/ejercicios/media-actions";
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

export function MediaUploader({
  exerciseId,
  tipo,
  rutaInicial,
  titulo,
  ayuda,
}: MediaUploaderProps) {
  const router = useRouter();
  const entrada = useRef<HTMLInputElement>(null);
  const [ruta, setRuta] = useState<string | null>(rutaInicial);
  const [estado, setEstado] = useState<Estado>("reposo");
  const [error, setError] = useState<string | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);
  const [confirmando, setConfirmando] = useState(false);

  const url = urlPublicaMedia(ruta);
  const ocupado = estado !== "reposo";
  const nombreTipo = tipo === "image" ? "imagen" : "vídeo";

  async function alElegir(evento: ChangeEvent<HTMLInputElement>) {
    const archivo = evento.target.files?.[0];
    evento.target.value = "";
    if (!archivo) return;

    setError(null);
    setAviso(null);
    setConfirmando(false);

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
      setAviso("Subido y guardado. Ya se ve en la aplicación.");
      router.refresh();
    } catch {
      setError("No se pudo subir. Comprueba tu conexión e inténtalo de nuevo.");
    }
    setEstado("reposo");
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

      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-border bg-surface-2">
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
          <div className="flex size-full items-center justify-center text-sm text-muted">
            Sin {nombreTipo}
          </div>
        )}
        {estado === "subiendo" ? (
          <div className="absolute inset-0 flex items-center justify-center bg-background/70 text-sm font-medium">
            Subiendo… no cierres la página
          </div>
        ) : null}
      </div>

      <input
        ref={entrada}
        type="file"
        accept={ACEPTA[tipo]}
        onChange={(evento) => void alElegir(evento)}
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
          <Button
            onClick={() => entrada.current?.click()}
            disabled={ocupado}
          >
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