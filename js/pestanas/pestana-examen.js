// Pestaña 4 · cableado: registro y botones (elegir opción, entregar, reintentar, nuevo examen, guardar errores).
import { sess } from '../estado/estado.js';
import { mentor } from '../ui/mentor.js';
import { registrarPestana, registrarAccion } from './registro.js';
import { generarExamen, renderExamen } from './examen.js';
import { entregarExamen, guardarErrores } from './examen-resultado.js';

// Al abrir la pestaña: si todavía no hay examen (ni uno en curso ni un error), se pide uno.
registrarPestana('examen', {
  mostrar() { const s = sess(); if (!s.exam && !s.busy.examen && !s.err.examen) generarExamen(false); else renderExamen(); },
  redibujar: renderExamen
});

registrarAccion('opt', a => {
  const ex = sess().exam;
  if (!ex || ex.submitted) return;
  ex.answers[+a.dataset.q] = +a.dataset.o;
  const y = window.scrollY; // se conserva la posición al redibujar
  renderExamen();
  window.scrollTo({ top: y });
});
registrarAccion('entregar', entregarExamen);
registrarAccion('reintentar', () => { const s = sess(); s.exam.answers = s.exam.answers.map(() => null); s.exam.submitted = false; s.exam.score = 0; s.exam.savedErrors = false; renderExamen(); mentor('¡A por la revancha! Esta vez lee cada opción con calma.'); });
registrarAccion('nuevo-exam', () => generarExamen(true));
registrarAccion('guardar-errores', guardarErrores);
