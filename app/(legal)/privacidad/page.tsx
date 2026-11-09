import type { Metadata } from "next";
import Link from "next/link";
import { LegalPendiente } from "../../../components/legal/LegalPendiente";
import {
  LegalSection,
  Responsable,
} from "../../../components/legal/LegalSection";
import { LEGAL } from "../../../lib/legal";
import { siteConfig } from "../../../lib/site";

export const metadata: Metadata = { title: "Política de privacidad" };

export default function PrivacidadPage() {
  return (
    <>
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold tracking-tight">
          Política de privacidad
        </h1>
        <p className="text-sm text-muted">
          Última actualización: {LEGAL.ultimaActualizacion}
        </p>
      </div>

      <LegalPendiente />

      <p className="text-muted">
        Aquí te explicamos, sin tecnicismos, qué datos recoge {siteConfig.name},
        para qué los usa y qué puedes hacer con ellos.
      </p>

      <LegalSection titulo="1. Quién es el responsable">
        <Responsable />
      </LegalSection>

      <LegalSection titulo="2. Qué datos tratamos">
        <ul className="flex list-disc flex-col gap-2 pl-5">
          <li>
            <strong className="text-foreground">Tu cuenta:</strong> nombre,
            correo electrónico y contraseña (se guarda cifrada, nunca la vemos).
            Si entras con Google, recibimos tu nombre y tu correo de Google.
          </li>
          <li>
            <strong className="text-foreground">El cuestionario:</strong> tu
            objetivo, nivel, días y duración de entrenamiento, material
            disponible, enfoque, duración del programa y, si quieres, tu sexo
            (solo sirve para elegir imágenes).
          </li>
          <li>
            <strong className="text-foreground">Tus entrenamientos:</strong>{" "}
            rutinas, sesiones, series, pesos, repeticiones, fechas y tu racha.
          </li>
          <li>
            <strong className="text-foreground">Datos técnicos:</strong> la
            dirección IP y datos del dispositivo que reciben los servidores al
            conectarte, necesarios para que la web funcione y para frenar
            abusos.
          </li>
        </ul>
        <p>
          La calculadora de IMC no guarda nada: los datos que escribes se quedan
          en tu pantalla.
        </p>
      </LegalSection>

      <LegalSection titulo="3. Zonas a cuidar (datos de salud)">
        <p>
          En el cuestionario puedes indicar zonas a cuidar (rodillas, zona
          lumbar, hombros, muñecas o evitar impacto). Esa información puede
          considerarse un dato relativo a la salud. <strong className="text-foreground">Es
          totalmente opcional</strong>: solo la tratamos si la marcas, y la usamos
          únicamente para evitar ejercicios que suelen cargar esas zonas al
          preparar tu plan. Puedes retirar tu consentimiento en cualquier
          momento eliminando tu cuenta o escribiéndonos.
        </p>
      </LegalSection>

      <LegalSection titulo="4. Para qué usamos tus datos y con qué base legal">
        <ul className="flex list-disc flex-col gap-2 pl-5">
          <li>
            Crear tu cuenta, preparar tus rutinas y guardar tu progreso:
            necesario para prestarte el servicio (ejecución del contrato).
          </li>
          <li>
            Tratar las zonas a cuidar: tu consentimiento expreso al marcarlas.
          </li>
          <li>
            Mantener la web segura y frenar bots y abusos: nuestro interés
            legítimo.
          </li>
        </ul>
        <p>
          No vendemos tus datos, no mostramos publicidad y no tomamos decisiones
          automatizadas con efectos legales sobre ti. El plan personalizado se
          genera con reglas generales y no sustituye el consejo de un
          profesional.
        </p>
      </LegalSection>

      <LegalSection titulo="5. Con quién los compartimos">
        <p>
          Para funcionar usamos proveedores que tratan datos por nuestra cuenta:
        </p>
        <ul className="flex list-disc flex-col gap-2 pl-5">
          <li>
            <strong className="text-foreground">Supabase:</strong> base de datos,
            inicio de sesión y archivos. Los datos se alojan en una región de la
            Unión Europea.
          </li>
          <li>
            <strong className="text-foreground">Netlify:</strong> alojamiento de
            la web.
          </li>
          <li>
            <strong className="text-foreground">Google:</strong> solo si eliges
            «Continuar con Google».
          </li>
          <li>
            <strong className="text-foreground">Cloudflare:</strong> verificación
            anti-bots (Turnstile) al registrarte o iniciar sesión, cuando está
            activada.
          </li>
        </ul>
        <p>
          Alguno de estos proveedores puede tratar datos fuera del Espacio
          Económico Europeo. En ese caso lo hace con las garantías que exige la
          normativa (por ejemplo, cláusulas contractuales tipo).
        </p>
      </LegalSection>

      <LegalSection titulo="6. Cuánto tiempo los guardamos">
        <p>
          Mientras tengas la cuenta. Si la eliminas desde tu Perfil, borramos tus
          datos de la aplicación al momento. Pueden permanecer un tiempo limitado
          en las copias de seguridad de los proveedores hasta que se renuevan.
        </p>
      </LegalSection>

      <LegalSection titulo="7. Tus derechos">
        <p>
          Puedes acceder a tus datos, rectificarlos, suprimirlos, oponerte a su
          tratamiento, limitarlo y pedir su portabilidad. Lo más rápido:
        </p>
        <ul className="flex list-disc flex-col gap-2 pl-5">
          <li>
            En tu <Link href="/perfil" className="font-semibold text-accent hover:underline">Perfil</Link>{" "}
            puedes cambiar tu nombre, <strong className="text-foreground">descargar todos tus
            datos</strong> (JSON) y <strong className="text-foreground">eliminar tu cuenta</strong>.
          </li>
          <li>
            Para cualquier otra petición, escríbenos a{" "}
            <a
              href={`mailto:${LEGAL.email}`}
              className="font-semibold text-accent hover:underline"
            >
              {LEGAL.email}
            </a>
            .
          </li>
        </ul>
        <p>
          Si crees que no tratamos tus datos correctamente, puedes reclamar ante
          la Agencia Española de Protección de Datos (aepd.es).
        </p>
      </LegalSection>

      <LegalSection titulo="8. Cookies y almacenamiento en tu dispositivo">
        <p>
          {siteConfig.name} solo usa lo estrictamente necesario: la cookie de tu
          sesión (para que sigas conectado) y un guardado temporal en tu
          navegador de las respuestas del cuestionario hasta que creas tu
          cuenta. No usamos cookies de analítica ni de publicidad. Si algún día
          las añadimos, te pediremos permiso antes.
        </p>
      </LegalSection>

      <LegalSection titulo="9. Seguridad">
        <p>
          Aplicamos medidas razonables: conexión cifrada, contraseñas cifradas,
          y reglas en la base de datos para que cada persona solo acceda a sus
          propios datos. Ningún sistema es infalible; si hubiera una brecha que
          te afectara, te lo comunicaríamos según marca la ley.
        </p>
      </LegalSection>

      <LegalSection titulo="10. Menores">
        <p>
          {siteConfig.name} es para mayores de {LEGAL.edadMinima} años. Si crees
          que un menor de esa edad se ha registrado, escríbenos y borraremos la
          cuenta.
        </p>
      </LegalSection>

      <LegalSection titulo="11. Cambios">
        <p>
          Si cambiamos esta política de forma importante, te lo avisaremos en la
          web. La fecha de arriba indica la última revisión.
        </p>
      </LegalSection>
    </>
  );
}