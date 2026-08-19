// Wrappers finos de las rutas /api/demo. La demo es publica y del mismo
// origen: no hay token ni sesion, la clave de IA vive solo en el servidor.
//
// Cada error propaga `status` y `motivo` porque la UI necesita distinguir
// 429 (cuota agotada) de 403 (falta el lead) de un 500 cualquiera; el texto
// del mensaje no alcanza para eso.

async function post(path, body) {
  let resp;
  try {
    resp = await fetch(path, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body ?? {}),
    });
  } catch {
    const err = new Error('No se pudo contactar al servidor. Revisá tu conexión.');
    err.status = 0;
    throw err;
  }

  let data = null;
  try {
    data = await resp.json();
  } catch {
    /* respuesta sin JSON */
  }

  if (!resp.ok) {
    const err = new Error(data?.error || `Error ${resp.status} al llamar a ${path}.`);
    err.status = resp.status;
    err.motivo = data?.motivo || '';
    err.data = data;
    throw err;
  }
  return data;
}

/** Identifica la posicion NCM del producto (busqueda + IA, todo server-side). */
export function identifyNCM(producto) {
  return post('/api/demo/identify', { producto });
}

/** Cotizacion del dolar BNA (billete venta). */
export function getDolar() {
  return post('/api/demo/dolar', {});
}

/** Contacto del visitante: desbloquea el analisis de marketing. */
export function submitLead(payload) {
  return post('/api/demo/lead', payload);
}

/** Analisis de comercializacion con IA (detras del lead). */
export function analyzeProduct(payload) {
  return post('/api/demo/analyze', payload);
}
