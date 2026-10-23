// Hojas de errores: lo editado de las secciones 1 y 2 ("Qué tengo que recordar" y "Cómo encarar"),
// por subtema, en el documento 'hojas' → S.hojas = { 'materia/eje/subtema': { recordar, encarar, fecha } }.
// Las secciones 3 y 4 no se guardan: se recalculan con los puntos débiles cada vez que se abre la hoja.
import { S } from './estado.js';
import { Store } from './almacen.js';

export const MAX_EDITADO = 2000; // caracteres por sección (lo mismo que permite el textarea)
const texto = x => typeof x === 'string' ? x.slice(0, MAX_EDITADO) : '';

// Lo guardado puede venir de otra versión o dañado: solo se aceptan objetos con textos.
function normalizarHojas(doc) {
  const hojas = {};
  if (!doc || typeof doc !== 'object') return hojas;
  for (const [k, h] of Object.entries(doc)) {
    if (h && typeof h === 'object') hojas[k] = { recordar: texto(h.recordar), encarar: texto(h.encarar), fecha: texto(h.fecha) };
  }
  return hojas;
}
export function cargarHojas(doc) { S.hojas = normalizarHojas(doc); }

export const hojaDe = k => S.hojas[k] || { recordar: '', encarar: '', fecha: '' };

// Primero guarda y recién después cambia la memoria: si falla, todo queda como estaba. Devuelve true o false.
// Antes de escribir vuelve a leer el documento: si al arrancar la lectura falló, S.hojas está vacío y
// escribirlo tal cual borraría las hojas de los otros subtemas. Lo que está en memoria gana (es lo más nuevo);
// lo leído solo completa lo que falta. Si las dos lecturas fallan no hay forma de saberlo: Store no avisa.
// Mismo tope que el resto de los documentos.
async function escribirHoja(k, { recordar, encarar }) {
  const guardadas = normalizarHojas(await Store.getDoc('hojas', null));
  const hojas = { ...guardadas, ...S.hojas, [k]: { recordar: texto(recordar), encarar: texto(encarar), fecha: new Date().toISOString() } };
  if (JSON.stringify(hojas).length >= 240000) return false;
  if (!await Store.setDoc('hojas', hojas)) return false;
  S.hojas = hojas;
  return true;
}
// De a una escritura por vez: si dos se pisaran (la IA termina mientras se guarda otra hoja), la segunda
// partiría de una copia vieja y borraría lo de la primera.
let cola = Promise.resolve();
export function guardarHoja(k, hoja) {
  const r = cola.then(() => escribirHoja(k, hoja)).catch(() => false);
  cola = r;
  return r;
}
