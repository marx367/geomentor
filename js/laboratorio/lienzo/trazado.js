// Trazado de curvas: y = f(x) recorriendo píxeles en x, x = g(y) en y, e implícitas F(x, y) = 0 con
// "marching squares" (busca dónde cambia el signo en una grilla de 5 px).
import { isNum } from '../parser/operaciones.js';
import { lz, toPx, toWorld } from './estado-lienzo.js';

export function plotFx(fn, env) {
  lz.ctx.beginPath();
  let pen = false, prevY = null;
  for (let px = 0; px <= lz.W; px += 1) {
    env.x = toWorld(px, 0)[0];
    let y;
    try { y = fn(env); } catch (err) { y = NaN; }
    if (!isNum(y) || !Number.isFinite(y)) { pen = false; prevY = null; continue; }
    const py = toPx(0, y)[1];
    if (Math.abs(py) > 1e5 || (prevY !== null && Math.abs(py - prevY) > lz.H * 1.2)) { pen = false; prevY = null; continue; }
    if (pen) lz.ctx.lineTo(px, py); else { lz.ctx.moveTo(px, py); pen = true; }
    prevY = py;
  }
  lz.ctx.stroke();
}
export function plotGy(fn, env) {
  lz.ctx.beginPath();
  let pen = false, prevX = null;
  for (let py = 0; py <= lz.H; py += 1) {
    env.y = toWorld(0, py)[1];
    let x;
    try { x = fn(env); } catch (err) { x = NaN; }
    if (!isNum(x) || !Number.isFinite(x)) { pen = false; prevX = null; continue; }
    const px = toPx(x, 0)[0];
    if (Math.abs(px) > 1e5 || (prevX !== null && Math.abs(px - prevX) > lz.W * 1.2)) { pen = false; prevX = null; continue; }
    if (pen) lz.ctx.lineTo(px, py); else { lz.ctx.moveTo(px, py); pen = true; }
    prevX = px;
  }
  lz.ctx.stroke();
}
export function plotImplicit(fn, env) {
  const g = 5;
  const nx = Math.ceil(lz.W / g) + 1, ny = Math.ceil(lz.H / g) + 1;
  const val = new Float64Array(nx * ny);
  for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) {
    const [x, y] = toWorld(i * g, j * g);
    env.x = x; env.y = y;
    let v;
    try { v = fn(env); } catch (err) { v = NaN; }
    val[j * nx + i] = isNum(v) ? v : NaN;
  }
  lz.ctx.beginPath();
  const lerp = (a, b) => a / (a - b);
  for (let j = 0; j < ny - 1; j++) for (let i = 0; i < nx - 1; i++) {
    const a = val[j * nx + i], b = val[j * nx + i + 1], c = val[(j + 1) * nx + i + 1], d = val[(j + 1) * nx + i];
    if (!Number.isFinite(a) || !Number.isFinite(b) || !Number.isFinite(c) || !Number.isFinite(d)) continue;
    const idx = (a > 0 ? 8 : 0) | (b > 0 ? 4 : 0) | (c > 0 ? 2 : 0) | (d > 0 ? 1 : 0);
    if (idx === 0 || idx === 15) continue;
    const x = i * g, y = j * g;
    const T = [x + g * lerp(a, b), y], R = [x + g, y + g * lerp(b, c)], B = [x + g * lerp(d, c), y + g], Lp = [x, y + g * lerp(a, d)];
    const seg = (p, q) => { lz.ctx.moveTo(p[0], p[1]); lz.ctx.lineTo(q[0], q[1]); };
    switch (idx) {
      case 1: case 14: seg(Lp, B); break;
      case 2: case 13: seg(B, R); break;
      case 3: case 12: seg(Lp, R); break;
      case 4: case 11: seg(T, R); break;
      case 5: seg(Lp, T); seg(B, R); break;
      case 6: case 9: seg(T, B); break;
      case 7: case 8: seg(Lp, T); break;
      case 10: seg(T, R); seg(Lp, B); break;
    }
  }
  lz.ctx.stroke();
}
