// Diálogo "✨ Generar ejes desde mis apuntes": muestra el progreso, deja editar la propuesta
// (nombres, emojis, quitar ejes o subtemas) y la guarda en la configuración.
import { $, $$ } from '../nucleo/dom.js';
import { escapeHTML, loadingHTML } from '../nucleo/utilidades.js';
import { S } from '../estado/estado.js';
import { Store } from '../estado/almacen.js';
import { aiReady } from '../ia/config-ia.js';
import { aiError } from '../ia/errores-ia.js';
import { mentor } from '../ui/mentor.js';
import { renderEjes } from '../ui/navegacion.js';
import { apuntesDeMateria, estructuraDePlan, materialDeApuntes, proponerEstructura, normalizarEjes } from './estructura-ejes.js';

const Gen = { draft: null, busy: false, err: '' };

export async function generarEjes() {
  const m = S.materia;
  const files = apuntesDeMateria(m);
  Gen.err = ''; Gen.draft = null;
  if (!files.length) { Gen.err = 'No hay apuntes para esta materia. Súbelos en ⚙️ Config (o revisa que no estén asignados a otra materia).'; renderGenEjes(); $('#dlg-ejes').showModal(); return; }
  if (!aiReady()) { Gen.err = 'Configura un proveedor de IA en ⚙️ Config para generar los ejes.'; renderGenEjes(); $('#dlg-ejes').showModal(); return; }
  Gen.busy = true; Gen.progress = 'Leyendo tus apuntes…';
  renderGenEjes(); $('#dlg-ejes').showModal();
  const nombres = files.map(([n]) => n);
  try {
    const plan = estructuraDePlan(files);
    let ejes;
    if (plan) {
      Gen.progress = `Usando la estructura de ${plan.file}…`; renderGenEjes();
      ejes = await proponerEstructura(m, plan.text, nombres, { explicita: true });
      for (const e of ejes) for (const sb of e.subtemas) if (!sb.archivos.includes(plan.file)) sb.archivos.unshift(plan.file);
    } else {
      const material = await materialDeApuntes(m, files, t => { Gen.progress = t; renderGenEjes(); });
      Gen.progress = 'Organizando ejes y subtemas…'; renderGenEjes();
      ejes = await proponerEstructura(m, material, nombres);
    }
    Gen.draft = ejes;
  } catch (e) {
    Gen.err = e.code ? aiError(e) : e.message;
  } finally {
    Gen.busy = false;
    renderGenEjes();
  }
}
export function renderGenEjes() {
  const body = $('#ejes-gen-body');
  const m = S.materia;
  const prev = ((S.config.ejesGen || {})[m.id] || []).length;
  const quitar = prev ? `<button class="btn ghost sm" data-gact="quitar">🗑️ Quitar los ${prev} ejes generados de ${escapeHTML(m.nombre)}</button>` : '';
  if (Gen.busy) { body.innerHTML = loadingHTML(Gen.progress || 'Generando…'); return; }
  if (Gen.err) { body.innerHTML = `<p class="error-text">${escapeHTML(Gen.err)}</p><div class="btn-row">${aiReady() && apuntesDeMateria(m).length ? '<button class="btn" data-gact="regen">↻ Reintentar</button>' : ''}${quitar}</div>`; return; }
  if (!Gen.draft) { body.innerHTML = `<p class="muted">Sin propuesta.</p><div class="btn-row">${quitar}</div>`; return; }
  body.innerHTML = `
    <p class="muted small">Revisa la propuesta: puedes cambiar nombres, emojis y descripciones, o quitar lo que no corresponda. Cada subtema queda vinculado a los archivos de donde salió.${prev ? ` Al guardar, reemplaza los ${prev} ejes generados antes para ${escapeHTML(m.nombre)}.` : ''}</p>
    ${Gen.draft.map((e, i) => `
      <div class="gen-eje" data-eje="${i}">
        <div class="gen-row">
          <input class="emoji" data-f="icono" value="${escapeHTML(e.icono)}" aria-label="Emoji del eje">
          <input data-f="nombre" value="${escapeHTML(e.nombre)}" aria-label="Nombre del eje">
          <button class="btn ghost sm" data-gact="del-eje" data-i="${i}" aria-label="Quitar eje">✕</button>
        </div>
        <input data-f="desc" value="${escapeHTML(e.desc)}" aria-label="Descripción del eje" style="min-height:38px;padding:.35rem .6rem">
        <div class="gen-subs">
          ${e.subtemas.map((sb, j) => `
            <div data-sub="${j}">
              <div class="gen-row">
                <input data-f="nombre" value="${escapeHTML(sb.nombre)}" aria-label="Nombre del subtema">
                <button class="btn ghost sm" data-gact="del-sub" data-i="${i}" data-j="${j}" aria-label="Quitar subtema">✕</button>
              </div>
              <div class="gen-files">📄 ${sb.archivos.length ? sb.archivos.map(escapeHTML).join(', ') : 'sin archivo identificado (se usará la búsqueda automática)'}</div>
            </div>`).join('')}
        </div>
      </div>`).join('')}
    <div class="btn-row">
      <button class="btn primary" data-gact="guardar">Guardar ejes</button>
      <button class="btn" data-gact="regen">↻ Regenerar</button>
      ${quitar}
    </div>`;
}
export function leerDraft() {
  if (!Gen.draft) return;
  $$('#ejes-gen-body [data-eje]').forEach(el => {
    const e = Gen.draft[+el.dataset.eje];
    for (const inp of el.querySelectorAll(':scope > .gen-row input, :scope > input')) e[inp.dataset.f] = inp.value.trim();
    el.querySelectorAll('[data-sub]').forEach(sEl => { e.subtemas[+sEl.dataset.sub].nombre = sEl.querySelector('input').value.trim(); });
  });
}

export async function guardarEjes() {
  leerDraft();
  const m = S.materia;
  const ejes = normalizarEjes(m, Gen.draft);
  (S.config.ejesGen ||= {})[m.id] = ejes;
  const ok = await Store.setDoc('config', S.config);
  $('#dlg-ejes').close();
  Gen.draft = null;
  renderEjes();
  mentor(`Agregué ${ejes.length} ${ejes.length === 1 ? 'eje' : 'ejes'} desde tus apuntes (marcados con 📚).${ok ? '' : ' No se pudieron guardar de forma permanente.'}`);
}

export function iniciarDialogoEjes() {
  $('#btn-gen-ejes').addEventListener('click', () => {
    if (Gen.busy) { $('#dlg-ejes').showModal(); return; }
    generarEjes();
  });
  $('#ejes-gen-body').addEventListener('click', async ev => {
    const b = ev.target.closest('[data-gact]');
    if (!b) return;
    const act = b.dataset.gact;
    if (act === 'regen') { generarEjes(); return; }
    if (act === 'guardar') { guardarEjes(); return; }
    if (act === 'quitar') {
      if (!confirm('¿Quitar los ejes generados desde tus apuntes en esta materia? Tus apuntes no se borran.')) return;
      delete S.config.ejesGen[S.materia.id];
      await Store.setDoc('config', S.config);
      $('#dlg-ejes').close();
      renderEjes();
      mentor('Quité los ejes generados. Puedes volver a generarlos cuando quieras.');
      return;
    }
    leerDraft();
    if (act === 'del-eje') Gen.draft.splice(+b.dataset.i, 1);
    if (act === 'del-sub') { const e = Gen.draft[+b.dataset.i]; e.subtemas.splice(+b.dataset.j, 1); if (!e.subtemas.length) Gen.draft.splice(+b.dataset.i, 1); }
    if (!Gen.draft.length) { Gen.draft = null; Gen.err = 'Quitaste todos los ejes. Pulsa «Reintentar» para generar otra propuesta.'; }
    renderGenEjes();
  });
}
