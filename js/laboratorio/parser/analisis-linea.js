// Clasifica una línea del laboratorio: parámetro (a = 2), función (y = …, f(x) = …), x = …, ecuación implícita,
// valor o error. literalInfo() detecta números, puntos y vectores literales (los que se pueden arrastrar).
import { parse, varsOf } from './parser.js';
import { compile } from './evaluador.js';

export const NAME_RE = /^([A-Za-z\u0370-\u03FF])(?:_([0-9A-Za-z]+)|([0-9]+))?$/;
export function litNum(n) {
  if (n.t === 'num') return n.v;
  if (n.t === 'neg' && n.a.t === 'num') return -n.a.v;
  return null;
}
export function literalInfo(node) {
  const v = litNum(node);
  if (v !== null) return { type: 'num', v };
  if (node.t === 'tuple' && node.items.length === 2) {
    const x = litNum(node.items[0]), y = litNum(node.items[1]);
    if (x !== null && y !== null) return { type: 'point' };
  }
  if (node.t === 'call' && (node.f === 'vector') && node.args.length === 2) {
    const x = litNum(node.args[0]), y = litNum(node.args[1]);
    if (x !== null && y !== null) return { type: 'vector' };
  }
  if (node.t === 'call' && (node.f === 'punto' || node.f === 'point') && node.args.length === 2) {
    const x = litNum(node.args[0]), y = litNum(node.args[1]);
    if (x !== null && y !== null) return { type: 'point' };
  }
  return null;
}

// Clasifica una línea del laboratorio.
export function analyzeLine(text) {
  const r = { kind: 'empty', error: null, name: null, node: null, fn: null, literal: null };
  const src = text.trim();
  if (!src || src.startsWith('//') || src.startsWith('#')) return r;
  try {
    const fdef = src.match(/^([A-Za-z])\s*\(\s*x\s*\)\s*=(.*)$/);
    if (fdef && fdef[1] !== 'y' && fdef[1] !== 'x') {
      const node = parse(fdef[2]);
      if (varsOf(node).has('y')) throw new Error('Una función f(x) no puede usar y.');
      return Object.assign(r, { kind: 'fx', name: fdef[1], node, fn: compile(node) });
    }
    const parts = src.split('=');
    if (parts.length > 2) throw new Error('Usa un solo signo «=».');
    if (parts.length === 2) {
      const L = parts[0].trim(), R = parts[1].trim();
      if (!L || !R) throw new Error('Falta un lado de la igualdad.');
      const rNode = parse(R), rv = varsOf(rNode);
      if (L === 'y' && !rv.has('y')) return Object.assign(r, { kind: 'fx', node: rNode, fn: compile(rNode) });
      if (L === 'x' && !rv.has('x')) return Object.assign(r, { kind: 'gy', node: rNode, fn: compile(rNode) });
      const nm = L.match(NAME_RE);
      if (nm && !rv.has('x') && !rv.has('y') && L !== 'x' && L !== 'y') {
        if (L === 'e') throw new Error('«e» es la constante de Euler; usa otro nombre.');
        const name = nm[2] || nm[3] ? `${nm[1]}_${nm[2] || nm[3]}` : nm[1];
        if (rv.has(name)) throw new Error(`«${name}» no puede depender de sí misma.`);
        return Object.assign(r, { kind: 'def', name, node: rNode, fn: compile(rNode), literal: literalInfo(rNode) });
      }
      const lNode = parse(L);
      const all = new Set([...varsOf(lNode), ...rv]);
      if (!all.has('x') && !all.has('y')) throw new Error('Una ecuación debe usar x o y. Para definir un valor escribe, por ejemplo, a = 2.');
      const node = { t: 'bin', op: '-', a: lNode, b: rNode };
      return Object.assign(r, { kind: 'implicit', node, fn: compile(node) });
    }
    const node = parse(src), v = varsOf(node);
    if (v.has('y')) throw new Error('Si usas y, escribe una ecuación (por ejemplo, x^2 + y^2 = 9).');
    if (v.has('x')) return Object.assign(r, { kind: 'fx', node, fn: compile(node) });
    return Object.assign(r, { kind: 'value', node, fn: compile(node) });
  } catch (err) {
    return Object.assign(r, { kind: 'error', error: err.message });
  }
}
