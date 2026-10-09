/**
 * Franja de pilares del hero (debajo del CTA).
 *
 * Antes eran tres numeros que se contaban solos (6 / 3 / +5); el cliente
 * pidio sacar las cifras y dejar solo los pilares, asi que el conteo, el
 * IntersectionObserver y el flash ambar se fueron con ellas. Ahora es markup
 * estatico: sale entero del server, no hidrata nada y no tiene estado sin JS
 * que cuidar. El protagonismo que tenian los numeros pasa a la tipografia de
 * los textos (ver `02-numbers-bar.css`): la palabra clave de cada pilar va en
 * dorado y el resto en blanco debajo. La division es explicita y no
 * `::first-line`, que dependia de donde cortara el texto en cada ancho.
 *
 * Mantiene el nombre del archivo y la clase `.numbers-bar` para no tocar las
 * capas de parallax del hero (`.hero-layer--numbers` en 16-hero-motion.css).
 */

const PILLARS = [
  { key: 'Agentes chinos', rest: 'de compra' },
  { key: 'Depósitos', rest: 'de almacenaje' },
  { key: 'Logística', rest: '' },
  { key: 'Profesionales', rest: 'al servicio' },
];

export default function NumbersBar() {
  return (
    <ul className="numbers-bar">
      {PILLARS.map(({ key, rest }) => (
        <li key={key} className="num-card">
          <span className="label">
            <span className="label-key">{key}</span>
            {rest && <> {rest}</>}
          </span>
        </li>
      ))}
    </ul>
  );
}
