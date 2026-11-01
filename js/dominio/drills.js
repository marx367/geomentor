// Drills: práctica rápida de opción múltiple con corrección local (sin IA ni red). Puro y determinista:
// misma semilla y método dan los mismos ítems en el mismo orden. Banco de preguntas en drills-banco.js.
import { BANCO, mezclar } from './drills-banco.js';

/** @typedef {{ id:string, tipo:string, pregunta:string, opciones:{v:string, texto:string}[], respuesta:string }} Item */

export const METODOS = Object.keys(BANCO);

// RNG mulberry32: números en [0, 1) a partir de una semilla entera.
function mulberry32(semilla) {
  let a = semilla | 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Recorre los generadores del método en un orden mezclado y descarta las preguntas repetidas
 * (las de enunciado fijo salen una sola vez). [] si el método no existe.
 * @returns {Item[]}
 */
export function generarDrill({ metodo, semilla = 1, cantidad = 10 } = {}) {
  const generadores = BANCO[metodo];
  if (!generadores || !Number.isInteger(cantidad) || cantidad < 1) return [];
  const rng = mulberry32(Number.isFinite(semilla) ? semilla : 1);
  const orden = mezclar(rng, generadores);
  const items = [], vistas = new Set();
  // Tope de vueltas: si el banco no alcanzara para tantas preguntas distintas, devuelve las que haya.
  for (let vuelta = 0; items.length < cantidad && vuelta < cantidad * 20; vuelta++) {
    const item = orden[vuelta % orden.length](rng);
    if (vistas.has(item.pregunta)) continue;
    vistas.add(item.pregunta);
    items.push({ id: `i${items.length + 1}`, ...item });
  }
  return items;
}

/** respuestas: { [id]: v }. Una respuesta faltante cuenta como error. */
export function corregirDrill(items, respuestas = {}) {
  const detalle = (Array.isArray(items) ? items : []).map(item => {
    const dado = respuestas?.[item.id] ?? null;
    return { id: item.id, ok: dado === item.respuesta, esperado: item.respuesta, dado };
  });
  return { aciertos: detalle.filter(d => d.ok).length, total: detalle.length, detalle };
}
