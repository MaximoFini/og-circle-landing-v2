import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Política de Privacidad — OG Circle by VeGroup',
  description: 'Política de privacidad y tratamiento de datos personales de OG Circle by VeGroup.',
  robots: { index: false, follow: true },
};

const WHATSAPP_HREF = 'https://wa.me/5491176392303?text=' + encodeURIComponent('Hola, tengo una consulta sobre la Política de Privacidad de OG Circle.');

export default function PrivacidadPage() {
  return (
    <main className="legal-page">
      <div className="wrap">
        <Link href="/" className="legal-back">
          <ArrowLeft size={14} /> Volver a la landing
        </Link>

        <h1>Política de Privacidad</h1>
        <p className="legal-updated">Última actualización: 18 de agosto de 2026</p>

        <div className="legal-draft-notice">
          <p>
            <strong>Nota interna:</strong> este documento es un borrador redactado en base al funcionamiento
            real del sitio y sus integraciones (formulario de contacto, cookies técnicas, uso de un proveedor
            de IA de terceros y de una API de cotización). Antes de publicarlo debe ser revisado por un
            abogado matriculado en Argentina para validar su ajuste a la Ley 25.326 de Protección de Datos
            Personales, su Decreto Reglamentario y las disposiciones de la Agencia de Acceso a la Información
            Pública (AAIP).
          </p>
        </div>

        <nav className="legal-toc" aria-label="Índice">
          <a href="#s1">1. Responsable del tratamiento</a>
          <a href="#s2">2. Normativa aplicable</a>
          <a href="#s3">3. Qué datos recolectamos</a>
          <a href="#s4">4. Para qué usamos tus datos</a>
          <a href="#s5">5. Base legal / consentimiento</a>
          <a href="#s6">6. Con quién compartimos tus datos</a>
          <a href="#s7">7. Transferencia internacional de datos</a>
          <a href="#s8">8. Cuánto tiempo conservamos tus datos</a>
          <a href="#s9">9. Cookies y tecnologías similares</a>
          <a href="#s10">10. Tus derechos (acceso, rectificación, supresión)</a>
          <a href="#s11">11. Seguridad de la información</a>
          <a href="#s12">12. Menores de edad</a>
          <a href="#s13">13. Cambios a esta política</a>
          <a href="#s14">14. Contacto</a>
        </nav>

        <section id="s1">
          <h2>1. Responsable del tratamiento</h2>
          <p>
            El responsable del tratamiento de los datos personales recolectados a través de este sitio es{' '}
            <strong>VeGroup</strong> ("VeGroup", "nosotros"), con domicilio en Amenábar 2049, Belgrano, Ciudad
            Autónoma de Buenos Aires, Argentina, titular del sitio de OG Circle by VeGroup (el "Sitio").
          </p>
        </section>

        <section id="s2">
          <h2>2. Normativa aplicable</h2>
          <p>
            Esta Política de Privacidad se elabora conforme a la <strong>Ley 25.326 de Protección de Datos
            Personales</strong> de la República Argentina y su Decreto Reglamentario 1558/2001, bajo el
            control de la <strong>Agencia de Acceso a la Información Pública (AAIP)</strong>, autoridad de
            aplicación en la materia.
          </p>
        </section>

        <section id="s3">
          <h2>3. Qué datos recolectamos</h2>
          <h3>3.1. Datos que dejás vos mismo (formulario de contacto de la demo)</h3>
          <p>
            El Sitio incluye una demo/simulador interactivo de costos de importación. Para desbloquear ciertos
            resultados de esa demo (por ejemplo, el análisis comercial), te pedimos un formulario de contacto
            con:
          </p>
          <ul>
            <li><strong>Nombre</strong></li>
            <li><strong>Número de WhatsApp</strong></li>
          </ul>
          <p>
            Junto con esos datos, guardamos automáticamente un <strong>hash (huella digital irreversible) de
            tu dirección IP</strong> y la <strong>fecha y hora</strong> del envío. No guardamos tu IP en texto
            plano: el hash se usa solo para evitar usos duplicados o abusivos del formulario, no para
            identificarte por sí solo.
          </p>
          <h3>3.2. Texto que escribís en la demo</h3>
          <p>
            Cuando usás la demo para estimar costos o pedir un análisis comercial, escribís el nombre de un
            producto que querés importar (por ejemplo, "auriculares bluetooth"). Ese texto se envía a un
            proveedor externo de inteligencia artificial para (a) sugerir una clasificación arancelaria
            orientativa (posición NCM) y (b) generar un análisis de estrategia comercial y marketing. Ver el
            detalle en la sección 6.2.
          </p>
          <h3>3.3. Cookies técnicas</h3>
          <p>
            Usamos una cookie técnica para identificar tu navegador como visitante de la demo y así limitar
            cuántas veces podés usar gratuitamente ciertas funciones (por ejemplo, el análisis comercial). No
            es una cookie de publicidad ni de seguimiento de terceros: no la compartimos con redes
            publicitarias ni la usamos para armar un perfil de navegación fuera del Sitio. Más detalle en la
            sección 9.
          </p>
          <h3>3.4. Datos que NO recolectamos en la demo</h3>
          <p>
            La consulta de la cotización del dólar oficial que usa la calculadora se resuelve contra una API
            pública externa (dolarapi.com) sin enviarle ningún dato personal tuyo: es una consulta genérica de
            precio, igual para todos los visitantes.
          </p>
          <h3>3.5. Datos que dejás por WhatsApp</h3>
          <p>
            Si nos escribís por WhatsApp para comprar o hacer una consulta, los datos que compartas en esa
            conversación (nombre, número, y lo que decidas contarnos) quedan sujetos además a la política de
            privacidad propia de WhatsApp / Meta. Ver sección 6.3.
          </p>
        </section>

        <section id="s4">
          <h2>4. Para qué usamos tus datos</h2>
          <ul>
            <li>Contactarte por WhatsApp a partir del formulario de la demo, para asesorarte comercialmente sobre OG Circle.</li>
            <li>Generar la clasificación arancelaria orientativa y el análisis comercial que pediste dentro de la demo.</li>
            <li>Prevenir el uso abusivo o duplicado de las funciones gratuitas de la demo.</li>
            <li>Cumplir obligaciones legales, contables o regulatorias que nos correspondan como empresa.</li>
          </ul>
          <p>No usamos tus datos para enviarte publicidad de terceros ni los vendemos a otras empresas.</p>
        </section>

        <section id="s5">
          <h2>5. Base legal / consentimiento</h2>
          <p>
            Tratamos tus datos personales en base a tu consentimiento libre, expreso e informado, que otorgás
            al completar voluntariamente el formulario de contacto de la demo o al escribirnos por WhatsApp.
            Podés retirar ese consentimiento en cualquier momento (ver sección 10), sin que ello afecte la
            licitud del tratamiento previo.
          </p>
        </section>

        <section id="s6">
          <h2>6. Con quién compartimos tus datos</h2>
          <p>No vendemos tus datos personales. Los compartimos únicamente con los siguientes terceros, en la medida necesaria para operar el Sitio:</p>
          <h3>6.1. Proveedores de infraestructura</h3>
          <p>
            Alojamos el Sitio y almacenamos los datos del formulario de contacto (nombre, WhatsApp, hash de IP,
            fecha) en infraestructura de hosting/almacenamiento en la nube contratada por VeGroup, que actúa
            como encargado del tratamiento bajo nuestras instrucciones.
          </p>
          <h3>6.2. Proveedor de inteligencia artificial (Anthropic)</h3>
          <p>
            El texto que ingresás en la demo (el nombre del producto que querés importar, y datos numéricos de
            costo/precio que vos mismo cargues) se envía a <strong>Anthropic</strong> (proveedor del modelo de
            IA "Claude"), un tercero con sede en Estados Unidos, para generar la clasificación arancelaria
            orientativa y el análisis de marketing. Le enviamos el contenido de tu consulta, no tu nombre ni tu
            WhatsApp. El tratamiento que Anthropic hace de esos datos está sujeto a sus propias políticas de
            privacidad y condiciones de uso.
          </p>
          <h3>6.3. WhatsApp / Meta</h3>
          <p>
            Todos los canales de contacto y compra del Sitio derivan a WhatsApp. Los mensajes que nos envíes
            por ese medio son procesados por WhatsApp / Meta Platforms, Inc. conforme a su propia política de
            privacidad, que rige además de la presente.
          </p>
          <h3>6.4. Autoridades</h3>
          <p>
            Podemos divulgar datos personales cuando así lo exija la ley, una orden judicial o un requerimiento
            válido de una autoridad competente.
          </p>
        </section>

        <section id="s7">
          <h2>7. Transferencia internacional de datos</h2>
          <p>
            El envío de datos a Anthropic (sección 6.2) implica una transferencia internacional de datos hacia
            un país que puede no contar con un nivel de protección adecuado según los estándares de la Ley
            25.326. Realizamos esta transferencia limitada al contenido de tu consulta (no tus datos de
            contacto) y en base a tu consentimiento al usar voluntariamente esa función de la demo.
          </p>
          <div className="legal-callout">
            <p>
              Punto a validar con el abogado: si corresponde incorporar cláusulas contractuales adicionales o
              alguna garantía específica exigida por la AAIP para este tipo de transferencia internacional de
              datos hacia un proveedor de IA en Estados Unidos.
            </p>
          </div>
        </section>

        <section id="s8">
          <h2>8. Cuánto tiempo conservamos tus datos</h2>
          <p>
            Conservamos los datos del formulario de contacto de la demo (nombre, WhatsApp, hash de IP,
            timestamp) mientras sean necesarios para la finalidad comercial por la que los recolectamos, y en
            todo caso hasta que ejerzas tu derecho de supresión conforme a la sección 10. Podemos conservar un
            registro mínimo por obligaciones legales, contables o de prevención de fraude aun después de
            eliminar tus datos de contacto activos.
          </p>
        </section>

        <section id="s9">
          <h2>9. Cookies y tecnologías similares</h2>
          <p>
            Usamos <strong>cookies técnicas propias</strong>, necesarias para el funcionamiento de la demo:
            identifican tu navegador para aplicar los límites de uso gratuito de ciertas funciones (por
            ejemplo, cuántas veces podés pedir el análisis comercial). Son de tipo técnico/funcional, no de
            publicidad ni de seguimiento (tracking) de terceros, y no las usamos para perfilarte
            comercialmente fuera del Sitio.
          </p>
          <p>
            Podés bloquear o eliminar estas cookies desde la configuración de tu navegador; si lo hacés, es
            posible que algunas funciones de la demo dejen de funcionar correctamente o se reinicien tus
            límites de uso.
          </p>
        </section>

        <section id="s10">
          <h2>10. Tus derechos (acceso, rectificación, supresión)</h2>
          <p>
            Conforme a la Ley 25.326, tenés derecho a solicitar en cualquier momento y de forma gratuita:
          </p>
          <ul>
            <li><strong>Acceso:</strong> conocer qué datos personales tuyos tenemos y cómo los usamos.</li>
            <li><strong>Rectificación:</strong> corregir datos inexactos o desactualizados.</li>
            <li><strong>Supresión:</strong> pedir que eliminemos tus datos cuando corresponda.</li>
            <li><strong>Retiro del consentimiento:</strong> oponerte a que sigamos usando tus datos para los fines de la sección 4.</li>
          </ul>
          <p>
            Para ejercer estos derechos, escribinos por los canales de la sección 14 indicando tu nombre y el
            número de WhatsApp con el que interactuaste en el Sitio, para poder identificar tu registro.
            Responderemos dentro de los plazos que establece la normativa vigente.
          </p>
          <div className="legal-callout">
            <p>
              La <strong>Agencia de Acceso a la Información Pública (AAIP)</strong>, órgano de control de la
              Ley 25.326, tiene la atribución de atender denuncias y reclamos que interpongan quienes resulten
              afectados en sus derechos por incumplimiento de las normas vigentes en materia de protección de
              datos personales.
            </p>
          </div>
        </section>

        <section id="s11">
          <h2>11. Seguridad de la información</h2>
          <p>
            Adoptamos medidas técnicas y organizativas razonables para proteger tus datos personales contra
            acceso no autorizado, pérdida o alteración, incluyendo el uso de conexiones cifradas y el
            almacenamiento de identificadores sensibles (como tu IP) únicamente en forma de hash irreversible.
            Ningún sistema es 100% infalible, y no podemos garantizar seguridad absoluta.
          </p>
        </section>

        <section id="s12">
          <h2>12. Menores de edad</h2>
          <p>
            El Sitio y el Producto están dirigidos a personas mayores de 18 años. No recolectamos
            intencionalmente datos de menores de edad. Si tomamos conocimiento de que un menor nos dejó datos
            sin el consentimiento de su representante legal, los eliminaremos.
          </p>
        </section>

        <section id="s13">
          <h2>13. Cambios a esta política</h2>
          <p>
            Podemos actualizar esta Política de Privacidad para reflejar cambios en el Sitio, en nuestros
            proveedores o en la normativa aplicable. La versión vigente es siempre la publicada en esta página,
            con su fecha de última actualización.
          </p>
        </section>

        <section id="s14">
          <h2>14. Contacto</h2>
          <p>Para consultas o para ejercer tus derechos sobre tus datos personales, escribinos a:</p>
          <ul>
            <li>WhatsApp: <a href={WHATSAPP_HREF} target="_blank" rel="noopener noreferrer">+54 9 11 7639-2303</a></li>
            <li>Dirección: Amenábar 2049, Belgrano, CABA, Argentina</li>
          </ul>
          <p>
            También podés consultar a la Agencia de Acceso a la Información Pública, autoridad de control de
            la Ley 25.326, en{' '}
            <a href="https://www.argentina.gob.ar/aaip" target="_blank" rel="noopener noreferrer">
              argentina.gob.ar/aaip
            </a>.
          </p>
        </section>
      </div>
    </main>
  );
}
