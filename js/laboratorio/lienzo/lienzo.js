// Punto de entrada del lienzo: toma los elementos del DOM, conecta la interacción y expone la API Lab
// que usan las pestañas (cargar líneas, leerlas, describirlas para la IA, redibujar).
import { $ } from '../../nucleo/dom.js';
import { lz } from './estado-lienzo.js';
import { resize, draw } from './dibujo.js';
import { makeExpr, renderList, describeValue } from './lista-expresiones.js';
import { iniciarInteraccion } from './interaccion.js';

export function iniciarLienzo() {
  lz.canvas = $('#plot');
  lz.ctx = lz.canvas.getContext('2d');
  lz.wrap = $('#plot-wrap');
  lz.listEl = $('#expr-list');
  lz.coordsEl = $('#plot-coords');
  iniciarInteraccion();
  new ResizeObserver(() => resize()).observe(lz.wrap);
  // Si cambia el tema claro/oscuro del sistema, se redibuja con los colores nuevos.
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener?.('change', () => draw());
}

export const Lab = {
  setLines(lines) { lz.colorIdx = 0; lz.exprs = (lines || []).map(makeExpr); lz.view.cx = 0; lz.view.cy = 0; lz.view.scale = 40; renderList(); },
  getLines() { return lz.exprs.map(e => e.text); },
  // Texto para la IA: cada expresión con su valor calculado, errores y si está oculta.
  describe() {
    return lz.exprs.map(e => {
      const d = (e.kind === 'def' || e.kind === 'value') ? describeValue(e) : '';
      return `${e.text}${d ? `   [${d}]` : ''}${e.evalError || e.error ? `   [error: ${e.evalError || e.error}]` : ''}${e.visible ? '' : '   [oculta]'}`;
    }).join('\n');
  },
  onChange(fn) { lz.onChange = fn; },
  resize, draw
};
