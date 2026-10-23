// Diálogo "📝 Hoja de errores" (acción hoja-errores, en Examen): editar las secciones 1 y 2 con vista previa,
// aviso según el material permitido y exportar a PDF. Lo editado se guarda al cambiar un campo y al cerrar
// (Escape también cierra: no se pierde nada). La lógica de la hoja está en hoja-errores.js.
import { $ } from '../nucleo/dom.js';
import { slug, today, loadingHTML, escapeHTML } from '../nucleo/utilidades.js';
import { S, key } from '../estado/estado.js';
import { hojaDe, guardarHoja, MAX_EDITADO } from '../estado/hojas.js';
import { materialPermitido } from '../estado/reglas-examen.js';
import { aiError } from '../ia/errores-ia.js';
import { registrarAccion } from '../pestanas/registro.js';
import { mentor } from '../ui/mentor.js';
import { generarPDF, rutaHTML } from './exportar-pdf.js';
import { iaDisponible, proponerHoja, hojaHTML, medirSeccion } from './hoja-errores.js';

const SIN_GUARDAR = 'No pude guardar la hoja (el almacenamiento del navegador está lleno).';
const ocupado = new Set(); // subtemas con un pedido a la IA en curso
const errores = {};        // último error de la IA por subtema
const borradores = {};    // lo que no se pudo guardar (almacenamiento lleno), para no perderlo al reabrir
let abierta = null;        // key del subtema de la hoja abierta
const textoDe = k => borradores[k] || hojaDe(k);

// Qué se puede hacer con la hoja según "Reglas del examen" (Profesor). Textos fijos, sin datos del estudiante.
function avisoMaterial(busy) {
  // Mientras la IA propone, sin PDF: saldría con las secciones 1 y 2 viejas.
  const pdf = texto => busy ? '' : `<button class="btn sm primary" data-hoja="pdf">📄 ${texto}</button>`;
  switch (materialPermitido()) {
    case 'impreso': return `<p class="muted small">Tu examen permite material impreso: exporta la hoja y llévala.</p><div class="btn-row">${pdf('Exportar PDF')}</div>`;
    case 'manuscrito': return '<p class="hoja-aviso">✍️ Tu examen solo permite material manuscrito: usa esta hoja como guía y cópiala a mano en tu cuaderno.</p>';
    case 'ninguno': return `<p class="hoja-aviso">🚫 Tu examen es sin material: esta hoja no se puede llevar. Puedes usarla igual como ficha para memorizar.</p><div class="btn-row">${pdf('Exportar como ficha para memorizar')}</div>`;
    default: return '<p class="hoja-aviso">Todavía no definiste qué material se puede llevar al examen.</p><div class="btn-row"><button class="btn sm" data-abrir="profesor">📋 Reglas del examen</button></div>';
  }
}

// Contador debajo de cada sección: avisa si no entra en una página, pero no corta ni bloquea nada.
function cuentaHTML(valor) {
  const m = medirSeccion(valor);
  return `${m.lineas} ${m.lineas === 1 ? 'línea' : 'líneas'} · ${m.caracteres} caracteres${m.larga ? ' · <strong>Muy larga para una página: recortala vos</strong>' : ''}`;
}
const campo = (id, titulo, valor, bloqueado) => `<label class="field">${titulo}
  <textarea id="${id}" rows="6" maxlength="${MAX_EDITADO}" aria-describedby="${id}-cuenta" ${bloqueado ? 'disabled' : ''}>${escapeHTML(valor)}</textarea></label>
  <p class="hoja-cuenta${medirSeccion(valor).larga ? ' larga' : ''}" id="${id}-cuenta">${cuentaHTML(valor)}</p>`;
function actualizarCuenta(textarea) {
  const p = $(`#${textarea.id}-cuenta`);
  p.innerHTML = cuentaHTML(textarea.value);
  p.classList.toggle('larga', medirSeccion(textarea.value).larga);
}

// Lo que está en los campos (o lo guardado o pendiente, si el diálogo todavía no los dibujó).
function leerCampos(k) {
  const r = $('#hoja-recordar'), e = $('#hoja-encarar');
  return r && e && !r.disabled ? { recordar: r.value, encarar: e.value } : textoDe(k);
}

function render() {
  const k = abierta, h = textoDe(k), busy = ocupado.has(k);
  $('#hoja-body').innerHTML = `${rutaHTML()}
    ${avisoMaterial(busy)}
    <p class="muted small">Las secciones 1 y 2 aceptan Markdown y LaTeX ($…$). Las 3 y 4 salen de tus puntos débiles y se recalculan solas.</p>
    ${busy ? loadingHTML('La IA está proponiendo las secciones 1 y 2…') : ''}
    ${errores[k] ? `<p class="error-text">${escapeHTML(errores[k])}</p>` : ''}
    <div class="hoja-editor">
      ${campo('hoja-recordar', '1. Qué tengo que recordar', h.recordar, busy)}
      ${campo('hoja-encarar', '2. Cómo encarar cada tipo de ejercicio', h.encarar, busy)}
    </div>
    ${iaDisponible() && !busy ? `<div class="btn-row"><button class="btn sm" data-hoja="proponer">${errores[k] ? 'Reintentar con IA' : '↻ Volver a proponer con IA'}</button></div>` : ''}
    <h4>Vista previa</h4>
    <div class="hoja-vista hoja" id="hoja-vista">${hojaHTML(h, k)}</div>`;
}
const actualizarVista = () => { $('#hoja-vista').innerHTML = hojaHTML(leerCampos(abierta), abierta); };

// Guarda h (o lo de los campos) solo si algo cambió. Si falla, queda como borrador hasta el próximo intento.
async function guardar(k = abierta, actual = leerCampos(k)) {
  if (!k) return true;
  const h = hojaDe(k);
  if (actual.recordar === h.recordar && actual.encarar === h.encarar) { delete borradores[k]; return true; }
  const ok = await guardarHoja(k, actual);
  if (ok) delete borradores[k];
  else { borradores[k] = actual; mentor(SIN_GUARDAR); }
  return ok;
}

// Una sola consulta. El resultado se guarda aunque el diálogo ya se haya cerrado.
async function proponer(k) {
  ocupado.add(k); delete errores[k];
  if (abierta === k) render();
  try {
    const h = await proponerHoja();
    await guardar(k, h); // si no se puede guardar, la propuesta queda como borrador (la consulta no se pierde)
  } catch (e) {
    errores[k] = e.code ? aiError(e) : (e.message || 'No se pudo armar la hoja.');
  } finally {
    ocupado.delete(k);
    if (abierta === k) {
      const enCabecera = $('#dlg-hoja .dlg-head').contains(document.activeElement); // por ejemplo, en el ✕
      render();
      if (!enCabecera) $('#hoja-recordar')?.focus();
    }
  }
}

export function abrirHoja() {
  if (!S.sub) { mentor('Entra a un subtema para armar su hoja de errores.'); return; }
  abierta = key();
  const h = textoDe(abierta);
  render();
  $('#dlg-hoja').showModal();
  $('#hoja-recordar')?.focus();
  // Sin nada guardado y con IA real: se propone una vez. Sin IA (o simulada), las secciones 1 y 2 quedan vacías.
  if (!h.recordar && !h.encarar && !h.fecha && iaDisponible() && !ocupado.has(abierta) && !errores[abierta]) proponer(abierta);
}

export function iniciarHojaErrores() {
  registrarAccion('hoja-errores', abrirHoja);
  const dlg = $('#dlg-hoja');
  dlg.addEventListener('close', () => { guardar(); abierta = null; });
  window.addEventListener('math-ready', () => { if (abierta) actualizarVista(); }); // fórmulas con mejor calidad
  dlg.addEventListener('input', ev => { if (ev.target.matches('#hoja-recordar, #hoja-encarar')) { actualizarCuenta(ev.target); actualizarVista(); } });
  dlg.addEventListener('change', ev => { if (ev.target.matches('#hoja-recordar, #hoja-encarar')) guardar(); });
  dlg.addEventListener('click', async ev => {
    // "📋 Reglas del examen": se cierra la hoja (y se guarda) antes; Profesor lo abre el data-abrir de ui/eventos.js.
    if (ev.target.closest('[data-abrir]')) { dlg.close(); return; }
    const b = ev.target.closest('[data-hoja]');
    if (!b) return;
    const k = abierta;
    if (b.dataset.hoja === 'proponer') {
      const h = leerCampos(k);
      if ((h.recordar.trim() || h.encarar.trim()) && !confirm('La IA va a reemplazar lo que escribiste en las secciones 1 y 2. ¿Seguir?')) return;
      proponer(k);
    }
    if (b.dataset.hoja === 'pdf') {
      if (!await guardar(k)) return;
      await generarPDF(`<div class="hoja"><h1>Hoja de errores</h1>${rutaHTML()}${hojaHTML(hojaDe(k), k)}</div>`,
        `hoja_${slug(S.sub.nombre)}_${today()}.pdf`, 'Hoja exportada. Revisa que entre en una página antes de imprimirla.');
    }
  });
}
