// Texto → tokens. Acepta notación cómoda (², π, ·, √, corchetes) y la normaliza antes de cortar.
import { WORDS, CONSTS } from './funciones.js';

export function tokenize(src) {
  const s = src.replace(/²/g, '^2').replace(/³/g, '^3').replace(/π/g, 'pi').replace(/[·×]/g, '*')
    .replace(/[−–]/g, '-').replace(/√/g, 'sqrt').replace(/÷/g, '/').replace(/\*\*/g, '^')
    .replace(/[\[{]/g, '(').replace(/[\]}]/g, ')');
  const toks = [];
  let i = 0;
  while (i < s.length) {
    const c = s[i];
    if (/\s/.test(c)) { i++; continue; }
    if (/[0-9.]/.test(c)) {
      const m = s.slice(i).match(/^(\d+\.?\d*|\.\d+)/);
      if (!m) throw new Error('Número mal escrito.');
      toks.push({ t: 'num', v: parseFloat(m[0]) }); i += m[0].length; continue;
    }
    if (/[A-Za-z\u0370-\u03FF]/.test(c)) {
      const rest = s.slice(i);
      const w = WORDS.find(w => rest.startsWith(w));
      if (w) {
        toks.push(w in CONSTS ? { t: 'const', v: w } : { t: 'fn', v: w });
        i += w.length; continue;
      }
      const m = rest.match(/^[A-Za-z\u0370-\u03FF](?:_([0-9A-Za-z]+)|([0-9]+))?/);
      const sub = m[1] || m[2];
      toks.push({ t: 'id', v: sub ? `${m[0][0]}_${sub}` : m[0][0] });
      i += m[0].length; continue;
    }
    if ('+-*/^(),|'.includes(c)) { toks.push({ t: c }); i++; continue; }
    throw new Error(`Carácter no reconocido: «${c}».`);
  }
  return toks;
}
