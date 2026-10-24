// Mi curso: materias, ejes y subtemas que arma el estudiante clase a clase.
// Se guarda en el documento 'curso' del almacén. La clave de cada subtema sigue siendo
// materia/eje/subtema (ver key() en estado.js), así progreso y puntos débiles funcionan igual.
import { slug, limpiarTexto, esFechaValida, today } from '../nucleo/utilidades.js';
import { COLORES_MATERIAS, COLORES_ANTERIORES } from '../datos/colores-materias.js';
import { S } from './estado.js';
import { Store } from './almacen.js';

// Devuelve un id que no esté en "usados" (si ya existe, le suma -2, -3…).
export function idUnico(base, usados) {
  const raiz = slug(base);
  let id = raiz, n = 2;
  while (usados.has(id)) id = `${raiz}-${n++}`;
  return id;
}

// Lo guardado puede venir incompleto o de otra versión: se valida pieza por pieza.
const lista = x => Array.isArray(x) ? x : [];
// Un emoji puede ocupar varios caracteres (👩‍🏫 son 5): 8 alcanzan y cortan cualquier texto largo.
const icono = (x, defecto) => limpiarTexto(x, 8) || defecto;
function normalizarSubtema(sb) {
  return {
    id: String(sb.id || slug(sb.nombre)), nombre: limpiarTexto(sb.nombre) || 'Tema sin nombre', desc: limpiarTexto(sb.desc, 300),
    fecha: esFechaValida(sb.fecha) ? sb.fecha : today(),
    archivos: lista(sb.archivos).map(String),
    // Capítulos de la biblioteca de donde salió el tema (ver profesor.js).
    fuentes: lista(sb.fuentes).filter(f => typeof f?.libroId === 'string' && typeof f?.capId === 'string').map(f => ({ libroId: f.libroId, capId: f.capId }))
  };
}
function normalizarEje(e) {
  return { id: String(e.id || slug(e.nombre)), nombre: limpiarTexto(e.nombre, 80) || 'Eje sin nombre', icono: icono(e.icono, '📚'), desc: limpiarTexto(e.desc, 300), creado: e.creado || today(), subtemas: lista(e.subtemas).map(normalizarSubtema) };
}
// Color guardado de la materia. Si es de la paleta anterior al rediseño, se cambia por el nuevo de la misma posición.
function colorMateria(acc, porDefecto) {
  if (lista(acc).length !== 2) return porDefecto;
  const viejo = COLORES_ANTERIORES.indexOf(String(acc[0]).toLowerCase());
  return viejo >= 0 ? COLORES_MATERIAS[viejo].acc : acc;
}
function normalizarMateria(m, i) {
  const color = COLORES_MATERIAS[i % COLORES_MATERIAS.length];
  return {
    id: String(m.id || slug(m.nombre)), nombre: limpiarTexto(m.nombre, 80) || 'Materia sin nombre', icono: icono(m.icono, color.icono), desc: limpiarTexto(m.desc, 300),
    acc: colorMateria(m.acc, color.acc), creada: m.creada || today(), ejes: lista(m.ejes).map(normalizarEje)
  };
}
export function cargarCurso(doc) {
  S.curso = { materias: lista(doc?.materias).map(normalizarMateria) };
}
export function guardarCurso() { return Store.setDoc('curso', S.curso); }

export const buscarMateria = id => S.curso.materias.find(m => m.id === id) || null;
export const buscarEje = (m, id) => m?.ejes.find(e => e.id === id) || null;
// Subtemas del más viejo al más nuevo: el orden en que se dieron en clase.
export const subtemasPorFecha = e => [...e.subtemas].sort((a, b) => a.fecha.localeCompare(b.fecha));
export const contarSubtemas = m => m.ejes.reduce((a, e) => a + e.subtemas.length, 0);

export function crearMateria(nombre) {
  const usados = new Set(S.curso.materias.map(m => m.id));
  const m = normalizarMateria({ id: idUnico(nombre, usados), nombre, desc: '' }, S.curso.materias.length);
  S.curso.materias.push(m);
  return m;
}
export function crearEje(m, { nombre, icono, desc }) {
  const e = normalizarEje({ id: idUnico(nombre, new Set(m.ejes.map(x => x.id))), nombre, icono, desc });
  m.ejes.push(e);
  return e;
}
export function agregarSubtema(e, { nombre, desc, fecha, archivos, fuentes }) {
  const sb = normalizarSubtema({ id: idUnico(nombre, new Set(e.subtemas.map(x => x.id))), nombre, desc, fecha, archivos, fuentes });
  e.subtemas.push(sb);
  return sb;
}
