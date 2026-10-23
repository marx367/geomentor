// Diálogo "📝 Hoja de errores" (acción hoja-errores, en Examen): editar las secciones 1 y 2 con vista previa,
// aviso según el material permitido y exportar a PDF. Lo editado se guarda al cambiar un campo y al cerrar
// (Escape también cierra: no se pierde nada). La lógica de la hoja está en hoja-errores.js.
import { $ } from '../nucleo/dom.js';
import { slug, today, loadingHTML, escapeHTML } from '../nucleo/utilidades.js';
import { S, key } from '../estado/estado.js';
import { hojaDe, guardarHoja, MAX_EDITADO, pasaTope } from '../estado/hojas.js';
import { materialPermitido } from '../estado/reglas-examen.js';
import { aiError } from '../ia/errores-ia.js';
import { registrarAccion } from '../pestanas/registro.js';
import { mentor } from '../ui/mentor.js';
import { generarPDF, rutaHTML } from './exportar-pdf.js';
import { iaDisponible, proponerHoja, hojaHTML, medirSeccion } from './hoja-errores.js';

const SIN_GUARDAR = 'No pude guardar la hoja (el almacenamiento del navegador está lleno).';
const MUY_LARGA = `No guardé la hoja: una sección pasa de ${MAX_EDITADO} caracteres. Quedó como borrador hasta que recargues la página: recortala para guardarla.`;
const SECCIONES = ['recordar', 'encarar'];
const ocupado = new Set(); // subtemas con un pedido a la IA en curso
const errores = {};        // último error de la IA por subtema
const faltan = {};         // secciones que la última respuesta de la IA no trajo, por subtema
const borradores = {};    // lo que no se pudo guardar (almacenamiento lleno o sección muy larga), para no perderlo al reabrir
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

// Contador debajo de cada sección: avisa si no entra en una página (sin bloquear) y si pasa del tope de
// guardado. Sin maxlength en el textarea: el navegador recortaría en silencio lo que se pega.
const pasaDelTope = valor => valor.length > MAX_EDITADO;
const enRojo = valor => medirSeccion(valor).larga || pasaDelTope(valor);
function cuentaHTML(valor) {
  const m = medirSeccion(valor);
  return `${m.lineas} ${m.lineas === 1 ? 'línea' : 'líneas'} · ${m.caracteres} caracteres${m.larga ? ' · <strong>Muy larga para una página: recortala vos</strong>' : ''}${pasaDelTope(valor) ? `<br><strong>Esta sección pasa de ${MAX_EDITADO} caracteres: recortala para guardarla</strong> (tiene ${valor.length}, contando espacios y saltos de línea del final)` : ''}`;
}
const AVISO_FALTA = '<p class="hoja-aviso">La IA no trajo esta sección: completala a mano o apretá "Pedir de nuevo a la IA".</p>';
const campo = (id, titulo, valor, bloqueado, falta) => `<label class="field">${titulo}
  <textarea id="${id}" rows="6" aria-describedby="${id}-cuenta" ${bloqueado ? 'disabled' : ''}>${escapeHTML(valor)}</textarea></label>
  <p class="hoja-cuenta${enRojo(valor) ? ' larga' : ''}" id="${id}-cuenta">${cuentaHTML(valor)}</p>${falta ? AVISO_FALTA : ''}`;
function actualizarCuenta(textarea) {
  const p = $(`#${textarea.id}-cuenta`);
  p.innerHTML = cuentaHTML(textarea.value);
  p.classList.toggle('larga', enRojo(textarea.value));
}

// Lo que está en los campos (o lo guardado o pendiente, si el diálogo todavía no los dibujó), con sus fuentes.
function leerCampos(k) {
  const r = $('#hoja-recordar'), e = $('#hoja-encarar');
  return r && e && !r.disabled ? { ...textoDe(k), recordar: r.value, encarar: e.value } : textoDe(k);
}

function render() {
  const k = abierta, h = textoDe(k), busy = ocupado.has(k), falta = s => !busy && faltan[k]?.includes(s);
  $('#hoja-body').innerHTML = `${rutaHTML()}
    ${avisoMaterial(busy)}
    <p class="muted small">Las secciones 1 y 2 aceptan Markdown y LaTeX ($…$). Las 3 y 4 salen de tus puntos débiles y se recalculan solas.</p>
    ${busy ? loadingHTML('La IA está proponiendo las secciones 1 y 2…') : ''}
    ${errores[k] ? `<p class="error-text">${escapeHTML(errores[k])}</p>` : ''}
    <div class="hoja-editor">
      ${campo('hoja-recordar', '1. Qué tengo que recordar', h.recordar, busy, falta('recordar'))}
      ${campo('hoja-encarar', '2. Cómo encarar cada tipo de ejercicio', h.encarar, busy, falta('encarar'))}
    </div>
    ${iaDisponible() && !busy ? `<div class="btn-row">${faltan[k] ? '<button class="btn sm" data-hoja="pedir-de-nuevo">Pedir de nuevo a la IA</button>' : ''}
      <button class="btn sm" data-hoja="proponer">${errores[k] ? 'Reintentar con IA' : '↻ Volver a proponer con IA'}</button></div>` : ''}
    <h4>Vista previa</h4>
    <div class="hoja-vista hoja" id="hoja-vista">${hojaHTML(h, k)}</div>`;
}
const actualizarVista = () => { $('#hoja-vista').innerHTML = hojaHTML(leerCampos(abierta), abierta); };

// Guarda h (o lo de los campos) solo si algo cambió. Si falla (o una sección pasa del tope), queda como
// borrador hasta el próximo intento: nunca se recorta para que entre.
async function guardar(k = abierta, actual = leerCampos(k)) {
  if (!k) return true;
  const h = hojaDe(k);
  if (actual.recordar === h.recordar && actual.encarar === h.encarar && actual.fuentes === h.fuentes) { delete borradores[k]; return true; }
  if (pasaTope(actual)) { borradores[k] = actual; mentor(MUY_LARGA); return false; }
  const ok = await guardarHoja(k, actual);
  if (ok) delete borradores[k];
  else { borradores[k] = actual; mentor(SIN_GUARDAR); }
  return ok;
}

// Una sola consulta por pedido, sin reintentos automáticos. Solo cambia las secciones pedidas; si la
// respuesta no trae alguna, esa queda vacía (el estudiante ya confirmó reemplazarla) y se ofrece "Pedir de nuevo a la IA".
// El resultado se guarda aunque el diálogo ya se haya cerrado.
async function proponer(k, secciones = SECCIONES) {
  const base = leerCampos(k); // antes de render(): con la IA trabajando, los campos quedan bloqueados
  ocupado.add(k); delete errores[k];
  if (abierta === k) render();
  try {
    const r = await proponerHoja();
    const h = { ...base, fuentes: r.fuentes }, vacias = [];
    for (const s of secciones) {
      h[s] = (r[s] || '').trim() ? r[s] : '';
      if (!h[s]) vacias.push(s);
    }
    if (vacias.length) faltan[k] = vacias; else delete faltan[k];
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
  // Si la IA ya respondió sin secciones (faltan), no se vuelve a pedir sola: lo decide el estudiante con el botón.
  if (!h.recordar && !h.encarar && !h.fecha && iaDisponible() && !ocupado.has(abierta) && !errores[abierta] && !faltan[abierta]) proponer(abierta);
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
    if (b.dataset.hoja === 'pedir-de-nuevo') {
      const secciones = faltan[k] || SECCIONES, h = leerCampos(k);
      if (secciones.some(s => h[s].trim()) && !confirm(`La IA va a reemplazar lo que escribiste en ${secciones.length > 1 ? 'las secciones que faltaban' : 'la sección que faltaba'}. ¿Seguir?`)) return;
      proponer(k, secciones);
    }
    if (b.dataset.hoja === 'pdf') {
      if (!await guardar(k)) return;
      await generarPDF(`<div class="hoja"><h1>Hoja de errores</h1>${rutaHTML()}${hojaHTML(hojaDe(k), k)}</div>`,
        `hoja_${slug(S.sub.nombre)}_${today()}.pdf`, 'Hoja exportada. Revisa que entre en una página antes de imprimirla.');
    }
  });
}
