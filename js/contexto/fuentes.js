// Etiqueta de transparencia: indica qué apuntes y qué capítulos de libros se usaron en una respuesta,
// o que no se usó ningún apunte. Recibe Apuntes.last tal como quedó al armar el prompt.
import { escapeHTML } from '../nucleo/utilidades.js';

export function fuentesHTML(f) {
  if (!f) return '';
  const lineas = [];
  if (f.total) lineas.push(f.files.length ? `📚 Basado en tus apuntes: ${f.files.map(escapeHTML).join(', ')}` : '📚 Ningún apunte cargado corresponde a este tema: respuesta con conocimiento general.');
  if (f.libros?.length) lineas.push(`📖 Bibliografía consultada: ${f.libros.map(escapeHTML).join(', ')}`);
  return lineas.map(l => `<p class="fuentes">${l}</p>`).join('');
}
