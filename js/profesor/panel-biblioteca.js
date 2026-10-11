// Biblioteca única de libros y capítulos (dentro del diálogo "🎓 Profesor y bibliografía").
// Cada capítulo se carga desde un archivo (.txt, .md, .pdf con texto) o pegando el texto.
// Los cambios se guardan enseguida en el documento 'biblioteca'.
import { $ } from '../nucleo/dom.js';
import { escapeHTML, spinnerHTML, limpiarTexto, newId } from '../nucleo/utilidades.js';
import { S } from '../estado/estado.js';
import { buscarLibro, guardarBiblioteca } from '../estado/profesor.js';
import { leerArchivoApunte } from '../apuntes/lector-archivos.js';

const MAX_MB = 30;
const B = { msg: '', error: false, leyendo: '' };
const aviso = (msg, error = false) => { B.msg = msg; B.error = error; };
const milCaracteres = t => `${Math.max(1, Math.round(t.length / 1000))} mil caracteres`;

function htmlLibro(l) {
  return `
    <div class="libro" data-libro="${escapeHTML(l.id)}">
      <div class="libro-head">
        <strong>📖 ${escapeHTML(l.titulo)}</strong>${l.autor ? ` <span class="muted small">· ${escapeHTML(l.autor)}</span>` : ''}
        <button type="button" class="btn ghost sm" data-bact="quitar-libro" aria-label="Quitar el libro ${escapeHTML(l.titulo)}">✕</button>
      </div>
      <div class="file-list">${l.capitulos.map(c => `
        <div class="file-item"><span>${escapeHTML(c.titulo)} <span class="muted">· ${milCaracteres(c.texto)}</span></span>
          <button type="button" class="btn ghost sm" data-bact="quitar-cap" data-cap="${escapeHTML(c.id)}" aria-label="Quitar ${escapeHTML(c.titulo)}">✕</button></div>`).join('') || '<p class="muted small">Todavía sin capítulos.</p>'}
      </div>
      <details class="nuevo-cap">
        <summary>＋ Agregar capítulo</summary>
        <label class="field">Título del capítulo<input class="cap-titulo" maxlength="150" placeholder="Ej.: Cap. 2 · Límites" autocomplete="off"></label>
        <div class="btn-row"><label class="btn file-btn sm">📁 Elegir archivo<input type="file" class="cap-archivo" accept=".txt,.md,.pdf,text/plain,text/markdown,application/pdf"></label><span class="small muted cap-nombre"></span></div>
        <textarea class="cap-texto" rows="3" placeholder="O pega aquí el texto del capítulo"></textarea>
        <div class="btn-row"><button type="button" class="btn sm primary" data-bact="agregar-cap">Agregar capítulo</button></div>
      </details>
    </div>`;
}

export function renderBiblioteca() {
  const libros = S.biblioteca.libros;
  $('#pf-biblioteca').innerHTML = `
    ${B.msg ? `<p class="small ${B.error ? 'error-text' : 'muted'}" role="status">${escapeHTML(B.msg)}</p>` : ''}
    ${B.leyendo ? `<p class="loading small">${spinnerHTML} Leyendo ${escapeHTML(B.leyendo)}…</p>` : ''}
    ${libros.map(htmlLibro).join('') || '<p class="muted small">No hay libros cargados.</p>'}
    <div class="nuevo-libro">
      <input id="pf-libro-titulo" maxlength="150" placeholder="Título del libro" aria-label="Título del libro" autocomplete="off">
      <input id="pf-libro-autor" maxlength="150" placeholder="Autor (opcional)" aria-label="Autor del libro" autocomplete="off">
      <button type="button" class="btn sm" data-bact="agregar-libro">＋ Agregar libro</button>
    </div>`;
}

// Guarda; si no entra (navegador lleno), deshace el cambio con "deshacer" y avisa.
async function guardarO(deshacer, okMsg) {
  if (await guardarBiblioteca()) { aviso(okMsg); return; }
  deshacer();
  aviso('No se pudo guardar: el almacenamiento del navegador está lleno. Prueba con capítulos más cortos.', true);
}

async function agregarCapitulo(libroEl) {
  const libro = buscarLibro(libroEl.dataset.libro);
  const titulo = limpiarTexto(libroEl.querySelector('.cap-titulo').value, 150);
  const archivo = libroEl.querySelector('.cap-archivo').files?.[0];
  const pegado = libroEl.querySelector('.cap-texto').value.trim();
  if (titulo.length < 2) { aviso('Escribe el título del capítulo.', true); return; }
  if (!archivo && pegado.length < 20) { aviso('Elige un archivo o pega el texto del capítulo.', true); return; }
  let texto = pegado;
  if (archivo) {
    if (!/\.(txt|md|pdf)$/i.test(archivo.name)) { aviso(`«${archivo.name}» no es .txt, .md ni .pdf.`, true); return; }
    if (archivo.size > MAX_MB * 1024 * 1024) { aviso(`«${archivo.name}» pesa más de ${MAX_MB} MB.`, true); return; }
    B.leyendo = archivo.name; renderBiblioteca();
    try { texto = await leerArchivoApunte(archivo); }
    catch (e) { B.leyendo = ''; aviso(e.code === 'escaneado' ? `«${archivo.name}» parece escaneado: no tiene texto para leer.` : `No pude leer «${archivo.name}».`, true); return; }
    B.leyendo = '';
  }
  const cap = { id: newId(), titulo, texto };
  libro.capitulos.push(cap);
  await guardarO(() => libro.capitulos.pop(), `Capítulo «${titulo}» agregado a ${libro.titulo}.`);
}

export function iniciarPanelBiblioteca() {
  const panel = $('#pf-biblioteca');
  panel.addEventListener('change', ev => {
    // Muestra el nombre del archivo elegido para el capítulo.
    if (ev.target.classList.contains('cap-archivo')) ev.target.closest('.libro').querySelector('.cap-nombre').textContent = ev.target.files?.[0]?.name || '';
  });
  panel.addEventListener('click', async ev => {
    const b = ev.target.closest('[data-bact]');
    if (!b) return;
    const act = b.dataset.bact, libroEl = b.closest('[data-libro]');
    const libros = S.biblioteca.libros;
    if (act === 'agregar-libro') {
      const titulo = limpiarTexto($('#pf-libro-titulo').value, 150);
      if (titulo.length < 2) { aviso('Escribe el título del libro.', true); renderBiblioteca(); return; }
      libros.push({ id: newId(), titulo, autor: limpiarTexto($('#pf-libro-autor').value, 150), capitulos: [] });
      await guardarO(() => libros.pop(), `Libro «${titulo}» agregado. Ahora súmale capítulos.`);
    }
    if (act === 'agregar-cap') await agregarCapitulo(libroEl);
    if (act === 'quitar-libro') {
      const libro = buscarLibro(libroEl.dataset.libro);
      if (!confirm(`¿Quitar «${libro.titulo}» con todos sus capítulos?`)) return;
      const i = libros.indexOf(libro);
      libros.splice(i, 1);
      await guardarO(() => libros.splice(i, 0, libro), `Quité «${libro.titulo}».`);
    }
    if (act === 'quitar-cap') {
      const libro = buscarLibro(libroEl.dataset.libro);
      const i = libro.capitulos.findIndex(c => c.id === b.dataset.cap);
      const [cap] = libro.capitulos.splice(i, 1);
      await guardarO(() => libro.capitulos.splice(i, 0, cap), `Quité «${cap.titulo}».`);
    }
    renderBiblioteca();
  });
}
