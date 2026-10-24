// Diálogo "📖 Bibliografía del tema" (en la vista del subtema): marca qué capítulos de la biblioteca
// corresponden al subtema abierto. Lo elegido va a S.sub.fuentes (Mi curso) y se guarda enseguida.
// Hasta ahora los capítulos solo se elegían al crear el tema en «＋ Tema de hoy».
import { $ } from '../nucleo/dom.js';
import { escapeHTML } from '../nucleo/utilidades.js';
import { S } from '../estado/estado.js';
import { guardarCurso } from '../estado/curso.js';

const valor = (libroId, capId) => `${libroId}|${capId}`;

function render() {
  $('#bt-subtema').textContent = S.sub?.nombre || '';
  const libros = S.biblioteca.libros.filter(l => l.capitulos.length);
  const elegidos = new Set((S.sub?.fuentes || []).map(f => valor(f.libroId, f.capId)));
  $('#bt-lista').innerHTML = libros.length
    ? libros.map(l => `<fieldset class="pregunta"><legend>📖 ${escapeHTML(l.titulo)}${l.autor ? ` · ${escapeHTML(l.autor)}` : ''}</legend>
        ${l.capitulos.map(c => `<label class="opcion"><input type="checkbox" class="bt-cap" value="${escapeHTML(valor(l.id, c.id))}" ${elegidos.has(valor(l.id, c.id)) ? 'checked' : ''}> ${escapeHTML(c.titulo)}</label>`).join('')}
      </fieldset>`).join('')
    : `<p class="muted small">Todavía no cargaste libros. Agrégalos en la biblioteca y vuelve acá para asociarlos a este tema.</p>
       <div class="btn-row"><button type="button" class="btn sm" data-abrir="profesor">🎓 Abrir Profesor y bibliografía</button></div>`;
}

export function abrirBiblioTema() {
  if (!S.sub) return;
  $('#bt-guardado').textContent = '';
  render();
  $('#dlg-biblio-tema').showModal();
}

export function iniciarDialogoBiblioTema() {
  $('#bt-lista').addEventListener('change', async ev => {
    if (!ev.target.classList.contains('bt-cap') || !S.sub) return;
    const anteriores = S.sub.fuentes;
    S.sub.fuentes = [...$('#bt-lista').querySelectorAll('.bt-cap:checked')].map(x => {
      const [libroId, capId] = x.value.split('|');
      return { libroId, capId };
    });
    // Si el guardado falla, se vuelve a lo que había: la memoria no queda distinta de lo guardado.
    if (await guardarCurso()) {
      $('#bt-guardado').textContent = 'Guardado. Lo nuevo se usa desde el próximo pedido; para la teoría ya generada, toca ↻ Regenerar.';
    } else {
      S.sub.fuentes = anteriores;
      $('#bt-guardado').textContent = 'No pude guardar el cambio. Vuelve a intentarlo.';
      render();
    }
  });
  // Al abrir la biblioteca desde acá, este diálogo se cierra para no quedar uno encima del otro.
  $('#bt-lista').addEventListener('click', ev => { if (ev.target.closest('[data-abrir="profesor"]')) $('#dlg-biblio-tema').close(); });
}
