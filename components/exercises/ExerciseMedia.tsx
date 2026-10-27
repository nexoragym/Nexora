"use client";

import { useState } from "react";
import { cn } from "../../lib/cn";

type ExerciseMediaProps = {
  imageUrl: string | null;
  videoUrl: string | null;
  alt: string;
  className?: string;
};

// Imagen o vídeo de un ejercicio. Si no hay nada, o no carga, se ve un degradado
// con una pesa, así que la pantalla nunca se queda rota.
export function ExerciseMedia({
  imageUrl,
  videoUrl,
  alt,
  className,
}: ExerciseMediaProps) {
  const [imagenFalla, setImagenFalla] = useState(false);
  const [videoFalla, setVideoFalla] = useState(false);

  return (
    <div
      className={cn(
        "relative aspect-[4/3] w-full overflow-hidden rounded-3xl border border-border bg-linear-to-br from-accent/40 via-surface-2 to-surface",
        className,
      )}
    >
      <div
        aria-hidden="true"
        className="absolute inset-0 flex items-center justify-center text-accent/70"
      >
        <svg
          viewBox="0 0 24 24"
          width="64"
          height="64"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M6.5 6.5v11M17.5 6.5v11M3.5 9v6M20.5 9v6M6.5 12h11" />
        </svg>
      </div>

      {imageUrl && !imagenFalla ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={imageUrl}
          alt={videoUrl && !videoFalla ? "" : alt}
          onError={() => setImagenFalla(true)}
          className="absolute inset-0 size-full object-cover"
        />
      ) : null}

      {videoUrl && !videoFalla ? (
        <video
          src={videoUrl}
          poster={imageUrl && !imagenFalla ? imageUrl : undefined}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          aria-label={`Demostración de ${alt}`}
          onError={() => setVideoFalla(true)}
          className="absolute inset-0 size-full object-cover"
        />
      ) : null}
    </div>
  );
}