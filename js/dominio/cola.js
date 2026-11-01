// Cola del día: qué hacer hoy, con prioridad, minutos y motivo. Determinista y sin IA.
// Entrada: { temas, fechaExamen, hoy } · Salida: Accion[] (ver tipos.js), [] si está todo al día.
import { esFecha, diasEntre } from './fechas.js';
import { etapaDe, intentosHasta } from './estudio.js';
import { vencimientos, modoExpress, diasHastaExamen } from './repaso.js';

/** @typedef {import('./tipos.js').Accion} Accion */

export const MINUTOS = { reconstruir: 30, practicar: 25, repasar: 12, 'cerrar-hoja': 5, integrar: 30 };

const MINUTOS_EXPRESS = 25;
const ERROR_MAXIMO = 0.4;        // P2: más error que esto en los últimos intentos de un tipo
const TOTAL_MINIMO = 5;          // P2: preguntas mínimas para que el porcentaje signifique algo
const ULTIMOS_INTENTOS = 3;
const DIAS_SEMANA = 7;           // P3: actividad = intentos de los últimos 7 días, hoy incluido
const DIAS_SIN_PRACTICA = 14;    // P4
const DE_REPASO = new Set(['repasar', 'integrar']);
const NOMBRE_TIPO = { chequeo: 'chequeos', drill: 'drills', construccion: 'construcciones', examen: 'exámenes' };
const TIPOS_PRACTICA = ['drill', 'construccion'];

const titulo = tema => `«${String(tema.nombre ?? '').trim() || 'Tema sin nombre'}»`;

// `atraso` (días) solo sirve para ordenar dentro de la misma prioridad; se quita antes de devolver.
function candidato(tema, prioridad, tipo, minutos, detalle, atraso = 0) {
  return { tipo, temaId: tema.id, minutos, motivo: `${titulo(tema)} · ${detalle}`, prioridad, atraso };
}

// El tipo con más error en sus últimos 3 intentos, si supera el 40% ({ tipo, error } o null).
function peorError(intentos, tipos = Object.keys(NOMBRE_TIPO)) {
  let peor = null;
  for (const tipo of tipos) {
    const ultimos = intentos.filter(i => i.tipo === tipo).slice(-ULTIMOS_INTENTOS);
    const total = ultimos.reduce((s, i) => s + i.total, 0);
    if (total < TOTAL_MINIMO) continue;
    const error = 1 - ultimos.reduce((s, i) => s + i.aciertos, 0) / total;
    if (error > ERROR_MAXIMO && (!peor || error > peor.error)) peor = { tipo, error };
  }
  return peor;
}

const textoError = ({ tipo, error }) => `${Math.round(error * 100)}% de error en ${NOMBRE_TIPO[tipo]}`;

// P0 · etapa reconstrucción: sin chequeos o con todos fallados. En modo express, integración corta.
function accionReconstruir(tema, hoy, examen) {
  const dias = diasEntre(tema.fechaClase, hoy);
  if (dias < 0) return null;
  if (modoExpress(tema, hoy, examen)) {
    const quedan = diasHastaExamen(hoy, examen);
    const texto = quedan === 1 ? 'queda 1 día' : `quedan ${quedan} días`;
    return candidato(tema, 0, 'integrar', MINUTOS_EXPRESS, `express (${texto})`, -dias);
  }
  const detalle = dias === 0 ? 'clase de hoy, sin reconstruir' : dias === 1 ? 'sin reconstruir desde ayer' : 'reconstrucción pendiente';
  // Atraso negativo: en reconstrucción va primero la clase más nueva (la de hoy es la que hay que cerrar hoy).
  return candidato(tema, 0, 'reconstruir', MINUTOS.reconstruir, detalle, -dias);
}

// P1 · etapa práctica: ninguna práctica aprobada todavía. Si los drills o construcciones vienen
// con mucho error, el motivo lo dice (en esta etapa P2 no corre aparte).
function accionPrimeraPractica(tema, intentos) {
  const peor = peorError(intentos, TIPOS_PRACTICA);
  const detalle = peor ? `primera práctica · ${textoError(peor)}` : 'primera práctica';
  return candidato(tema, 1, 'practicar', MINUTOS.practicar, detalle);
}

// P1: repasos D3/D7/D14 vencidos y no hechos. Si hay varios, uno solo: el más avanzado los cubre.
function accionRepaso(tema, hoy) {
  const pendientes = vencimientos(tema, hoy).filter(v => DE_REPASO.has(v.tipo) && v.vence && !v.hecho);
  if (!pendientes.length) return null;
  const masAvanzado = pendientes[pendientes.length - 1];
  const detalle = `${masAvanzado.tipo === 'integrar' ? 'integración' : 'repaso'} a ${masAvanzado.dia} días`;
  return candidato(tema, 1, masAvanzado.tipo, MINUTOS[masAvanzado.tipo], detalle, pendientes[0].diasVencido);
}

// P2: más de 40% de error en los últimos 3 intentos de algún tipo.
function accionPractica(tema, intentos) {
  const peor = peorError(intentos);
  return peor && candidato(tema, 2, 'practicar', MINUTOS.practicar, textoError(peor));
}

// P3: hoja sin cerrar del tema con más intentos esta semana (desempate: el intento más reciente).
function accionHoja(temas, hoy, intentosDe) {
  let elegido = null;
  for (const tema of temas) {
    if (tema.hoja?.estado === 'hecha') continue;
    const semana = intentosDe.get(tema).filter(i => diasEntre(i.fecha, hoy) < DIAS_SEMANA);
    if (!semana.length) continue;
    const actual = { tema, cantidad: semana.length, ultima: semana[semana.length - 1].fecha };
    const supera = !elegido || actual.cantidad > elegido.cantidad
      || (actual.cantidad === elegido.cantidad && actual.ultima > elegido.ultima);
    if (supera) elegido = actual;
  }
  const minutos = MINUTOS['cerrar-hoja'];
  return elegido && candidato(elegido.tema, 3, 'cerrar-hoja', minutos, `cerrar hoja (${minutos} min)`);
}

// P4: tema sin intentos (o sin tocar desde la clase) hace 14 días o más.
function accionOlvidado(tema, hoy, intentos) {
  const ultima = intentos.length ? intentos[intentos.length - 1].fecha : tema.fechaClase;
  const dias = diasEntre(ultima, hoy);
  if (dias < DIAS_SIN_PRACTICA) return null;
  return candidato(tema, 4, 'integrar', MINUTOS.integrar, `sin practicar hace ${dias} días`, dias);
}

const ordenar = (a, b) => a.prioridad - b.prioridad || b.atraso - a.atraso
  || (a.temaId < b.temaId ? -1 : a.temaId > b.temaId ? 1 : 0);

// Un tema puede tener dos acciones solo si son la de reconstruir (P0) y cerrar su hoja.
const combinan = (a, b) => (a.prioridad === 0 && b.tipo === 'cerrar-hoja') || (b.prioridad === 0 && a.tipo === 'cerrar-hoja');

function elegir(candidatos, max, maxRepasos) {
  const elegidas = [];
  let repasos = 0;
  for (const c of candidatos.sort(ordenar)) {
    if (elegidas.length >= max) break;
    if (DE_REPASO.has(c.tipo) && repasos >= maxRepasos) continue;
    if (elegidas.some(e => e.temaId === c.temaId && !combinan(e, c))) continue;
    elegidas.push(c);
    if (DE_REPASO.has(c.tipo)) repasos++;
  }
  return elegidas.map(({ atraso, ...accion }) => accion);
}

/** @returns {Accion[]} */
export function colaDeHoy({ temas, fechaExamen, hoy } = {}, { max = 3, maxRepasos = 2 } = {}) {
  if (!esFecha(hoy) || !Array.isArray(temas)) return [];
  const activos = temas.filter(t => t && typeof t.id === 'string' && t.id && etapaDe(t, hoy) !== 'captura');
  const intentosDe = new Map(activos.map(t => [t, intentosHasta(t, hoy)]));
  // La etapa decide qué acción corresponde; los vencimientos solo dicen cuándo y con qué motivo.
  const candidatos = activos.flatMap(t => {
    const etapa = etapaDe(t, hoy);
    const intentos = intentosDe.get(t);
    if (etapa === 'reconstruccion') return [accionReconstruir(t, hoy, fechaExamen)];
    if (etapa === 'practica') return [accionPrimeraPractica(t, intentos)];
    return [accionRepaso(t, hoy), accionPractica(t, intentos), accionOlvidado(t, hoy, intentos)];
  });
  candidatos.push(accionHoja(activos, hoy, intentosDe));
  return elegir(candidatos.filter(Boolean), max, maxRepasos);
}
