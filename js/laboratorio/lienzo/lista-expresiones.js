// Panel de expresiones: crea cada fila (color, campo, borrar), muestra el resultado o el error debajo,
// convierte los parámetros numéricos en deslizadores y ofrece "＋ deslizador" para variables sin definir.
import { newId, escapeHTML } from '../../nucleo/utilidades.js';
import { isNum, isArr, isVec } from '../parser/operaciones.js';
import { analyzeLine } from '../parser/analisis-linea.js';
import { fmtNum } from '../parser/formato-numeros.js';
import { lz, COLORS } from './estado-lienzo.js';
import { draw } from './dibujo.js';

export function makeExpr(text) {
  const e = { id: newId(), text, color: COLORS[lz.colorIdx++ % COLORS.length], visible: true, slider: null };
  Object.assign(e, analyzeLine(text));
  return e;
}
export function reanalyze(e) { Object.assign(e, analyzeLine(e.text)); }
// Redibuja en el próximo cuadro de animación (agrupa varios cambios seguidos en un solo dibujo).
export function schedule() { cancelAnimationFrame(lz.raf); lz.raf = requestAnimationFrame(() => { draw(); updateMetas(); }); }

export function describeValue(e) {
  const v = e.value;
  if (v === undefined) return '';
  if (isNum(v)) return `= ${fmtNum(v)}`;
  if (isArr(v)) {
    if (v.length === 2) return `punto (${fmtNum(v[0])}, ${fmtNum(v[1])})`;
    return `(${v.map(fmtNum).join(', ')}) · en R³ no se grafica · módulo ${fmtNum(Math.hypot(...v))}`;
  }
  if (isVec(v)) return `componentes (${fmtNum(v.d[0])}, ${fmtNum(v.d[1])}) · módulo ${fmtNum(Math.hypot(...v.d))}`;
  if (v.k === 'seg') return `longitud ${fmtNum(Math.hypot(v.b[0] - v.a[0], v.b[1] - v.a[1]))}`;
  if (v.k === 'line') {
    const [dx, dy] = v.d, [ax, ay] = v.a;
    const A = dy, B = -dx, Cc = dx * ay - dy * ax;
    const sgn = n => n < 0 ? ` − ${fmtNum(-n)}` : ` + ${fmtNum(n)}`;
    const eq = `${fmtNum(A)}x${sgn(B)}y${sgn(Cc)} = 0`;
    return Math.abs(dx) > 1e-12 ? `${eq} · pendiente ${fmtNum(dy / dx)}` : `${eq} · recta vertical`;
  }
  return '';
}

export function updateMeta(e) {
  const meta = e.row?.meta;
  if (!meta) return;
  e.row.el.classList.toggle('has-error', !!(e.error || e.evalError));
  e.row.color.classList.toggle('off', !e.visible);
  const isSlider = e.kind === 'def' && e.literal?.type === 'num' && !e.evalError;
  if (isSlider) {
    const v = e.literal.v;
    if (!e.slider) e.slider = { min: Math.min(-10, Math.floor(v)), max: Math.max(10, Math.ceil(v)), step: 0.1 };
    e.slider.min = Math.min(e.slider.min, v); e.slider.max = Math.max(e.slider.max, v);
    if (!meta.querySelector('.slider')) {
      meta.innerHTML = `<div class="slider" style="--c:${e.color}">
        <input type="number" class="s-min" aria-label="Mínimo" step="any">
        <input type="range" class="s-range" aria-label="Valor de ${escapeHTML(e.name)}">
        <input type="number" class="s-max" aria-label="Máximo" step="any">
        <span class="slider-val"></span></div>`;
      const rng = meta.querySelector('.s-range'), mn = meta.querySelector('.s-min'), mx = meta.querySelector('.s-max');
      rng.addEventListener('input', () => {
        const val = Number(rng.value);
        e.text = `${e.name} = ${fmtNum(val)}`;
        e.row.input.value = e.text;
        reanalyze(e); lz.onChange(); schedule();
      });
      const setBounds = () => {
        const a = Number(mn.value), b = Number(mx.value);
        if (Number.isFinite(a) && Number.isFinite(b) && a < b) { e.slider.min = a; e.slider.max = b; e.slider.step = (b - a) > 40 ? 1 : (b - a) > 4 ? 0.1 : 0.01; }
        updateMeta(e);
      };
      mn.addEventListener('change', setBounds); mx.addEventListener('change', setBounds);
    }
    const rng = meta.querySelector('.s-range');
    rng.min = e.slider.min; rng.max = e.slider.max; rng.step = e.slider.step;
    if (document.activeElement !== rng) rng.value = v;
    const mn = meta.querySelector('.s-min'), mx = meta.querySelector('.s-max');
    if (document.activeElement !== mn) mn.value = e.slider.min;
    if (document.activeElement !== mx) mx.value = e.slider.max;
    meta.querySelector('.slider-val').textContent = `${e.name} = ${fmtNum(v)}`;
    return;
  }
  const err = e.error || e.evalError;
  if (err) {
    meta.innerHTML = `<span class="err">${escapeHTML(err)}</span>${(e.undef || []).map(n => `<button class="add-var" data-var="${escapeHTML(n)}">＋ deslizador ${escapeHTML(n)}</button>`).join('')}`;
    return;
  }
  meta.textContent = (e.kind === 'def' || e.kind === 'value') ? describeValue(e) : '';
}
export function updateMetas() { lz.exprs.forEach(updateMeta); }

export function buildRow(e) {
  const el = document.createElement('div');
  el.className = 'expr-row';
  el.innerHTML = `<button class="expr-color" style="--c:${e.color}" title="Mostrar u ocultar" aria-label="Mostrar u ocultar"></button>
    <input class="expr-input" spellcheck="false" autocapitalize="off" autocomplete="off" aria-label="Expresión">
    <button class="expr-del" aria-label="Eliminar expresión">×</button>
    <div class="expr-meta"></div>`;
  const input = el.querySelector('.expr-input');
  input.value = e.text;
  e.row = { el, input, meta: el.querySelector('.expr-meta'), color: el.querySelector('.expr-color') };
  input.addEventListener('input', () => {
    e.text = input.value;
    reanalyze(e);
    if (!(e.kind === 'def' && e.literal?.type === 'num')) e.slider = null;
    lz.onChange(); schedule();
  });
  e.row.color.addEventListener('click', () => { e.visible = !e.visible; schedule(); });
  el.querySelector('.expr-del').addEventListener('click', () => { lz.exprs = lz.exprs.filter(x => x !== e); el.remove(); lz.onChange(); schedule(); });
  e.row.meta.addEventListener('click', ev => {
    const b = ev.target.closest('[data-var]');
    if (b) insertBefore(e, `${b.dataset.var} = 1`);
  });
  return el;
}
export function renderList() {
  lz.listEl.innerHTML = '';
  if (!lz.exprs.length) lz.listEl.innerHTML = '<p class="muted small">Sin expresiones. Escribe una abajo o carga el ejemplo del tema.</p>';
  lz.exprs.forEach(e => lz.listEl.appendChild(buildRow(e)));
  draw(); updateMetas();
}
export function insertBefore(target, text) {
  const e = makeExpr(text);
  const i = lz.exprs.indexOf(target);
  lz.exprs.splice(i < 0 ? 0 : i, 0, e);
  renderList(); lz.onChange();
}
