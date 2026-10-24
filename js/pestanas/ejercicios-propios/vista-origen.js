// HTML del ejercicio propio: elegir el origen (tutor, apuntes y libros, profesor), la lista de ejercicios
// encontrados, la carga del enunciado del profesor y, ya con el ejercicio armado, el aviso sobre la solución.
// Solo arma HTML: las acciones están en acciones-propias.js.
import { escapeHTML, loadingHTML } from '../../nucleo/utilidades.js';
import { markdownToHTML } from '../../render/markdown.js';
import { AI } from '../../ia/config-ia.js';
import { ORIGENES, propio, hayMaterialDelTema } from './estado-propio.js';

const botonOrigen = (id, actual) => `<button class="btn sm" data-action="ej-origen" data-origen="${id}" aria-pressed="${id === actual}">${ORIGENES[id].icono} ${ORIGENES[id].nombre}</button>`;
const error = msg => msg ? `<p class="error-text" role="alert">${escapeHTML(msg)}</p>` : '';

function panelTutor(nivelSel) {
  return `<p class="muted small">El tutor inventa un ejercicio tipo examen de este subtema, con pistas y solución.</p>
    <div class="btn-row">${nivelSel}<button class="btn primary" data-action="nuevo-ej">Generar ejercicio</button></div>`;
}

function itemEncontrado(e, i) {
  return `<article class="ej-encontrado">
      <p class="small muted">${escapeHTML(e.origen || 'Fuente sin nombre')}
        ${e.textual ? '<span class="pill ok">✔ Está tal cual en tu archivo</span>' : '<span class="pill warn">⚠ No lo encontré textual: revísalo contra tu archivo</span>'}
        ${e.solucionDada ? '<span class="pill accent">📝 Trae solución</span>' : ''}</p>
      <div class="md">${markdownToHTML(e.enunciado)}</div>
      <div class="btn-row"><button class="btn sm primary" data-action="ej-elegir" data-i="${i}">Practicar este</button></div>
    </article>`;
}

function panelApuntes(s, p) {
  if (!hayMaterialDelTema()) {
    return `<p class="muted small">Este tema no tiene apuntes ni capítulos de libros. Súmalos con «＋ Tema de hoy», con los apuntes de ⚙️ o con «📖 Bibliografía del tema».</p>`;
  }
  if (s.busy.buscar) return loadingHTML('Buscando ejercicios en tus apuntes y libros…');
  const lista = p.encontrados;
  return `<p class="muted small">El tutor busca los ejercicios que ya están escritos en los apuntes y libros de este tema. No inventa ninguno; cada uno se compara con tu archivo.</p>
    ${error(s.err.buscar)}
    <div class="btn-row"><button class="btn ${lista ? '' : 'primary'}" data-action="ej-buscar">🔎 ${lista ? 'Buscar de nuevo' : 'Buscar ejercicios en mis apuntes y libros'}</button></div>
    ${lista ? (lista.length ? `<div class="stack">${lista.map(itemEncontrado).join('')}</div>` : '<p class="muted">No encontré ejercicios en el material de este tema.</p>') : ''}`;
}

function panelProfesor(s, p) {
  const formatos = AI.images ? 'una foto (JPG, PNG o WEBP) o un PDF' : 'un PDF con texto (la IA configurada no lee fotos)';
  const accept = AI.images ? `${AI.imageTypes},.pdf,application/pdf` : '.pdf,application/pdf';
  if (p.leyendo) return loadingHTML(`Leyendo «${p.leyendo}»…`);
  return `<p class="muted small">Sube el enunciado como ${formatos}, o escríbelo. Revisa la transcripción antes de practicar: si el archivo trae varios ejercicios, deja solo el que vas a hacer.</p>
    ${error(s.err.profesor)}
    <div class="btn-row"><label class="btn file-btn">📎 Subir enunciado<input type="file" id="in-enunciado" accept="${escapeHTML(accept)}"></label></div>
    ${p.imagen ? `<div class="photo-preview"><img src="${p.imagen.dataUrl}" alt="Foto del enunciado del ejercicio del profesor"></div>
      <div class="btn-row"><button class="btn ghost sm" data-action="ej-quitar-imagen">Quitar foto</button></div>` : ''}
    <label class="field">Enunciado<textarea id="ep-enunciado" rows="6" placeholder="El enunciado del ejercicio…">${escapeHTML(p.enunciado)}</textarea></label>
    <details class="help" ${p.solucion ? 'open' : ''}>
      <summary>Solución oficial (opcional)</summary>
      <p class="muted small">Si el profesor o el libro dan la solución, cárgala: la corrección se hace contra ella. Si no, la arma la IA y queda marcada como no verificada.</p>
      <div class="btn-row"><label class="btn file-btn sm">📎 Subir solución<input type="file" id="in-solucion" accept="${escapeHTML(accept)},.txt,.md"></label></div>
      <textarea id="ep-solucion" rows="4" aria-label="Solución oficial" placeholder="O escríbela o pégala aquí…">${escapeHTML(p.solucion)}</textarea>
    </details>
    <div class="btn-row"><button class="btn primary" data-action="ej-preparar-profesor">Preparar ejercicio</button></div>`;
}

// Pantalla sin ejercicio: elegir de dónde sale y completar lo que haga falta.
export function vistaOrigen(s, nivelSel) {
  const p = propio(s);
  const panel = p.origen === 'apuntes' ? panelApuntes(s, p) : p.origen === 'profesor' ? panelProfesor(s, p) : panelTutor(nivelSel);
  return `<section class="panel-card">
      <div class="card-head"><h2>📝 ¿Qué ejercicio vas a practicar?</h2></div>
      <div class="btn-row origen-ejercicio" role="group" aria-label="Origen del ejercicio">${Object.keys(ORIGENES).map(id => botonOrigen(id, p.origen)).join('')}</div>
      ${error(s.err.ejercicio)}
      ${panel}
    </section>`;
}

// Ya con el ejercicio: la imagen original y de dónde salió la solución (solo en ejercicios propios).
export function extrasEjercicio(ex) {
  if (!ex.origen || ex.origen === 'tutor') return '';
  const imagen = ex.imagen ? `<div class="photo-preview"><img src="${ex.imagen.dataUrl}" alt="Enunciado original del ejercicio"></div>` : '';
  const fuente = ex.fuenteNombre ? `<p class="fuentes">📎 Ejercicio tomado de: ${escapeHTML(ex.fuenteNombre)}</p>` : '';
  const aviso = ex.solucionOrigen === 'fuente'
    ? '<p class="small"><span class="pill ok">✔ Solución de referencia: la de tu fuente</span></p>'
    : `<div class="aviso-solucion"><p class="small"><span class="pill warn">⚠ Solución armada por la IA, no verificada</span> Puede tener errores. Si tienes la del profesor o la del libro, cárgala y la corrección se hace contra ella.</p>
        <details class="help"><summary>Cargar la solución oficial</summary>
          <textarea id="ej-sol-oficial" rows="4" aria-label="Solución oficial del ejercicio" placeholder="Pega aquí la solución oficial…"></textarea>
          <div class="btn-row"><button class="btn sm primary" data-action="ej-usar-solucion">Usar esta solución</button></div>
        </details></div>`;
  return `${imagen}${fuente}${aviso}`;
}

export const tituloEjercicio = ex => `${ORIGENES[ex.origen || 'tutor'].icono} ${ORIGENES[ex.origen || 'tutor'].titulo}`;
