// Navegación entre vistas (materias → ejes → subtemas → mentoría), color de acento por materia,
// pestañas del subtema, tema personalizado y botón "Reiniciar". Las pestañas se manejan por el registro.
import { $, $$ } from '../nucleo/dom.js';
import { slug } from '../nucleo/utilidades.js';
import { MATERIAS } from '../datos/catalogo.js';
import { S, ejesDe } from '../estado/estado.js';
import { debilesDelTema } from '../contexto/cabecera-prompt.js';
import { mostrarPestana, redibujarPestana, avisar } from '../pestanas/registro.js';
import { mentor } from './mentor.js';
import { renderCrumbs } from './migas.js';
import { pickCard, countDebiles } from './tarjetas.js';

export function setAccent(m) {
  const r = document.documentElement.style;
  r.setProperty('--accent-l', m ? m.acc[0] : '#0e7490');
  r.setProperty('--accent-d', m ? m.acc[1] : '#22d3ee');
  avisar('cambio-acento'); // el laboratorio redibuja con el color nuevo
}
export function go(view) {
  S.view = view;
  for (const v of ['materias', 'ejes', 'subtemas', 'mentoria']) $('#view-' + v).hidden = v !== view;
  if (view === 'materias') renderMaterias();
  if (view === 'ejes') renderEjes();
  if (view === 'subtemas') renderSubtemas();
  renderCrumbs();
  window.scrollTo({ top: 0, behavior: 'instant' in window ? 'instant' : 'auto' });
}

export function renderMaterias() {
  setAccent(null);
  const grid = $('#grid-materias');
  grid.innerHTML = '';
  for (const m of MATERIAS) {
    const n = countDebiles(m.id + '/');
    grid.appendChild(pickCard({
      icon: m.icono, title: m.nombre, desc: m.desc,
      badges: `<span class="pill">${ejesDe(m).length} ejes</span>${n ? `<span class="pill warn">📌 ${n} puntos débiles</span>` : ''}`,
      onPick: () => { S.materia = m; S.eje = null; S.sub = null; setAccent(m); go('ejes'); mentor(`¡Buena elección! ${m.nombre} tiene ${ejesDe(m).length} ejes. Empieza por el que más te cuesta.`); }
    }));
  }
}
export function renderEjes() {
  const m = S.materia;
  setAccent(m);
  $('#ejes-title').textContent = 'Selecciona un eje temático';
  $('#ejes-lead').textContent = `Elige la unidad de ${m.nombre} que quieres repasar hoy.`;
  const grid = $('#grid-ejes');
  grid.innerHTML = '';
  for (const e of ejesDe(m)) {
    const n = countDebiles(`${m.id}/${e.id}/`);
    grid.appendChild(pickCard({
      icon: e.icono, title: e.nombre, desc: e.desc,
      badges: `${e.generado ? '<span class="pill accent">📚 De tus apuntes</span>' : ''}<span class="pill">${e.subtemas.length} subtemas</span>${n ? `<span class="pill warn">📌 ${n}</span>` : ''}`,
      onPick: () => { S.eje = e; S.sub = null; go('subtemas'); mentor('Vas por buen camino. Ahora elige el subtema que corresponde a tu clase.'); }
    }));
  }
}
export function renderSubtemas() {
  const m = S.materia, e = S.eje;
  $('#subtemas-title').textContent = e.nombre;
  const grid = $('#grid-subtemas');
  grid.innerHTML = '';
  const subs = [...e.subtemas, ...(e.custom || [])];
  for (const s of subs) {
    const k = `${m.id}/${e.id}/${s.id}`;
    const p = S.progreso.temas?.[k];
    const n = countDebiles(k);
    let badges = '';
    if (p?.comprension != null) badges += `<span class="pill accent">Comprensión ${p.comprension}%</span>`;
    if (p?.examenMejor != null) badges += `<span class="pill accent">Examen ${p.examenMejor}/10</span>`;
    if (n) badges += `<span class="pill warn">📌 ${n}</span>`;
    grid.appendChild(pickCard({ title: s.nombre, desc: s.desc, badges, onPick: () => enterSubtema(s) }));
  }
}

export function enterSubtema(sub) {
  S.sub = sub;
  $('#mentoria-title').textContent = sub.nombre;
  go('mentoria');
  showTab('teoria');
  avisar('entrar-subtema'); // el laboratorio carga su gráfico y la teoría se pide si no está en caché
  const n = debilesDelTema().length;
  mentor(n ? `Tienes ${n} puntos débiles guardados en este subtema. El mentor los va a reforzar en las preguntas y ejercicios.` : '¡Excelente elección! Lee la teoría y luego pon a prueba tu comprensión en el chequeo.');
}

export function showTab(tab) {
  S.tab = tab;
  $$('.tab').forEach(t => t.setAttribute('aria-selected', String(t.dataset.tab === tab)));
  for (const t of ['teoria', 'lab', 'ejercicios', 'examen']) $('#tab-' + t).hidden = t !== tab;
  mostrarPestana(tab);
}
export function rerenderCurrent() {
  if (S.view !== 'mentoria') return;
  redibujarPestana(S.tab);
}

export function iniciarNavegacion() {
  $('#custom-sub-form').addEventListener('submit', ev => {
    ev.preventDefault();
    const name = $('#custom-sub-input').value.trim();
    if (!name) return;
    const sub = { id: 'custom-' + slug(name), nombre: name, desc: 'Tema personalizado' };
    (S.eje.custom ||= []).some(x => x.id === sub.id) || S.eje.custom.push(sub);
    $('#custom-sub-input').value = '';
    enterSubtema(sub);
  });
  $('#btn-reset').addEventListener('click', () => {
    if (!confirm('¿Reiniciar la sesión? Se borra el avance de esta sesión (chequeos, ejercicios y exámenes). Tus apuntes y puntos débiles guardados se conservan.')) return;
    S.cache = {}; S.sessions = {}; S.materia = S.eje = S.sub = null;
    avisar('reiniciar');
    go('materias');
    mentor('Sesión reiniciada. Elige una materia para empezar de nuevo.');
  });
}
