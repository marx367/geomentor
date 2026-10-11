// Diálogo "🎓 Profesor y bibliografía": estilo del profesor (archivo, texto, cuestionario y análisis de la IA),
// biblioteca (ver panel-biblioteca.js) y modo estricto. Todo se guarda solo, al cambiar cada campo.
import { $ } from '../nucleo/dom.js';
import { escapeHTML, loadingHTML } from '../nucleo/utilidades.js';
import { CUESTIONARIO } from '../datos/cuestionario-profesor.js';
import { S } from '../estado/estado.js';
import { guardarProfesor, MAX_ESTILO } from '../estado/profesor.js';
import { markdownToHTML } from '../render/markdown.js';
import { aiReady } from '../ia/config-ia.js';
import { aiError } from '../ia/errores-ia.js';
import { leerArchivoApunte } from '../apuntes/lector-archivos.js';
import { analizarEstilo } from './analisis-estilo.js';
import { renderBiblioteca, iniciarPanelBiblioteca } from './panel-biblioteca.js';
import { renderReglas, iniciarPanelReglas } from './panel-reglas.js';

const A = { busy: false, err: '' }; // estado del análisis

function renderCuestionario() {
  $('#pf-cuestionario').innerHTML = CUESTIONARIO.map(q => `
    <fieldset class="pregunta">
      <legend>${escapeHTML(q.pregunta)}</legend>
      ${q.opciones.map((o, i) => `<label class="opcion"><input type="radio" name="pf-q-${q.id}" value="${i}" ${S.profesor.respuestas[q.id] === i ? 'checked' : ''}> ${escapeHTML(o)}</label>`).join('')}
    </fieldset>`).join('');
}
function renderAnalisis() {
  const el = $('#pf-analisis');
  $('#pf-analizar').disabled = A.busy || !aiReady();
  if (A.busy) { el.innerHTML = loadingHTML('Analizando el estilo del profesor…'); return; }
  el.innerHTML = `${A.err ? `<p class="error-text">${escapeHTML(A.err)}</p>` : ''}${!aiReady() ? '<p class="muted small">Configura un proveedor de IA en ⚙️ para analizar el estilo.</p>' : ''}${S.profesor.analisis
    ? `<div class="analisis md"><p class="small muted">Lo que el mentor va a seguir al explicar y corregir:</p>${markdownToHTML(S.profesor.analisis)}<button type="button" class="btn ghost sm" id="pf-quitar-analisis">Quitar análisis</button></div>` : ''}`;
}
function render() {
  $('#pf-estilo').value = S.profesor.estilo;
  $('#pf-estricto').checked = S.profesor.estricto;
  $('#pf-guardado').textContent = '';
  renderReglas(); renderCuestionario(); renderAnalisis(); renderBiblioteca();
}

async function guardar() {
  const ok = await guardarProfesor();
  $('#pf-guardado').textContent = ok ? '✔ Guardado' : 'No se pudo guardar (el almacenamiento del navegador está lleno).';
}
// Lee el texto del estilo (recortado al máximo) y lo guarda solo si cambió.
function leerEstilo() {
  const v = $('#pf-estilo').value.slice(0, MAX_ESTILO);
  if (v === S.profesor.estilo) return false;
  S.profesor.estilo = v;
  return true;
}

async function analizar() {
  leerEstilo();
  if (!S.profesor.estilo.trim() && !Object.keys(S.profesor.respuestas).length) { A.err = 'Escribe algo sobre el profesor o responde el cuestionario.'; renderAnalisis(); return; }
  A.busy = true; A.err = ''; renderAnalisis();
  try {
    S.profesor.analisis = await analizarEstilo(S.profesor.estilo, S.profesor.respuestas);
    await guardar();
  } catch (e) {
    A.err = e.code ? aiError(e) : e.message;
  } finally {
    A.busy = false; renderAnalisis();
  }
}

export function abrirProfesor() { render(); $('#dlg-profesor').showModal(); }

export function iniciarDialogoProfesor() {
  iniciarPanelBiblioteca();
  iniciarPanelReglas();
  $('#pf-estilo').addEventListener('change', () => { if (leerEstilo()) guardar(); });
  $('#dlg-profesor').addEventListener('close', () => { if (leerEstilo()) guardar(); });
  $('#pf-estricto').addEventListener('change', ev => { S.profesor.estricto = ev.target.checked; guardar(); });
  $('#pf-cuestionario').addEventListener('change', ev => {
    const id = ev.target.name?.replace(/^pf-q-/, '');
    if (!CUESTIONARIO.some(q => q.id === id)) return;
    S.profesor.respuestas[id] = Number(ev.target.value);
    guardar();
  });
  $('#pf-estilo-archivo').addEventListener('change', async ev => {
    const f = ev.target.files?.[0];
    ev.target.value = '';
    if (!f) return;
    if (!/\.(txt|md|pdf)$/i.test(f.name)) { $('#pf-guardado').textContent = `«${f.name}» no es .txt, .md ni .pdf.`; return; }
    try {
      $('#pf-estilo').value = (await leerArchivoApunte(f)).slice(0, MAX_ESTILO);
      if (leerEstilo()) guardar();
    } catch (e) { $('#pf-guardado').textContent = `No pude leer «${f.name}».`; }
  });
  $('#pf-analizar').addEventListener('click', analizar);
  $('#pf-analisis').addEventListener('click', ev => {
    if (ev.target.id !== 'pf-quitar-analisis') return;
    S.profesor.analisis = '';
    guardar(); renderAnalisis();
  });
}
