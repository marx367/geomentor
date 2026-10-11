// Convierte LaTeX a HTML: prueba MathJax (SVG), luego KaTeX (MathML) y, si ninguno cargó, muestra el código.
import { escapeHTML } from '../nucleo/utilidades.js';

export function renderMath(tex, display) {
  let html = null;
  if (window.__mjReady && window.MathJax && MathJax.tex2svg) {
    try { html = MathJax.tex2svg(tex, { display }).outerHTML; } catch (e) { html = null; }
  }
  if (!html && window.katex) {
    try { html = katex.renderToString(tex, { displayMode: display, throwOnError: false, output: 'mathml' }); } catch (e) { html = null; }
  }
  if (!html) html = `<code class="tex">${escapeHTML(tex)}</code>`;
  return display ? `<span class="math-block">${html}</span>` : html;
}
