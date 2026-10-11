// Lee las etiquetas XML que devuelve la IA (<teoria>…</teoria>, <pista>…</pista>, etc.).
// getTag tolera una etiqueta sin cerrar (respuesta cortada); getTags solo toma las cerradas.
export function getTag(text, name) {
  const t = String(text || '');
  const closed = t.match(new RegExp(`<${name}>([\\s\\S]*?)</${name}>`, 'i'));
  if (closed) return closed[1].trim();
  const open = t.match(new RegExp(`<${name}>([\\s\\S]*?)(?=<\\/?[a-z_]+>|$)`, 'i'));
  return open ? open[1].trim() : '';
}
export function getTags(text, name) {
  return [...String(text || '').matchAll(new RegExp(`<${name}>([\\s\\S]*?)</${name}>`, 'gi'))].map(m => m[1].trim());
}
export function toList(s) {
  return String(s || '').split('\n').map(l => l.replace(/^\s*(?:[-*•]|\d+[.)])\s+/, '').trim()).filter(Boolean);
}
