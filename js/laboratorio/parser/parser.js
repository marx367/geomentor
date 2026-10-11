// Tokens → árbol de la expresión (descenso recursivo, sin eval). Admite multiplicación implícita (2x, a b)
// y funciones sin paréntesis (sen x). varsOf() lista las variables que usa un árbol.
import { CONSTS } from './funciones.js';
import { tokenize } from './tokenizador.js';

export function parse(src) {
  const toks = tokenize(src);
  let p = 0;
  const peek = () => toks[p];
  const next = () => toks[p++];
  const tokStr = k => k ? (k.v ?? k.t) : 'el final';
  const expect = t => { const k = next(); if (!k || k.t !== t) throw new Error(t === ')' ? 'Falta cerrar un paréntesis.' : `Se esperaba «${t}».`); return k; };
  const startsPrimary = k => k && (k.t === 'num' || k.t === 'id' || k.t === 'fn' || k.t === 'const' || k.t === '(');

  function expr() {
    let a = mult();
    while (peek() && (peek().t === '+' || peek().t === '-')) { const op = next().t; a = { t: 'bin', op, a, b: mult() }; }
    return a;
  }
  function mult() {
    let a = unary();
    for (;;) {
      const k = peek();
      if (k && (k.t === '*' || k.t === '/')) { next(); a = { t: 'bin', op: k.t, a, b: unary() }; }
      else if (startsPrimary(k)) { a = { t: 'bin', op: '*', a, b: power() }; }
      else break;
    }
    return a;
  }
  function unary() {
    const k = peek();
    if (k && k.t === '-') { next(); return { t: 'neg', a: unary() }; }
    if (k && k.t === '+') { next(); return unary(); }
    return power();
  }
  function power() {
    const base = primary();
    if (peek() && peek().t === '^') { next(); return { t: 'bin', op: '^', a: base, b: unary() }; }
    return base;
  }
  function primary() {
    const k = next();
    if (!k) throw new Error('La expresión está incompleta.');
    if (k.t === 'num') return { t: 'num', v: k.v };
    if (k.t === 'const') return { t: 'num', v: CONSTS[k.v] };
    if (k.t === 'id') return { t: 'var', n: k.v };
    if (k.t === 'fn') {
      if (peek() && peek().t === '(') {
        next();
        const args = [];
        if (peek() && peek().t !== ')') { args.push(expr()); while (peek() && peek().t === ',') { next(); args.push(expr()); } }
        expect(')');
        return { t: 'call', f: k.v, args };
      }
      let arg = power();
      while (peek() && (peek().t === 'num' || peek().t === 'id' || peek().t === 'const')) arg = { t: 'bin', op: '*', a: arg, b: power() };
      return { t: 'call', f: k.v, args: [arg] };
    }
    if (k.t === '(') {
      const items = [expr()];
      while (peek() && peek().t === ',') { next(); items.push(expr()); }
      expect(')');
      return items.length === 1 ? items[0] : { t: 'tuple', items };
    }
    if (k.t === '|') { const inner = expr(); expect('|'); return { t: 'call', f: 'abs', args: [inner] }; }
    throw new Error(`No se esperaba «${tokStr(k)}».`);
  }
  const node = expr();
  if (p < toks.length) throw new Error(`Sobra algo cerca de «${tokStr(toks[p])}».`);
  return node;
}

export function varsOf(node, set = new Set()) {
  if (!node) return set;
  if (node.t === 'var') set.add(node.n);
  else if (node.t === 'bin') { varsOf(node.a, set); varsOf(node.b, set); }
  else if (node.t === 'neg') varsOf(node.a, set);
  else if (node.t === 'call') node.args.forEach(a => varsOf(a, set));
  else if (node.t === 'tuple') node.items.forEach(a => varsOf(a, set));
  return set;
}
