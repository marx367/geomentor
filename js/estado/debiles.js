// Puntos débiles: formato de cada ítem, migración del formato viejo y guardado.
// Ítem: { id, key, materiaId, ejeId, subId, materia, eje, subtema, fecha, origen, detalle, puntos: [{ texto, tipo, descartado }], superado }
// origen es un código (ORIGENES) y detalle el dato extra ("7/10", "Parcial"). superado y descartado: null o fecha ISO.
import { limpiarTexto, norm } from '../nucleo/utilidades.js';
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
const MAX_PUNTO = 600;
const fechaONull = f => typeof f === 'string' && !isNaN(Date.parse(f)) ? f : null;
// Datos viejos sin descartado → null (vigente): no hace falta migrarlos.
const leerPunto = p => typeof p === 'string'
  ? { texto: limpiarTexto(p, MAX_PUNTO), tipo: SIN_CLASIFICAR, descartado: null }
  : { texto: limpiarTexto(p?.texto, MAX_PUNTO), tipo: normalizarTipo(p?.tipo), descartado: fechaONull(p?.descartado) };

export function normalizarDebil(d) {
  return {
    ...d,
    ...leerOrigen(d.origen, d.detalle),
    puntos: (Array.isArray(d.puntos) ? d.puntos : []).map(leerPunto).filter(p => p.texto),
    superado: fechaONull(d.superado)
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

// Puntos que cuentan y se muestran: los descartados quedan guardados pero no suman en nada.
export const puntosVigentes = d => (Array.isArray(d?.puntos) ? d.puntos : []).filter(p => !p?.descartado);

// Los superados no se borran (quedan para contar frecuencias), pero no se muestran ni se cuentan como pendientes.
// Un ítem con todos sus puntos descartados tampoco.
export const debilesActivos = () => S.debiles.filter(d => !d.superado && puntosVigentes(d).length);

// Clave de comparación de un punto débil: texto normalizado y recortado igual que al guardarlo.
export const claveTextoDebil = t => norm(limpiarTexto(t, MAX_PUNTO));

// Textos normalizados de los puntos vigentes ya guardados para un subtema (key). Se usan para no
// guardar dos veces el mismo punto: el panel marca como "ya guardado" los que coincidan con estos.
export const textosDebilesGuardados = k => new Set(
  S.debiles.filter(d => d.key === k).flatMap(d => puntosVigentes(d).map(p => claveTextoDebil(p.texto)))
);

// Marca el ítem como superado con la fecha de hoy. Devuelve false si no se pudo guardar (y no cambia nada).
export async function marcarSuperado(d) {
  const nuevo = { ...d, superado: new Date().toISOString() };
  if (!await Store.updateDebil(d.id, nuevo)) return false;
  d.superado = nuevo.superado;
  return true;
}

// Guarda el ítem con el punto i cambiado. i es el índice en d.puntos (todos, no solo los vigentes).
// Primero guarda y recién después cambia la memoria: si falla, todo queda como estaba.
async function guardarPunto(d, i, cambios) {
  const puntos = d.puntos.map((p, j) => j === i ? { ...p, ...cambios } : p);
  if (!await Store.updateDebil(d.id, { ...d, puntos })) return false;
  d.puntos = puntos;
  return true;
}

// Corrige texto y tipo de un punto. Devuelve 'vacio' si el texto queda vacío (no guarda), true o false.
export async function editarPunto(d, i, { texto, tipo }) {
  const limpio = limpiarTexto(texto, MAX_PUNTO);
  if (!limpio) return 'vacio';
  return guardarPunto(d, i, { texto: limpio, tipo: normalizarTipo(tipo) });
}

// Descarta un punto mal generado: queda guardado con la fecha, pero no cuenta en nada (no se borra).
export const descartarPunto = (d, i) => guardarPunto(d, i, { descartado: new Date().toISOString() });

export const etiquetaOrigen = d => `${ORIGENES[d.origen] || 'Origen desconocido'}${d.detalle ? ` (${d.detalle})` : ''}`;
