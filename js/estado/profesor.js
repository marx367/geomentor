// Profesor y bibliografía: estilo del profesor (texto, respuestas del cuestionario y análisis de la IA),
// modo estricto y biblioteca de libros con sus capítulos. Van en documentos propios del almacén
// ('profesor' y 'biblioteca'): los libros pueden ser largos y no deben llenar 'config'.
import { limpiarTexto } from '../nucleo/utilidades.js';
import { S } from './estado.js';
import { Store } from './almacen.js';

export const MAX_ESTILO = 20000; // caracteres del estilo del profesor
const lista = x => Array.isArray(x) ? x : [];
const texto = (x, max) => String(x ?? '').slice(0, max);

// doc: lo guardado en 'profesor'. Si todavía no existe, se toman el estilo y el modo estricto
// que antes vivían en Config (config viejo).
export function cargarProfesor(doc, configViejo) {
  const d = doc || { estilo: configViejo?.estilo, estricto: configViejo?.estricto };
  const respuestas = {};
  for (const [k, v] of Object.entries(d.respuestas || {})) if (Number.isInteger(v)) respuestas[k] = v;
  S.profesor = { estilo: texto(d.estilo, MAX_ESTILO), respuestas, analisis: texto(d.analisis, 6000), estricto: !!d.estricto };
}
export function cargarBiblioteca(doc) {
  S.biblioteca = {
    libros: lista(doc?.libros).filter(l => l?.id).map(l => ({
      id: String(l.id), titulo: limpiarTexto(l.titulo, 150) || 'Libro sin título', autor: limpiarTexto(l.autor, 150),
      capitulos: lista(l.capitulos).filter(c => c?.id).map(c => ({ id: String(c.id), titulo: limpiarTexto(c.titulo, 150) || 'Capítulo', texto: String(c.texto || '') }))
    }))
  };
}
export const guardarProfesor = () => Store.setDoc('profesor', S.profesor);
export const guardarBiblioteca = () => Store.setDoc('biblioteca', S.biblioteca);

// Lo que recibe la IA como "estilo del profesor": lo que escribió el estudiante más el análisis del cuestionario.
export function textoEstilo() {
  const { estilo, analisis } = S.profesor;
  return [estilo.trim(), analisis.trim() && `Análisis del cuestionario sobre el profesor:\n${analisis.trim()}`].filter(Boolean).join('\n\n');
}

export const buscarLibro = id => S.biblioteca.libros.find(l => l.id === id) || null;
export function capitulo(libroId, capId) {
  const libro = buscarLibro(libroId);
  const cap = libro?.capitulos.find(c => c.id === capId);
  return cap ? { libro, cap } : null;
}
