// Puntos débiles: formato de cada ítem, migración del formato viejo y guardado.
// Ítem: { id, key, materiaId, ejeId, subId, materia, eje, subtema, fecha, origen, detalle, puntos: [{ texto, tipo }], superado }
// origen es un código (ORIGENES) y detalle el dato extra ("7/10", "Parcial"). superado: null o fecha ISO.
import { limpiarTexto } from '../nucleo/utilidades.js';
import { S } from './estado.js';
import { Store } from './almacen.js';
import { normalizarTipo, SIN_CLASIFICAR } from './tipos-error.js';

export const ORIGENES = { chequeo: 'Chequeo', examen: 'Examen', ejercicio: 'Ejercicio', repaso: 'Repaso' };
const RESPALDO = 'debiles-respaldo'; // copia de los datos tal como estaban antes de la primera migración

// Origen viejo (texto) → código + detalle. '' = origen desconocido (el texto queda en detalle).
function leerOrigen(origen, detalle) {
  const o = String(origen ?? '').trim();
  if (Object.hasOwn(ORIGENES, o)) return { origen: o, detalle: limpiarTexto(detalle, 80) };
  if (/^chequeo de comprensi/i.test(o)) return { origen: 'chequeo', detalle: '' };
  const examen = o.match(/^examen de práctica\s*\((.*)\)/i);
  if (examen) return { origen: 'examen', detalle: limpiarTexto(examen[1], 80) };
  return { origen: '', detalle: limpiarTexto(o || detalle, 80) };
}
const leerPunto = p => typeof p === 'string'
  ? { texto: limpiarTexto(p, 600), tipo: SIN_CLASIFICAR }
  : { texto: limpiarTexto(p?.texto, 600), tipo: normalizarTipo(p?.tipo) };

export function normalizarDebil(d) {
  return {
    ...d,
    ...leerOrigen(d.origen, d.detalle),
    puntos: (Array.isArray(d.puntos) ? d.puntos : []).map(leerPunto).filter(p => p.texto),
    superado: typeof d.superado === 'string' && !isNaN(Date.parse(d.superado)) ? d.superado : null
  };
}

// Viejo = guardado antes de este formato. Un ítem ya migrado da false: así la migración no se repite.
export function esFormatoViejo(d) {
  return !Array.isArray(d.puntos) || d.puntos.some(p => typeof p !== 'object' || p === null)
    || !(d.origen === '' || Object.hasOwn(ORIGENES, d.origen)) || !('detalle' in d) || !('superado' in d);
}

// El respaldo se hace una sola vez, con los datos originales. Si ya existe, no se toca.
async function respaldar(items) {
  if (await Store.getDoc(RESPALDO, null)) return true;
  if (JSON.stringify(items).length >= 240000) return false; // demasiado grande para un documento
  return Store.setDoc(RESPALDO, { fecha: new Date().toISOString(), items });
}

// Al arrancar: devuelve la lista en el formato nuevo. Reescribe en el almacén solo los ítems viejos,
// y solo si el respaldo quedó guardado; si no, usa la versión nueva en memoria y lo reintenta la próxima vez.
export async function migrarDebiles(lista) {
  const items = Array.isArray(lista) ? lista.filter(d => d && typeof d === 'object') : [];
  const nuevos = items.map(normalizarDebil);
  try {
    const viejos = items.map(esFormatoViejo);
    if (viejos.some(Boolean) && await respaldar(items)) {
      for (let i = 0; i < items.length; i++) if (viejos[i] && nuevos[i].id) await Store.updateDebil(nuevos[i].id, nuevos[i]);
    }
  } catch (e) { /* sin escribir: la app sigue con la versión en memoria */ }
  return nuevos;
}

// Guarda un ítem nuevo (normalizado) y lo suma al principio de la lista en memoria.
export async function guardarDebil(item) {
  const guardado = await Store.addDebil(normalizarDebil(item));
  S.debiles.unshift(guardado);
  return guardado;
}

// Los superados no se borran (quedan para contar frecuencias), pero no se muestran ni se cuentan como pendientes.
export const debilesActivos = () => S.debiles.filter(d => !d.superado);

// Marca el ítem como superado con la fecha de hoy. Devuelve false si no se pudo guardar (y no cambia nada).
export async function marcarSuperado(d) {
  const nuevo = { ...d, superado: new Date().toISOString() };
  if (!await Store.updateDebil(d.id, nuevo)) return false;
  d.superado = nuevo.superado;
  return true;
}

export const etiquetaOrigen = d => `${ORIGENES[d.origen] || 'Origen desconocido'}${d.detalle ? ` (${d.detalle})` : ''}`;
