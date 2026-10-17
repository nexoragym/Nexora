import type { Metadata } from "next";
import { PageContainer, PageHeader } from "../../../components/layout/Page";
import { Alert } from "../../../components/ui/Alert";
import { Badge } from "../../../components/ui/Badge";
import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";
import { OptionCard } from "../../../components/ui/OptionCard";
import { ProgressRing } from "../../../components/ui/ProgressRing";
import { Select } from "../../../components/ui/Select";

export const metadata: Metadata = { title: "Componentes" };

export default function ComponentesPage() {
  return (
    <PageContainer>
      <PageHeader
        title="Componentes"
        description="Sección temporal para probar las piezas del sistema visual. Se eliminará más adelante."
      />

      <section aria-labelledby="botones" className="flex flex-col gap-4">
        <h2 id="botones" className="text-xl font-semibold">
          Botones
        </h2>
        <div className="flex flex-wrap items-center gap-3">
          <Button>Principal</Button>
          <Button variant="secondary">Secundario</Button>
          <Button variant="ghost">Discreto</Button>
          <Button disabled>Desactivado</Button>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button size="sm">Pequeño</Button>
          <Button size="md">Mediano</Button>
          <Button size="lg">Grande</Button>
          <Button size="xl">Extra grande</Button>
        </div>
      </section>

      <section aria-labelledby="etiquetas" className="flex flex-col gap-4">
        <h2 id="etiquetas" className="text-xl font-semibold">
          Etiquetas
        </h2>
        <div className="flex flex-wrap gap-2">
          <Badge>Neutral</Badge>
          <Badge tone="accent">Acento</Badge>
          <Badge tone="success">Completada</Badge>
          <Badge tone="warning">Pendiente</Badge>
          <Badge tone="danger">Error</Badge>
        </div>
      </section>

      <section aria-labelledby="anillos" className="flex flex-col gap-4">
        <h2 id="anillos" className="text-xl font-semibold">
          Anillos de progreso
        </h2>
        <div className="flex flex-wrap items-center gap-6">
          <ProgressRing value={25} label="Ejemplo al 25 %" />
          <ProgressRing value={60} label="Ejemplo al 60 %" />
          <ProgressRing value={100} label="Ejemplo al 100 %" />
        </div>
      </section>

      <section aria-labelledby="campos" className="flex flex-col gap-4">
        <h2 id="campos" className="text-xl font-semibold">
          Campos de formulario
        </h2>
        <div className="flex max-w-xl flex-col gap-4">
          <Input
            name="nombre"
            label="Nombre"
            placeholder="Tu nombre"
            hint="Texto de ayuda de demostración."
          />
          <Input
            name="correo"
            type="email"
            label="Correo electrónico"
            placeholder="nombre@ejemplo.com"
          />
          <Input
            name="contrasena"
            type="password"
            label="Contraseña"
            defaultValue="abc"
            error="Error de demostración: debe tener al menos 8 caracteres."
          />
          <Input
            name="desactivado"
            label="Campo desactivado"
            defaultValue="No editable"
            disabled
          />
          <Select
            name="objetivo"
            label="Objetivo principal"
            placeholder="Elige una opción"
            hint="Desplegable de demostración."
            options={[
              { value: "musculo", label: "Ganar músculo" },
              { value: "fuerza", label: "Ganar fuerza" },
              { value: "condicion", label: "Mejorar la condición física" },
            ]}
          />
        </div>
      </section>

      <section aria-labelledby="opciones" className="flex flex-col gap-6">
        <h2 id="opciones" className="text-xl font-semibold">
          Tarjetas de opción
        </h2>

        <fieldset className="flex flex-col gap-3">
          <legend className="mb-1 text-sm font-medium">
            Nivel de experiencia (elige una)
          </legend>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <OptionCard
              name="nivel"
              value="principiante"
              title="Principiante"
              description="Estoy empezando"
              defaultChecked
            />
            <OptionCard
              name="nivel"
              value="intermedio"
              title="Intermedio"
              description="Ya tengo experiencia"
            />
            <OptionCard
              name="nivel"
              value="avanzado"
              title="Avanzado"
              description="Entreno desde hace tiempo"
            />
          </div>
        </fieldset>

        <fieldset className="flex flex-col gap-3">
          <legend className="mb-1 text-sm font-medium">
            Material disponible (elige varias)
          </legend>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <OptionCard
              type="checkbox"
              name="material"
              value="mancuernas"
              title="Mancuernas"
            />
            <OptionCard
              type="checkbox"
              name="material"
              value="barra"
              title="Barra y discos"
            />
            <OptionCard
              type="checkbox"
              name="material"
              value="maquinas"
              title="Máquinas"
            />
            <OptionCard
              type="checkbox"
              name="material"
              value="corporal"
              title="Solo mi peso corporal"
            />
          </div>
        </fieldset>
      </section>

      <section aria-labelledby="mensajes" className="flex flex-col gap-4">
        <h2 id="mensajes" className="text-xl font-semibold">
          Mensajes
        </h2>
        <div className="flex max-w-xl flex-col gap-3">
          <Alert tone="success" title="Guardado">
            Mensaje de éxito de demostración.
          </Alert>
          <Alert tone="danger" title="No se pudo guardar">
            Mensaje de error de demostración.
          </Alert>
          <Alert tone="warning" title="Atención">
            Mensaje de aviso de demostración.
          </Alert>
          <Alert tone="info">Mensaje informativo de demostración.</Alert>
        </div>
      </section>
    </PageContainer>
  );
}