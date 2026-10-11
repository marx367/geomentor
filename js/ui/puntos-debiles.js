// Puntos débiles guardados: contador de la cabecera, diálogo 📌 con la lista, "Repasar este tema",
// "Marcar como superado" y exportar todo a .txt.
import { $ } from '../nucleo/dom.js';
import { escapeHTML, stamp, today } from '../nucleo/utilidades.js';
import { MATERIAS } from '../datos/catalogo.js';
import { S, ejesDe } from '../estado/estado.js';
import { Store } from '../estado/almacen.js';
import { mdInline } from '../render/markdown.js';
import { saveFile } from '../exportacion/descargas.js';
import { mentor } from './mentor.js';
import { setAccent, enterSubtema } from './navegacion.js';

export function updateDebilesCount() {
  const n = S.debiles.reduce((a, d) => a + (d.puntos?.length || 0), 0);
  const c = $('#debiles-count');
  c.textContent = n; c.hidden = !n;
}
export function renderDebiles() {
  const body = $('#debiles-body');
  if (!S.debiles.length) {
    body.innerHTML = '<p class="muted">Todavía no hay puntos débiles guardados. Se guardan cuando generas el resumen de un chequeo de comprensión o cuando guardas los errores de un examen.</p>';
    return;
  }
  const where = Store.mode === 'db' ? 'Se guardan en tu cuenta y solo tú puedes verlos.' : 'Se guardan en este navegador.';
  body.innerHTML = `<p class="muted small">${where}</p>
    <div class="btn-row"><button class="btn sm" data-dact="export-all">⬇️ Exportar todo (.txt)</button></div>
    ${S.debiles.map(d => `
    <article class="weak-item">
      <h4>${escapeHTML(d.subtema)}</h4>
      <p class="meta">${escapeHTML(d.materia)} › ${escapeHTML(d.eje)} · ${escapeHTML(d.origen || '')} · ${stamp(new Date(d.fecha))}</p>
      <ul>${(d.puntos || []).map(p => `<li>${mdInline(p)}</li>`).join('')}</ul>
      <div class="btn-row">
        <button class="btn sm primary" data-dact="repasar" data-id="${escapeHTML(d.id)}">Repasar este tema</button>
        <button class="btn sm" data-dact="superado" data-id="${escapeHTML(d.id)}">✔ Marcar como superado</button>
      </div>
    </article>`).join('')}`;
}
export function findSub(d) {
  const m = MATERIAS.find(x => x.id === d.materiaId);
  const e = m ? ejesDe(m).find(x => x.id === d.ejeId) : null;
  if (!m || !e) return null;
  let s = [...e.subtemas, ...(e.custom || [])].find(x => x.id === d.subId);
  if (!s) { s = { id: d.subId, nombre: d.subtema, desc: 'Tema personalizado' }; (e.custom ||= []).push(s); }
  return { m, e, s };
}
export function exportAllDebiles() {
  const L = ['GEOMENTOR · PUNTOS DÉBILES GUARDADOS', `Exportado: ${stamp()}`, ''];
  for (const d of S.debiles) {
    L.push('='.repeat(60), `${d.materia} › ${d.eje} › ${d.subtema}`, `${d.origen || ''} · ${stamp(new Date(d.fecha))}`, '-'.repeat(60));
    (d.puntos || []).forEach(p => L.push('  ✖ ' + p));
    L.push('');
  }
  saveFile(new Blob([L.join('\n')], { type: 'text/plain;charset=utf-8' }), `puntos_debiles_${today()}.txt`);
}

export function iniciarPuntosDebiles() {
  $('#btn-debiles').addEventListener('click', () => { renderDebiles(); $('#dlg-debiles').showModal(); });
  $('#debiles-body').addEventListener('click', async ev => {
    const b = ev.target.closest('[data-dact]');
    if (!b) return;
    if (b.dataset.dact === 'export-all') { exportAllDebiles(); return; }
    const d = S.debiles.find(x => x.id === b.dataset.id);
    if (!d) return;
    if (b.dataset.dact === 'superado') {
      await Store.deleteDebil(d.id);
      S.debiles = S.debiles.filter(x => x.id !== d.id);
      updateDebilesCount(); renderDebiles();
      mentor('¡Punto superado! Así se avanza.');
    }
    if (b.dataset.dact === 'repasar') {
      const f = findSub(d);
      if (!f) return;
      $('#dlg-debiles').close();
      S.materia = f.m; S.eje = f.e; setAccent(f.m);
      enterSubtema(f.s);
    }
  });
}
