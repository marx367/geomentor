// Puntos débiles guardados: contador de la cabecera, diálogo 📌 con la lista, "Repasar este tema",
// "Marcar como superado" y exportar todo a .txt.
import { $ } from '../nucleo/dom.js';
import { escapeHTML, stamp, today } from '../nucleo/utilidades.js';
import { S } from '../estado/estado.js';
import { buscarMateria, buscarEje } from '../estado/curso.js';
import { Store } from '../estado/almacen.js';
import { etiquetaOrigen, debilesActivos, marcarSuperado } from '../estado/debiles.js';
import { etiquetaTipo } from '../estado/tipos-error.js';
import { mdInline } from '../render/markdown.js';
import { saveFile } from '../exportacion/descargas.js';
import { mentor } from './mentor.js';
import { setAccent, enterSubtema } from './navegacion.js';

// Todo lo que se muestra y se cuenta acá son los pendientes (no superados): ver debilesActivos().
export function updateDebilesCount() {
  const n = debilesActivos().reduce((a, d) => a + d.puntos.length, 0);
  const c = $('#debiles-count');
  c.textContent = n; c.hidden = !n;
}
export function renderDebiles() {
  const body = $('#debiles-body');
  const activos = debilesActivos();
  if (!activos.length) {
    body.innerHTML = S.debiles.length
      ? '<p class="muted">¡No tienes puntos débiles pendientes! Los que marcaste como superados quedan en tu historial.</p>'
      : '<p class="muted">Todavía no hay puntos débiles guardados. Se guardan cuando generas el resumen de un chequeo de comprensión, cuando el mentor corrige un ejercicio o cuando guardas los errores de un examen.</p>';
    return;
  }
  const where = Store.mode === 'db' ? 'Se guardan en tu cuenta y solo tú puedes verlos.' : 'Se guardan en este navegador.';
  body.innerHTML = `<p class="muted small">${where}</p>
    <div class="btn-row"><button class="btn sm" data-dact="export-all">⬇️ Exportar todo (.txt)</button></div>
    ${activos.map(d => `
    <article class="weak-item">
      <h4>${escapeHTML(d.subtema)}</h4>
      <p class="meta">${escapeHTML(d.materia)} › ${escapeHTML(d.eje)} · ${escapeHTML(etiquetaOrigen(d))} · ${stamp(new Date(d.fecha))}</p>
      <ul>${d.puntos.map(p => `<li>${mdInline(p.texto)} <span class="pill tipo">${escapeHTML(etiquetaTipo(p.tipo))}</span></li>`).join('')}</ul>
      <div class="btn-row">
        <button class="btn sm primary" data-dact="repasar" data-id="${escapeHTML(d.id)}">Repasar este tema</button>
        <button class="btn sm" data-dact="superado" data-id="${escapeHTML(d.id)}">✔ Marcar como superado</button>
      </div>
    </article>`).join('')}`;
}
// Busca en Mi curso el subtema de un punto débil. Si se borró (o era del catálogo viejo), devuelve null.
export function findSub(d) {
  const m = buscarMateria(d.materiaId);
  const e = buscarEje(m, d.ejeId);
  const s = e?.subtemas.find(x => x.id === d.subId);
  return s ? { m, e, s } : null;
}
export function exportAllDebiles() {
  const L = ['GEOMENTOR · PUNTOS DÉBILES GUARDADOS', `Exportado: ${stamp()}`, ''];
  for (const d of debilesActivos()) {
    L.push('='.repeat(60), `${d.materia} › ${d.eje} › ${d.subtema}`, `${etiquetaOrigen(d)} · ${stamp(new Date(d.fecha))}`, '-'.repeat(60));
    d.puntos.forEach(p => L.push(`  ✖ ${p.texto} [${etiquetaTipo(p.tipo)}]`));
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
    const d = debilesActivos().find(x => x.id === b.dataset.id);
    if (!d) return;
    if (b.dataset.dact === 'superado') {
      if (!await marcarSuperado(d)) { mentor('No pude guardar el cambio (el almacenamiento del navegador está lleno). Vuelve a intentarlo.'); return; }
      updateDebilesCount(); renderDebiles();
      mentor('¡Punto superado! Así se avanza.');
    }
    if (b.dataset.dact === 'repasar') {
      const f = findSub(d);
      if (!f) { mentor('Ese tema ya no está en Mi curso. Puedes marcar el punto como superado o cargarlo de nuevo con «＋ Tema de hoy».'); return; }
      $('#dlg-debiles').close();
      S.materia = f.m; S.eje = f.e; setAccent(f.m);
      enterSubtema(f.s);
    }
  });
}
