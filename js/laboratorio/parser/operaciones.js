// Tipos de valor del laboratorio y sus operaciones: números, puntos/vectores de Rⁿ, vectores con origen,
// segmentos y rectas. callSpecial() resuelve vector(), recta(), norma(), angulo(), cruz()…
// Tipos de valor: número · arreglo (punto o vector de R^n) · {k:'vec', o, d} · {k:'seg', a, b} · {k:'line', a, d}
export const isNum = v => typeof v === 'number';
export const isArr = v => Array.isArray(v);
export const isVec = v => v && v.k === 'vec';
export const comps = v => isArr(v) ? v : isVec(v) ? v.d : null;
export const vec = (o, d) => ({ k: 'vec', o, d });
export function need2(v, what) { if (!isArr(v) || v.length !== 2) throw new Error(`${what} necesita un punto del plano (x, y).`); return v; }

export const OPS = {
  '+'(a, b) {
    if (isNum(a) && isNum(b)) return a + b;
    if (isArr(a) && isArr(b) && a.length === b.length) return a.map((x, i) => x + b[i]);
    if (isVec(a) && isVec(b)) return vec(a.o, [a.d[0] + b.d[0], a.d[1] + b.d[1]]);
    if (isArr(a) && isVec(b) && a.length === 2) return [a[0] + b.d[0], a[1] + b.d[1]];
    if (isVec(a) && isArr(b) && b.length === 2) return [b[0] + a.d[0], b[1] + a.d[1]];
    throw new Error('No se puede sumar un número con un punto o vector.');
  },
  '-'(a, b) {
    if (isNum(a) && isNum(b)) return a - b;
    if (isArr(a) && isArr(b) && a.length === b.length) return a.length === 2 ? vec(b, [a[0] - b[0], a[1] - b[1]]) : a.map((x, i) => x - b[i]);
    if (isVec(a) && isVec(b)) return vec(a.o, [a.d[0] - b.d[0], a.d[1] - b.d[1]]);
    if (isArr(a) && isVec(b) && a.length === 2) return [a[0] - b.d[0], a[1] - b.d[1]];
    throw new Error('Resta no válida entre esos objetos.');
  },
  '*'(a, b) {
    if (isNum(a) && isNum(b)) return a * b;
    if (isNum(a) && isArr(b)) return b.map(x => a * x);
    if (isArr(a) && isNum(b)) return a.map(x => x * b);
    if (isNum(a) && isVec(b)) return vec(b.o, b.d.map(x => a * x));
    if (isVec(a) && isNum(b)) return vec(a.o, a.d.map(x => x * b));
    const ca = comps(a), cb = comps(b);
    if (ca && cb && ca.length === cb.length) return ca.reduce((s, x, i) => s + x * cb[i], 0);
    throw new Error('Producto no válido entre esos objetos.');
  },
  '/'(a, b) {
    if (isNum(a) && isNum(b)) return a / b;
    if (isArr(a) && isNum(b)) return a.map(x => x / b);
    if (isVec(a) && isNum(b)) return vec(a.o, a.d.map(x => x / b));
    throw new Error('Solo se puede dividir entre un número.');
  },
  '^'(a, b) {
    if (isNum(a) && isNum(b)) return Math.pow(a, b);
    throw new Error('Las potencias solo se aplican a números.');
  }
};
export function negV(v) {
  if (isNum(v)) return -v;
  if (isArr(v)) return v.map(x => -x);
  if (isVec(v)) return vec(v.o, v.d.map(x => -x));
  throw new Error('No se puede cambiar el signo de ese objeto.');
}
export function callSpecial(f, args) {
  const nums = args.every(isNum);
  switch (f) {
    case 'vector':
      if (args.length === 2 && nums) return vec([0, 0], args);
      if (args.length === 2 && isArr(args[0]) && isArr(args[1])) { const a = need2(args[0], 'vector'), b = need2(args[1], 'vector'); return vec(a, [b[0] - a[0], b[1] - a[1]]); }
      if (args.length === 1 && isArr(args[0])) return args[0].length === 2 ? vec([0, 0], args[0]) : args[0];
      if (args.length === 1 && isVec(args[0])) return args[0];
      if (args.length === 3 && nums) return args;
      throw new Error('Usa vector(a, b) o vector(A, B).');
    case 'punto': case 'point':
      if (nums && (args.length === 2 || args.length === 3)) return args;
      throw new Error('Usa punto(x, y).');
    case 'segmento': case 'segment':
      if (args.length === 2) return { k: 'seg', a: need2(args[0], 'segmento'), b: need2(args[1], 'segmento') };
      throw new Error('Usa segmento(A, B).');
    case 'recta': case 'line': {
      if (args.length !== 2) throw new Error('Usa recta(A, B) o recta(A, u).');
      const a = need2(args[0], 'recta');
      const d = isVec(args[1]) ? args[1].d : (() => { const b = need2(args[1], 'recta'); return [b[0] - a[0], b[1] - a[1]]; })();
      return { k: 'line', a, d };
    }
    case 'norma': case 'modulo': {
      const c = comps(args[0]);
      if (!c) { if (isNum(args[0])) return Math.abs(args[0]); throw new Error('norma() necesita un vector.'); }
      return Math.hypot(...c);
    }
    case 'angulo': {
      const a = comps(args[0]), b = comps(args[1]);
      if (!a || !b || a.length !== b.length) throw new Error('angulo(u, v) necesita dos vectores de la misma dimensión.');
      const dot = a.reduce((s, x, i) => s + x * b[i], 0);
      return Math.acos(Math.max(-1, Math.min(1, dot / (Math.hypot(...a) * Math.hypot(...b))))) * 180 / Math.PI;
    }
    case 'cruz': case 'cross': {
      const a = comps(args[0]), b = comps(args[1]);
      if (!a || !b) throw new Error('cruz(u, v) necesita dos vectores.');
      if (a.length === 2 && b.length === 2) return a[0] * b[1] - a[1] * b[0];
      if (a.length === 3 && b.length === 3) return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
      throw new Error('cruz(u, v) necesita vectores de R³.');
    }
    case 'min': if (nums && args.length) return Math.min(...args); break;
    case 'max': if (nums && args.length) return Math.max(...args); break;
  }
  throw new Error(`${f}() recibió argumentos no válidos.`);
}
