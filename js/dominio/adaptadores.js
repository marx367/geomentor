// Puente entre los datos de la app (Mi curso, hojas, intentos) y los Tema del dominio. Puro: recibe y devuelve datos.
// Entrada: { curso, progreso, hojas, intentos } como están en memoria · Salida: Tema[] (ver tipos.js).
import { esFecha } from './fechas.js';
import { intentosHasta } from './estudio.js';

/** @typedef {import('./tipos.js').Tema} Tema */

const lista = x => (Array.isArray(x) ? x : []);
const tieneTexto = s => typeof s === 'string' && s.trim() !== '';

/** Clave de un subtema: la misma que usan progreso, hojas y puntos débiles ('materia/eje/subtema'). */
export const claveDe = (materiaId, ejeId, subId) => `${materiaId}/${ejeId}/${subId}`;

/** Recorre materia > eje > subtema y devuelve un elemento por subtema. */
export function aplanarCurso(curso) {
  return lista(curso?.materias).flatMap(materia =>
    lista(materia?.ejes).flatMap(eje => lista(eje?.subtemas).map(subtema => ({ materia, eje, subtema }))));
}

/** { materia, eje, subtema } de una clave, o null si no existe en el curso. */
export function buscarPorClave(curso, clave) {
  return aplanarCurso(curso).find(f => claveDe(f.materia.id, f.eje.id, f.subtema.id) === clave) || null;
}

// La hoja guarda la fecha con hora (ISO); para comparar con los intentos alcanza el día.
function estadoHoja(hoja, intentos, hoy) {
  if (!hoja) return 'vacia';
  const dia = typeof hoja.fecha === 'string' ? hoja.fecha.slice(0, 10) : '';
  const validos = intentosHasta({ intentos }, hoy);
  const ultimo = validos.length ? validos[validos.length - 1].fecha : null;
  if (esFecha(dia) && ultimo && dia < ultimo) return 'obsoleta';
  return tieneTexto(hoja.recordar) && tieneTexto(hoja.encarar) ? 'hecha' : 'vacia';
}

/**
 * Un Tema por subtema del curso. Los subtemas sin fecha válida se incluyen igual: el dominio los deja en captura.
 * El progreso no se lee: lo que tenía de comprensión ya pasó a intentos (ver estado/intentos.js).
 * @returns {Tema[]}
 */
export function temasDesdeEstado({ curso, hojas, intentos } = {}, hoy) {
  return aplanarCurso(curso).map(({ materia, eje, subtema }) => {
    const id = claveDe(materia.id, eje.id, subtema.id);
    const propios = lista(intentos?.[id]);
    return {
      id, nombre: subtema.nombre, fechaClase: subtema.fecha,
      intentos: propios, hoja: { estado: estadoHoja(hojas?.[id], propios, hoy) },
    };
  });
}
