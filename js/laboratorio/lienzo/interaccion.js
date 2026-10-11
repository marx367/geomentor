// Interacción con el lienzo: arrastrar manijas (puntos y puntas de vector, con ajuste a la grilla), mover la vista,
// zoom con rueda, pellizco o botones, coordenadas bajo el puntero y alta de expresiones nuevas.
import { $, $$ } from '../../nucleo/dom.js';
import { isVec } from '../parser/operaciones.js';
import { fmtNum } from '../parser/formato-numeros.js';
import { lz, toWorld } from './estado-lienzo.js';
import { niceStep, decimalsFor } from './cuadricula.js';
import { draw } from './dibujo.js';
import { makeExpr, reanalyze, schedule, renderList } from './lista-expresiones.js';

const pointers = new Map();
let drag = null;
const pos = ev => { const r = lz.canvas.getBoundingClientRect(); return { x: ev.clientX - r.left, y: ev.clientY - r.top }; };
function hit(p, tol) {
  let best = null, bd = tol;
  for (const h of lz.handles) { const d = Math.hypot(h.px - p.x, h.py - p.y); if (d <= bd) { bd = d; best = h; } }
  return best;
}
function zoomAt(p, f) {
  const [wx, wy] = toWorld(p.x, p.y);
  lz.view.scale = Math.min(4000, Math.max(2, lz.view.scale * f));
  lz.view.cx = wx - (p.x - lz.W / 2) / lz.view.scale;
  lz.view.cy = wy + (p.y - lz.H / 2) / lz.view.scale;
  draw();
}
function snap(v) {
  const st = niceStep(80 / lz.view.scale) / 10;
  const d = decimalsFor(st);
  return Number((Math.round(v / st) * st).toFixed(d));
}

export function iniciarInteraccion() {
  lz.canvas.addEventListener('pointerdown', ev => {
    lz.canvas.setPointerCapture(ev.pointerId);
    const p = pos(ev);
    pointers.set(ev.pointerId, p);
    if (pointers.size === 1) {
      const h = hit(p, ev.pointerType === 'touch' ? 24 : 13);
      drag = h ? { type: 'handle', h } : { type: 'pan', last: p };
      lz.canvas.style.cursor = h ? 'grabbing' : 'move';
    } else if (pointers.size === 2) {
      const [a, b] = [...pointers.values()];
      const mid = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
      drag = { type: 'pinch', dist: Math.hypot(a.x - b.x, a.y - b.y) || 1, scale: lz.view.scale, world: toWorld(mid.x, mid.y) };
    }
  });
  lz.canvas.addEventListener('pointermove', ev => {
    const p = pos(ev);
    const [wx, wy] = toWorld(p.x, p.y);
    const dec = decimalsFor(niceStep(80 / lz.view.scale) / 10);
    lz.coordsEl.textContent = `x = ${wx.toFixed(dec)}   y = ${wy.toFixed(dec)}`;
    if (!pointers.has(ev.pointerId)) { lz.canvas.style.cursor = hit(p, 13) ? 'grab' : 'crosshair'; return; }
    pointers.set(ev.pointerId, p);
    if (!drag) return;
    if (drag.type === 'handle') {
      const e = drag.h.e;
      let nx = snap(wx), ny = snap(wy);
      if (drag.h.type === 'vector') {
        const o = isVec(e.value) ? e.value.o : [0, 0];
        nx = snap(wx - o[0]); ny = snap(wy - o[1]);
        e.text = `${e.name} = vector(${fmtNum(nx)}, ${fmtNum(ny)})`;
      } else {
        e.text = `${e.name} = (${fmtNum(nx)}, ${fmtNum(ny)})`;
      }
      if (e.row) e.row.input.value = e.text;
      reanalyze(e); lz.onChange(); schedule();
    } else if (drag.type === 'pan') {
      lz.view.cx -= (p.x - drag.last.x) / lz.view.scale;
      lz.view.cy += (p.y - drag.last.y) / lz.view.scale;
      drag.last = p; draw();
    } else if (drag.type === 'pinch' && pointers.size >= 2) {
      const [a, b] = [...pointers.values()];
      const mid = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
      lz.view.scale = Math.min(4000, Math.max(2, drag.scale * Math.hypot(a.x - b.x, a.y - b.y) / drag.dist));
      lz.view.cx = drag.world[0] - (mid.x - lz.W / 2) / lz.view.scale;
      lz.view.cy = drag.world[1] + (mid.y - lz.H / 2) / lz.view.scale;
      draw();
    }
  });
  const endPointer = ev => {
    pointers.delete(ev.pointerId);
    if (pointers.size === 1 && drag?.type === 'pinch') drag = { type: 'pan', last: [...pointers.values()][0] };
    else if (!pointers.size) { drag = null; lz.canvas.style.cursor = 'crosshair'; }
  };
  lz.canvas.addEventListener('pointerup', endPointer);
  lz.canvas.addEventListener('pointercancel', endPointer);
  lz.canvas.addEventListener('pointerleave', () => { if (!pointers.size) lz.coordsEl.textContent = 'Arrastra para moverte · rueda o pellizco para zoom'; });
  lz.canvas.addEventListener('wheel', ev => { ev.preventDefault(); zoomAt(pos(ev), Math.exp(-ev.deltaY * 0.0015)); }, { passive: false });
  $$('.plot-zoom button').forEach(b => b.addEventListener('click', () => {
    const c = { x: lz.W / 2, y: lz.H / 2 };
    if (b.dataset.zoom === 'in') zoomAt(c, 1.4);
    else if (b.dataset.zoom === 'out') zoomAt(c, 1 / 1.4);
    else { lz.view.cx = 0; lz.view.cy = 0; lz.view.scale = 40; draw(); }
  }));

  $('#expr-add').addEventListener('submit', ev => {
    ev.preventDefault();
    const inp = $('#expr-new');
    const t = inp.value.trim();
    if (!t) return;
    lz.exprs.push(makeExpr(t));
    inp.value = '';
    renderList(); lz.onChange();
  });
}
