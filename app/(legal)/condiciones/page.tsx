import type { Metadata } from "next";
import Link from "next/link";
import { LegalPendiente } from "../../../components/legal/LegalPendiente";
import {
  LegalSection,
  Responsable,
} from "../../../components/legal/LegalSection";
import { LEGAL } from "../../../lib/legal";
import { siteConfig } from "../../../lib/site";

export const metadata: Metadata = { title: "Condiciones de uso" };

export default function CondicionesPage() {
  return (
    <>
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold tracking-tight">
          Condiciones de uso
        </h1>
        <p className="text-sm text-muted">
          Última actualización: {LEGAL.ultimaActualizacion}
        </p>
      </div>

      <LegalPendiente />

      <p className="text-muted">
        Al crear una cuenta o usar {siteConfig.name} aceptas estas condiciones.
        Léelas con calma; son cortas.
      </p>

      <LegalSection titulo="1. Qué es este servicio">
        <p>
          {siteConfig.name} es una aplicación para planificar entrenamientos y
          seguir tu progreso: rutinas, biblioteca de ejercicios, registro de
          series, racha y herramientas como la calculadora de IMC.
        </p>
        <Responsable />
      </LegalSection>

      <LegalSection titulo="2. Versión beta">
        <p>
          La aplicación está en fase de pruebas. Puede tener errores, cambiar,
          dejar de estar disponible o perder datos de forma puntual. Hoy es
          gratuita. Si algún día se ofrecen funciones de pago, te lo diremos
          antes y no se cobrará nada sin tu aceptación expresa.
        </p>
      </LegalSection>

      <LegalSection titulo="3. Tu cuenta">
        <ul className="flex list-disc flex-col gap-2 pl-5">
          <li>
            Debes tener al menos {LEGAL.edadMinima} años.
          </li>
          <li>
            Los datos que nos des deben ser verdaderos y mantenerlos al día.
          </li>
          <li>
            Eres responsable de tu contraseña y de lo que se haga con tu cuenta.
          </li>
          <li>Una cuenta es personal: no la compartas ni la vendas.</li>
        </ul>
      </LegalSection>

      <LegalSection titulo="4. No es consejo médico">
        <p>
          Las rutinas, ejercicios, consejos y la calculadora de IMC son{" "}
          <strong className="text-foreground">orientativos y generales</strong> y
          no sustituyen el consejo de un médico, fisioterapeuta o entrenador
          profesional. Antes de empezar, sobre todo si tienes una lesión, dolor,
          una enfermedad, estás embarazada o llevas tiempo sin entrenar,
          consulta con un profesional sanitario.
        </p>
        <p>
          Entrenar conlleva riesgos. Eliges tú los pesos y la intensidad y
          decides si seguir o parar. Si notas dolor, mareo o malestar, detente.
          Los ejercicios con barra o mucho peso requieren técnica y, si es
          posible, compañía.
        </p>
      </LegalSection>

      <LegalSection titulo="5. Uso adecuado">
        <p>No está permitido:</p>
        <ul className="flex list-disc flex-col gap-2 pl-5">
          <li>Intentar acceder a datos de otras personas o al panel privado.</li>
          <li>Sobrecargar o intentar dañar el servicio, o saltarse sus protecciones.</li>
          <li>Usar la aplicación para fines ilegales o para molestar a otros.</li>
          <li>Copiar masivamente su contenido sin permiso.</li>
        </ul>
        <p>
          Si se incumple, podemos suspender o cerrar la cuenta.
        </p>
      </LegalSection>

      <LegalSection titulo="6. Contenido y propiedad">
        <p>
          El diseño, los textos, los ejercicios, las rutinas, las imágenes y el
          código de {siteConfig.name} pertenecen a su titular o se usan con
          licencia. Puedes usarlos para tu entrenamiento personal, pero no
          copiarlos ni redistribuirlos. Tus datos y tus rutinas propias siguen
          siendo tuyos.
        </p>
      </LegalSection>

      <LegalSection titulo="7. Disponibilidad y cambios">
        <p>
          Hacemos lo posible por que el servicio funcione, pero no podemos
          garantizar que esté siempre disponible ni libre de errores. Podemos
          cambiar, añadir o quitar funciones. Si hacemos cambios importantes en
          estas condiciones, te lo avisaremos.
        </p>
      </LegalSection>

      <LegalSection titulo="8. Responsabilidad">
        <p>
          En la medida en que la ley lo permite, no nos hacemos responsables de
          lesiones o daños derivados de seguir las rutinas o consejos de la
          aplicación, ni de pérdidas por fallos del servicio. Esto no limita
          los derechos que la ley te reconoce como consumidor ni nuestra
          responsabilidad por dolo o negligencia grave.
        </p>
      </LegalSection>

      <LegalSection titulo="9. Darte de baja">
        <p>
          Puedes eliminar tu cuenta cuando quieras desde tu{" "}
          <Link href="/perfil" className="font-semibold text-accent hover:underline">
            Perfil
          </Link>
          . Se borrarán tus datos, como explica la{" "}
          <Link href="/privacidad" className="font-semibold text-accent hover:underline">
            política de privacidad
          </Link>
          .
        </p>
      </LegalSection>

      <LegalSection titulo="10. Ley aplicable y contacto">
        <p>
          Estas condiciones se rigen por la ley española. Para cualquier duda,
          queja o petición, escríbenos a{" "}
          <a
            href={`mailto:${LEGAL.email}`}
            className="font-semibold text-accent hover:underline"
          >
            {LEGAL.email}
          </a>
          .
        </p>
      </LegalSection>
    </>
  );
}