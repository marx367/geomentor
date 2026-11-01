// Aritmética de fechas 'YYYY-MM-DD' sin objetos de fecha del navegador (evita los saltos de zona horaria).
// Cada fecha se pasa a un número de día (días desde 1970-01-01) con el algoritmo civil de H. Hinnant.

const FORMATO = /^(\d{4})-(\d{2})-(\d{2})$/;

const esBisiesto = a => (a % 4 === 0 && a % 100 !== 0) || a % 400 === 0;
const diasDelMes = (a, m) => [31, esBisiesto(a) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][m - 1];
const dosCifras = n => String(n).padStart(2, '0');

// [año, mes, día] si s es una fecha real; null si no.
function partes(s) {
  const m = FORMATO.exec(typeof s === 'string' ? s : '');
  if (!m) return null;
  const [a, mes, d] = [Number(m[1]), Number(m[2]), Number(m[3])];
  if (a < 1 || mes < 1 || mes > 12 || d < 1 || d > diasDelMes(a, mes)) return null;
  return [a, mes, d];
}

function aNumeroDeDia([a, m, d]) {
  const anio = m <= 2 ? a - 1 : a;
  const era = Math.floor(anio / 400);
  const anioDeEra = anio - era * 400;
  const diaDelAnio = Math.floor((153 * (m > 2 ? m - 3 : m + 9) + 2) / 5) + d - 1;
  const diaDeEra = anioDeEra * 365 + Math.floor(anioDeEra / 4) - Math.floor(anioDeEra / 100) + diaDelAnio;
  return era * 146097 + diaDeEra - 719468;
}

function desdeNumeroDeDia(n) {
  const z = n + 719468;
  const era = Math.floor(z / 146097);
  const diaDeEra = z - era * 146097;
  const anioDeEra = Math.floor((diaDeEra - Math.floor(diaDeEra / 1460) + Math.floor(diaDeEra / 36524) - Math.floor(diaDeEra / 146096)) / 365);
  const diaDelAnio = diaDeEra - (365 * anioDeEra + Math.floor(anioDeEra / 4) - Math.floor(anioDeEra / 100));
  const mp = Math.floor((5 * diaDelAnio + 2) / 153);
  const d = diaDelAnio - Math.floor((153 * mp + 2) / 5) + 1;
  const m = mp < 10 ? mp + 3 : mp - 9;
  const a = anioDeEra + era * 400 + (m <= 2 ? 1 : 0);
  return a < 1 || a > 9999 ? null : `${String(a).padStart(4, '0')}-${dosCifras(m)}-${dosCifras(d)}`;
}

/** true si s cumple 'YYYY-MM-DD' y es una fecha que existe en el calendario. */
export const esFecha = s => partes(s) !== null;

/** fecha + n días (n entero, puede ser negativo). null si la entrada es inválida. */
export function sumarDias(fecha, n) {
  const p = partes(fecha);
  if (!p || !Number.isInteger(n)) return null;
  return desdeNumeroDeDia(aNumeroDeDia(p) + n);
}

/** Días completos de desde a hasta (negativo si hasta es anterior). null si alguna es inválida. */
export function diasEntre(desde, hasta) {
  const a = partes(desde), b = partes(hasta);
  return a && b ? aNumeroDeDia(b) - aNumeroDeDia(a) : null;
}
