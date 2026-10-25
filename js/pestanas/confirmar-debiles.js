// Panel de confirmación de la pestaña 1: la IA propuso puntos débiles para el resumen y acá el
// estudiante desmarca, edita texto y tipo antes de guardar. confirmarDebiles devuelve los confirmados.
import { $ } from '../nucleo/dom.js';
import { escapeHTML, limpiarTexto } from '../nucleo/utilidades.js';
import { claveTextoDebil, textosDebilesGuardados } from '../estado/debiles.js';
import { opcionesTipo } from '../estado/tipos-error.js';

let resolver = null; // promesa pendiente mientras el diálogo está abierto

const fila = (p, yaGuardado) => `<article class="confirmar-punto">
  <label class="cp-casilla"><input type="checkbox" class="cp-guardar" ${yaGuardado ? '' : 'checked'}> Guardar</label>
  ${yaGuardado ? '<span class="pill tipo">ya guardado</span>' : ''}
  <label class="field">Texto <textarea class="cp-texto" maxlength="600" rows="2">${escapeHTML(p.texto)}</textarea></label>
  <label class="field">Tipo de error <select class="cp-tipo">${opcionesTipo(p.tipo)}</select></label>
</article>`;

function render(puntos, k) {
  const ya = textosDebilesGuardados(k);
  $('#confirmar-debiles-body').innerHTML = `<p class="muted small">La IA propuso estos puntos débiles. Desmarca los que no correspondan y ajusta texto o tipo antes de guardar.</p>
    ${puntos.map(p => fila(p, ya.has(claveTextoDebil(p.texto)))).join('')}
    <div class="btn-row"><button class="btn primary" id="cp-guardar">Guardar seleccionados</button><button class="btn" id="cp-cancelar">Cancelar</button></div>`;
}

// Resuelve la promesa y cierra. resolver se limpia antes de close() para que el listener 'close' no
// la vuelva a resolver como cancelada.
function cerrarYResolve(resultado) {
  const r = resolver;
  resolver = null;
  r?.(resultado);
  $('#dlg-confirmar-debiles').close();
}

// Abre el panel y devuelve una promesa: { cancelado: true } o { confirmados: [{ texto, tipo }] }.
export function confirmarDebiles(puntos, k) {
  render(puntos, k);
  $('#dlg-confirmar-debiles').showModal();
  $('#confirmar-debiles-body .cp-guardar')?.focus();
  return new Promise(res => { resolver = res; });
}

export function iniciarConfirmarDebiles() {
  const dlg = $('#dlg-confirmar-debiles');
  $('#confirmar-debiles-body').addEventListener('click', ev => {
    if (ev.target.closest('#cp-cancelar')) { cerrarYResolve({ cancelado: true }); return; }
    if (ev.target.closest('#cp-guardar')) {
      const confirmados = [...$('#confirmar-debiles-body').querySelectorAll('.confirmar-punto')]
        .filter(f => f.querySelector('.cp-guardar').checked)
        .map(f => ({ texto: limpiarTexto(f.querySelector('.cp-texto').value, 600), tipo: f.querySelector('.cp-tipo').value }))
        .filter(p => p.texto);
      cerrarYResolve({ confirmados });
    }
  });
  // Escape o el ✕ cierran sin confirmar: se resuelve como cancelado (no guarda ni descarga).
  dlg.addEventListener('close', () => {
    if (resolver) { const r = resolver; resolver = null; r({ cancelado: true }); }
  });
}
