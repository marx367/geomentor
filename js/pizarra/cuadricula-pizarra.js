// Fondo de la pizarra: cuadrícula cada 25 px y ejes x, y con el origen O, con los colores del tema (--plot-*).
const PASO = 25;

export function coloresPizarra() {
  const cs = getComputedStyle(document.documentElement);
  const g = n => cs.getPropertyValue(n).trim();
  return { fondo: g('--plot-bg'), grilla: g('--plot-major'), ejes: g('--plot-axis'), trazo: g('--accent') };
}

export function dibujarCuadricula(ctx, ancho, alto) {
  const c = coloresPizarra();
  // Origen centrado y alineado a la grilla
  const cx = Math.round(ancho / 2 / PASO) * PASO;
  const cy = Math.round(alto / 2 / PASO) * PASO;

  ctx.clearRect(0, 0, ancho, alto);
  ctx.fillStyle = c.fondo;
  ctx.fillRect(0, 0, ancho, alto);

  ctx.strokeStyle = c.grilla;
  ctx.lineWidth = 1;
  for (let x = 0.5; x <= ancho; x += PASO) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, alto); ctx.stroke(); }
  for (let y = 0.5; y <= alto; y += PASO) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(ancho, y); ctx.stroke(); }

  ctx.strokeStyle = c.ejes;
  ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(0, cy); ctx.lineTo(ancho, cy); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(cx, 0); ctx.lineTo(cx, alto); ctx.stroke();

  ctx.fillStyle = c.ejes;
  ctx.font = '12px "Atkinson Hyperlegible Next", system-ui, sans-serif';
  ctx.fillText('x', ancho - 12, cy - 6);
  ctx.fillText('y', cx + 6, 12);
  ctx.fillText('O', cx + 4, cy + 14);
}
