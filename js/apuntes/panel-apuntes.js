// Apuntes en el diálogo de Config: lista de archivos con su tema asignado, carga de archivos
// (.txt, .md, .pdf) y quitar apuntes.
import { $ } from '../nucleo/dom.js';
import { escapeHTML, spinnerHTML } from '../nucleo/utilidades.js';
import { S } from '../estado/estado.js';
import { Store } from '../estado/almacen.js';
import { mentor } from '../ui/mentor.js';
import { esPDF, leerArchivoApunte } from './lector-archivos.js';

export function scopeOptions(sel) {
  const opt = (v, label) => `<option value="${v}" ${v === sel ? 'selected' : ''}>${escapeHTML(label)}</option>`;
  let h = opt('', 'Todos los temas (búsqueda automática)');
  for (const m of S.curso.materias) {
    h += `<optgroup label="${escapeHTML(m.nombre)}">${opt(m.id, `${m.nombre}: toda la materia`)}`;
    for (const e of m.ejes) {
      h += opt(`${m.id}/${e.id}`, `\u00a0\u00a0${e.nombre} (eje completo)`);
      for (const sb of e.subtemas) h += opt(`${m.id}/${e.id}/${sb.id}`, `\u00a0\u00a0\u00a0\u00a0· ${sb.nombre}`);
    }
    h += '</optgroup>';
  }
  return h;
}
export function renderApuntes() {
  const files = Object.entries(S.config.apuntes || {});
  $('#apuntes-list').innerHTML = files.length
    ? files.map(([n, t]) => `<div class="file-item"><div class="file-info"><span>📄 ${escapeHTML(n)} <span class="muted">· ${Math.round(t.length / 1000)} mil caracteres</span></span><select data-scope="${escapeHTML(n)}" aria-label="Tema al que corresponde ${escapeHTML(n)}">${scopeOptions((S.config.asignacion || {})[n] || '')}</select></div><button class="btn ghost sm" data-remove="${escapeHTML(n)}" aria-label="Quitar ${escapeHTML(n)}">✕</button></div>`).join('')
    : '<p class="muted small">No hay apuntes cargados.</p>';
  $('#storage-note').textContent = Store.mode === 'db' ? 'Tus apuntes se guardan en tu cuenta, de forma privada.' : 'Tus apuntes se guardan en este navegador.';
  $('#apuntes-dot').hidden = !files.length;
}

export function iniciarPanelApuntes() {
  $('#in-apuntes').addEventListener('change', async ev => {
    const files = [...(ev.target.files || [])];
    for (const f of files) {
      try {
        if (esPDF(f)) $('#apuntes-list').insertAdjacentHTML('afterbegin', `<p class="loading small" id="pdf-loading">${spinnerHTML} Leyendo ${escapeHTML(f.name)}…</p>`);
        S.config.apuntes[f.name] = await leerArchivoApunte(f);
        $('#pdf-loading')?.remove();
      } catch (e) {
        $('#pdf-loading')?.remove();
        if (e.code === 'escaneado') mentor(`«${f.name}» parece escaneado: sus páginas son imágenes y no tienen texto para leer. Pásalo por un OCR o súbelo como .txt.`);
        else mentor('No pude leer ' + f.name + (e?.message ? ': ' + e.message : ''));
      }
    }
    ev.target.value = '';
    renderApuntes();
  });
  $('#apuntes-list').addEventListener('click', ev => {
    const b = ev.target.closest('[data-remove]');
    if (b) { delete S.config.apuntes[b.dataset.remove]; if (S.config.asignacion) delete S.config.asignacion[b.dataset.remove]; renderApuntes(); }
  });
  $('#apuntes-list').addEventListener('change', ev => {
    const sel = ev.target.closest('[data-scope]');
    if (sel) { (S.config.asignacion ||= {})[sel.dataset.scope] = sel.value; if (!sel.value) delete S.config.asignacion[sel.dataset.scope]; }
  });
}
