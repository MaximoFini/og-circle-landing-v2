// COPIA LITERAL de src/lib/calc.js del repo emilianoverabusiness-blip/vegroup,
// commit 5bbca48, snapshot 2026-08-17. No editar acá: cualquier cambio se hace
// upstream y se vuelve a copiar, para poder verificar paridad al centavo.
// ─────────────────────────────────────────────────────────────────────────
// MOTOR DE CÁLCULO DE COSTO DE IMPORTACIÓN — VEGROUP
//
// Réplica EXACTA del cotizador madre COTIZADOR_VEGROUP.xlsx (hojas MIAMI /
// BARCELONA / CHINA). Cada línea de costo corresponde a una celda de esa
// planilla; si cambiás la operatoria, cambiá primero la planilla y después
// esto. Todos los valores en USD salvo el total en pesos (dólar BN).
// ─────────────────────────────────────────────────────────────────────────

export const ROUTES = [
  {
    id: 'miami',
    label: 'Miami',
    pais: 'EE.UU.',
    // EDITABLE: dirección real del depósito (se muestra en el selector).
    direccion: 'Miami, Florida, EE.UU.',
    freightPerKg: 7, // "Flete courier ($7/kg)"
    volRatePerKg: 5, // "Volumétrico (×$5)"
    handlingOrigenDefault: 5, // "HANDLING (GASTOS ORIGEN)" hoja MIAMI
    tiempoEstimado: '3-5 días',
    integral: { mayor: 48, menor: 53, vol: false }, // ≥10 kg: $48/kg, <10 kg: $53/kg — sin volumétrico
  },
  {
    id: 'barcelona',
    label: 'Barcelona',
    pais: 'España',
    direccion: 'Barcelona, España',
    freightPerKg: 10,
    volRatePerKg: 10,
    handlingOrigenDefault: 0,
    tiempoEstimado: '10 días',
    integral: { mayor: 55, menor: 60, vol: true }, // ≥10 kg: $55/kg, <10 kg: $60/kg — con volumétrico
  },
  {
    id: 'china',
    label: 'China',
    pais: 'Guangzhou',
    direccion: 'Guangzhou, China',
    freightPerKg: 14.5,
    volRatePerKg: 15,
    handlingOrigenDefault: 0,
    tiempoEstimado: '15 días',
    integral: { mayor: 55, menor: 60, vol: true }, // ≥10 kg: $55/kg, <10 kg: $60/kg — con volumétrico
  },
]

export const CONFIG = {
  // CIF = (FOB + peso × pesoFactor) × seguroFactor  — celda B15
  pesoFactor: 2.5,
  seguroFactor: 1.01,

  // Peso volumétrico: (L×W×H en cm) / 6000 por caja. El exceso sobre el peso
  // real se cobra a la tarifa volumétrica de cada ruta (B23).
  divisorVolumetrico: 6000,

  ivaServicios: 1.21, // los servicios locales llevan IVA 21% incluido
  tcaPorKgDia: 0.5, // "TCA (terminal cargo)" = peso × días × 0.5 × 1.21  — B18
  diasTcaDefault: 2, // "DÍAS TCA" — B10
  cargoFijo: 5, // "Cargo fijo" = 5 × 1.21 — B19
  comisionSeguroFobRate: 0.02, // "Comisión/seguro (2% FOB)" × 1.21 — B20
  handlingDestinoPorKg: 4, // "Handling destino" = peso × 4 × 1.21 — B21
  comisionVegroupPorKg: 5, // "COMISIÓN VEGROUP ($5/kg)" — B26
}

export const PEQUEÑOS_ENVIOS = {
  sim: '0000.04.56.000T',
  ncm: '0000.04.56',
  sufijo: '000T',
  descripcion: 'Envíos courier — Régimen simplificado de pequeños envíos (franquicia)',
  die: 0,
  te: 0,
  iva: 21,
  ivaAd: 0,
  lic: '',
  antidumping: false,
  impInternos: 0,
}

export const PE_LIMITS = { maxFob: 400, maxUnidades: 3 }

/**
 * @typedef {Object} Inputs
 * @property {number} fob        Valor FOB total (USD)
 * @property {number} pesoKg     Peso real bruto total (kg)
 * @property {number} cajas      Cantidad de cajas/bultos
 * @property {number} largo      Largo de la caja (cm)
 * @property {number} ancho      Ancho de la caja (cm)
 * @property {number} alto       Alto de la caja (cm)
 * @property {number} unidades   Cantidad total de unidades
 * @property {number} die        Derechos de importación (%) — de la base NCM
 * @property {number} te         Tasa de estadística (%) — de la base NCM
 * @property {number} [iva]      IVA (%) de la posición SIM (21 / 10,5 / 0)
 * @property {number} [dolarBN]  Cotización dólar Banco Nación (para total en pesos)
 * @property {number} [diasTca]  Días de terminal (default 2)
 * @property {number} [handlingOrigen] Gastos de origen (USD); si falta, default de la ruta
 */

/** Calcula el costo para UNA ruta — celda a celda como la planilla. */
export function calcRoute(inp, route, cfg = CONFIG) {
  const fob = num(inp.fob)
  const peso = num(inp.pesoKg)
  const cajas = Math.max(0, num(inp.cajas))
  const unidades = Math.max(1, num(inp.unidades) || 1)
  const diePct = num(inp.die) / 100
  const tePct = num(inp.te) / 100
  const ivaPct = (inp.iva != null && inp.iva !== '' ? num(inp.iva) : 21) / 100
  const diasTca = num(inp.diasTca) || cfg.diasTcaDefault
  const dolarBN = num(inp.dolarBN)

  // ── CIF (referencia / base imponible; NO se suma al total) — B15 ──────
  const cif = (fob + peso * cfg.pesoFactor) * cfg.seguroFactor

  // ── Volumen: exceso del peso volumétrico sobre el real ────────────────
  const volKgPorCaja =
    (num(inp.largo) * num(inp.ancho) * num(inp.alto)) / cfg.divisorVolumetrico
  const pesoVolumetrico = volKgPorCaja * cajas
  const volumen = Math.max(0, pesoVolumetrico - peso) // input "VOLUMEN" — B12

  // ── Costos no recuperables (B17–B26) ──────────────────────────────────
  const flete = route.freightPerKg * peso
  const tca = peso * diasTca * cfg.tcaPorKgDia * cfg.ivaServicios
  const cargoFijo = cfg.cargoFijo * cfg.ivaServicios
  const comisionSeguro = fob * cfg.comisionSeguroFobRate * cfg.ivaServicios
  const handlingDestino = peso * cfg.handlingDestinoPorKg * cfg.ivaServicios
  const handlingOrigen =
    inp.handlingOrigen != null && inp.handlingOrigen !== ''
      ? num(inp.handlingOrigen)
      : route.handlingOrigenDefault
  const volumetrico = volumen * route.volRatePerKg
  const derechos = cif * diePct
  const estadistica = cif * tePct
  const comisionVegroup = cfg.comisionVegroupPorKg * peso

  const gastosDestino = {
    flete,
    tca,
    cargoFijo,
    comisionSeguro,
    handlingDestino,
    handlingOrigen,
    volumetrico,
    derechos,
    estadistica,
    comisionVegroup,
  }
  const totalGastosDestino = sum(gastosDestino) // B17:B26 — lo que se paga en destino (VEGROUP)

  const noRecuperable = { fob, ...gastosDestino }
  const totalNoRecuperable = fob + totalGastosDestino // costo puesto acá

  // ── Recuperable (crédito fiscal) — B30 ────────────────────────────────
  const iva = (cif + derechos + estadistica) * ivaPct
  const recuperable = { iva }
  const totalRecuperable = iva

  // ── Totales (B32–B35) ─────────────────────────────────────────────────
  const totalUSD = totalNoRecuperable + iva
  const totalPesos = dolarBN > 0 ? totalUSD * dolarBN : null
  const costoPorKg = peso > 0 ? totalUSD / peso : 0
  const costoRealEfectivo = totalNoRecuperable // "COSTO REAL EFECTIVO (SIN IVA)"
  const costoPorUnidad = costoRealEfectivo / unidades

  return {
    route: route.id,
    label: route.label,
    pais: route.pais,
    freightPerKg: route.freightPerKg,
    tiempoEstimado: route.tiempoEstimado,
    cif,
    pesoVolumetrico,
    volumen,
    fob,
    gastosDestino,
    totalGastosDestino,
    noRecuperable,
    recuperable,
    totalNoRecuperable,
    totalRecuperable,
    totalUSD,
    totalPesos,
    costoPorKg,
    costoRealEfectivo,
    costoPorUnidad,
    unidades,
    // compat con la UI existente
    costoTotal: totalUSD,
  }
}

/** Calcula las 3 rutas y devuelve también la más conveniente. */
export function calcAllRoutes(inp, cfg = CONFIG) {
  const results = ROUTES.map((r) => calcRoute(inp, r, cfg))
  const mejor = results.reduce((a, b) =>
    b.costoRealEfectivo < a.costoRealEfectivo ? b : a,
  )
  return { results, mejorRuta: mejor.route }
}

// Etiquetas legibles para el desglose (mismos nombres que la planilla).
export const LABELS = {
  cif: 'Valor CIF (referencia)',
  fob: 'Valor FOB (mercadería)',
  flete: 'Flete courier',
  tca: 'TCA (terminal cargo)',
  cargoFijo: 'Cargo fijo',
  comisionSeguro: 'Comisión/seguro (2% FOB)',
  handlingDestino: 'Handling destino',
  handlingOrigen: 'Handling origen',
  volumetrico: 'Volumétrico',
  derechos: 'Derechos de importación',
  estadistica: 'Tasa de estadística',
  comisionVegroup: 'Gestión operativa ($5/kg)',
  iva: 'IVA (crédito fiscal)',
}

export const INTEGRAL_THRESHOLD = 10
export const INTEGRAL_VOL_RATE = 15

export function calcIntegral(inp, route) {
  const peso = num(inp.pesoKg)
  const cajas = Math.max(0, num(inp.cajas))
  const unidades = Math.max(1, num(inp.unidades) || 1)
  const dolarBN = num(inp.dolarBN)

  const volKgPorCaja =
    (num(inp.largo) * num(inp.ancho) * num(inp.alto)) / CONFIG.divisorVolumetrico
  const pesoVolumetrico = volKgPorCaja * cajas
  const excesoVol = route.integral.vol ? Math.max(0, pesoVolumetrico - peso) : 0

  const rate = peso >= INTEGRAL_THRESHOLD
    ? route.integral.mayor
    : route.integral.menor
  const base = peso * rate
  const volCost = excesoVol * INTEGRAL_VOL_RATE
  const totalUSD = base + volCost
  const totalPesos = dolarBN > 0 ? totalUSD * dolarBN : null

  return {
    route: route.id,
    label: route.label,
    pais: route.pais,
    tiempoEstimado: route.tiempoEstimado,
    pesoReal: peso,
    pesoVolumetrico,
    excesoVol,
    rate,
    base,
    volCost,
    totalUSD,
    totalPesos,
    costoPorKg: peso > 0 ? totalUSD / peso : 0,
    costoPorUnidad: totalUSD / unidades,
    unidades,
  }
}

export function calcAllIntegral(inp) {
  const results = ROUTES.map((r) => calcIntegral(inp, r))
  const mejor = results.reduce((a, b) => (b.totalUSD < a.totalUSD ? b : a))
  return { results, mejorRuta: mejor.route }
}

function num(v) {
  const n = typeof v === 'string' ? parseFloat(v.replace(',', '.')) : v
  return Number.isFinite(n) ? n : 0
}
function sum(obj) {
  return Object.values(obj).reduce((a, b) => a + b, 0)
}

export function fmtUSD(n) {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2,
  }).format(Number.isFinite(n) ? n : 0)
}

export function fmtARS(n) {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 0,
  }).format(Number.isFinite(n) ? n : 0)
}
