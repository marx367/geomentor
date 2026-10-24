// Pestaña 3 · corrección por IA de la resolución (texto y/o imagen: foto o pizarra), con el criterio del profesor.
// Lo que le faltó al estudiante se guarda como puntos débiles con tipo (origen 'ejercicio').
import { $ } from '../nucleo/dom.js';
import { getTag } from '../nucleo/etiquetas-xml.js';
import { leerPuntos } from '../estado/tipos-error.js';
import { guardarDebil } from '../estado/debiles.js';
import { S, key, sess } from '../estado/estado.js';
import { ask } from '../ia/cliente-ia.js';
import { aiError } from '../ia/errores-ia.js';
import { Apuntes } from '../contexto/busqueda-apuntes.js';
import { header, fitPrompt } from '../contexto/cabecera-prompt.js';
import { FORMAT_RULES, FORMATO_PUNTOS } from '../contexto/reglas-prompt.js';
import { mentor } from '../ui/mentor.js';
import { updateDebilesCount } from '../ui/puntos-debiles.js';
import { renderEjercicios } from './ejercicios.js';

export async function corregir() {
  const k = key(), s = sess(k), ex = s.exercise;
  const ta = $('#resolucion');
  if (ta) s.resolucion = ta.value;
  if (!s.resolucion.trim() && !s.photo) { mentor('Escribe tu desarrollo o sube una foto para que pueda corregirlo.'); return; }
  // Se toma ahora: mientras la IA corrige, el estudiante puede cambiar de tema.
  const tema = { key: k, materiaId: S.materia.id, ejeId: S.eje.id, subId: S.sub.id, materia: S.materia.nombre, eje: S.eje.nombre, subtema: S.sub.nombre };
  const nivel = s.nivel;
  s.busy.correccion = true; s.err.correccion = '';
  renderEjercicios();
  // En los ejercicios propios, la solución puede venir de la fuente (referencia oficial) o de la IA (no verificada).
  const notaSolucion = ex.solucionOrigen === 'fuente'
    ? '(Es la solución oficial de la fuente del estudiante: corrige contra ella. Si ves un error evidente en ella, señálalo aparte.)'
    : ex.origen && ex.origen !== 'tutor' ? '(La armó la IA y NO está verificada: si la resolución del estudiante difiere, revisa las dos antes de marcar un error y dilo.)' : '';
  // Imágenes: la del enunciado original (puede traer una figura) y la del desarrollo del estudiante.
  const imagenes = [ex.imagen?.blob, s.photo?.blob].filter(Boolean);
  const prompt = fitPrompt(b => `${header(b)}

TAREA: corrige la resolución del estudiante como lo haría el profesor en un examen.
[ENUNCIADO]
${ex.enunciado}
[SOLUCIÓN DE REFERENCIA] ${notaSolucion}
${ex.solucion}${ex.imagen ? '\nLa PRIMERA imagen adjunta es el enunciado original (con su figura).' : ''}
[RESOLUCIÓN ESCRITA DEL ESTUDIANTE]
${s.resolucion.trim() || '(ver la foto adjunta)'}
${s.photo ? `\nSe adjunta ${ex.imagen ? 'como SEGUNDA imagen ' : ''}una foto del desarrollo manuscrito. Si alguna parte es ilegible, dilo en lugar de suponer.` : ''}
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
<falta>Puntos débiles concretos que revela esta resolución (puede quedar vacío). ${FORMATO_PUNTOS}</falta>

${FORMAT_RULES}`);
  try {
    const fuentes = Apuntes.last;
    const text = await ask(prompt, { fresh: true, images: imagenes.length ? imagenes : null });
    s.correction = getTag(text, 'correccion') || text;
    s.correctionFuentes = fuentes;
    // Lo que faltó se guarda directo como punto débil (origen 'ejercicio'). Ya no se suma a "Lo que te falta"
    // de Teoría: el resumen de la sesión lo volvería a guardar y cada error contaría dos veces.
    const puntos = leerPuntos(getTag(text, 'falta')).slice(0, 8);
    if (puntos.length) {
      await guardarDebil({ ...tema, fecha: new Date().toISOString(), origen: 'ejercicio', detalle: nivel, puntos });
      updateDebilesCount();
    }
    if (key() === k) mentor(puntos.length ? `Guardé ${puntos.length} ${puntos.length === 1 ? 'punto débil' : 'puntos débiles'} de este ejercicio (📌). Los voy a reforzar en tus próximas sesiones.` : '¡Buen trabajo! Prueba ahora con un ejercicio de nivel más alto.');
  } catch (e) {
    s.err.correccion = e.code ? aiError(e) : e.message;
  } finally {
    s.busy.correccion = false;
    if (key() === k && S.tab === 'ejercicios') renderEjercicios();
  }
}
