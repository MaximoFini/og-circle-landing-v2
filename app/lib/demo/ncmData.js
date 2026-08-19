// ─────────────────────────────────────────────────────────────────────────
// BASE DE DATOS NCM/SIM (tablas oficiales Malvina/AFIP) — VEGROUP
//
// Port de src/data/ncm.js del repo emilianoverabusiness-blip/vegroup (commit
// 5bbca48). `ncm.json` contiene ~10.500 posiciones NCM de 8 dígitos, cada una
// con sus sufijos SIM (~33.000 en total) y alícuotas vigentes:
//
//   { ncm: "8518.30.00", descripcion: "…", suf: [
//       [sufijo, desc, die, te, iva, ivaAd, lic, antidumping, impInternos]
//   ] }
//
// ⚠️ SOLO SERVIDOR. Son 4,3 MB: si esto entra en un bundle de cliente, la
// landing pasa a pesar más que todo el resto junta. Importalo únicamente
// desde route handlers de app/api/demo/**, nunca desde un 'use client'.
//
// Diferencia con el original: allá era `await import('./ncm.json')` para que
// Vite lo mandara a un chunk aparte del browser. Acá el import estático es
// mejor: el JSON queda resuelto en el bundle del server y no hay un await de
// I/O en el camino caliente del lambda.
// ─────────────────────────────────────────────────────────────────────────
import raw from './ncm.json'

let _headings = null // [{ncm, descripcion, suf:[{...}]}]
let _bySim = null // Map "8518.30.00.100U" → registro plano

/**
 * Carga (una sola vez) la base completa. Sigue siendo async para que
 * ncmSearch.js quede idéntico al original.
 */
export async function loadBase() {
  if (_headings) return _headings
  _headings = raw.map((h) => ({
    ncm: h.ncm,
    descripcion: h.descripcion,
    suf: h.suf.map((t) => tupleToRecord(h, t)),
  }))
  _bySim = new Map()
  for (const h of _headings) {
    for (const s of h.suf) _bySim.set(s.sim, s)
  }
  return _headings
}

function tupleToRecord(h, [suf, desc, die, te, iva, ivaAd, lic, ad, impInternos]) {
  return {
    sim: `${h.ncm}.${suf}`, // posición SIM completa (la que usa el despachante)
    ncm: h.ncm,
    sufijo: suf,
    descripcion: desc ? `${desc}. ${h.descripcion}` : h.descripcion,
    descripcionSufijo: desc,
    die,
    te,
    iva,
    ivaAd,
    lic,
    antidumping: ad && ad !== '0' ? ad : '',
    impInternos,
  }
}

/**
 * Busca un registro por código: acepta posición SIM completa
 * ("8518.30.00.100U") o NCM de 8 dígitos ("8518.30.00", devuelve su primer
 * sufijo). Requiere que la base ya esté cargada (loadBase()).
 */
export function getNcm(code) {
  if (!_bySim) return null
  const c = String(code).trim()
  const exact = _bySim.get(c)
  if (exact) return exact
  const h = _headings.find((x) => x.ncm === c)
  return h ? h.suf[0] : null
}

/** Etiquetas conocidas de códigos de intervención/licencia de importación. */
export const LIC_LABELS = {
  CS: 'Certificación de seguridad de producto (seguridad eléctrica)',
  AO: 'Intervención ANMAT (salud / cosmética / alimentos)',
  E: 'Requisito de etiquetado / intervención textil',
  O: 'Intervención de organismo (SENASA u otro)',
}

export function licLabel(code) {
  if (!code) return ''
  return LIC_LABELS[code] || `Intervención aduanera código "${code}"`
}
