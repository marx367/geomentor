// Muestra un número con hasta 4 decimales (0 para valores casi nulos, «indefinido» si no es finito).
export function fmtNum(v) {
  if (!Number.isFinite(v)) return 'indefinido';
  if (Math.abs(v) < 1e-10) return '0';
  const r = Math.round(v * 1e4) / 1e4;
  return String(r);
}
