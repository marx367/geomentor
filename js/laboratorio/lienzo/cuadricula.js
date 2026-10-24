// Cuadrícula, ejes y números de escala. Los colores salen de las variables CSS del tema (--plot-*).
import { lz, toPx, toWorld } from './estado-lienzo.js';

export function niceStep(raw) {
  const p = Math.pow(10, Math.floor(Math.log10(raw)));
  for (const m of [1, 2, 5, 10]) if (m * p >= raw) return m * p;
  return 10 * p;
}
export const decimalsFor = step => Math.max(0, -Math.floor(Math.log10(step) + 1e-9));

export function colorsFromCSS() {
  const cs = getComputedStyle(document.documentElement);
  const g = n => cs.getPropertyValue(n).trim();
  return { bg: g('--plot-bg'), minor: g('--plot-minor'), major: g('--plot-major'), axis: g('--plot-axis'), label: g('--plot-label'), font: '12px "Atkinson Hyperlegible Next", system-ui, sans-serif' };
}

export function drawGrid(C) {
  const step = niceStep(80 / lz.view.scale);
  const minor = step / (String(step).startsWith('2') ? 4 : 5);
  const [x0, y1] = toWorld(0, 0), [x1, y0] = toWorld(lz.W, lz.H);
  lz.ctx.lineWidth = 1;
  if (minor * lz.view.scale >= 9) {
    lz.ctx.strokeStyle = C.minor; lz.ctx.beginPath();
    for (let i = Math.ceil(x0 / minor); i <= Math.floor(x1 / minor); i++) { const px = Math.round(toPx(i * minor, 0)[0]) + .5; lz.ctx.moveTo(px, 0); lz.ctx.lineTo(px, lz.H); }
    for (let i = Math.ceil(y0 / minor); i <= Math.floor(y1 / minor); i++) { const py = Math.round(toPx(0, i * minor)[1]) + .5; lz.ctx.moveTo(0, py); lz.ctx.lineTo(lz.W, py); }
    lz.ctx.stroke();
  }
  lz.ctx.strokeStyle = C.major; lz.ctx.beginPath();
  for (let i = Math.ceil(x0 / step); i <= Math.floor(x1 / step); i++) { const px = Math.round(toPx(i * step, 0)[0]) + .5; lz.ctx.moveTo(px, 0); lz.ctx.lineTo(px, lz.H); }
  for (let i = Math.ceil(y0 / step); i <= Math.floor(y1 / step); i++) { const py = Math.round(toPx(0, i * step)[1]) + .5; lz.ctx.moveTo(0, py); lz.ctx.lineTo(lz.W, py); }
  lz.ctx.stroke();

  const [ax, ay] = toPx(0, 0);
  lz.ctx.strokeStyle = C.axis; lz.ctx.lineWidth = 1.5; lz.ctx.beginPath();
  if (ay >= 0 && ay <= lz.H) { lz.ctx.moveTo(0, ay); lz.ctx.lineTo(lz.W, ay); }
  if (ax >= 0 && ax <= lz.W) { lz.ctx.moveTo(ax, 0); lz.ctx.lineTo(ax, lz.H); }
  lz.ctx.stroke();

  lz.ctx.fillStyle = C.label; lz.ctx.font = C.font;
  const dec = decimalsFor(step);
  const ly = Math.min(Math.max(ay + 14, 14), lz.H - 4);
  lz.ctx.textAlign = 'center';
  for (let i = Math.ceil(x0 / step); i <= Math.floor(x1 / step); i++) {
    if (i === 0) continue;
    const [px] = toPx(i * step, 0);
    lz.ctx.fillText((i * step).toFixed(dec), px, ly);
  }
  const lx = Math.min(Math.max(ax - 6, 30), lz.W - 4);
  lz.ctx.textAlign = 'right';
  for (let i = Math.ceil(y0 / step); i <= Math.floor(y1 / step); i++) {
    if (i === 0) continue;
    const [, py] = toPx(0, i * step);
    lz.ctx.fillText((i * step).toFixed(dec), lx, py + 4);
  }
  if (ax >= 0 && ax <= lz.W && ay >= 0 && ay <= lz.H) { lz.ctx.textAlign = 'right'; lz.ctx.fillText('0', ax - 5, ay + 14); }
  lz.ctx.textAlign = 'left';
  if (ay >= 0 && ay <= lz.H) lz.ctx.fillText('x', lz.W - 14, ay - 6);
  if (ax >= 0 && ax <= lz.W) lz.ctx.fillText('y', ax + 6, 14);
}
