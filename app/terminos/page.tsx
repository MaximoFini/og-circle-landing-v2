import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Términos y Condiciones — OG Circle by VEGROUP',
  description: 'Términos y condiciones de uso y compra de OG Circle by VeGroup.',
  robots: { index: false, follow: true },
};

const WHATSAPP_HREF = 'https://wa.me/5491176392303?text=' + encodeURIComponent('Hola, tengo una consulta sobre los Términos y Condiciones de OG Circle.');

export default function TerminosPage() {
  return (
    <main className="legal-page">
      <div className="wrap">
        <Link href="/" className="legal-back">
          <ArrowLeft size={14} /> Volver a la landing
        </Link>

        <h1>Términos y Condiciones</h1>
        <p className="legal-updated">Última actualización: 18 de agosto de 2026</p>

        <div className="legal-draft-notice">
          <p>
            <strong>Nota interna:</strong> este documento es un borrador redactado para cubrir de forma honesta
            y completa el funcionamiento real del sitio y del producto. Antes de publicarlo debe ser revisado
            y ajustado por un abogado matriculado en Argentina, especialmente en lo referido a defensa del
            consumidor (Ley 24.240), venta a distancia (Resolución 424/2020 y modificatorias) y la actividad
            específica de intermediación en importaciones.
          </p>
        </div>

        <nav className="legal-toc" aria-label="Índice">
          <a href="#s1">1. Quiénes somos</a>
          <a href="#s2">2. Objeto de estos Términos</a>
          <a href="#s3">3. Qué es OG Circle (y qué no es)</a>
          <a href="#s4">4. Planes, precios y forma de pago</a>
          <a href="#s5">5. Proceso de compra</a>
          <a href="#s6">6. Acceso, entrega y vigencia</a>
          <a href="#s7">7. Derecho de arrepentimiento</a>
          <a href="#s8">8. Cambios, cancelaciones y reembolsos</a>
          <a href="#s9">9. La demo / simulador de costos</a>
          <a href="#s10">10. Propiedad intelectual</a>
          <a href="#s11">11. Uso aceptable</a>
          <a href="#s12">12. Terceros involucrados</a>
          <a href="#s13">13. Límite de responsabilidad</a>
          <a href="#s14">14. WhatsApp como canal de contacto y venta</a>
          <a href="#s15">15. Protección de datos personales</a>
          <a href="#s16">16. Modificaciones a estos Términos</a>
          <a href="#s17">17. Ley aplicable y jurisdicción</a>
          <a href="#s18">18. Contacto</a>
        </nav>

        <section id="s1">
          <h2>1. Quiénes somos</h2>
          <p>
            OG Circle es un producto de <strong>VeGroup</strong> (en adelante, "VeGroup", "nosotros" o "la
            empresa"), con domicilio comercial en Amenábar 2049, Belgrano, Ciudad Autónoma de Buenos Aires,
            Argentina.
          </p>
          <p>
            Estos Términos y Condiciones (los "Términos") regulan el uso del sitio web de OG Circle by VeGroup
            (el "Sitio") y la compra del curso y los servicios asociados descriptos más abajo (el "Producto").
          </p>
        </section>

        <section id="s2">
          <h2>2. Objeto de estos Términos</h2>
          <p>
            Al usar el Sitio, dejar tus datos en cualquiera de sus formularios o abonar el Producto, aceptás
            estos Términos en su totalidad. Si no estás de acuerdo con alguna parte, no debés usar el Sitio ni
            comprar el Producto.
          </p>
          <p>
            Estos Términos aplican junto con nuestra <Link href="/privacidad">Política de Privacidad</Link>,
            que regula específicamente el tratamiento de tus datos personales.
          </p>
        </section>

        <section id="s3">
          <h2>3. Qué es OG Circle (y qué no es)</h2>
          <p>
            OG Circle es un <strong>curso de formación</strong> sobre importación de mercadería desde China,
            Miami (EE.UU.) y España, y sobre el armado de un e-commerce en Argentina, acompañado de{' '}
            <strong>acceso a una red de contactos y proveedores</strong> (agentes de compra, depósitos, agentes
            de flete/despacho, entre otros) que VeGroup facilita a sus alumnos.
          </p>
          <div className="legal-callout">
            <p>
              VeGroup <strong>no es un operador logístico, un despachante de aduana, ni una agencia de
              transporte internacional</strong>. VeGroup no realiza por sí misma el transporte, el despacho
              aduanero ni la nacionalización de la mercadería: en el plan Avanzado, esas gestiones son
              coordinadas por VeGroup a través de terceros profesionales y proveedores de su red (agentes de
              carga, despachantes matriculados, couriers), no ejecutadas directamente por VeGroup como
              transportista o aduana.
            </p>
          </div>
          <p>
            OG Circle <strong>no garantiza resultados</strong>: ni que vayas a importar exitosamente, ni que
            vayas a vender la mercadería importada, ni ningún resultado económico en particular. Es formación y
            acceso a infraestructura y contactos; el resultado depende de decisiones, esfuerzo y contexto de
            mercado que están fuera del control de VeGroup.
          </p>
        </section>

        <section id="s4">
          <h2>4. Planes, precios y forma de pago</h2>
          <p>OG Circle se ofrece hoy en dos niveles, ambos de <strong>pago único</strong> (no es una suscripción) con <strong>acceso de por vida</strong> al contenido y beneficios del nivel adquirido:</p>
          <h3>4.1. Principiante — $75.000 ARS (pago único)</h3>
          <ul>
            <li>Formación completa en video sobre el proceso de importación y armado de e-commerce.</li>
            <li>Acceso a la calculadora de costos.</li>
            <li>Acceso a la red de profesionales de VeGroup.</li>
            <li>Soporte financiero básico.</li>
          </ul>
          <h3>4.2. Avanzado — $125.000 ARS (pago único)</h3>
          <p>Incluye todo lo del plan Principiante, más:</p>
          <ul>
            <li>Uso de depósitos propios de la red en Miami, China y España.</li>
            <li>Agente de compras y agente de volumen.</li>
            <li>Flete y despacho gestionado por VeGroup a través de su red de proveedores.</li>
            <li>Tracking internacional del envío.</li>
            <li>Cuenta cambiaria con transferencias SWIFT.</li>
          </ul>
          <h3>4.3. Upgrade de Principiante a Avanzado</h3>
          <p>
            Quien haya adquirido el plan Principiante puede pasar al plan Avanzado en cualquier momento,
            abonando la diferencia de precio entre ambos planes vigente al momento del upgrade, más un cargo
            adicional de <strong>$10.000 ARS</strong>.
          </p>
          <h3>4.4. Precios</h3>
          <p>
            Los precios están expresados en pesos argentinos (ARS), incluyen los impuestos aplicables salvo
            que se indique lo contrario, y pueden modificarse sin aviso previo hacia el futuro. El precio
            aplicable a tu compra es el vigente y comunicado al momento en que se confirma la operación por el
            canal de venta (ver sección 5), no el que pudiera figurar en el Sitio en un momento posterior.
          </p>
        </section>

        <section id="s5">
          <h2>5. Proceso de compra</h2>
          <p>
            Actualmente el Sitio <strong>no cuenta con un checkout de pago automático</strong>. La compra de
            OG Circle se gestiona de forma directa por WhatsApp: al hacer clic en cualquiera de los botones de
            contacto/compra del Sitio, se abre una conversación de WhatsApp con el equipo de VeGroup, donde se
            coordinan el plan elegido, la forma de pago y la confirmación de la operación.
          </p>
          <p>
            La compra se considera perfeccionada una vez que VeGroup confirma por ese medio la recepción del
            pago correspondiente. Antes de esa confirmación, ningún mensaje o intercambio previo implica una
            venta cerrada.
          </p>
        </section>

        <section id="s6">
          <h2>6. Acceso, entrega y vigencia</h2>
          <p>
            Una vez confirmada la compra, VeGroup habilita el acceso al contenido y beneficios del plan
            adquirido dentro de un plazo razonable, que se comunica por WhatsApp al momento de la compra. El
            acceso al material de formación es <strong>de por vida</strong>, sujeto a que el Producto y sus
            plataformas asociadas sigan operativos.
          </p>
          <p>
            Los beneficios que dependen de terceros o de la red de contactos (agentes, depósitos, cuenta
            cambiaria, etc.) están sujetos a la disponibilidad y a los términos propios de esos terceros, que
            pueden cambiar con el tiempo sin que ello constituya un incumplimiento de VeGroup.
          </p>
        </section>

        <section id="s7">
          <h2>7. Derecho de arrepentimiento</h2>
          <p>
            De conformidad con la Ley 24.240 de Defensa del Consumidor y su normativa complementaria en materia
            de venta a distancia, si comprás como consumidor final tenés derecho a revocar la aceptación
            durante el plazo legal de <strong>10 (diez) días corridos</strong> contados desde la confirmación
            de la compra, sin necesidad de invocar motivo alguno y sin costo adicional.
          </p>
          <p>
            Para ejercerlo, escribinos por los canales de contacto indicados en la sección 18 dentro de ese
            plazo. Te reintegraremos el importe abonado según el medio de pago utilizado, en los plazos que
            correspondan según la normativa vigente.
          </p>
          <div className="legal-callout">
            <p>
              Punto a validar con el abogado: en qué medida el derecho de arrepentimiento se ve limitado o
              modulado por el acceso efectivo y uso del contenido digital durante ese plazo (por ejemplo, si ya
              se consumió una parte sustancial del curso o ya se hizo uso de beneficios de la red de contactos),
              y cómo debe redactarse esa excepción para ser válida bajo la Ley 24.240.
            </p>
          </div>
        </section>

        <section id="s8">
          <h2>8. Cambios, cancelaciones y reembolsos</h2>
          <p>
            Fuera del plazo de arrepentimiento de la sección 7, al ser OG Circle un producto de pago único con
            acceso de por vida, no ofrecemos reembolsos por el simple cambio de opinión, la falta de uso del
            Producto o resultados económicos no alcanzados.
          </p>
          <p>
            Si considerás que hubo un error de facturación, un cobro duplicado o un incumplimiento nuestro de
            lo prometido en estos Términos, escribinos por los canales de la sección 18 para que evaluemos el
            caso puntual.
          </p>
        </section>

        <section id="s9">
          <h2>9. La demo / simulador de costos</h2>
          <p>
            El Sitio incluye una demo interactiva que estima costos de importación (incluyendo una
            clasificación arancelaria orientativa por posición NCM), calcula aranceles aproximados usando una
            cotización de referencia del dólar, y puede generar sugerencias de estrategia comercial y de
            marketing para el producto que indiques.
          </p>
          <div className="legal-callout">
            <p>
              <strong>Esta demo es orientativa y educativa. No reemplaza el asesoramiento de un despachante de
              aduana matriculado.</strong> La clasificación arancelaria, los aranceles, tasas, impuestos y
              costos finales de una importación real dependen de la mercadería específica, su valorización,
              el criterio de la Aduana y la normativa vigente al momento del despacho, y pueden variar
              respecto de lo que muestra la demo.
            </p>
          </div>
          <div className="legal-callout">
            <p>
              <strong>El análisis de marketing y estrategia comercial generado en la demo es una sugerencia
              orientativa producida con asistencia de inteligencia artificial, no una garantía de resultados
              comerciales.</strong> Las ideas, ángulos de venta y precios sugeridos deben ser evaluados con
              criterio propio antes de tomar decisiones de negocio.
            </p>
          </div>
          <p>
            El uso de la demo puede estar sujeto a límites de uso (por ejemplo, una cantidad máxima de consultas
            por visitante o por día) para controlar su costo operativo. Ver también la sección 15 y nuestra{' '}
            <Link href="/privacidad">Política de Privacidad</Link> respecto de los datos que se recolectan en
            este flujo.
          </p>
        </section>

        <section id="s10">
          <h2>10. Propiedad intelectual</h2>
          <p>
            Todo el contenido del Sitio y del curso —videos, textos, materiales descargables, calculadoras,
            marca "OG Circle by VeGroup", diseño y demás elementos— es propiedad de VeGroup o de sus
            licenciantes, y está protegido por la normativa de propiedad intelectual aplicable.
          </p>
          <p>
            El acceso al Producto te otorga una licencia personal, intransferible y no exclusiva para uso
            propio del contenido. Queda prohibido reproducir, revender, redistribuir, compartir credenciales
            de acceso o explotar comercialmente el contenido del curso sin autorización expresa y por escrito
            de VeGroup.
          </p>
        </section>

        <section id="s11">
          <h2>11. Uso aceptable</h2>
          <p>Al usar el Sitio te comprometés a:</p>
          <ul>
            <li>Proporcionar datos de contacto reales y propios en los formularios (nombre, WhatsApp).</li>
            <li>No usar la demo ni el Sitio para fines abusivos, fraudulentos o que busquen evadir sus límites de uso.</li>
            <li>No intentar acceder sin autorización a sistemas, cuentas o datos de otros usuarios.</li>
            <li>Usar el contenido del curso y de la red de contactos conforme a la ley y a estos Términos.</li>
          </ul>
        </section>

        <section id="s12">
          <h2>12. Terceros involucrados</h2>
          <p>
            El plan Avanzado implica interactuar con proveedores y profesionales de la red de VeGroup
            (agentes de compra, depósitos en Miami/China/España, agentes de flete y despacho, entidades que
            operan la cuenta cambiaria con transferencias SWIFT, entre otros). Esos terceros prestan sus
            servicios bajo sus propios términos, tarifas y responsabilidades, y no son empleados ni
            representantes directos de VeGroup salvo que se indique expresamente lo contrario en cada caso.
          </p>
          <p>
            VeGroup selecciona y facilita el contacto con esta red, pero no es garante de la actuación de cada
            proveedor individual más allá de lo que corresponda por la propia gestión que VeGroup coordina.
          </p>
        </section>

        <section id="s13">
          <h2>13. Límite de responsabilidad</h2>
          <p>
            En la máxima medida permitida por la ley aplicable, VeGroup no será responsable por:
          </p>
          <ul>
            <li>Resultados económicos, comerciales o de ventas que el alumno no obtenga al aplicar lo aprendido en el curso.</li>
            <li>Diferencias entre los valores estimados por la demo/simulador y los costos reales de una importación.</li>
            <li>Demoras, daños, pérdidas o incumplimientos atribuibles a terceros de la red (transportistas, despachantes, depósitos, entidades financieras) que actúan bajo su propia responsabilidad profesional.</li>
            <li>Cambios en normativa aduanera, cambiaria o impositiva posteriores a la compra que afecten la viabilidad de una importación.</li>
            <li>Interrupciones del Sitio por causas de fuerza mayor, caídas de proveedores tecnológicos externos, o mantenimiento.</li>
          </ul>
          <p>
            Nada de lo anterior limita responsabilidades que, por ley, no puedan ser limitadas o excluidas
            frente a consumidores (Ley 24.240).
          </p>
        </section>

        <section id="s14">
          <h2>14. WhatsApp como canal de contacto y venta</h2>
          <p>
            Todos los botones de contacto y compra del Sitio derivan a una conversación de WhatsApp (wa.me).
            Al usar ese canal, tus mensajes son procesados por WhatsApp / Meta Platforms, Inc. conforme a sus
            propios términos y su propia política de privacidad, que te recomendamos leer y que aplican además
            de estos Términos y de nuestra <Link href="/privacidad">Política de Privacidad</Link>. VeGroup no
            controla la infraestructura de WhatsApp ni es responsable por su disponibilidad o funcionamiento.
          </p>
        </section>

        <section id="s15">
          <h2>15. Protección de datos personales</h2>
          <p>
            El tratamiento de tus datos personales (por ejemplo, los que dejás en el formulario de contacto de
            la demo) se rige por nuestra <Link href="/privacidad">Política de Privacidad</Link>, elaborada
            conforme a la Ley 25.326 de Protección de Datos Personales de la República Argentina.
          </p>
        </section>

        <section id="s16">
          <h2>16. Modificaciones a estos Términos</h2>
          <p>
            Podemos modificar estos Términos en cualquier momento para reflejar cambios en el Producto, en la
            operatoria del Sitio o en la normativa aplicable. La versión vigente es siempre la publicada en
            esta página, con su fecha de última actualización. Los cambios no aplican de forma retroactiva a
            compras ya confirmadas, salvo que la ley exija lo contrario.
          </p>
        </section>

        <section id="s17">
          <h2>17. Ley aplicable y jurisdicción</h2>
          <p>
            Estos Términos se rigen por las leyes de la República Argentina. Para cualquier controversia que no
            pueda resolverse de forma directa entre las partes, y sin perjuicio de los fueros que
            imperativamente correspondan por aplicación de la Ley 24.240 a favor del consumidor, las partes
            se someten a la jurisdicción de los tribunales ordinarios con competencia en la Ciudad Autónoma de
            Buenos Aires.
          </p>
        </section>

        <section id="s18">
          <h2>18. Contacto</h2>
          <p>Para consultas sobre estos Términos, escribinos a:</p>
          <ul>
            <li>WhatsApp: <a href={WHATSAPP_HREF} target="_blank" rel="noopener noreferrer">+54 9 11 7639-2303</a></li>
            <li>Dirección: Amenábar 2049, Belgrano, CABA, Argentina</li>
          </ul>
        </section>
      </div>
    </main>
  );
}
