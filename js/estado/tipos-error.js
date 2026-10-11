// Tipos de error de los puntos débiles: lista fija y corta, igual para todos los temas, para poder contar
// repeticiones ("Mis errores", "Errores más frecuentes"). La IA elige uno por punto; si no elige bien, 'sin-clasificar'.
// Si agregás o renombrás un tipo, los puntos ya guardados con el id viejo pasan a 'sin-clasificar': hace falta migrarlos.
import { norm } from '../nucleo/utilidades.js';
import { getTag, getTags, toList } from '../nucleo/etiquetas-xml.js';

export const SIN_CLASIFICAR = 'sin-clasificar';

// id (sin tildes, se guarda) → etiqueta (se muestra) y descripción (va al prompt de la IA).
export const TIPOS_ERROR = {
  signo: { etiqueta: 'Signo', desc: 'error de signo al operar, despejar o trasladar términos' },
  notacion: { etiqueta: 'Notación', desc: 'notación incorrecta o distinta de la del curso' },
  condicion: { etiqueta: 'Condición sin verificar', desc: 'no verifica dominio, hipótesis o condiciones de un teorema o método' },
  calculo: { etiqueta: 'Cálculo', desc: 'error de cuentas o de álgebra' },
  concepto: { etiqueta: 'Concepto', desc: 'no entiende o confunde una definición, propiedad o idea' },
  metodo: { etiqueta: 'Método', desc: 'no sabe por dónde empezar o qué método usar' }
};

// Acepta el id o la etiqueta, sin importar tildes, mayúsculas ni espacios de más.
export function normalizarTipo(x) {
  const t = norm(x).trim();
  if (!t) return SIN_CLASIFICAR;
  for (const [id, { etiqueta }] of Object.entries(TIPOS_ERROR)) if (t === id || t === norm(etiqueta)) return id;
  return SIN_CLASIFICAR;
}

export const etiquetaTipo = id => TIPOS_ERROR[id]?.etiqueta || 'Sin clasificar';

// Lee los puntos que devolvió la IA: <punto><texto>…</texto><tipo>id</tipo></punto> (formato en reglas-prompt.js).
// Si la IA no usó <punto> (modelo que no obedece), toma una línea por punto, sin clasificar.
export function leerPuntos(texto) {
  const bloques = getTags(texto, 'punto');
  if (!bloques.length) return toList(texto).map(t => ({ texto: t, tipo: SIN_CLASIFICAR }));
  return bloques.map(b => ({
    texto: getTag(b, 'texto') || b.replace(/<tipo>[\s\S]*?<\/tipo>/i, '').replace(/<[^>]+>/g, '').trim(),
    tipo: normalizarTipo(getTag(b, 'tipo'))
  })).filter(p => p.texto);
}
