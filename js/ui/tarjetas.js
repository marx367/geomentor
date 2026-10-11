// Tarjetas de selección (materia, eje, subtema) y conteo de puntos débiles para sus pastillas.
import { $$ } from '../nucleo/dom.js';
import { escapeHTML } from '../nucleo/utilidades.js';
import { S } from '../estado/estado.js';

export function pickCard({ icon, title, desc, badges = '', onPick }) {
  const b = document.createElement('button');
  b.className = 'pick';
  b.type = 'button';
  b.innerHTML = `${icon ? `<span class="icon" aria-hidden="true">${escapeHTML(icon)}</span>` : ''}<h3>${escapeHTML(title)}</h3><p>${escapeHTML(desc)}</p>${badges ? `<div class="badges">${badges}</div>` : ''}`;
  b.addEventListener('click', () => {
    $$('.pick.selected').forEach(x => x.classList.remove('selected'));
    b.classList.add('selected');
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    setTimeout(onPick, reduce ? 0 : 230);
  });
  return b;
}
export function countDebiles(prefix) { return S.debiles.filter(d => (d.key || '').startsWith(prefix)).reduce((a, d) => a + (d.puntos?.length || 0), 0); }
