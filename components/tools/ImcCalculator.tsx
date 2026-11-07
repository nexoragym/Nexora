"use client";

import { useState, type FormEvent } from "react";
import {
  DESCRIPCIONES_IMC,
  ETIQUETAS_IMC,
  ETIQUETAS_RATIO,
  TONOS_IMC,
  TONOS_RATIO,
  resumenImc,
  validarFormularioImc,
  type ErroresImc,
  type ResultadoImc,
} from "../../lib/imc";
import { Alert } from "../ui/Alert";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";
import { Input } from "../ui/Input";

const ESCALA_MIN = 15;
const ESCALA_MAX = 40;

function posicion(imc: number): number {
  const porcentaje = ((imc - ESCALA_MIN) / (ESCALA_MAX - ESCALA_MIN)) * 100;
  return Math.min(100, Math.max(0, porcentaje));
}

function formatear(valor: number, decimales: number): string {
  return valor.toLocaleString("es-ES", {
    minimumFractionDigits: decimales,
    maximumFractionDigits: decimales,
  });
}

// Barra con los cuatro tramos y un marcador donde cae tu IMC.
function Escala({ imc }: { imc: number }) {
  return (
    <div className="flex flex-col gap-2" aria-hidden="true">
      <div className="relative pt-2">
        <div className="flex h-3 w-full overflow-hidden rounded-full">
          <div className="bg-warning" style={{ width: "14%" }} />
          <div className="bg-success" style={{ width: "26%" }} />
          <div className="bg-warning" style={{ width: "20%" }} />
          <div className="bg-danger" style={{ width: "40%" }} />
        </div>
        <div
          className="absolute top-0 h-7 w-1 -translate-x-1/2 rounded-full bg-foreground"
          style={{ left: `${posicion(imc)}%` }}
        />
      </div>
      <div className="relative h-4 text-xs text-muted">
        <span className="absolute -translate-x-1/2" style={{ left: "14%" }}>
          18,5
        </span>
        <span className="absolute -translate-x-1/2" style={{ left: "40%" }}>
          25
        </span>
        <span className="absolute -translate-x-1/2" style={{ left: "60%" }}>
          30
        </span>
      </div>
    </div>
  );
}

function Resultado({ resultado }: { resultado: ResultadoImc }) {
  if (resultado.menor) {
    return (
      <Alert tone="info" title="El IMC de adultos no sirve para menores de 18 años">
        En niños y adolescentes se interpreta con tablas por edad y sexo. Consulta
        con un pediatra o con el médico.
      </Alert>
    );
  }

  return (
    <Card className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <p className="text-sm text-muted">Tu IMC</p>
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-5xl font-semibold tabular-nums">
            {formatear(resultado.imc, 1)}
          </span>
          <Badge tone={TONOS_IMC[resultado.categoria]}>
            {ETIQUETAS_IMC[resultado.categoria]}
          </Badge>
        </div>
        <p className="max-w-2xl text-muted">{DESCRIPCIONES_IMC[resultado.categoria]}</p>
      </div>

      <Escala imc={resultado.imc} />

      <p className="text-sm text-muted">
        Para tu estatura, un IMC entre 18,5 y 24,9 corresponde a unos{" "}
        {formatear(resultado.rango.min, 1)} a {formatear(resultado.rango.max, 1)} kg.
        Es solo una referencia estadística, no un objetivo.
      </p>

      {resultado.ratio ? (
        <div className="flex flex-col gap-2 border-t border-border pt-5">
          <p className="text-sm text-muted">Relación cintura/estatura</p>
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-3xl font-semibold tabular-nums">
              {formatear(resultado.ratio.valor, 2)}
            </span>
            <Badge tone={TONOS_RATIO[resultado.ratio.categoria]}>
              {ETIQUETAS_RATIO[resultado.ratio.categoria]}
            </Badge>
          </div>
          <p className="max-w-2xl text-sm text-muted">
            Sirve de complemento al IMC porque no se confunde con el músculo.
            También es orientativa.
          </p>
        </div>
      ) : null}
    </Card>
  );
}

export function ImcCalculator() {
  const [peso, setPeso] = useState("");
  const [altura, setAltura] = useState("");
  const [edad, setEdad] = useState("");
  const [cintura, setCintura] = useState("");
  const [errores, setErrores] = useState<ErroresImc>({});
  const [resultado, setResultado] = useState<ResultadoImc | null>(null);

  function calcular(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    const { valores, errores: nuevos } = validarFormularioImc({
      peso,
      altura,
      edad,
      cintura,
    });
    setErrores(nuevos);
    setResultado(valores ? resumenImc(valores) : null);
  }

  function borrar() {
    setPeso("");
    setAltura("");
    setEdad("");
    setCintura("");
    setErrores({});
    setResultado(null);
  }

  return (
    <div className="flex flex-col gap-6">
      <Card className="flex flex-col gap-5">
        <form onSubmit={calcular} noValidate className="flex flex-col gap-5">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              name="peso"
              label="Peso (kg)"
              inputMode="decimal"
              autoComplete="off"
              placeholder="Por ejemplo, 72,5"
              value={peso}
              onChange={(evento) => setPeso(evento.target.value)}
              error={errores.peso}
            />
            <Input
              name="altura"
              label="Estatura (cm)"
              inputMode="decimal"
              autoComplete="off"
              placeholder="Por ejemplo, 175"
              value={altura}
              onChange={(evento) => setAltura(evento.target.value)}
              error={errores.altura}
            />
            <Input
              name="edad"
              label="Edad (años)"
              inputMode="numeric"
              autoComplete="off"
              placeholder="Por ejemplo, 30"
              value={edad}
              onChange={(evento) => setEdad(evento.target.value)}
              error={errores.edad}
            />
            <Input
              name="cintura"
              label="Cintura (cm, opcional)"
              inputMode="decimal"
              autoComplete="off"
              hint="A la altura del ombligo, sin apretar y tras soltar el aire."
              value={cintura}
              onChange={(evento) => setCintura(evento.target.value)}
              error={errores.cintura}
            />
          </div>
          <div className="flex flex-wrap gap-3">
            <Button type="submit" size="lg">
              Calcular
            </Button>
            <Button type="button" variant="secondary" size="lg" onClick={borrar}>
              Borrar
            </Button>
          </div>
          <p className="text-sm text-muted">
            No se guarda nada: los datos se quedan en tu pantalla.
          </p>
        </form>
      </Card>

      <div aria-live="polite">{resultado ? <Resultado resultado={resultado} /> : null}</div>

      <Alert tone="warning" title="Ten en cuenta">
        <ul className="flex list-disc flex-col gap-1 pl-5">
          <li>
            El IMC no distingue músculo de grasa. Si entrenas fuerza, puede salir
            alto sin que lo sea tu grasa corporal.
          </li>
          <li>
            Es una orientación general para adultos y no un diagnóstico. No sirve
            durante el embarazo ni para menores de 18 años.
          </li>
          <li>
            Si algo te preocupa de tu peso o de tu alimentación, habla con un
            profesional sanitario.
          </li>
        </ul>
      </Alert>
    </div>
  );
}