// Funciones matemáticas, palabras especiales (vector, recta…) y constantes que entiende el laboratorio.
export const FUNCS = {
  sin: Math.sin, sen: Math.sin, cos: Math.cos, tan: Math.tan, tg: Math.tan,
  asin: Math.asin, acos: Math.acos, atan: Math.atan, arcsen: Math.asin, arccos: Math.acos, arctan: Math.atan,
  sec: x => 1 / Math.cos(x), csc: x => 1 / Math.sin(x), cot: x => 1 / Math.tan(x),
  sqrt: Math.sqrt, raiz: Math.sqrt, abs: Math.abs, ln: Math.log, log: Math.log10, exp: Math.exp,
  floor: Math.floor, ceil: Math.ceil, sign: Math.sign
};
export const SPECIAL = ['vector', 'segmento', 'segment', 'recta', 'line', 'punto', 'point', 'norma', 'modulo', 'angulo', 'cruz', 'cross', 'min', 'max'];
export const CONSTS = { pi: Math.PI, e: Math.E };
export const WORDS = [...Object.keys(FUNCS), ...SPECIAL, ...Object.keys(CONSTS)].sort((a, b) => b.length - a.length);
