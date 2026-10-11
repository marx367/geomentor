// Árbol → función evaluable (compile) y evaluación de todas las líneas en orden, resolviendo dependencias
// entre definiciones (evaluateAll). UndefErr marca una variable todavía no definida.
import { FUNCS } from './funciones.js';
import { varsOf } from './parser.js';
import { isNum, OPS, negV, callSpecial } from './operaciones.js';

export class UndefErr extends Error { constructor(n) { super(`«${n}» no está definida.`); this.varName = n; } }

export function compile(node) {
  switch (node.t) {
    case 'num': { const v = node.v; return () => v; }
    case 'var': { const n = node.n; return env => { const v = env[n]; if (v === undefined) throw new UndefErr(n); return v; }; }
    case 'neg': { const a = compile(node.a); return env => negV(a(env)); }
    case 'bin': { const a = compile(node.a), b = compile(node.b), f = OPS[node.op]; return env => f(a(env), b(env)); }
    case 'tuple': {
      const items = node.items.map(compile);
      return env => items.map(f => { const v = f(env); if (!isNum(v)) throw new Error('Las coordenadas deben ser números.'); return v; });
    }
    case 'call': {
      const args = node.args.map(compile);
      if (node.f in FUNCS) {
        const fn = FUNCS[node.f];
        if (node.args.length !== 1) throw new Error(`${node.f}() recibe un solo argumento.`);
        return env => { const v = args[0](env); if (!isNum(v)) throw new Error(`${node.f}() necesita un número.`); return fn(v); };
      }
      return env => callSpecial(node.f, args.map(a => a(env)));
    }
  }
  throw new Error('Expresión no válida.');
}

// Evalúa definiciones en orden, resolviendo dependencias entre ellas.
export function evaluateAll(list) {
  const env = {};
  const seen = new Set();
  for (const e of list) {
    e.value = undefined; e.evalError = null; e.undef = [];
    if (e.kind === 'def') {
      if (seen.has(e.name)) { e.evalError = `«${e.name}» ya está definida en otra línea.`; e.dup = true; }
      else { seen.add(e.name); e.dup = false; }
    }
  }
  let pending = list.filter(e => e.kind === 'def' && !e.dup);
  for (let pass = 0; pending.length && pass <= list.length; pass++) {
    const still = [];
    for (const d of pending) {
      try { d.value = d.fn(env); env[d.name] = d.value; d.evalError = null; }
      catch (err) { d.evalError = err.message; if (err instanceof UndefErr) still.push(d); }
    }
    if (still.length === pending.length) break;
    pending = still;
  }
  for (const e of list) {
    if (!e.node || e.kind === 'error') continue;
    const missing = [...varsOf(e.node)].filter(n => n !== 'x' && n !== 'y' && !(n in env) && n !== e.name);
    if (missing.length) { e.undef = missing; e.evalError = `${missing.map(n => `«${n}»`).join(', ')} ${missing.length > 1 ? 'no están definidas' : 'no está definida'}.`; continue; }
    if (e.kind === 'value') { try { e.value = e.fn(env); } catch (err) { e.evalError = err.message; } }
    if (e.kind === 'fx' || e.kind === 'gy' || e.kind === 'implicit') {
      try { const t = e.fn({ ...env, x: 0.37, y: 0.41 }); if (!isNum(t)) e.evalError = 'La expresión debe dar un número, no un punto o vector.'; }
      catch (err) { if (!(err instanceof UndefErr)) e.evalError = err.message; }
    }
  }
  return env;
}
