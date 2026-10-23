// Diálogo "🧩 Consolidar apuntes en un plan": opciones (días, completar), progreso con
// cancelación (una consulta por subtema), resultado y descarga del .md.
import { $ } from '../nucleo/dom.js';
import { escapeHTML, loadingHTML } from '../nucleo/utilidades.js';
import { S } from '../estado/estado.js';
import { Store } from '../estado/almacen.js';
import { ask } from '../ia/cliente-ia.js';
import { aiReady } from '../ia/config-ia.js';
import { aiError, coded } from '../ia/errores-ia.js';
import { Apuntes } from '../contexto/busqueda-apuntes.js';
import { saveFile } from '../exportacion/descargas.js';
import { renderApuntes } from './panel-apuntes.js';
import { materialDeApuntes, proponerEstructura } from './estructura-ejes.js';
import { planFileName, fuentesPlan, promptSeccion, limpiarSeccion, armarPlan } from './plan-estudios.js';

const Plan = { busy: false, cancel: false, progress: '', err: '', result: null, dias: 12, completar: true };

export async function consolidarApuntes() {
  const m = S.materia;
  const fname = planFileName(m);
  const { files } = fuentesPlan(m);
  Plan.err = ''; Plan.result = null; Plan.cancel = false;
  if (!files.length) { Plan.err = 'No hay apuntes para esta materia. Súbelos en ⚙️ Config.'; renderPlanDlg(); return; }
  if (!aiReady()) { Plan.err = 'Configura un proveedor de IA en ⚙️ Config.'; renderPlanDlg(); return; }
  Plan.busy = true;
  const setP = t => { Plan.progress = t; renderPlanDlg(); };
  const cancelado = () => Plan.cancel;
  const nombres = files.map(([n]) => n);
  Apuntes.excluir = new Set([fname, ...fuentesPlan(m).omitidos]);
  try {
    setP('Leyendo tus apuntes…');
    const material = await materialDeApuntes(m, files, setP, cancelado);
    if (cancelado()) throw coded('cancelado', 'Cancelado.');
    setP('Definiendo ejes y subtemas del plan…');
    const ejes = await proponerEstructura(m, material, nombres, { completar: Plan.completar });
    const total = ejes.reduce((a, e) => a + e.subtemas.length, 0);
    const secciones = [];
    let n = 0;
    for (const [i, e] of ejes.entries()) {
      const partes = [`# EJE ${i + 1}: ${e.nombre}`];
      for (const [j, sb] of e.subtemas.entries()) {
        if (cancelado()) throw coded('cancelado', 'Cancelado.');
        n++;
        setP(`Redactando la sección ${n} de ${total}: ${sb.nombre}…`);
        const num = `${i + 1}.${j + 1}`;
        const txt = await ask(promptSeccion(m, e, sb, num, Plan.completar), { fresh: true });
        partes.push(limpiarSeccion(txt, num, sb.nombre));
      }
      secciones.push(partes.join('\n\n'));
    }
    const md = armarPlan(m, ejes, secciones, nombres, Plan.dias, Plan.completar);
    S.config.apuntes[fname] = md;
    (S.config.asignacion ||= {})[fname] = m.id;
    (S.config.planes ||= {})[m.id] = fname;
    const ok = await Store.setDoc('config', S.config);
    Plan.result = { md, fname, ejes: ejes.length, subtemas: total, complementos: (md.match(/^:::complemento/gm) || []).length, ok };
    renderApuntes();
  } catch (e) {
    Plan.err = e.code === 'cancelado' ? 'Consolidación cancelada. No se guardó nada.' : (e.code ? aiError(e) : e.message);
  } finally {
    Apuntes.excluir = new Set();
    Plan.busy = false;
    renderPlanDlg();
  }
}
export function renderPlanDlg() {
  const body = $('#plan-body');
  const m = S.materia;
  if (!m) return;
  if (Plan.busy) {
    body.innerHTML = `${loadingHTML(Plan.progress || 'Trabajando…')}<p class="muted small">Se hace una consulta por subtema, así que puede tardar varios minutos. Puedes cerrar esta ventana: el trabajo sigue.</p><div class="btn-row"><button class="btn" data-pact="cancelar" ${Plan.cancel ? 'disabled' : ''}>${Plan.cancel ? 'Cancelando…' : 'Cancelar'}</button></div>`;
    return;
  }
  if (Plan.result) {
    const r = Plan.result;
    body.innerHTML = `
      <p>✔ Plan listo: <strong>${r.ejes} ejes</strong> y <strong>${r.subtemas} subtemas</strong>${r.complementos ? `, con ${r.complementos} ${r.complementos === 1 ? 'complemento marcado' : 'complementos marcados'}` : ''}.</p>
      <p class="muted small">Quedó guardado como apunte «${escapeHTML(r.fname)}», asignado a ${escapeHTML(m.nombre)}. Tus archivos originales siguen cargados como respaldo.${r.ok ? '' : ' No se pudo guardar de forma permanente (el plan es muy grande).'}</p>
      <div class="btn-row">
        <button class="btn primary" data-pact="descargar">⬇️ Descargar plan (.md)</button>
        <button class="btn" data-pact="cerrar">Cerrar</button>
      </div>`;
    return;
  }
  const { files, omitidos } = fuentesPlan(m);
  const previo = S.config.apuntes?.[planFileName(m)];
  body.innerHTML = `
    ${Plan.err ? `<p class="error-text">${escapeHTML(Plan.err)}</p>` : ''}
    <p class="muted small">Une tus ${files.length} ${files.length === 1 ? 'archivo' : 'archivos'} de apuntes de ${escapeHTML(m.nombre)} en un solo plan: elimina duplicados y ruido, sigue la notación del estilo del profesor, pasa los decimales a valores exactos y agrega un cronograma. Hace una consulta por subtema.</p>
    ${previo ? '<p class="small" style="color:var(--hint)">Ya hay un plan de esta materia: el nuevo lo reemplaza.</p>' : ''}
    ${omitidos.length ? `<p class="muted small">Se omite${omitidos.length > 1 ? 'n' : ''} ${omitidos.map(escapeHTML).join(', ')} porque ya ${omitidos.length > 1 ? 'son planes consolidados' : 'es un plan consolidado'}.</p>` : ''}
    ${!S.profesor.estilo && !S.profesor.analisis ? '<p class="small" style="color:var(--hint)">No cargaste el estilo del profesor en 🎓 Profesor y bibliografía: el plan usará criterios generales.</p>' : ''}
    <label class="field">Días hasta el examen<input type="number" id="plan-dias" min="3" max="90" value="${Plan.dias}" style="max-width:140px"></label>
    <label class="toggle"><input type="checkbox" id="plan-completar" ${Plan.completar ? 'checked' : ''}><span>Completar temas típicos que falten en los apuntes, marcados como complemento (qué, por qué y para qué).</span></label>
    <div class="btn-row"><button class="btn primary" data-pact="crear" ${files.length && aiReady() ? '' : 'disabled'}>🧩 Crear plan</button></div>`;
}

export function iniciarDialogoPlan() {
  $('#btn-plan').addEventListener('click', () => { if (!Plan.busy) { Plan.result = null; Plan.err = ''; } renderPlanDlg(); $('#dlg-plan').showModal(); });
  $('#plan-body').addEventListener('click', ev => {
    const b = ev.target.closest('[data-pact]');
    if (!b) return;
    const act = b.dataset.pact;
    if (act === 'crear') {
      Plan.dias = Number($('#plan-dias').value) || 12;
      Plan.completar = $('#plan-completar').checked;
      consolidarApuntes();
    }
    if (act === 'cancelar') { Plan.cancel = true; renderPlanDlg(); }
    if (act === 'descargar' && Plan.result) saveFile(new Blob([Plan.result.md], { type: 'text/markdown;charset=utf-8' }), Plan.result.fname);
    if (act === 'cerrar') { $('#dlg-plan').close(); Plan.result = null; }
  });
}
