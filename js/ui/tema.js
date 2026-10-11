// Selector de tema del encabezado: Light, Dim, Dark o Auto (sigue al sistema, por defecto).
// Guarda la elección en localStorage (excepción a estado/almacen.js: tema-inicial.js necesita leerla
// sincrónica, antes de pintar) y avisa con el evento 'cambio-tema' para que los lienzos se redibujen.
import { $, $$ } from '../nucleo/dom.js';

const CLAVE = 'geomentor-tema';
const NOMBRES = { light: 'Light', dim: 'Dim', dark: 'Dark', auto: 'Auto (System)' };

const temaActual = () => document.documentElement.dataset.theme || 'auto';

function aplicarTema(tema) {
  if (tema === 'auto') delete document.documentElement.dataset.theme;
  else document.documentElement.dataset.theme = tema;
  try {
    if (tema === 'auto') localStorage.removeItem(CLAVE);
    else localStorage.setItem(CLAVE, tema);
  } catch (e) { /* sin localStorage: el tema vale solo para esta visita */ }
  marcarActivo();
  window.dispatchEvent(new Event('cambio-tema'));
}

// Resalta la opción elegida y actualiza el nombre accesible del botón.
function marcarActivo() {
  const tema = temaActual();
  $$('#menu-tema [data-tema]').forEach(op => op.setAttribute('aria-checked', String(op.dataset.tema === tema)));
  $('#btn-tema').setAttribute('aria-label', `Tema: ${NOMBRES[tema]}`);
}

function abrirMenu() {
  $('#menu-tema').hidden = false;
  $('#btn-tema').setAttribute('aria-expanded', 'true');
  $('#menu-tema [aria-checked="true"]').focus();
}

function cerrarMenu(devolverFoco) {
  $('#menu-tema').hidden = true;
  $('#btn-tema').setAttribute('aria-expanded', 'false');
  if (devolverFoco) $('#btn-tema').focus();
}

export function iniciarTema() {
  const btn = $('#btn-tema'), menu = $('#menu-tema');
  marcarActivo();

  btn.addEventListener('click', () => (menu.hidden ? abrirMenu() : cerrarMenu(false)));
  menu.addEventListener('click', ev => {
    const op = ev.target.closest('[data-tema]');
    if (op) { aplicarTema(op.dataset.tema); cerrarMenu(true); }
  });

  // Teclado: flechas recorren las opciones, Esc cierra y devuelve el foco al botón.
  menu.addEventListener('keydown', ev => {
    const ops = $$('[data-tema]', menu), i = ops.indexOf(document.activeElement);
    if (ev.key === 'Escape') { ev.preventDefault(); cerrarMenu(true); }
    else if (ev.key === 'ArrowDown') { ev.preventDefault(); ops[(i + 1) % ops.length].focus(); }
    else if (ev.key === 'ArrowUp') { ev.preventDefault(); ops[(i - 1 + ops.length) % ops.length].focus(); }
    else if (ev.key === 'Home') { ev.preventDefault(); ops[0].focus(); }
    else if (ev.key === 'End') { ev.preventDefault(); ops[ops.length - 1].focus(); }
  });
  btn.addEventListener('keydown', ev => { if (ev.key === 'Escape' && !menu.hidden) cerrarMenu(true); });

  // Se cierra al hacer clic afuera o al salir con Tab.
  document.addEventListener('click', ev => { if (!menu.hidden && !ev.target.closest('.tema-wrap')) cerrarMenu(false); });
  $('.tema-wrap').addEventListener('focusout', ev => { if (!ev.currentTarget.contains(ev.relatedTarget)) cerrarMenu(false); });

  // En Auto, si cambia el tema de Windows, el CSS cambia solo; los lienzos necesitan el aviso.
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener?.('change', () => {
    if (temaActual() === 'auto') window.dispatchEvent(new Event('cambio-tema'));
  });
}
