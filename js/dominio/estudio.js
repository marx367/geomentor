// Etapa de estudio de un tema: se deriva de su fecha de clase y sus intentos, nunca se asigna a mano.
import { esFecha, diasEntre } from './fechas.js';

/** @typedef {import('./tipos.js').Etapa} Etapa */

export const ETAPAS = ['captura', 'reconstruccion', 'practica', 'recuperacion', 'simulacion'];
export const UMBRALES = { comprension: 0.7, practica: 0.8 };

// Días después de la clase a partir de los cuales un intento aprobado cuenta como recuperación.
const DIAS_RECUPERACION = 3;

/** Intento con datos usables: fecha real y 0 <= aciertos <= total, con total > 0. */
export const esIntentoValido = i => !!i && esFecha(i.fecha) && Number.isFinite(i.total) && i.total > 0
  && Number.isFinite(i.aciertos) && i.aciertos >= 0 && i.aciertos <= i.total;

/** Los chequeos miden comprensión; drills, construcciones y exámenes, práctica. */
export function aprobado(intento) {
  if (!esIntentoValido(intento)) return false;
  const umbral = intento.tipo === 'chequeo' ? UMBRALES.comprension : UMBRALES.practica;
  return intento.aciertos / intento.total >= umbral;
}

/** Intentos válidos hasta hoy (incluido), ordenados del más viejo al más nuevo. */
export function intentosHasta(tema, hoy) {
  const lista = Array.isArray(tema?.intentos) ? tema.intentos : [];
  return lista
    .filter(i => esIntentoValido(i) && (!esFecha(hoy) || i.fecha <= hoy))
    .sort((a, b) => (a.fecha < b.fecha ? -1 : a.fecha > b.fecha ? 1 : 0));
}

/** @returns {Etapa} */
export function etapaDe(tema, hoy) {
  if (!esFecha(tema?.fechaClase)) return 'captura';
  const aprobados = intentosHasta(tema, hoy).filter(aprobado);
  if (!aprobados.some(i => i.tipo === 'chequeo')) return 'reconstruccion';
  if (!aprobados.some(i => i.tipo === 'drill' || i.tipo === 'construccion')) return 'practica';
  if (!aprobados.some(i => diasEntre(tema.fechaClase, i.fecha) >= DIAS_RECUPERACION)) return 'recuperacion';
  return 'simulacion';
}

/** @returns {Etapa|null} null si es la última o no existe. */
export function proximaEtapa(etapa) {
  const i = ETAPAS.indexOf(etapa);
  return i < 0 || i === ETAPAS.length - 1 ? null : ETAPAS[i + 1];
}
