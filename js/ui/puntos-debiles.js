// Puntos débiles guardados: contador de la cabecera, diálogo 📌 con la lista, "Repasar este tema",
// "Marcar como superado", editar o descartar cada punto, y exportar todo a .txt.
import { $ } from '../nucleo/dom.js';
import { escapeHTML, stamp, today } from '../nucleo/utilidades.js';
import { S } from '../estado/estado.js';
import { buscarMateria, buscarEje } from '../estado/curso.js';
import { Store } from '../estado/almacen.js';
import { etiquetaOrigen, debilesActivos, marcarSuperado, puntosVigentes, editarPunto, descartarPunto } from '../estado/debiles.js';
import { etiquetaTipo, TIPOS_ERROR, SIN_CLASIFICAR } from '../estado/tipos-error.js';
import { mdInline } from '../render/markdown.js';
import { saveFile } from '../exportacion/descargas.js';
import { mentor } from './mentor.js';
import { setAccent, enterSubtema, renderMaterias, renderEjes, renderSubtemas } from './navegacion.js';

const SIN_GUARDAR = 'No pude guardar el cambio (el almacenamiento del navegador está lleno). Vuelve a intentarlo.';

// Todo lo que se muestra y se cuenta acá son los pendientes (no superados ni descartados): ver debilesActivos().
export function updateDebilesCount() {
  const n = debilesActivos().reduce((a, d) => a + puntosVigentes(d).length, 0);
  const c = $('#debiles-count');
  c.textContent = n; c.hidden = !n;
}
export function renderDebiles() {
  const body = $('#debiles-body');
  const activos = debilesActivos();
  if (!activos.length) {
    body.innerHTML = S.debiles.length
      ? '<p class="muted">¡No tienes puntos débiles pendientes! Los superados y descartados quedan guardados en tu historial.</p>'
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
      <ul>${d.puntos.map((p, i) => p.descartado ? '' : puntoHTML(d, p, i)).join('')}</ul>
      <div class="btn-row">
        <button class="btn sm primary" data-dact="repasar" data-id="${escapeHTML(d.id)}">Repasar este tema</button>
        <button class="btn sm" data-dact="superado" data-id="${escapeHTML(d.id)}">✔ Marcar como superado</button>
      </div>
    </article>`).join('')}`;
}
// data-i es la posición en d.puntos (con los descartados incluidos), así siempre apunta al mismo punto.
const datos = (d, i) => `data-id="${escapeHTML(d.id)}" data-i="${i}"`;
const puntoHTML = (d, p, i) => `<li>${mdInline(p.texto)} <span class="pill tipo">${escapeHTML(etiquetaTipo(p.tipo))}</span>
  <span class="punto-acciones"><button class="btn sm" data-dact="editar" ${datos(d, i)}>✏️ Editar</button><button class="btn sm" data-dact="descartar" ${datos(d, i)}>🗑️ Descartar</button></span></li>`;

// Formulario de edición dentro del mismo <li>. Los <label> envuelven al campo: no hacen falta ids.
function abrirEditor(li, d, i) {
  const p = d.puntos[i];
  const tipos = [...Object.entries(TIPOS_ERROR).map(([id, t]) => [id, t.etiqueta]), [SIN_CLASIFICAR, 'Sin clasificar']];
  li.innerHTML = `<div class="editar-punto">
    <label>Texto del punto <textarea maxlength="600" rows="3">${escapeHTML(p.texto)}</textarea></label>
    <label>Tipo de error <select>${tipos.map(([id, et]) => `<option value="${id}"${id === p.tipo ? ' selected' : ''}>${escapeHTML(et)}</option>`).join('')}</select></label>
    <div class="btn-row"><button class="btn sm primary" data-dact="guardar-punto" ${datos(d, i)}>Guardar</button><button class="btn sm" data-dact="cancelar-punto" ${datos(d, i)}>Cancelar</button></div>
  </div>`;
  li.querySelector('textarea').focus();
}

const botonesEditar = () => [...$('#debiles-body').querySelectorAll('[data-dact="editar"]')];
const clave = b => `${b.dataset.id}|${b.dataset.i}`;

// Después de editar o descartar: contador, lista y las pastillas de las tarjetas que están detrás del diálogo.
// Devuelve el foco al botón Editar del punto para no perder el lugar con el teclado. Si el punto ya no está
// (descartado), va al Editar del siguiente punto vigente; si no hay, al del anterior; con la lista vacía, al ✕.
function refrescar(id, i) {
  const antes = botonesEditar().map(clave);
  const pos = antes.indexOf(`${id}|${i}`);
  updateDebilesCount(); renderDebiles();
  if (S.view === 'materias') renderMaterias();
  if (S.view === 'ejes') renderEjes();
  if (S.view === 'subtemas') renderSubtemas();
  const ahora = new Map(botonesEditar().map(b => [clave(b), b]));
  const destino = ahora.has(`${id}|${i}`) ? `${id}|${i}`
    : pos < 0 ? undefined
    : antes.slice(pos + 1).find(k => ahora.has(k)) ?? antes.slice(0, pos).reverse().find(k => ahora.has(k));
  (ahora.get(destino) || (!ahora.size && $('#dlg-debiles [data-close]')))?.focus();
}

// Formularios de edición con algo distinto de lo guardado (texto o tipo).
function editoresConCambios() {
  return [...$('#debiles-body').querySelectorAll('.editar-punto')].filter(f => {
    const b = f.querySelector('[data-dact="guardar-punto"]');
    const p = debilesActivos().find(x => x.id === b.dataset.id)?.puntos[Number(b.dataset.i)];
    return p && (f.querySelector('textarea').value !== p.texto || f.querySelector('select').value !== p.tipo);
  });
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
    puntosVigentes(d).forEach(p => L.push(`  ✖ ${p.texto} [${etiquetaTipo(p.tipo)}]`));
    L.push('');
  }
  saveFile(new Blob([L.join('\n')], { type: 'text/plain;charset=utf-8' }), `puntos_debiles_${today()}.txt`);
}

export function iniciarPuntosDebiles() {
  $('#btn-debiles').addEventListener('click', () => { renderDebiles(); $('#dlg-debiles').showModal(); });
  // Escape dispara 'cancel' en el <dialog>. Con una edición a medio hacer, cancela solo la edición y el diálogo queda abierto.
  $('#dlg-debiles').addEventListener('cancel', ev => {
    const [f] = editoresConCambios();
    if (!f) return;
    ev.preventDefault();
    const b = f.querySelector('[data-dact="cancelar-punto"]');
    refrescar(b.dataset.id, Number(b.dataset.i));
  });
  $('#debiles-body').addEventListener('click', async ev => {
    const b = ev.target.closest('[data-dact]');
    if (!b) return;
    if (b.dataset.dact === 'export-all') { exportAllDebiles(); return; }
    const d = debilesActivos().find(x => x.id === b.dataset.id);
    if (!d) return;
    // Acciones sobre un punto: el índice tiene que existir y el punto seguir vigente.
    const i = Number(b.dataset.i);
    const punto = Number.isInteger(i) && d.puntos[i] && !d.puntos[i].descartado;
    if (b.dataset.dact === 'editar' && punto) abrirEditor(b.closest('li'), d, i);
    if (b.dataset.dact === 'cancelar-punto') refrescar(d.id, i);
    if (b.dataset.dact === 'guardar-punto' && punto) {
      const li = b.closest('li');
      const r = await editarPunto(d, i, { texto: li.querySelector('textarea').value, tipo: li.querySelector('select').value });
      if (r === 'vacio') { mentor('El punto no puede quedar vacío. Escribe el texto o usa Cancelar.'); li.querySelector('textarea').focus(); return; }
      if (!r) { mentor(SIN_GUARDAR); return; }
      refrescar(d.id, i);
      mentor('Punto corregido.');
    }
    if (b.dataset.dact === 'descartar' && punto) {
      if (!confirm('¿Descartar este punto? Deja de contar en 📌 y en los errores frecuentes. No se puede deshacer.')) return;
      if (!await descartarPunto(d, i)) { mentor(SIN_GUARDAR); return; }
      refrescar(d.id, i);
      mentor('Punto descartado.');
    }
    if (b.dataset.dact === 'superado') {
      if (!await marcarSuperado(d)) { mentor(SIN_GUARDAR); return; }
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
