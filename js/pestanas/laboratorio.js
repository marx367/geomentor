// Pestaña 2 · Laboratorio: botones de ejemplos (tema, ejercicio, vaciar) y "Explicar lo que veo",
// que manda a la IA la descripción del gráfico actual.
import { $ } from '../nucleo/dom.js';
import { escapeHTML, loadingHTML } from '../nucleo/utilidades.js';
import { S, key, sess } from '../estado/estado.js';
import { markdownToHTML } from '../render/markdown.js';
import { ask } from '../ia/cliente-ia.js';
import { aiReady } from '../ia/config-ia.js';
import { aiError } from '../ia/errores-ia.js';
import { Apuntes } from '../contexto/busqueda-apuntes.js';
import { header, fitPrompt } from '../contexto/cabecera-prompt.js';
import { fuentesHTML } from '../contexto/fuentes.js';
import { mentor } from '../ui/mentor.js';
import { Lab } from '../laboratorio/lienzo/lienzo.js';

export function renderLabPresets() {
  const s = sess(), c = S.cache[key()];
  const el = $('#lab-presets');
  if (!s) return;
  el.innerHTML = `
    <button class="btn sm" data-lab="tema" ${c?.grafico?.length ? '' : 'disabled'}>📘 Ejemplo del tema</button>
    <button class="btn sm" data-lab="ejercicio" ${s.exercise?.grafico?.length ? '' : 'disabled'}>📝 Datos del ejercicio</button>
    <button class="btn sm ghost" data-lab="vaciar">Vaciar</button>`;
}
export function renderAnalysis() {
  const s = sess();
  const el = $('#lab-analysis');
  if (!s) return;
  if (s.busy.analisis) { el.innerHTML = loadingHTML('Analizando el gráfico…'); return; }
  el.innerHTML = s.err.analisis ? `<p class="error-text">${escapeHTML(s.err.analisis)}</p>` : s.analysis ? `<div class="turn-f md">${markdownToHTML(s.analysis)}</div>${fuentesHTML(s.analysisFuentes)}` : '';
  $('#lab-analyze').disabled = !aiReady();
}
export async function analizarGrafico() {
  const k = key(), s = sess(k);
  const desc = Lab.describe();
  if (!desc.trim()) { mentor('Agrega alguna expresión al laboratorio para que pueda explicarla.'); return; }
  s.busy.analisis = true; s.err.analisis = '';
  renderAnalysis();
  const prompt = fitPrompt(b => `${header(Math.min(b, 6000))}

El estudiante está usando un graficador interactivo. Estas son las expresiones y sus valores actuales (entre corchetes, lo que calcula el graficador):
${desc}

TAREA: en 120 a 220 palabras explica qué se ve en el gráfico, cómo influye cada parámetro en la figura y qué conexión tiene con el subtema. Termina con una propuesta concreta del tipo «prueba a cambiar k a 3 y observa…».
Responde con Markdown simple y LaTeX ($...$), sin etiquetas.`);
  try {
    s.analysisFuentes = Apuntes.last;
    s.analysis = await ask(prompt, { fresh: true });
  } catch (e) {
    s.err.analisis = e.code ? aiError(e) : e.message;
  } finally {
    s.busy.analisis = false;
    if (key() === k) renderAnalysis();
  }
}
