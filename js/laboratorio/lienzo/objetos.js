// Dibujo de cada expresión: curvas (vía trazado.js) y objetos (puntos, vectores con flecha, segmentos, rectas),
// con su etiqueta. Los puntos y vectores literales se registran como manijas para arrastrarlos.
import { isNum, isArr, isVec } from '../parser/operaciones.js';
import { fmtNum } from '../parser/formato-numeros.js';
import { lz, toPx } from './estado-lienzo.js';
import { plotFx, plotGy, plotImplicit } from './trazado.js';

export function drawExpr(e, C) {
  lz.ctx.strokeStyle = e.color; lz.ctx.fillStyle = e.color; lz.ctx.lineWidth = 2.5; lz.ctx.lineCap = 'round'; lz.ctx.lineJoin = 'round';
  const env = { ...lz.lastEnv };
  if (e.kind === 'fx') return plotFx(e.fn, env);
  if (e.kind === 'gy') return plotGy(e.fn, env);
  if (e.kind === 'implicit') return plotImplicit(e.fn, env);
  if (e.kind === 'def' || e.kind === 'value') {
    const v = e.value;
    if (v === undefined || isNum(v)) return;
    drawObject(v, e.color, e.kind === 'def' ? e.name : '', e, C);
  }
}

export function label(text, px, py, color, C) {
  if (!text) return;
  lz.ctx.font = '600 13px Lexend, system-ui, sans-serif';
  lz.ctx.lineWidth = 4; lz.ctx.strokeStyle = C.bg; lz.ctx.strokeText(text, px, py);
  lz.ctx.fillStyle = color; lz.ctx.fillText(text, px, py);
}
export function drawObject(v, color, name, e, C) {
  if (isArr(v)) {
    if (v.length !== 2) return;
    const [px, py] = toPx(v[0], v[1]);
    lz.ctx.beginPath(); lz.ctx.arc(px, py, 5.5, 0, Math.PI * 2); lz.ctx.fill();
    lz.ctx.lineWidth = 2; lz.ctx.strokeStyle = C.bg; lz.ctx.stroke();
    label(`${name ? name + ' ' : ''}(${fmtNum(v[0])}, ${fmtNum(v[1])})`, px + 9, py - 9, color, C);
    if (e.kind === 'def' && e.literal?.type === 'point') lz.handles.push({ e, px, py, type: 'point' });
    return;
  }
  if (isVec(v)) {
    const [x0, y0] = toPx(v.o[0], v.o[1]);
    const [x1, y1] = toPx(v.o[0] + v.d[0], v.o[1] + v.d[1]);
    lz.ctx.strokeStyle = color; lz.ctx.fillStyle = color; lz.ctx.lineWidth = 2.5;
    lz.ctx.beginPath(); lz.ctx.moveTo(x0, y0); lz.ctx.lineTo(x1, y1); lz.ctx.stroke();
    const ang = Math.atan2(y1 - y0, x1 - x0), L = 13;
    if (Math.hypot(x1 - x0, y1 - y0) > 4) {
      lz.ctx.beginPath(); lz.ctx.moveTo(x1, y1);
      lz.ctx.lineTo(x1 - L * Math.cos(ang - 0.4), y1 - L * Math.sin(ang - 0.4));
      lz.ctx.lineTo(x1 - L * Math.cos(ang + 0.4), y1 - L * Math.sin(ang + 0.4));
      lz.ctx.closePath(); lz.ctx.fill();
    }
    label(name ? `${name}` : '', (x0 + x1) / 2 + 8, (y0 + y1) / 2 - 8, color, C);
    if (e.kind === 'def' && e.literal?.type === 'vector') lz.handles.push({ e, px: x1, py: y1, type: 'vector' });
    return;
  }
  if (v.k === 'seg') {
    const [x0, y0] = toPx(v.a[0], v.a[1]), [x1, y1] = toPx(v.b[0], v.b[1]);
    lz.ctx.lineWidth = 2.5; lz.ctx.beginPath(); lz.ctx.moveTo(x0, y0); lz.ctx.lineTo(x1, y1); lz.ctx.stroke();
    label(name, (x0 + x1) / 2 + 8, (y0 + y1) / 2 - 8, color, C);
    return;
  }
  if (v.k === 'line') {
    const len = Math.hypot(v.d[0], v.d[1]);
    if (!len) return;
    const span = (Math.hypot(lz.W, lz.H) / lz.view.scale) + Math.hypot(v.a[0] - lz.view.cx, v.a[1] - lz.view.cy);
    const k = span / len;
    const [x0, y0] = toPx(v.a[0] - v.d[0] * k, v.a[1] - v.d[1] * k), [x1, y1] = toPx(v.a[0] + v.d[0] * k, v.a[1] + v.d[1] * k);
    lz.ctx.lineWidth = 2.5; lz.ctx.beginPath(); lz.ctx.moveTo(x0, y0); lz.ctx.lineTo(x1, y1); lz.ctx.stroke();
    const [lx, ly] = toPx(v.a[0], v.a[1]);
    label(name, lx + 10, ly + 18, color, C);
  }
}
