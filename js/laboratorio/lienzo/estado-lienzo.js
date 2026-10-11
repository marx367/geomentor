// Estado compartido del lienzo (antes eran variables internas de un solo bloque): elementos del DOM, tamaño,
// vista (centro y escala), expresiones, colores y "manijas" arrastrables. Lo llenan lienzo.js y dibujo.js.
export const lz = {
  canvas: null, ctx: null, wrap: null, listEl: null, coordsEl: null,
  W: 0, H: 0, dpr: 1,
  view: { cx: 0, cy: 0, scale: 40 },
  exprs: [], colorIdx: 0, handles: [], lastEnv: {},
  onChange: () => {}, raf: 0
};
export const COLORS = ['#3b82f6', '#ef4444', '#10b981', '#a855f7', '#f97316', '#06b6d4', '#ec4899', '#84cc16'];

// Conversión entre coordenadas del plano (x, y) y píxeles del lienzo.
export const toPx = (x, y) => [lz.W / 2 + (x - lz.view.cx) * lz.view.scale, lz.H / 2 - (y - lz.view.cy) * lz.view.scale];
export const toWorld = (px, py) => [lz.view.cx + (px - lz.W / 2) / lz.view.scale, lz.view.cy - (py - lz.H / 2) / lz.view.scale];
