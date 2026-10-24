// Bibliografía del tema: los capítulos de la biblioteca asociados al subtema abierto (S.sub.fuentes).
// Elige los párrafos más relevantes hasta llenar el presupuesto, igual que con los apuntes,
// y anota en Biblio.last qué capítulos se usaron (para la línea «📖 Bibliografía consultada»).
import { norm } from '../nucleo/utilidades.js';
import { S } from '../estado/estado.js';
import { capitulo } from '../estado/profesor.js';
import { keywords, chunksOf } from './busqueda-apuntes.js';

export const Biblio = { last: [] };

// Nombre que ve la IA (en los encabezados «=== ... ===») y el estudiante (en la línea de fuentes).
export const etiquetaCapitulo = ({ libro, cap }) => `${libro.titulo}${libro.autor ? ` (${libro.autor})` : ''} · ${cap.titulo}`;

// Capítulos que el estudiante asoció a este subtema. Los que se borraron de la biblioteca se ignoran.
export function capitulosDelTema() {
  return (S.sub?.fuentes || []).map(f => capitulo(f.libroId, f.capId)).filter(Boolean);
}

export function bibliografiaRelevante(budget) {
  Biblio.last = [];
  const caps = capitulosDelTema();
  if (!caps.length || budget <= 0) return '';
  const kw = keywords();
  // Cada capítulo se parte en párrafos y se puntúa por las palabras clave del subtema.
  const chunks = caps.flatMap(c => chunksOf(etiquetaCapitulo(c), c.cap.texto)).map((c, i) => {
    const np = norm(c.p);
    return { ...c, i, score: kw.reduce((acc, { t, w }) => acc + w * (np.split(t).length - 1), 0) };
  });
  const elegidos = [];
  let usado = 0;
  for (const it of [...chunks].sort((a, b) => b.score - a.score || a.i - b.i)) {
    if (usado + it.p.length + 2 > budget) continue;
    elegidos.push(it); usado += it.p.length + 2;
  }
  elegidos.sort((a, b) => a.i - b.i); // vuelven al orden del libro para que se lean de corrido
  Biblio.last = [...new Set(elegidos.map(c => c.file))];
  let out = '', actual = null;
  for (const c of elegidos) {
    if (c.file !== actual) { out += `${out ? '\n\n' : ''}=== ${c.file} ===\n`; actual = c.file; }
    else out += '\n\n';
    out += c.p;
  }
  return out;
}
