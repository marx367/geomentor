// Búsqueda en los apuntes: arma palabras clave del subtema (con sinónimos), corta los apuntes en trozos
// y elige los más relevantes hasta llenar el presupuesto de caracteres. Los apuntes asignados al tema van primero.
// Apuntes.last guarda qué archivos se usaron en la última búsqueda (para las etiquetas de fuente).
import { norm } from '../nucleo/utilidades.js';
import { STOP, SINONIMOS } from '../datos/sinonimos.js';
import { S, key } from '../estado/estado.js';

export const stem = w => w.length > 6 ? w.slice(0, -2) : w;
export function keywords() {
  const txt = norm([S.eje?.nombre, S.eje?.desc, S.sub?.nombre, S.sub?.desc].join(' '));
  const words = txt.split(/[^a-z0-9]+/).filter(w => w.length >= 4 && !STOP.has(w));
  const terms = new Map(words.map(w => [stem(w), 1]));
  for (const grupo of SINONIMOS) {
    if (grupo.some(t => txt.includes(t) || words.some(w => t.startsWith(stem(w)) && stem(w).length >= 5))) {
      for (const t of grupo) terms.set(t, t.includes(' ') ? 3 : 2);
    }
  }
  return [...terms].map(([t, w]) => ({ t, w }));
}
// Estado del archivo respecto del subtema actual: asignado a él, asignado a otro tema o libre.
export function scopeState(name) {
  if (S.sub?.archivos?.includes(name)) return 'asignado';
  const sc = (S.config.asignacion || {})[name] || '';
  if (!sc) return 'libre';
  const k = key() || '';
  return (k === sc || k.startsWith(sc + '/')) ? 'asignado' : 'otro';
}
export function chunksOf(name, text) {
  const out = [];
  const push = t => { if (t.trim()) out.push({ file: name, p: t }); };
  for (const para of String(text).split(/\n\s*\n/)) {
    if (para.length <= 1500) { push(para); continue; }
    let buf = '';
    for (let line of para.split('\n')) {
      while (line.length > 1500) { push(buf); buf = ''; push(line.slice(0, 1200)); line = line.slice(1200); }
      if (buf && buf.length + line.length > 1200) { push(buf); buf = ''; }
      buf += (buf ? '\n' : '') + line;
    }
    push(buf);
  }
  return out;
}
export const Apuntes = { last: { files: [], total: 0 }, excluir: new Set() };
export function apuntesRelevantes(budget) {
  const files = Object.entries(S.config.apuntes || {});
  const elegibles = files.filter(([n]) => scopeState(n) !== 'otro' && !Apuntes.excluir.has(n));
  Apuntes.last = { files: [], total: files.length };
  if (!elegibles.length || budget <= 0) return '';
  const kw = keywords();
  const chunks = elegibles.flatMap(([n, t]) => chunksOf(n, t)).map((c, i) => {
    const np = norm(c.p);
    let score = kw.reduce((acc, { t, w }) => acc + w * (np.split(t).length - 1), 0);
    if (scopeState(c.file) === 'asignado') score += 1000;
    return { ...c, i, score };
  });
  const chosen = [];
  let used = 0;
  for (const it of [...chunks].sort((a, b) => b.score - a.score || a.i - b.i)) {
    if (used + it.p.length + 2 > budget) continue;
    chosen.push(it); used += it.p.length + 2;
  }
  chosen.sort((a, b) => a.i - b.i);
  Apuntes.last = { files: [...new Set(chosen.map(c => c.file))], total: files.length };
  let out = '', cur = null;
  for (const c of chosen) {
    if (c.file !== cur) { out += `${out ? '\n\n' : ''}=== ${c.file}${scopeState(c.file) === 'asignado' ? ' (asignado por el estudiante a este tema)' : ''} ===\n`; cur = c.file; }
    else out += '\n\n';
    out += c.p;
  }
  return out;
}
