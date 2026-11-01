// Pantalla Hoy: hasta 3 acciones de colaDeHoy() con los datos de Mi curso, cada una con su botón "Empezar".
// La navegación la avisa con 'mostrar-hoy' (ver pestanas/registro.js): así navegacion.js no importa este archivo.
import { $ } from '../nucleo/dom.js';
import { escapeHTML, today } from '../nucleo/utilidades.js';
import { S } from '../estado/estado.js';
import { temasDesdeEstado, buscarPorClave } from '../dominio/adaptadores.js';
import { colaDeHoy } from '../dominio/cola.js';
import { registrarAccion, alSuceder } from '../pestanas/registro.js';
import { abrirHoja } from '../exportacion/dialogo-hoja.js';
import { setAccent, enterSubtema } from './navegacion.js';

// Pestaña del subtema donde se hace cada acción (cerrar-hoja abre el diálogo de la hoja).
const PESTANA = { reconstruir: 'teoria', practicar: 'ejercicios', repasar: 'ejercicios', integrar: 'examen' };
// Acciones que se hacen con un drill (ver ui/dialogo-drill.js, que registra la acción drill-abrir).
const DRILL = new Set(['practicar', 'repasar']);

// 'AAAA-MM-DD' → 'DD/MM/AAAA' sin pasar por Date (no cambia el día por la zona horaria).
const fechaCorta = f => f.split('-').reverse().join('/');

function tarjeta(accion) {
  const f = buscarPorClave(S.curso, accion.temaId);
  const titulo = f ? f.subtema.nombre : 'Tema';
  const clave = `data-key="${escapeHTML(accion.temaId)}"`;
  const datos = `${clave} aria-label="Empezar: ${escapeHTML(titulo)}"`;
  let boton;
  if (accion.tipo === 'cerrar-hoja') boton = `<button class="btn primary" data-action="cerrar-hoja-hoy" ${datos}>Empezar</button>`;
  // Practicar y repasar se hacen con un drill local; "Ir al tema" lleva a Ejercicios como antes.
  else if (DRILL.has(accion.tipo)) {
    boton = `<button class="btn primary" data-action="drill-abrir" ${datos}>Empezar</button>
      <button class="btn" data-action="hoy-ir" data-tab="${PESTANA[accion.tipo]}" ${clave} aria-label="Ir al tema: ${escapeHTML(titulo)}">Ir al tema</button>`;
  } else boton = `<button class="btn primary" data-action="hoy-ir" data-tab="${PESTANA[accion.tipo]}" ${datos}>Empezar</button>`;
  return `<article class="panel-card stack">
    <div>
      <h2>${escapeHTML(titulo)}</h2>
      ${f ? `<p class="muted small">${escapeHTML(f.materia.nombre)} › ${escapeHTML(f.eje.nombre)}</p>` : ''}
    </div>
    <p>${escapeHTML(accion.motivo)}</p>
    <div class="btn-row"><span class="pill">⏱ ${accion.minutos} min</span>${boton}</div>
  </article>`;
}

export function renderHoy() {
  setAccent(null);
  const hoy = today();
  $('#hoy-fecha').textContent = `${fechaCorta(hoy)} · lo que conviene hacer hoy, según tus clases y repasos.`;
  const cuerpo = $('#hoy-body');
  // Sin ningún tema cargado, "todo al día" confundiría: se invita a cargar la primera clase.
  if (!S.curso.materias.length) {
    cuerpo.innerHTML = `<div class="panel-card stack">
      <p><strong>Todavía no cargaste ningún tema.</strong></p>
      <div class="btn-row"><button class="btn primary" data-abrir="tema-hoy">＋ Tema de hoy</button></div>
    </div>`;
    return;
  }
  const temas = temasDesdeEstado({ curso: S.curso, progreso: S.progreso, hojas: S.hojas, intentos: S.intentos }, hoy);
  const acciones = colaDeHoy({ temas, fechaExamen: S.config.reglasExamen?.fecha, hoy });
  if (!acciones.length) {
    cuerpo.innerHTML = `<div class="panel-card stack">
      <p>Todo al día. Si quieres adelantar, abre Mi curso.</p>
      <div class="btn-row"><button class="btn primary" data-go="materias">Ir a Mi curso</button></div>
    </div>`;
    return;
  }
  cuerpo.innerHTML = `<div class="stack">${acciones.map(tarjeta).join('')}</div>`;
}

// Elige materia, eje y subtema de la clave y entra directo a la pestaña: así la teoría no se pide si no es Teoría.
function entrar(el, tab) {
  const f = buscarPorClave(S.curso, el.dataset.key);
  if (!f) return false;
  S.materia = f.materia; S.eje = f.eje;
  setAccent(f.materia);
  enterSubtema(f.subtema, tab);
  return true;
}

export function iniciarHoy() {
  alSuceder('mostrar-hoy', renderHoy);
  registrarAccion('hoy-ir', el => { entrar(el, el.dataset.tab || 'teoria'); });
  // abrirHoja trabaja sobre el subtema abierto: primero se entra al tema, por Examen (donde está la hoja).
  registrarAccion('cerrar-hoja-hoy', el => { if (entrar(el, 'examen')) abrirHoja(); });
}
