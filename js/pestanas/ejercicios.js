// Pestaña 3 · Ejercicios: pide un ejercicio tipo examen (enunciado, 3 pistas, solución y gráfico de los datos)
// y dibuja la pantalla: pistas graduales, solución, y "Tu resolución" con texto, foto o pizarra.
import { $ } from '../nucleo/dom.js';
import { escapeHTML, spinnerHTML, clip, loadingHTML, errorBlock } from '../nucleo/utilidades.js';
import { getTag, getTags } from '../nucleo/etiquetas-xml.js';
import { S, key, sess } from '../estado/estado.js';
import { markdownToHTML, mdInline } from '../render/markdown.js';
import { ask } from '../ia/cliente-ia.js';
import { AI } from '../ia/config-ia.js';
import { aiError } from '../ia/errores-ia.js';
import { Apuntes } from '../contexto/busqueda-apuntes.js';
import { header, fitPrompt } from '../contexto/cabecera-prompt.js';
import { fuentesHTML } from '../contexto/fuentes.js';
import { FORMAT_RULES, LAB_SYNTAX } from '../contexto/reglas-prompt.js';
import { montarPizarra } from '../pizarra/pizarra.js';

export async function generarEjercicio(fresh) {
  const k = key(), s = sess(k);
  s.busy.ejercicio = true; s.err.ejercicio = '';
  renderEjercicios();
  const prev = s.exercise ? `\nNo repitas este ejercicio anterior: ${clip(s.exercise.enunciado, 400)}` : '';
  const prompt = fitPrompt(b => `${header(b)}

TAREA: crea UN ejercicio guiado tipo examen del subtema, nivel ${s.nivel}. Si hay puntos débiles guardados, el ejercicio debe trabajar al menos uno.${prev}
<enunciado>Enunciado completo con los datos, sin la solución.</enunciado>
<pista>Pista 1: orienta hacia el concepto a usar, sin cálculos.</pista>
<pista>Pista 2: plantea la ecuación o el procedimiento.</pista>
<pista>Pista 3: casi resuelto, deja solo el último paso.</pista>
<solucion>Resolución completa, paso a paso, con justificación y verificación final.</solucion>
<grafico>De 2 a 6 líneas en la sintaxis del laboratorio que representen los DATOS del ejercicio, con los valores numéricos como parámetros con deslizador.</grafico>

${LAB_SYNTAX}

${FORMAT_RULES}`);
  try {
    const fuentes = Apuntes.last;
    const text = await ask(prompt, { fresh });
    const enunciado = getTag(text, 'enunciado');
    if (!enunciado) throw new Error('No llegó el ejercicio. Vuelve a intentarlo.');
    s.exercise = {
      fuentes,
      enunciado, pistas: getTags(text, 'pista').slice(0, 3), solucion: getTag(text, 'solucion'),
      grafico: getTag(text, 'grafico').split('\n').map(l => l.replace(/^\s*[-*]\s+/, '').replace(/`/g, '').trim()).filter(Boolean)
    };
    s.hints = 0; s.showSol = false; s.correction = ''; s.resolucion = ''; s.photo = null; s.pizarra = null; // ejercicio nuevo: se limpia también la pizarra
  } catch (e) {
    s.err.ejercicio = e.code ? aiError(e) : e.message;
  } finally {
    s.busy.ejercicio = false;
    if (key() === k && S.tab === 'ejercicios') renderEjercicios();
  }
}

export function renderEjercicios() {
  const el = $('#tab-ejercicios');
  const s = sess();
  if (!s) return;
  const niveles = ['Básico', 'Parcial', 'Examen reglamentado'];
  const nivelSel = `<select id="ej-nivel" style="width:auto">${niveles.map(n => `<option ${n === s.nivel ? 'selected' : ''}>${n}</option>`).join('')}</select>`;
  if (s.busy.ejercicio) { el.innerHTML = loadingHTML('Preparando un ejercicio tipo examen…'); return; }
  if (!s.exercise) { el.innerHTML = s.err.ejercicio ? errorBlock(s.err.ejercicio, 'nuevo-ej') : `<div class="empty"><p class="muted">Genera un ejercicio para practicar.</p><div class="btn-row">${nivelSel}<button class="btn primary" data-action="nuevo-ej">Generar ejercicio</button></div></div>`; return; }
  const ex = s.exercise;
  const hints = ex.pistas.slice(0, s.hints).map((p, i) => `<div class="hint-box"><strong>Pista ${i + 1}:</strong> ${mdInline(p)}</div>`).join('');
  const busyC = s.busy.correccion;
  el.innerHTML = `
  <div class="stack">
    <section class="panel-card">
      <div class="card-head"><h2>📌 Ejercicio guiado tipo examen</h2><div class="btn-row">${nivelSel}<button class="btn sm" data-action="nuevo-ej">↻ Nuevo ejercicio</button><button class="btn sm" data-action="pdf-ejercicio">📄 Exportar</button></div></div>
      <div class="md">${markdownToHTML(ex.enunciado)}</div>${fuentesHTML(ex.fuentes)}
      <div class="btn-row" style="margin:.9rem 0">
        <button class="btn" data-action="pista" ${s.hints >= ex.pistas.length ? 'disabled' : ''}>💡 Pedir pista (${s.hints}/${ex.pistas.length})</button>
        <button class="btn" data-action="solucion">${s.showSol ? '🙈 Ocultar solución' : '👁️ Ver solución'}</button>
        ${ex.grafico.length ? '<button class="btn" data-action="abrir-lab">📐 Abrir datos en el laboratorio</button>' : ''}
      </div>
      <div class="stack" style="gap:.6rem">${hints}</div>
      ${s.showSol ? `<div class="solution-box md" style="margin-top:.8rem"><strong>Solución</strong>${markdownToHTML(ex.solucion)}</div>` : ''}
    </section>
    <section class="panel-card">
      <h3>✍️ Tu resolución</h3>
      <p class="muted small" style="margin:.3rem 0 .6rem">Escribe tu desarrollo${AI.images ? ', sube una foto de tu hoja o dibújalo en la pizarra' : ''}. El mentor lo corrige con el criterio del profesor.</p>
      <textarea id="resolucion" rows="5" placeholder="Planteo, cálculos y conclusión…" ${busyC ? 'disabled' : ''}>${escapeHTML(s.resolucion)}</textarea>
      ${AI.images ? `<div class="photo-row" style="margin-top:.6rem">
        <label class="btn file-btn">📸 ${s.photo ? 'Cambiar foto' : 'Subir foto'}<input type="file" id="in-photo" accept="${escapeHTML(AI.imageTypes)}"></label>
        ${s.photo ? '<button class="btn ghost sm" data-action="quitar-foto">Quitar foto</button>' : ''}
        <button class="btn" data-action="pizarra-abrir" aria-expanded="${!!s.pizarra?.abierta}">✏️ ${s.pizarra?.abierta ? 'Cerrar la pizarra' : 'Dibujar en la pizarra'}</button>
      </div>
      ${s.pizarra?.abierta ? pizarraHTML(s.pizarra) : ''}
      ${s.photo ? `<div class="photo-preview"><img src="${s.photo.dataUrl}" alt="Foto de tu desarrollo manuscrito"></div>` : ''}` : ''}
      <div class="btn-row" style="margin-top:.75rem"><button class="btn primary" data-action="corregir" ${busyC ? 'disabled' : ''}>${busyC ? spinnerHTML + ' Corrigiendo…' : '🔍 Corregir mi resolución'}</button></div>
      ${s.err.correccion ? `<p class="error-text">${escapeHTML(s.err.correccion)}</p>` : ''}
      ${s.correction ? `<div class="turn-f md" style="margin-top:.9rem">${markdownToHTML(s.correction)}</div>${fuentesHTML(s.correctionFuentes)}` : ''}
    </section>
  </div>`;
  if (s.pizarra?.abierta) montarPizarra($('#pizarra-lienzo'), s.pizarra);
}

// Bloque de la pizarra (lienzo + herramientas). El dibujo se restaura desde la sesión al redibujar.
function pizarraHTML(p) {
  const herramienta = (id, texto) => `<button class="btn sm" data-action="pizarra-herramienta" data-herramienta="${id}" aria-pressed="${p.herramienta === id}">${texto}</button>`;
  return `<div class="pizarra">
        <canvas id="pizarra-lienzo" width="640" height="400" aria-label="Pizarra cuadriculada para dibujar tu desarrollo"></canvas>
        <div class="btn-row">
          ${herramienta('lapiz', '✏️ Lápiz')}${herramienta('linea', '📏 Línea')}
          <button class="btn sm ghost" data-action="pizarra-limpiar">🗑️ Limpiar</button>
          <button class="btn sm primary" data-action="pizarra-usar">📎 Usar el dibujo en la corrección</button>
        </div>
      </div>`;
}
