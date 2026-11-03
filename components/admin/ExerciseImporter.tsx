"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import {
  confirmarImportacion,
  previsualizarImportacion,
} from "../../app/(app)/admin/ejercicios/importar-actions";
import type {
  ModoExistentes,
  ResultadoImportacion,
  VistaPrevia,
} from "../../lib/admin/exercise-import";
import { Alert } from "../ui/Alert";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";

export function ExerciseImporter() {
  const [texto, setTexto] = useState("");
  const [modo, setModo] = useState<ModoExistentes>("omitir");
  const [vista, setVista] = useState<VistaPrevia | null>(null);
  const [resultado, setResultado] = useState<ResultadoImportacion | null>(null);
  const [pendiente, startTransition] = useTransition();

  function cambiarTexto(valor: string) {
    setTexto(valor);
    setVista(null);
    setResultado(null);
  }

  function revisar() {
    setResultado(null);
    startTransition(async () => {
      const respuesta = await previsualizarImportacion(texto);
      setVista(respuesta);
    });
  }

  function guardar() {
    startTransition(async () => {
      const respuesta = await confirmarImportacion(texto, modo);
      setResultado(respuesta);
      setVista(null);
    });
  }

  const aGuardar = vista
    ? vista.resumen.nuevos + (modo === "actualizar" ? vista.resumen.existentes : 0)
    : 0;

  return (
    <div className="flex flex-col gap-6">
      <Card className="flex flex-col gap-3">
        <label htmlFor="json" className="text-xl font-semibold">
          JSON de ejercicios
        </label>
        <textarea
          id="json"
          rows={14}
          value={texto}
          onChange={(evento) => cambiarTexto(evento.target.value)}
          spellCheck={false}
          placeholder='[ { "name": "Remo con barra", ... } ]'
          className="w-full rounded-xl border border-border bg-surface-2 px-4 py-3 font-mono text-sm text-foreground placeholder:text-muted/70 hover:border-muted focus-visible:border-accent"
        />
        <div className="flex flex-wrap items-center gap-3">
          <Button
            onClick={revisar}
            disabled={pendiente || texto.trim().length === 0}
          >
            {pendiente && !vista ? "Revisando…" : "Revisar"}
          </Button>
          <p className="text-sm text-muted">
            No se guarda nada hasta que pulses «Guardar».
          </p>
        </div>
      </Card>

      {vista && !vista.ok ? (
        <Alert tone="danger" title="No se puede revisar">
          {vista.error}
        </Alert>
      ) : null}

      {vista && vista.ok ? (
        <section aria-label="Vista previa" className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <Badge>{vista.resumen.total} en total</Badge>
            <Badge tone="success">{vista.resumen.nuevos} nuevos</Badge>
            <Badge tone="warning">{vista.resumen.existentes} ya existen</Badge>
            <Badge tone="danger">{vista.resumen.errores} con error</Badge>
            <Badge>{vista.resumen.conAvisos} con avisos</Badge>
          </div>

          {vista.resumen.existentes > 0 ? (
            <Card className="flex flex-col gap-3">
              <p className="font-medium">
                {vista.resumen.existentes} ejercicios ya existen. ¿Qué hacemos?
              </p>
              <label className="flex cursor-pointer items-center gap-3">
                <input
                  type="radio"
                  name="modo"
                  checked={modo === "omitir"}
                  onChange={() => setModo("omitir")}
                  className="size-4 accent-accent"
                />
                <span>Omitirlos (no se toca nada de lo que ya existe)</span>
              </label>
              <label className="flex cursor-pointer items-center gap-3">
                <input
                  type="radio"
                  name="modo"
                  checked={modo === "actualizar"}
                  onChange={() => setModo("actualizar")}
                  className="size-4 accent-accent"
                />
                <span>
                  Actualizarlos con los datos del JSON (conservan su imagen y
                  su vídeo)
                </span>
              </label>
            </Card>
          ) : null}

          <div className="overflow-x-auto rounded-3xl border border-border bg-surface">
            <table className="w-full min-w-[40rem] text-left text-sm">
              <thead className="border-b border-border text-muted">
                <tr>
                  <th className="px-4 py-3 font-medium">#</th>
                  <th className="px-4 py-3 font-medium">Ejercicio</th>
                  <th className="px-4 py-3 font-medium">Estado</th>
                  <th className="px-4 py-3 font-medium">Detalle</th>
                </tr>
              </thead>
              <tbody>
                {vista.filas.map((fila) => (
                  <tr
                    key={fila.indice}
                    className="border-b border-border align-top last:border-0"
                  >
                    <td className="px-4 py-3 text-muted">{fila.indice}</td>
                    <td className="px-4 py-3">
                      <div className="font-medium">
                        {fila.name || "(sin nombre)"}
                      </div>
                      <div className="text-xs text-muted">{fila.slug}</div>
                    </td>
                    <td className="px-4 py-3">
                      {fila.estado === "nuevo" ? (
                        <Badge tone="success">Nuevo</Badge>
                      ) : fila.estado === "existe" ? (
                        <Badge tone="warning">Ya existe</Badge>
                      ) : (
                        <Badge tone="danger">Error</Badge>
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs">
                      {fila.errores.map((mensaje, i) => (
                        <p key={`e${i}`} className="text-danger">
                          {mensaje}
                        </p>
                      ))}
                      {fila.avisos.map((mensaje, i) => (
                        <p key={`a${i}`} className="text-warning">
                          {mensaje}
                        </p>
                      ))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col gap-2">
            <div>
              <Button
                size="lg"
                onClick={guardar}
                disabled={pendiente || aGuardar === 0}
              >
                {pendiente
                  ? "Guardando…"
                  : `Guardar ${aGuardar} ${aGuardar === 1 ? "ejercicio" : "ejercicios"}`}
              </Button>
            </div>
            {vista.resumen.errores > 0 ? (
              <p className="text-sm text-muted">
                Los {vista.resumen.errores} ejercicios con error no se guardarán.
                Corrígelos en el JSON y vuelve a pulsar «Revisar».
              </p>
            ) : null}
          </div>
        </section>
      ) : null}

      {resultado ? (
        resultado.ok ? (
          <div className="flex flex-col gap-3">
            <Alert tone="success" title="Importación terminada">
              Creados: {resultado.creados} · Actualizados:{" "}
              {resultado.actualizados} · Omitidos: {resultado.omitidos} · Con
              error: {resultado.conError}
            </Alert>
            {resultado.fallos.length > 0 ? (
              <Alert tone="warning" title="Algunos no se pudieron guardar">
                <ul className="list-disc pl-5">
                  {resultado.fallos.map((fallo) => (
                    <li key={fallo.slug}>
                      {fallo.slug}: {fallo.motivo}
                    </li>
                  ))}
                </ul>
              </Alert>
            ) : null}
            <Link
              href="/admin/ejercicios"
              className="text-sm font-semibold text-accent hover:underline"
            >
              Ver la lista de ejercicios →
            </Link>
          </div>
        ) : (
          <Alert tone="danger" title="No se pudo importar">
            {resultado.error}
          </Alert>
        )
      ) : null}
    </div>
  );
}