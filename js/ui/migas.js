// Migas de pan: 1. Materia › 2. Eje › 3. Subtema › 4. Mentoría. Los pasos anteriores son botones (data-go).
import { $ } from '../nucleo/dom.js';
import { escapeHTML } from '../nucleo/utilidades.js';
import { S } from '../estado/estado.js';

export function renderCrumbs() {
  const steps = [
    { v: 'materias', label: S.materia ? S.materia.nombre : '1. Materia' },
    { v: 'ejes', label: S.eje ? S.eje.nombre : '2. Eje temático', need: S.materia },
    { v: 'subtemas', label: S.sub ? S.sub.nombre : '3. Subtema', need: S.eje },
    { v: 'mentoria', label: '4. Mentoría guiada', need: S.sub }
  ];
  const order = ['materias', 'ejes', 'subtemas', 'mentoria'];
  const cur = order.indexOf(S.view);
  $('#crumbs').innerHTML = steps.map((s, i) => {
    if (i === cur) return `<span class="current">${escapeHTML(['1. Materia', '2. Eje temático', '3. Subtema', '4. Mentoría guiada'][i])}</span>`;
    if (i < cur) return `<button data-go="${s.v}">${escapeHTML(s.label)}</button>`;
    return `<span>${escapeHTML(['1. Materia', '2. Eje temático', '3. Subtema', '4. Mentoría guiada'][i])}</span>`;
  }).join('<span class="sep">›</span>');
}
