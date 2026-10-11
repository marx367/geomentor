// Pestaña 4 · entrega del examen (nota sobre 10, guarda el mejor resultado) y guardado de los errores
// como puntos débiles.
import { $ } from '../nucleo/dom.js';
import { S, key, sess } from '../estado/estado.js';
import { Store } from '../estado/almacen.js';
import { saveProgreso } from '../estado/progreso.js';
import { mentor } from '../ui/mentor.js';
import { updateDebilesCount } from '../ui/puntos-debiles.js';
import { renderExamen } from './examen.js';

export async function entregarExamen() {
  const k = key(), s = sess(k), ex = s.exam;
  const correct = ex.questions.reduce((a, q, i) => a + (ex.answers[i] === q.correcta ? 1 : 0), 0);
  ex.score = Math.round((correct / ex.questions.length) * 100) / 10;
  ex.submitted = true;
  renderExamen();
  window.scrollTo({ top: $('#tab-examen').getBoundingClientRect().top + window.scrollY - 90, behavior: 'smooth' });
  const prev = S.progreso.temas[k]?.examenMejor ?? 0;
  await saveProgreso(k, { examenUltimo: ex.score, examenMejor: Math.max(prev, ex.score) });
  mentor(ex.score >= 8 ? '🎯 ¡Excelente progreso! El estudio constante te asegura la nota reglamentada.' : ex.score >= 5 ? 'Buen intento. Lee las explicaciones de las que fallaste y reintenta.' : 'No te desanimes: vuelve al chequeo de la pestaña Teoría y después reintenta.');
}

export async function guardarErrores() {
  const k = key(), s = sess(k), ex = s.exam;
  const puntos = ex.questions.filter((q, i) => ex.answers[i] !== q.correcta)
    .map(q => `${q.enunciado.replace(/\s+/g, ' ')} → ${q.explicacion.replace(/\s+/g, ' ')}`.slice(0, 400));
  if (!puntos.length) return;
  const item = await Store.addDebil({
    key: k, materiaId: S.materia.id, ejeId: S.eje.id, subId: S.sub.id,
    materia: S.materia.nombre, eje: S.eje.nombre, subtema: S.sub.nombre,
    fecha: new Date().toISOString(), origen: `Examen de práctica (${ex.score}/10)`, puntos
  });
  S.debiles.unshift(item);
  ex.savedErrors = true;
  updateDebilesCount();
  renderExamen();
  mentor(`Guardé ${puntos.length} ${puntos.length === 1 ? 'error' : 'errores'} como puntos débiles. Los voy a reforzar en tus próximas sesiones.`);
}
