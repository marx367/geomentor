// "Errores más frecuentes": cuenta cuántas veces aparece cada tipo de error en los puntos débiles.
// Función pura, sin IA ni almacén: recibe la lista (por ejemplo S.debiles) y devuelve el conteo.
// Incluye los superados: sirven para ver qué errores se repiten aunque ya se hayan trabajado.

// key: 'materia/eje/subtema' para un solo subtema; null para todos.
// Devuelve [{ tipo, veces, ultimaFecha }] de más a menos veces (empate: el más reciente primero).
// ultimaFecha es ISO, o '' si ningún ítem de ese tipo tenía una fecha válida.
export function erroresFrecuentes(debiles, key = null) {
  const conteo = new Map();
  for (const d of Array.isArray(debiles) ? debiles : []) {
    if (key && d?.key !== key) continue;
    const ms = new Date(d?.fecha).getTime(); // la fecha puede venir como ISO o como número (datos viejos)
    for (const p of Array.isArray(d?.puntos) ? d.puntos : []) {
      if (!p?.tipo) continue;
      const c = conteo.get(p.tipo) || { tipo: p.tipo, veces: 0, ms: NaN };
      c.veces++;
      if (!isNaN(ms) && !(c.ms >= ms)) c.ms = ms;
      conteo.set(p.tipo, c);
    }
  }
  return [...conteo.values()]
    .sort((a, b) => b.veces - a.veces || (b.ms || 0) - (a.ms || 0))
    .map(({ tipo, veces, ms }) => ({ tipo, veces, ultimaFecha: isNaN(ms) ? '' : new Date(ms).toISOString() }));
}
