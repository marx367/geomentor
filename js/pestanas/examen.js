// Pestaña 4 · Examen tipo test: pide 5 preguntas de opción múltiple (con explicación de cada opción)
// y dibuja el examen, el resultado con barra de nota y las explicaciones al entregar.
import { $ } from '../nucleo/dom.js';
import { loadingHTML, errorBlock } from '../nucleo/utilidades.js';
import { getTag, getTags } from '../nucleo/etiquetas-xml.js';
import { normalizarTipo, TIPOS_ERROR } from '../estado/tipos-error.js';
import { S, key, sess } from '../estado/estado.js';
import { mdInline } from '../render/markdown.js';
import { ask } from '../ia/cliente-ia.js';
import { aiError } from '../ia/errores-ia.js';
import { Apuntes } from '../contexto/busqueda-apuntes.js';
import { header, fitPrompt } from '../contexto/cabecera-prompt.js';
import { fuentesHTML } from '../contexto/fuentes.js';
import { FORMAT_RULES } from '../contexto/reglas-prompt.js';

export async function generarExamen(fresh) {
  const k = key(), s = sess(k);
  s.busy.examen = true; s.err.examen = '';
  renderExamen();
  const prompt = fitPrompt(b => `${header(b)}

TAREA: crea un examen de práctica de 5 preguntas de opción múltiple (una sola correcta) sobre el subtema. Mezcla cálculo y concepto. Los distractores deben salir de errores típicos de estudiantes. Distribuye la letra correcta entre A, B, C y D. Si hay puntos débiles guardados, al menos 2 preguntas deben evaluarlos. Opciones breves.
Formato EXACTO, repetido 5 veces:
<pregunta>
<enunciado>...</enunciado>
<a>...</a>
<b>...</b>
<c>...</c>
<d>...</d>
<correcta>LETRA</correcta>
<explicacion>Por qué la correcta es correcta, con el cálculo clave (1 o 2 frases).</explicacion>
<tipo>Tipo de error que revela fallar esta pregunta. SOLO uno de estos ids: ${Object.keys(TIPOS_ERROR).join(', ')}.</tipo>
<por_que_a>Por qué A es correcta o incorrecta (1 frase).</por_que_a>
<por_que_b>...</por_que_b>
<por_que_c>...</por_que_c>
<por_que_d>...</por_que_d>
</pregunta>

${FORMAT_RULES}`);
  try {
    const fuentes = Apuntes.last;
    const text = await ask(prompt, { fresh });
    const qs = getTags(text, 'pregunta').map(block => ({
      enunciado: getTag(block, 'enunciado'),
      opciones: ['a', 'b', 'c', 'd'].map(l => getTag(block, l)),
      correcta: 'ABCD'.indexOf((getTag(block, 'correcta').trim().toUpperCase().match(/[ABCD]/) || [''])[0]),
      explicacion: getTag(block, 'explicacion'),
      tipo: normalizarTipo(getTag(block, 'tipo')),
      porQue: ['a', 'b', 'c', 'd'].map(l => getTag(block, 'por_que_' + l))
    })).filter(q => q.enunciado && q.opciones.every(Boolean) && q.correcta >= 0);
    if (qs.length < 3) throw new Error('El examen llegó incompleto. Vuelve a generarlo.');
    s.exam = { fuentes, questions: qs.slice(0, 5), answers: Array(Math.min(5, qs.length)).fill(null), submitted: false, score: 0 };
  } catch (e) {
    s.err.examen = e.code ? aiError(e) : e.message;
  } finally {
    s.busy.examen = false;
    if (key() === k && S.tab === 'examen') renderExamen();
  }
}

// Hoja de errores del subtema (exportacion/dialogo-hoja.js): arriba de la pestaña siempre, y también junto a la ficha PDF.
const BOTON_HOJA = '<button class="btn" data-action="hoja-errores">📝 Hoja de errores</button>';
const BARRA_HOJA = `<div class="btn-row hoja-barra">${BOTON_HOJA}</div>`;

export function renderExamen() {
  const el = $('#tab-examen');
  const s = sess();
  if (!s) return;
  if (s.busy.examen) { el.innerHTML = BARRA_HOJA + loadingHTML('Armando tu examen de práctica…'); return; }
  if (!s.exam) { el.innerHTML = BARRA_HOJA + errorBlock(s.err.examen || 'Genera un examen de práctica de 5 preguntas.', 'nuevo-exam', s.err.examen ? 'Reintentar' : 'Generar examen'); return; }
  const ex = s.exam;
  const L = 'ABCD';
  const answered = ex.answers.filter(a => a !== null).length;
  const n = ex.questions.length;
  const score = ex.score;
  const band = score >= 7 ? 'high' : score >= 4 ? 'mid' : 'low';
  const wrong = ex.submitted ? ex.questions.filter((q, i) => ex.answers[i] !== q.correcta).length : 0;

  const result = ex.submitted ? `
    <section class="result-card">
      <h3>Resultado del examen de práctica</h3>
      <div class="grade">${score.toFixed(1).replace('.0', '')} / 10</div>
      <div class="score-bar ${band}" role="progressbar" aria-valuemin="0" aria-valuemax="10" aria-valuenow="${score}"><span style="width:${score * 10}%"></span></div>
      <p class="muted" style="margin-top:.6rem">${n - wrong} de ${n} correctas. ${score >= 7 ? '¡Muy bien!' : score >= 4 ? 'Vas en camino: repasa las explicaciones.' : 'Conviene volver a la teoría antes de reintentar.'}</p>
    </section>` : '';

  const questions = ex.questions.map((q, i) => {
    const chosen = ex.answers[i];
    const opts = q.opciones.map((o, j) => {
      let cls = 'opt';
      if (!ex.submitted && chosen === j) cls += ' selected';
      if (ex.submitted && j === q.correcta) cls += ' correct';
      if (ex.submitted && chosen === j && j !== q.correcta) cls += ' wrong';
      return `<button class="${cls}" data-action="opt" data-q="${i}" data-o="${j}" ${ex.submitted ? 'disabled' : ''} aria-pressed="${chosen === j}"><span class="letter">${L[j]})</span><span>${mdInline(o)}</span></button>`;
    }).join('');
    let explain = '';
    if (ex.submitted) {
      const ok = chosen === q.correcta;
      explain = `<div class="explain">
        <p class="${ok ? 'good' : 'badx'}"><strong>${ok ? '✔ ¡Correcto!' : `✖ Respuesta correcta: ${L[q.correcta]}`}</strong> ${mdInline(q.explicacion)}</p>
        ${!ok && chosen !== null && q.porQue[chosen] ? `<p class="muted"><strong>Tu elección (${L[chosen]}):</strong> ${mdInline(q.porQue[chosen])}</p>` : ''}
      </div>`;
    }
    return `<section class="q-card"><p class="q-title"><span>${i + 1}.</span><span>${mdInline(q.enunciado)}</span></p><div class="opts">${opts}</div>${explain}</section>`;
  }).join('');

  const foot = ex.submitted
    ? `<div class="btn-row">
        <button class="btn primary" data-action="reintentar">↺ Reintentar examen</button>
        <button class="btn" data-action="nuevo-exam">Nuevo examen</button>
        ${wrong ? `<button class="btn" data-action="guardar-errores" ${ex.savedErrors ? 'disabled' : ''}>${ex.savedErrors ? '✔ Errores guardados' : '📌 Guardar mis errores como puntos débiles'}</button>` : ''}
        <button class="btn" data-action="pdf">📄 Exportar ficha PDF</button>
        ${BOTON_HOJA}
      </div>`
    : `<div class="btn-row"><button class="btn primary" data-action="entregar" ${answered < n ? 'disabled' : ''}>Entregar examen (${answered}/${n})</button></div>`;

  el.innerHTML = `<div class="stack">${BARRA_HOJA}${fuentesHTML(ex.fuentes)}${result}${questions}<div class="exam-foot">${foot}</div></div>`;
}
