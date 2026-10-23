// Sección "📋 Reglas del examen" del diálogo Profesor y bibliografía: material permitido y fecha del examen.
// Se guarda sola al cambiar cada campo. Una fecha inválida o pasada no se guarda.
import { $ } from '../nucleo/dom.js';
import { escapeHTML, esFechaValida, today } from '../nucleo/utilidades.js';
import { S } from '../estado/estado.js';
import { MATERIALES, guardarReglas } from '../estado/reglas-examen.js';

function aviso(msg) { $('#pf-reglas-aviso').textContent = msg; }

export function renderReglas() {
  const r = S.config.reglasExamen;
  $('#pf-material').innerHTML = Object.entries(MATERIALES).map(([id, texto]) =>
    `<label class="opcion"><input type="radio" name="pf-material" value="${id}" ${r.material === id ? 'checked' : ''}> ${escapeHTML(texto)}</label>`).join('');
  const f = $('#pf-fecha-examen');
  f.value = r.fecha;
  f.min = today();
  aviso('');
}

async function guardar() {
  $('#pf-guardado').textContent = await guardarReglas() ? '✔ Guardado' : 'No se pudo guardar (el almacenamiento del navegador está lleno).';
}

export function iniciarPanelReglas() {
  $('#pf-material').addEventListener('change', ev => {
    if (!Object.hasOwn(MATERIALES, ev.target.value)) return;
    S.config.reglasExamen.material = ev.target.value;
    guardar();
  });
  $('#pf-fecha-examen').addEventListener('change', ev => {
    const v = ev.target.value;
    // Si no se guarda, el campo vuelve a la fecha guardada: lo que se ve es lo que vale.
    const rechazar = msg => { aviso(msg); ev.target.value = S.config.reglasExamen.fecha; };
    // AAAA-MM-DD se compara bien como texto: '2026-10-09' < '2026-10-11'.
    if (v && !esFechaValida(v)) { rechazar('Esa fecha no es válida: no la guardé.'); return; }
    if (v && v < today()) { rechazar('Esa fecha ya pasó: no la guardé.'); return; }
    aviso('');
    S.config.reglasExamen.fecha = v;
    guardar();
  });
}
