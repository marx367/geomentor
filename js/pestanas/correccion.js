// Pestaña 3 · corrección por IA de la resolución (texto y/o imagen: foto o pizarra), con el criterio del profesor.
// Lo que le faltó al estudiante se suma a "Lo que te falta" de la pestaña Teoría.
import { $ } from '../nucleo/dom.js';
import { getTag, toList } from '../nucleo/etiquetas-xml.js';
import { S, key, sess } from '../estado/estado.js';
import { ask } from '../ia/cliente-ia.js';
import { aiError } from '../ia/errores-ia.js';
import { Apuntes } from '../contexto/busqueda-apuntes.js';
import { header, fitPrompt } from '../contexto/cabecera-prompt.js';
import { FORMAT_RULES } from '../contexto/reglas-prompt.js';
import { mentor } from '../ui/mentor.js';
import { renderEjercicios } from './ejercicios.js';

export async function corregir() {
  const k = key(), s = sess(k), ex = s.exercise;
  const ta = $('#resolucion');
  if (ta) s.resolucion = ta.value;
  if (!s.resolucion.trim() && !s.photo) { mentor('Escribe tu desarrollo o sube una foto para que pueda corregirlo.'); return; }
  s.busy.correccion = true; s.err.correccion = '';
  renderEjercicios();
  const prompt = fitPrompt(b => `${header(b)}

TAREA: corrige la resolución del estudiante como lo haría el profesor en un examen.
[ENUNCIADO]
${ex.enunciado}
[SOLUCIÓN DE REFERENCIA]
${ex.solucion}
[RESOLUCIÓN ESCRITA DEL ESTUDIANTE]
${s.resolucion.trim() || '(ver la foto adjunta)'}
${s.photo ? '\nSe adjunta una foto del desarrollo manuscrito. Si alguna parte es ilegible, dilo en lugar de suponer.' : ''}
<correccion>
### Lo que interpreté
Breve transcripción de lo que hizo.
### Análisis de pasos
Aciertos y errores concretos en planteo, despejes, signos y notación.
### Criterio del profesor
Si cumple con lo que se exige (gráfico, justificación, verificación).
### Calificación conceptual
Sobresaliente / Aprobado / Requiere corrección, con una frase que lo justifique.
</correccion>
<falta>Puntos débiles concretos que revela esta resolución, uno por línea con "- " (puede quedar vacío).</falta>

${FORMAT_RULES}`);
  try {
    const fuentes = Apuntes.last;
    const text = await ask(prompt, { fresh: true, images: s.photo ? [s.photo.blob] : null });
    s.correction = getTag(text, 'correccion') || text;
    s.correctionFuentes = fuentes;
    const falta = toList(getTag(text, 'falta'));
    if (falta.length) s.falta = [...new Set([...s.falta, ...falta])].slice(0, 10);
    if (key() === k) mentor(falta.length ? 'Sumé lo que te faltó en este ejercicio a tu lista de la pestaña Teoría. Exporta el resumen para guardarlo.' : '¡Buen trabajo! Prueba ahora con un ejercicio de nivel más alto.');
  } catch (e) {
    s.err.correccion = e.code ? aiError(e) : e.message;
  } finally {
    s.busy.correccion = false;
    if (key() === k && S.tab === 'ejercicios') renderEjercicios();
  }
}
