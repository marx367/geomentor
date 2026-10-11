// Pestaña 1 · chequeo socrático: manda la respuesta del estudiante, recibe la devolución, el % de
// comprensión, lo entendido / lo que falta y la siguiente pregunta. Guarda la comprensión en el progreso.
import { $ } from '../nucleo/dom.js';
import { clip } from '../nucleo/utilidades.js';
import { getTag, toList } from '../nucleo/etiquetas-xml.js';
import { leerPuntos } from '../estado/tipos-error.js';
import { S, key, sess } from '../estado/estado.js';
import { saveProgreso } from '../estado/progreso.js';
import { ask } from '../ia/cliente-ia.js';
import { aiError } from '../ia/errores-ia.js';
import { Apuntes } from '../contexto/busqueda-apuntes.js';
import { header, fitPrompt } from '../contexto/cabecera-prompt.js';
import { FORMAT_RULES, FORMATO_PUNTOS } from '../contexto/reglas-prompt.js';
import { mentor } from '../ui/mentor.js';
import { renderTeoria } from './teoria.js';

export async function verificar(noSe) {
  const k = key(), s = sess(k), c = S.cache[k];
  if (!c) return;
  const ta = $('#answer');
  if (ta) s.draft = ta.value;
  const answer = noSe ? '(El estudiante indica que no sabe cómo responder y pide que se lo expliquen.)' : s.draft.trim();
  if (!answer) { mentor('Escribe tu razonamiento antes de verificarlo, aunque sea incompleto.'); ta?.focus(); return; }
  s.busy.chequeo = true; s.err.chequeo = '';
  renderTeoria();

  const prev = s.turns.slice(-5).map(t => `Pregunta: ${t.q}\nRespuesta del estudiante: ${t.a}\nDevolución: ${clip(t.feedback, 700)}`).join('\n\n');
  const prompt = fitPrompt(b => `${header(b)}

Estás en un chequeo socrático de comprensión del subtema.
[IDEAS CLAVE]
${c.ideas.map(i => '- ' + i).join('\n')}

[INTERCAMBIOS ANTERIORES]
${prev || '(ninguno)'}

[LO QUE YA ENTENDÍA]
${s.entendido.map(x => '- ' + x).join('\n') || '(sin datos)'}
[LO QUE LE FALTABA]
${s.falta.map(x => '- ' + x.texto).join('\n') || '(sin datos)'}

[PREGUNTA ACTUAL]
${s.currentQ}

[RESPUESTA DEL ESTUDIANTE]
${answer}

TAREA: evalúa el razonamiento con criterio de profesor. Si está bien, confírmalo y profundiza; si tiene errores, señálalos con precisión y guíalo sin darle todo resuelto; si dice que no sabe, explica la idea con un ejemplo corto.
<feedback>Devolución de 60 a 180 palabras.</feedback>
<comprension>Número entero de 0 a 100: comprensión global del subtema demostrada hasta ahora.</comprension>
<entendido>Lista acumulada y actualizada de lo que YA demostró entender, cada ítem en una línea con "- " (máximo 8, frases cortas).</entendido>
<falta>Lista acumulada y actualizada de lo que AÚN le falta (máximo 8). Quita lo que ya demostró entender. ${FORMATO_PUNTOS}</falta>
<siguiente_pregunta>Nueva pregunta que ataque su punto débil principal, o que profundice si ya domina lo básico.</siguiente_pregunta>
<tip>Una frase breve de ánimo o consejo de examen, sin LaTeX.</tip>

${FORMAT_RULES}`);
  try {
    const fuentes = Apuntes.last;
    const text = await ask(prompt, { fresh: true });
    const feedback = getTag(text, 'feedback');
    if (!feedback) throw new Error('No llegó la devolución del mentor. Vuelve a intentarlo.');
    const comp = parseInt(getTag(text, 'comprension'), 10);
    s.turns.push({ q: s.currentQ, a: answer, feedback, fuentes });
    s.comprension = Number.isFinite(comp) ? Math.max(0, Math.min(100, comp)) : s.comprension;
    s.entendido = toList(getTag(text, 'entendido')).slice(0, 8);
    s.falta = leerPuntos(getTag(text, 'falta')).slice(0, 8);
    s.currentQ = getTag(text, 'siguiente_pregunta') || s.currentQ;
    if (!noSe) s.draft = '';
    await saveProgreso(k, { comprension: s.comprension });
    const tip = getTag(text, 'tip');
    if (tip && key() === k) mentor(tip);
  } catch (e) {
    s.err.chequeo = e.code ? aiError(e) : e.message;
  } finally {
    s.busy.chequeo = false;
    if (key() === k && S.tab === 'teoria') {
      renderTeoria();
      $('.current-q')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }
}
