// Reglas fijas que se agregan a los prompts: formato de respuesta, sintaxis del laboratorio, reglas del examen,
// citas de los apuntes, modo estricto y formato de los puntos débiles. Si cambiás una etiqueta, ver docs/formato-prompts.md.
import { TIPOS_ERROR } from '../estado/tipos-error.js';

export const FORMAT_RULES = 'FORMATO: fórmulas en LaTeX con $...$ en línea y $$...$$ en bloque; Markdown simple (### títulos, **negrita**, listas con "- "). Sin tablas ni bloques de código. Responde SOLO con las etiquetas pedidas, sin texto fuera de ellas.';
export const LAB_SYNTAX = `SINTAXIS DEL LABORATORIO GRÁFICO (una expresión por línea, texto plano, NUNCA LaTeX):
- Parámetro con deslizador: k = 2
- Función: y = a*x^2 + b*x + c   (también f(x) = ...; potencias con ^; funciones sen, cos, tan, sqrt, abs, ln, exp; constante pi)
- Ecuación implícita (cónicas, rectas generales): x^2/9 + y^2/4 = 1   ó   2x + 3y - 6 = 0
- Recta vertical: x = 3
- Punto: A = (2, 3)
- Vector desde el origen: u = vector(3, 4); vector entre puntos: w = vector(A, B)
- Segmento: s = segmento(A, B); recta por dos puntos: r = recta(A, B); recta por un punto con dirección: r = recta(A, u)
- Nombres: una letra, opcionalmente con subíndice (a_1, P_2). No uses x, y ni e como nombres.
- Define los datos numéricos como parámetros con deslizador para que el estudiante pueda variarlos.`;

export const CITE_RULES = 'CITAS: cuando una definición, propiedad, fórmula o método provenga de los apuntes, termina esa frase con la cita del archivo entre paréntesis, así: (según NOMBRE_DEL_ARCHIVO), usando el nombre exacto que figura en los encabezados «=== ... ===». No pongas citas dentro de fórmulas ni en las opciones de un examen.';
export const STRICT_RULES = `MODO ESTRICTO: explica, resuelve y evalúa SOLO con lo que está en los apuntes. Si hace falta algo que no figura en ellos, agrégalo en un bloque aparte con este formato exacto (cada marca en su propia línea):
:::complemento
**Qué agrego:** el contenido que falta.
**Por qué:** qué falta o no está claro en los apuntes.
**Para qué:** qué le permite entender o resolver al estudiante.
:::
Fuera de esos bloques no incluyas contenido que no esté en los apuntes. En las opciones de un examen no uses bloques; si una explicación necesita un complemento, indícalo con «(complemento: …, porque los apuntes no lo tratan)».`;

// Reglas del examen final (🎓 Profesor y bibliografía). Una línea por opción de material; ver estado/reglas-examen.js.
export const REGLAS_EXAMEN = {
  ninguno: 'El examen es SIN MATERIAL: el estudiante tiene que saber de memoria fórmulas, definiciones y notación. En la teoría destaca qué conviene memorizar; en las pistas pídele que recuerde la fórmula antes de dársela; en las preguntas evalúa también fórmulas y notación exactas.',
  manuscrito: 'El examen es A CUADERNO ABIERTO, SOLO CON MATERIAL MANUSCRITO: prioriza la aplicación y saber dónde buscar. En la teoría señala qué conviene tener copiado a mano en el cuaderno (fórmulas, pasos, casos); en las preguntas evalúa aplicar y elegir el método más que recordar de memoria.',
  impreso: 'El examen es A CUADERNO ABIERTO Y SE PUEDE LLEVAR MATERIAL IMPRESO: prioriza la aplicación y saber dónde buscar. En la teoría señala qué conviene llevar en la hoja impresa (fórmulas, pasos, casos); en las preguntas evalúa aplicar y elegir el método más que recordar de memoria.'
};

// Puntos débiles con tipo de error (lista fija en estado/tipos-error.js). Se leen con leerPuntos().
export const FORMATO_PUNTOS = `Cada punto va en su propia etiqueta, así:
<punto><texto>Descripción concreta y autocontenida (que se entienda sin leer la sesión).</texto><tipo>id</tipo></punto>
En <tipo> escribe SOLO uno de estos ids, el que mejor describa el error:
${Object.entries(TIPOS_ERROR).map(([id, t]) => `- ${id}: ${t.desc}`).join('\n')}`;
