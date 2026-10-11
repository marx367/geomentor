// Exportación a PDF (html2pdf, por CDN). generarPDF() hace lo común; cada exportación arma su contenido:
// - ficha del subtema (teoría, ideas clave, chequeo, ejercicio y examen): data-action="pdf" en Examen y ficha.
// - ejercicio actual con tu resolución y la solución: data-action="pdf-ejercicio" en Ejercicios.
import { $ } from '../nucleo/dom.js';
import { escapeHTML, stamp, slug, today } from '../nucleo/utilidades.js';
import { S, key, sess } from '../estado/estado.js';
import { markdownToHTML, mdInline } from '../render/markdown.js';
import { registrarAccion } from '../pestanas/registro.js';
import { mentor } from '../ui/mentor.js';
import { saveFile } from './descargas.js';

// Ruta del subtema actual, para el encabezado de cada PDF.
const rutaHTML = () => `<p>${escapeHTML(S.materia.nombre)} › ${escapeHTML(S.eje.nombre)} › <strong>${escapeHTML(S.sub.nombre)}</strong> · ${stamp()}</p>`;

// Convierte el HTML en un PDF (estilos de ficha-pdf.css, siempre en claro) y lo descarga.
export async function generarPDF(html, archivo, okMsg) {
  if (typeof html2pdf === 'undefined') { mentor('La librería de PDF no cargó. Revisa tu conexión y recarga la página.'); return; }
  const doc = document.createElement('div');
  doc.className = 'pdf-doc';
  doc.innerHTML = html;
  doc.querySelectorAll('mjx-assistive-mml').forEach(n => n.remove()); // texto oculto de MathJax que saldría duplicado
  mentor('Generando el PDF…');
  try {
    const blob = await html2pdf().set({
      margin: 0.5, image: { type: 'jpeg', quality: 0.95 },
      html2canvas: { scale: 2, backgroundColor: '#ffffff' },
      jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' },
      pagebreak: { mode: ['css', 'legacy'], avoid: ['.box', 'li', '.math-block', 'img'] }
    }).from(doc).outputPdf('blob');
    if (await saveFile(blob, archivo)) mentor(okMsg);
  } catch (e) {
    mentor('No se pudo generar el PDF: ' + (e?.message || 'error'));
  }
}

export async function exportPDF() {
  if (!S.sub) { mentor('Entra a un subtema para exportar su ficha.'); return; }
  const k = key(), c = S.cache[k], s = sess(k);
  if (!c) { mentor('Primero genera la teoría del subtema.'); return; }
  const L = 'ABCD';
  const html = `
    <h1>GeoMentor · Ficha de estudio</h1>
    ${rutaHTML()}
    <h2>Teoría y notación</h2><div class="md">${markdownToHTML(c.teoria)}</div>
    ${c.ideas.length ? `<h2>Ideas clave</h2><ul>${c.ideas.map(i => `<li>${mdInline(i)}</li>`).join('')}</ul>` : ''}
    ${s.turns.length ? `<h2>Chequeo de comprensión (${s.comprension}%)</h2>
      ${s.entendido.length ? `<p><strong>Entendido:</strong></p><ul>${s.entendido.map(x => `<li>${mdInline(x)}</li>`).join('')}</ul>` : ''}
      ${s.falta.length ? `<p><strong>Por reforzar:</strong></p><ul>${s.falta.map(x => `<li>${mdInline(x.texto)}</li>`).join('')}</ul>` : ''}` : ''}
    ${s.exercise ? `<h2>Ejercicio guiado</h2><div class="box md">${markdownToHTML(s.exercise.enunciado)}</div>${s.showSol ? `<p><strong>Solución</strong></p><div class="md">${markdownToHTML(s.exercise.solucion)}</div>` : ''}` : ''}
    ${s.exam?.submitted ? `<h2>Examen de práctica: ${s.exam.score}/10</h2>${s.exam.questions.map((q, i) => `
      <div class="box"><p><strong>${i + 1}.</strong> ${mdInline(q.enunciado)}</p>
      <p>Tu respuesta: ${s.exam.answers[i] !== null ? L[s.exam.answers[i]] : '-'} · Correcta: ${L[q.correcta]} ${s.exam.answers[i] === q.correcta ? '✔' : '✖'}</p>
      <p>${mdInline(q.explicacion)}</p></div>`).join('')}` : ''}`;
  await generarPDF(html, `ficha_${slug(S.sub.nombre)}_${today()}.pdf`, 'Ficha exportada. Guárdala para repasar antes del examen.');
}

// Ejercicio actual: enunciado, pistas vistas, tu resolución (texto y foto o pizarra), corrección y solución.
export async function exportarEjercicioPDF() {
  const s = sess();
  if (!s?.exercise) { mentor('Primero genera un ejercicio.'); return; }
  s.resolucion = $('#resolucion')?.value ?? s.resolucion; // lo escrito todavía puede no estar en la sesión
  const ex = s.exercise;
  const html = `
    <h1>GeoMentor · Ejercicio (${escapeHTML(s.nivel)})</h1>
    ${rutaHTML()}
    <h2>Enunciado</h2><div class="box md">${markdownToHTML(ex.enunciado)}</div>
    ${s.hints ? `<h2>Pistas usadas</h2><ol>${ex.pistas.slice(0, s.hints).map(p => `<li>${mdInline(p)}</li>`).join('')}</ol>` : ''}
    <h2>Tu resolución</h2>
    ${s.resolucion.trim() ? `<div class="box">${escapeHTML(s.resolucion).replace(/\n/g, '<br>')}</div>` : ''}
    ${s.photo?.dataUrl ? `<img src="${s.photo.dataUrl}" alt="Desarrollo a mano">` : ''}
    ${!s.resolucion.trim() && !s.photo ? '<p>(Sin resolución escrita.)</p>' : ''}
    ${s.correction ? `<h2>Corrección del mentor</h2><div class="md">${markdownToHTML(s.correction)}</div>` : ''}
    <h2>Solución</h2><div class="md">${markdownToHTML(ex.solucion)}</div>`;
  await generarPDF(html, `ejercicio_${slug(S.sub.nombre)}_${today()}.pdf`, 'Ejercicio exportado.');
}

export function iniciarExportarPDF() {
  registrarAccion('pdf', exportPDF);
  registrarAccion('pdf-ejercicio', exportarEjercicioPDF);
}
