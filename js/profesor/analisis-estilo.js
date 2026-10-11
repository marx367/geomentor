// Análisis del estilo del profesor (sin pantalla): manda a la IA el estilo escrito y las respuestas
// del cuestionario, y devuelve criterios concretos que después se suman a todos los prompts.
import { clip } from '../nucleo/utilidades.js';
import { getTag } from '../nucleo/etiquetas-xml.js';
import { CUESTIONARIO } from '../datos/cuestionario-profesor.js';
import { ask } from '../ia/cliente-ia.js';

export function respuestasEnTexto(respuestas) {
  return CUESTIONARIO.filter(q => q.opciones[respuestas[q.id]])
    .map(q => `- ${q.pregunta} → ${q.opciones[respuestas[q.id]]}`).join('\n');
}

export async function analizarEstilo(estilo, respuestas) {
  const out = await ask(`Eres GeoMentor, tutor universitario de matemática. El estudiante describe a su profesor para preparar el examen final.
[ESTILO ESCRITO POR EL ESTUDIANTE]
${estilo.trim() ? clip(estilo, 12000) : '(no escribió nada)'}

[RESPUESTAS DEL CUESTIONARIO]
${respuestasEnTexto(respuestas) || '(sin respuestas)'}

TAREA: resume cómo corrige y qué exige este profesor, en 5 a 10 viñetas cortas y accionables que un tutor pueda seguir al explicar, corregir y armar exámenes (qué justificar, notación, gráficos, verificaciones, errores que más penaliza, formato del examen). Si algo se contradice, quédate con lo que escribió el estudiante. No inventes lo que no se sabe.
Formato: <analisis>viñetas con "- "</analisis>
Responde solo con la etiqueta.`, { fresh: true });
  const analisis = getTag(out, 'analisis').trim();
  if (!analisis) throw new Error('La IA no devolvió el análisis. Prueba de nuevo.');
  return clip(analisis, 6000);
}
