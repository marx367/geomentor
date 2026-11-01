// Intentos por subtema (chequeos, drills, construcciones, exámenes) en el documento 'intentos'
// → S.intentos = { 'materia/eje/subtema': Intento[] } (formato en js/dominio/tipos.js). Solo se agregan: nunca se editan ni se borran.
import { S } from './estado.js';
import { Store } from './almacen.js';
import { esFecha } from '../dominio/fechas.js';
import { esIntentoValido } from '../dominio/estudio.js';
import { buscarPorClave } from '../dominio/adaptadores.js';

const TIPOS = ['chequeo', 'drill', 'construccion', 'examen'];
const TOPE = 240000; // mismo tope que el resto de los documentos

// Copia solo los campos conocidos; null si el intento no es válido para el dominio.
function limpiar(i) {
  if (!esIntentoValido(i) || !TIPOS.includes(i.tipo)) return null;
  const limpio = { fecha: i.fecha, tipo: i.tipo, aciertos: i.aciertos, total: i.total };
  if (Array.isArray(i.errores)) limpio.errores = i.errores.filter(e => typeof e === 'string').slice(0, 20);
  return limpio;
}

// Lo guardado puede venir de otra versión o dañado: se queda solo lo válido.
function normalizar(doc) {
  const intentos = {};
  if (!doc || typeof doc !== 'object') return intentos;
  for (const [k, l] of Object.entries(doc)) if (Array.isArray(l)) intentos[k] = l.map(limpiar).filter(Boolean);
  return intentos;
}

// Las dos copias (memoria y lo guardado) solo crecen: por clave, la más larga es la más completa.
// Así no se pierde nada si falló la lectura del arranque o la de ahora.
function unir(a, b) {
  const r = { ...a };
  for (const [k, l] of Object.entries(b)) if (!r[k] || l.length > r[k].length) r[k] = l;
  return r;
}

// Relee, suma lo que devuelve `nuevos(todos)` y guarda; recién después cambia la memoria (como hojas.js).
// false si no entra en el tope o no se pudo guardar: la memoria queda como estaba.
async function escribir(nuevos) {
  const todos = unir(normalizar(await Store.getDoc('intentos', null)), S.intentos);
  const suma = nuevos(todos);
  if (!suma) return true;
  for (const [k, l] of Object.entries(suma)) todos[k] = [...(todos[k] || []), ...l];
  if (JSON.stringify(todos).length >= TOPE) return false;
  if (!await Store.setDoc('intentos', todos)) return false;
  S.intentos = todos;
  return true;
}

// De a una escritura por vez: si dos se pisaran, la segunda partiría de una copia vieja.
let cola = Promise.resolve();
function enCola(fn) {
  const r = cola.then(fn).catch(() => false);
  cola = r;
  return r;
}

export async function cargarIntentos() {
  S.intentos = normalizar(await Store.getDoc('intentos', {}));
}

export const intentosDe = clave => S.intentos[clave] || [];

/** Agrega un intento al subtema. true si se guardó. */
export async function appendIntento(clave, intento) {
  const limpio = limpiar(intento);
  if (typeof clave !== 'string' || !clave || !limpio) return false;
  return enCola(() => escribir(() => ({ [clave]: [limpio] })));
}

/**
 * Pasa la comprensión guardada en el progreso a un chequeo (aciertos = comprensión, total = 100), solo para los
 * subtemas de Mi curso que todavía no tienen ningún intento. Idempotente: la segunda vez no encuentra nada que sumar.
 * Fecha: la del progreso (es la del último chequeo); si no es válida, la de la clase. No inventa fechas.
 */
export async function backfillDesdeProgreso() {
  return enCola(() => escribir(todos => {
    const suma = {};
    for (const [k, p] of Object.entries(S.progreso.temas || {})) {
      if (p?.comprension === undefined || todos[k]?.length) continue;
      const f = buscarPorClave(S.curso, k);
      if (!f) continue; // progreso del catálogo viejo: no hay subtema
      const delProgreso = typeof p.fecha === 'string' ? p.fecha.slice(0, 10) : '';
      const fecha = esFecha(delProgreso) ? delProgreso : f.subtema.fecha;
      const intento = limpiar({ fecha, tipo: 'chequeo', aciertos: p.comprension, total: 100 });
      if (intento) suma[k] = [intento];
    }
    return Object.keys(suma).length ? suma : null;
  }));
}
