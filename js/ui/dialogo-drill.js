// Diálogo "🎯 Práctica rápida": 10 ítems de Geometría Descriptiva con corrección local (sin IA ni red).
// Al corregir registra un intento 'drill' del subtema. Se abre desde Hoy con la acción drill-abrir.
import { $ } from '../nucleo/dom.js';
import { escapeHTML, norm } from '../nucleo/utilidades.js';
import { S } from '../estado/estado.js';
import { registrar } from '../estado/intentos.js';
import { generarDrill, corregirDrill, METODOS } from '../dominio/drills.js';
import { buscarPorClave } from '../dominio/adaptadores.js';
import { registrarAccion, avisar } from '../pestanas/registro.js';

const NOMBRE_METODO = { 'tercera-proyeccion': 'Tercera proyección de un punto', recta: 'Representación de la recta' };
const UMBRAL = 0.8; // mismo que UMBRALES.practica del dominio: debajo de esto, la cola lo vuelve a pedir

// Estado del diálogo abierto. resultado: lo de corregirDrill; guardado: si el intento se pudo registrar.
const D = { clave: null, metodo: METODOS[0], items: [], respuestas: {}, resultado: null, guardado: false, ocupado: false };

const semillaNueva = () => Math.floor(Math.random() * 2 ** 31);

// Método según el nombre del subtema; si no se reconoce, el primero.
function metodoPara(clave) {
  const nombre = norm(buscarPorClave(S.curso, clave)?.subtema.nombre);
  if (nombre.includes('recta')) return 'recta';
  if (nombre.includes('proyecc')) return 'tercera-proyeccion';
  return METODOS[0];
}

function nuevoDrill(metodo) {
  Object.assign(D, { metodo, items: generarDrill({ metodo, semilla: semillaNueva() }), respuestas: {}, resultado: null, guardado: false });
}

const textoDe = (item, v) => item.opciones.find(o => o.v === v)?.texto || '';

function itemHTML(item, n) {
  const det = D.resultado?.detalle.find(d => d.id === item.id);
  const opciones = item.opciones.map(o => {
    const elegida = D.respuestas[item.id] === o.v;
    return `<button type="button" class="btn${elegida ? ' primary' : ''}" data-drill="opcion" data-item="${item.id}" data-v="${escapeHTML(o.v)}" aria-pressed="${elegida}">${escapeHTML(o.texto)}</button>`;
  }).join('');
  const marca = !det ? '' : det.ok
    ? '<p><span class="pill accent">✔ Bien</span></p>'
    : `<p><span class="pill warn">✘ Correcta: ${escapeHTML(textoDe(item, det.esperado))}</span></p>`;
  return `<div class="panel-card stack">
    <p><strong>${n}.</strong> ${escapeHTML(item.pregunta)}</p>
    <div class="btn-row" role="group" aria-label="Opciones de la pregunta ${n}">${opciones}</div>
    ${marca}
  </div>`;
}

function pieHTML() {
  if (!D.resultado) {
    const contestadas = Object.keys(D.respuestas).length;
    return `<div class="btn-row">
      <button type="button" class="btn primary" data-drill="corregir"${contestadas && !D.ocupado ? '' : ' disabled'}>Corregir</button>
      <span class="muted small">${contestadas} de ${D.items.length} contestadas</span>
    </div>`;
  }
  const { aciertos, total } = D.resultado;
  return `<div class="panel-card stack" role="status">
    <p><strong>${aciertos} de ${total}</strong> · ${D.guardado ? 'guardado' : 'no se pudo guardar'}</p>
    ${aciertos / total < UMBRAL ? '<p>Mañana te lo vuelvo a pedir.</p>' : ''}
    <div class="btn-row">
      <button type="button" class="btn primary" data-drill="repetir">Repetir</button>
      <button type="button" class="btn" data-drill="cerrar">Cerrar</button>
    </div>
  </div>`;
}

function render() {
  const opciones = METODOS.map(m => `<option value="${m}"${m === D.metodo ? ' selected' : ''}>${escapeHTML(NOMBRE_METODO[m] || m)}</option>`).join('');
  $('#drill-body').innerHTML = `<div class="stack">
    <label class="field">Método<select id="drill-metodo">${opciones}</select></label>
    <p class="muted small">Elige una opción en cada pregunta. La corrección es inmediata y no usa IA.</p>
    ${D.items.map((item, i) => itemHTML(item, i + 1)).join('')}
    ${pieHTML()}
  </div>`;
}

async function corregir() {
  if (D.resultado || D.ocupado) return;
  D.ocupado = true;
  const r = corregirDrill(D.items, D.respuestas);
  D.guardado = await registrar(D.clave, { tipo: 'drill', aciertos: r.aciertos, total: r.total });
  D.resultado = r;
  D.ocupado = false;
  render();
  $('#drill-body [data-drill="repetir"]')?.focus();
}

export function abrirDrill({ clave, metodo } = {}) {
  D.clave = clave || null;
  nuevoDrill(METODOS.includes(metodo) ? metodo : metodoPara(clave));
  render();
  $('#dlg-drill').showModal();
  $('#drill-metodo')?.focus();
}

export function iniciarDialogoDrill() {
  registrarAccion('drill-abrir', el => abrirDrill({ clave: el.dataset.key, metodo: el.dataset.metodo }));
  const dlg = $('#dlg-drill');
  dlg.addEventListener('change', ev => {
    if (ev.target.id !== 'drill-metodo' || !METODOS.includes(ev.target.value)) return;
    nuevoDrill(ev.target.value);
    render();
    $('#drill-metodo').focus();
  });
  // Los botones se dibujan de nuevo en cada render: se escuchan en el diálogo (data-close solo enlaza los del arranque).
  dlg.addEventListener('click', ev => {
    const b = ev.target.closest('[data-drill]');
    if (!b) return;
    const accion = b.dataset.drill;
    if (accion === 'opcion' && !D.resultado) {
      D.respuestas[b.dataset.item] = b.dataset.v;
      render();
      $(`#drill-body [data-item="${b.dataset.item}"][data-v="${b.dataset.v}"]`)?.focus();
    }
    if (accion === 'corregir') corregir();
    if (accion === 'repetir') { nuevoDrill(D.metodo); render(); $('#drill-metodo')?.focus(); }
    if (accion === 'cerrar') dlg.close();
  });
  // Al cerrar, Hoy se vuelve a dibujar con el intento nuevo.
  dlg.addEventListener('close', () => { if (S.view === 'hoy') avisar('mostrar-hoy'); });
}
