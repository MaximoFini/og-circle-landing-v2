// Fuente unica: la usan FaqList.tsx (render visible) y page.tsx (FAQPage
// JSON-LD) para que el schema nunca quede desincronizado del contenido.
export const FAQS = [
  {
    q: '¿Es una suscripción mensual?',
    a: 'No. Es un pago único que te otorga acceso de por vida a OG Circle y las herramientas, incluyendo todas las actualizaciones futuras de los módulos.'
  },
  {
    q: '¿Sirve si estoy fuera de Argentina?',
    a: 'La estructura aduanera, las calculadoras de impuestos locales y los depósitos de retiro están diseñados específicamente para importadores que residen y comercializan dentro de Argentina.'
  },
  {
    q: '¿Puedo empezar en Principiante y pasarme a Avanzado más adelante?',
    a: 'Sí. Podés arrancar en el nivel Principiante y hacer el upgrade a Avanzado cuando quieras, abonando únicamente la diferencia entre ambos niveles más $10.000.'
  },
  {
    q: '¿Necesito experiencia previa en comercio exterior para entender los cursos?',
    a: 'No. El contenido está pensado desde cero, sin dar por sabido ningún término ni proceso previo de importación.'
  }
];
