// Ajuste de tamaño (alto proporcional al ancho, nítido en pantallas de alta densidad) y redibujo completo:
// fondo, cuadrícula, evaluación de todas las líneas y cada expresión visible.
import { evaluateAll } from '../parser/evaluador.js';
import { lz } from './estado-lienzo.js';
import { colorsFromCSS, drawGrid } from './cuadricula.js';
import { drawExpr } from './objetos.js';

export function resize() {
  const w = lz.wrap.clientWidth;
  if (w < 10) return;
  lz.W = w;
  lz.H = Math.max(300, Math.min(600, Math.round(lz.W * 0.72)));
  lz.dpr = window.devicePixelRatio || 1;
  lz.canvas.width = Math.round(lz.W * lz.dpr);
  lz.canvas.height = Math.round(lz.H * lz.dpr);
  lz.canvas.style.height = lz.H + 'px';
  draw();
}

export function draw() {
  if (!lz.W) return;
  const C = colorsFromCSS();
  lz.ctx.setTransform(lz.dpr, 0, 0, lz.dpr, 0, 0);
  lz.ctx.fillStyle = C.bg; lz.ctx.fillRect(0, 0, lz.W, lz.H);
  drawGrid(C);
  lz.lastEnv = evaluateAll(lz.exprs);
  lz.handles = [];
  for (const e of lz.exprs) {
    if (!e.visible || e.evalError) continue;
    try { drawExpr(e, C); } catch (err) { /* un error de dibujo no detiene al resto */ }
  }
}
