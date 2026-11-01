// Banco de drills de Geometría Descriptiva (sistema de Monge), por método. Puro: cada generador recibe el RNG
// y devuelve { tipo, pregunta, opciones: [{ v, texto }], respuesta } sin id (lo pone drills.js).
// Reglas tomadas de las hojas 01 (tercera proyección) y 02 (representación de la recta) del cuadernillo.

const entero = (rng, min, max) => min + Math.floor(rng() * (max - min + 1));
const conSigno = (rng, min, max) => (rng() < 0.5 ? -1 : 1) * entero(rng, min, max);
const elegir = (rng, lista) => lista[Math.floor(rng() * lista.length)];
// Con signo explícito y el menos tipográfico: +3, −2.
const conSignoTexto = n => (n > 0 ? `+${n}` : `−${-n}`);

/** Copia mezclada (Fisher-Yates) con el RNG dado. */
export function mezclar(rng, lista) {
  const r = [...lista];
  for (let i = r.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [r[i], r[j]] = [r[j], r[i]];
  }
  return r;
}

/** Diedro según los signos: I (+,+) · II (+,−) · III (−,−) · IV (−,+). Cota y alejamiento distintos de 0. */
export function diedroDe(cota, alejamiento) {
  if (cota > 0) return alejamiento > 0 ? 'I' : 'II';
  return alejamiento < 0 ? 'III' : 'IV';
}

/** Qué trazas son propias en cada recta particular (hoja 02). 'h': solo H · 'v': solo V. */
export const TRAZAS = {
  vertical: 'h', 'de fuga': 'v', frontal: 'h', horizontal: 'v',
  'paralela a LT': 'ninguna', 'de perfil': 'ambas', 'que corta a LT': 'ambas',
};

const DIEDROS = ['I', 'II', 'III', 'IV'].map(d => ({ v: d, texto: `Diedro ${d}` }));
const SIGNOS = [
  { v: 'pp', texto: 'cota +, alejamiento +' }, { v: 'pm', texto: 'cota +, alejamiento −' },
  { v: 'mp', texto: 'cota −, alejamiento +' }, { v: 'mm', texto: 'cota −, alejamiento −' },
];
const SIGNOS_DE_DIEDRO = { I: 'pp', II: 'pm', III: 'mm', IV: 'mp' };
const signosDe = (cota, alejamiento) => `${cota > 0 ? 'p' : 'm'}${alejamiento > 0 ? 'p' : 'm'}`;
const LADOS = [
  { v: 'der-arr', texto: 'a la derecha del perfil y arriba de LT' }, { v: 'der-abj', texto: 'a la derecha del perfil y abajo de LT' },
  { v: 'izq-arr', texto: 'a la izquierda del perfil y arriba de LT' }, { v: 'izq-abj', texto: 'a la izquierda del perfil y abajo de LT' },
];
const PROPIAS = [
  { v: 'h', texto: 'H propia y V impropia' }, { v: 'v', texto: 'V propia y H impropia' },
  { v: 'ninguna', texto: 'las dos impropias' }, { v: 'ambas', texto: 'las dos propias' },
];

// --- Comunes ---------------------------------------------------------------------------------------------
function diedro(rng) {
  const c = conSigno(rng, 2, 5), a = conSigno(rng, 2, 5);
  return { tipo: 'diedro', pregunta: `Un punto tiene cota ${conSignoTexto(c)} y alejamiento ${conSignoTexto(a)}. ¿En qué diedro está?`, opciones: DIEDROS, respuesta: diedroDe(c, a) };
}
function signos(rng) {
  const d = elegir(rng, ['I', 'II', 'III', 'IV']);
  return { tipo: 'signos', pregunta: `Un punto está en el diedro ${d}. ¿Qué signos tienen su cota y su alejamiento?`, opciones: SIGNOS, respuesta: SIGNOS_DE_DIEDRO[d] };
}

// --- Tercera proyección (hoja 01) -------------------------------------------------------------------------
function terceraLado(rng) {
  const c = conSigno(rng, 1, 5), a = conSigno(rng, 1, 5);
  return {
    tipo: 'tercera-lado', pregunta: `Un punto tiene cota ${conSignoTexto(c)} y alejamiento ${conSignoTexto(a)}. ¿Dónde queda P‴?`,
    opciones: LADOS, respuesta: `${a > 0 ? 'der' : 'izq'}-${c > 0 ? 'arr' : 'abj'}`,
  };
}
function terceraInversa(rng) {
  const n = entero(rng, 1, 5), m = entero(rng, 1, 5), derecha = rng() < 0.5, arriba = rng() < 0.5;
  return {
    tipo: 'tercera-inversa',
    pregunta: `P‴ está ${n} unidades a la ${derecha ? 'derecha' : 'izquierda'} del perfil y ${m} ${arriba ? 'arriba' : 'abajo'} de LT. ¿Qué signos tienen la cota y el alejamiento del punto?`,
    opciones: SIGNOS, respuesta: signosDe(arriba ? m : -m, derecha ? n : -n),
  };
}
function terceraAuxiliares(rng) {
  return {
    tipo: 'tercera-auxiliares', pregunta: 'En el método de la tercera proyección, ¿por qué punto se traza la perpendicular a LT que ubica P‴?',
    opciones: mezclar(rng, [{ v: 'p1', texto: 'por P₁' }, { v: 'p2', texto: 'por P₂' }, { v: 'centro', texto: 'por el corte de π‴ con LT' }, { v: 'p-prima', texto: 'por P′' }]),
    respuesta: 'p2',
  };
}

// --- Recta (hoja 02) --------------------------------------------------------------------------------------
function trazaParticular(rng) {
  const recta = elegir(rng, Object.keys(TRAZAS));
  return { tipo: 'traza-particular', pregunta: `Una recta ${recta}: ¿qué trazas son propias?`, opciones: PROPIAS, respuesta: TRAZAS[recta] };
}
function trazaMetodo(rng) {
  return {
    tipo: 'traza-metodo', pregunta: 'Para hallar V″ se traza la perpendicular a LT… ¿por qué punto?',
    opciones: mezclar(rng, [{ v: 'r1-lt', texto: 'por r′ ∩ LT' }, { v: 'r2-lt', texto: 'por r″ ∩ LT' }, { v: 'v2', texto: 'por V″' }, { v: 'h2', texto: 'por H″' }]),
    respuesta: 'r1-lt',
  };
}
function perfilIndeterminada(rng) {
  return {
    tipo: 'perfil-indeterminada', pregunta: 'Dos proyecciones perpendiculares a LT, ¿determinan una única recta?',
    opciones: mezclar(rng, [
      { v: 'si-perfil', texto: 'Sí, es la recta de perfil' }, { v: 'no', texto: 'No: son infinitas; hace falta un punto más o la tercera proyección' },
      { v: 'si-impropias', texto: 'Sí, si las trazas son impropias' }, { v: 'solo-lt', texto: 'Solo si corta a LT' },
    ]),
    respuesta: 'no',
  };
}
// V″ arriba de LT → cota + ; H′ abajo de LT → alejamiento + (tabla de la hoja 02).
function diedroTrazas(rng) {
  const vArriba = rng() < 0.5, hArriba = rng() < 0.5;
  return {
    tipo: 'diedro-trazas',
    pregunta: `V″ está ${vArriba ? 'arriba' : 'abajo'} de LT y H′ ${hArriba ? 'arriba' : 'abajo'} de LT. ¿En qué diedro está el tramo entre las trazas?`,
    opciones: DIEDROS, respuesta: diedroDe(vArriba ? 1 : -1, hArriba ? -1 : 1),
  };
}

export const BANCO = {
  'tercera-proyeccion': [diedro, signos, terceraLado, terceraInversa, terceraAuxiliares],
  recta: [trazaParticular, trazaMetodo, perfilIndeterminada, diedroTrazas, signos],
};
