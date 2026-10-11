// Etiqueta de transparencia: indica qué apuntes se usaron en una respuesta, o que no se usó ninguno.
import { escapeHTML } from '../nucleo/utilidades.js';

export function fuentesHTML(f) {
  if (!f || !f.total) return '';
  return `<p class="fuentes">${f.files.length ? `📚 Basado en tus apuntes: ${f.files.map(escapeHTML).join(', ')}` : '📚 Ningún apunte cargado corresponde a este tema: respuesta con conocimiento general.'}</p>`;
}
