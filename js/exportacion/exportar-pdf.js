// Ficha de estudio en PDF (html2pdf, por CDN): teoría, ideas clave, chequeo, ejercicio y examen del subtema.
// Se dispara con el botón 📄 de la cabecera o con un botón data-action="pdf".
import { $ } from '../nucleo/dom.js';
import { escapeHTML, stamp, slug, today } from '../nucleo/utilidades.js';
import { S, key, sess } from '../estado/estado.js';
import { markdownToHTML, mdInline } from '../render/markdown.js';
import { registrarAccion } from '../pestanas/registro.js';
import { mentor } from '../ui/mentor.js';
import { saveFile } from './descargas.js';

export async function exportPDF() {
  if (!S.sub) { mentor('Entra a un subtema para exportar su ficha.'); return; }
  if (typeof html2pdf === 'undefined') { mentor('La librería de PDF no cargó. Revisa tu conexión y recarga la página.'); return; }
  const k = key(), c = S.cache[k], s = sess(k);
  if (!c) { mentor('Primero genera la teoría del subtema.'); return; }
  const L = 'ABCD';
  const doc = document.createElement('div');
  doc.className = 'pdf-doc';
  doc.innerHTML = `
    <h1>GeoMentor · Ficha de estudio</h1>
    <p>${escapeHTML(S.materia.nombre)} › ${escapeHTML(S.eje.nombre)} › <strong>${escapeHTML(S.sub.nombre)}</strong> · ${stamp()}</p>
    <h2>Teoría y notación</h2><div class="md">${markdownToHTML(c.teoria)}</div>
    ${c.ideas.length ? `<h2>Ideas clave</h2><ul>${c.ideas.map(i => `<li>${mdInline(i)}</li>`).join('')}</ul>` : ''}
    ${s.turns.length ? `<h2>Chequeo de comprensión (${s.comprension}%)</h2>
      ${s.entendido.length ? `<p><strong>Entendido:</strong></p><ul>${s.entendido.map(x => `<li>${mdInline(x)}</li>`).join('')}</ul>` : ''}
      ${s.falta.length ? `<p><strong>Por reforzar:</strong></p><ul>${s.falta.map(x => `<li>${mdInline(x)}</li>`).join('')}</ul>` : ''}` : ''}
    ${s.exercise ? `<h2>Ejercicio guiado</h2><div class="box md">${markdownToHTML(s.exercise.enunciado)}</div>${s.showSol ? `<p><strong>Solución</strong></p><div class="md">${markdownToHTML(s.exercise.solucion)}</div>` : ''}` : ''}
    ${s.exam?.submitted ? `<h2>Examen de práctica: ${s.exam.score}/10</h2>${s.exam.questions.map((q, i) => `
      <div class="box"><p><strong>${i + 1}.</strong> ${mdInline(q.enunciado)}</p>
      <p>Tu respuesta: ${s.exam.answers[i] !== null ? L[s.exam.answers[i]] : '-'} · Correcta: ${L[q.correcta]} ${s.exam.answers[i] === q.correcta ? '✔' : '✖'}</p>
      <p>${mdInline(q.explicacion)}</p></div>`).join('')}` : ''}`;
  doc.querySelectorAll('mjx-assistive-mml').forEach(n => n.remove());
  mentor('Generando la ficha en PDF…');
  try {
    const blob = await html2pdf().set({
      margin: 0.5, image: { type: 'jpeg', quality: 0.95 },
      html2canvas: { scale: 2, backgroundColor: '#ffffff' },
      jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' },
      pagebreak: { mode: ['css', 'legacy'], avoid: ['.box', 'li', '.math-block'] }
    }).from(doc).outputPdf('blob');
    const ok = await saveFile(blob, `ficha_${slug(S.sub.nombre)}_${today()}.pdf`);
    if (ok) mentor('Ficha exportada. Guárdala para repasar antes del examen.');
  } catch (e) {
    mentor('No se pudo generar el PDF: ' + (e?.message || 'error'));
  }
}

export function iniciarExportarPDF() {
  $('#btn-pdf').addEventListener('click', exportPDF);
  registrarAccion('pdf', exportPDF);
}
