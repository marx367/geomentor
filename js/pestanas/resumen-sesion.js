// Pestaña 1 · "Resumen de la sesión": la IA resume el chequeo, se guardan los puntos débiles
// y se descarga el .txt.
import { slug, today, clip } from '../nucleo/utilidades.js';
import { getTag, toList } from '../nucleo/etiquetas-xml.js';
import { leerPuntos } from '../estado/tipos-error.js';
import { S, key, sess } from '../estado/estado.js';
import { guardarDebil } from '../estado/debiles.js';
import { ask } from '../ia/cliente-ia.js';
import { aiError } from '../ia/errores-ia.js';
import { Apuntes } from '../contexto/busqueda-apuntes.js';
import { header, fitPrompt } from '../contexto/cabecera-prompt.js';
import { FORMATO_PUNTOS } from '../contexto/reglas-prompt.js';
import { saveFile } from '../exportacion/descargas.js';
import { buildResumenTxt } from '../exportacion/resumen-txt.js';
import { mentor } from '../ui/mentor.js';
import { updateDebilesCount } from '../ui/puntos-debiles.js';
import { confirmarDebiles } from './confirmar-debiles.js';
import { renderTeoria } from './teoria.js';

// Reglas para que la IA no invente ni repita puntos débiles en el resumen (problemas vistos en sesiones reales).
const REGLAS_PUNTOS_DEBILES = `Cómo elegir los puntos débiles:
- Partí de la lista de "Falta" de arriba (lo que ya se mostró en la sesión) y de errores o huecos concretos que aparezcan en las respuestas del estudiante. No agregues puntos nuevos salvo que salgan de una respuesta suya.
- No incluyas lo que el mentor explicó ni las preguntas que hizo el estudiante: solo errores o huecos que él mostró en sus respuestas.
- Fusioná en un único punto las redacciones distintas de la misma confusión.
- Al clasificar: "Condición sin verificar" es no verificar dominio, hipótesis o condición de existencia. "Signo" es un error de signo efectivo al operar, despejar o trasladar términos. Una imprecisión al redactar no es Signo, y tampoco es Notación salvo que sea de notación matemática.`;

export async function exportResumen() {
  const k = key(), s = sess(k);
  if (!s.turns.length) return;
  const meta = { materia: S.materia.nombre, eje: S.eje.nombre, subtema: S.sub.nombre };
  const materiaId = S.materia.id, ejeId = S.eje.id, subId = S.sub.id;
  s.busy.resumen = true; s.err.chequeo = '';
  renderTeoria();
  const transcript = s.turns.map((t, i) => `[${i + 1}] Pregunta: ${t.q}\nRespuesta: ${t.a}\nDevolución: ${t.feedback}`).join('\n\n');
  const prompt = fitPrompt(b => `${header(Math.min(b, 6000))}

TAREA: resume la sesión de comprensión para que el estudiante repase después. Escribe en TEXTO PLANO (irá a un archivo .txt): sin LaTeX ni Markdown; usa notación legible como u·v, ‖u‖, x², √2, ≤, θ.
[REGISTRO DE LA SESIÓN]
${clip(transcript, 14000)}

[ÚLTIMA EVALUACIÓN]
Comprensión: ${s.comprension}%
Entendido: ${s.entendido.join('; ') || '-'}
Falta: ${s.falta.map(p => p.texto).join('; ') || '-'}

<resumen_general>3 a 5 frases sobre qué entendió y cómo razonó.</resumen_general>
<puntos_fuertes>Una línea por punto, empezando con "- ".</puntos_fuertes>
${REGLAS_PUNTOS_DEBILES}
<puntos_debiles>Máximo 8 puntos débiles. ${FORMATO_PUNTOS}</puntos_debiles>
<plan_de_repaso>De 3 a 5 pasos concretos, uno por línea con "- ".</plan_de_repaso>
<ejercicio_sugerido>Un ejercicio corto para practicar el punto débil principal (sin solución).</ejercicio_sugerido>
Responde SOLO con las etiquetas pedidas.`);
  try {
    const fuentes = Apuntes.last;
    const text = await ask(prompt, { fresh: true });
    const general = getTag(text, 'resumen_general');
    if (!general) throw new Error('No se pudo generar el resumen. Vuelve a intentarlo.');
    const propuestos = leerPuntos(getTag(text, 'puntos_debiles')).slice(0, 8);
    // Antes de guardar, el estudiante confirma qué puntos quedan: desmarca, edita texto y tipo.
    const decision = propuestos.length ? await confirmarDebiles(propuestos, k) : { confirmados: [] };
    const debiles = decision.cancelado ? [] : decision.confirmados;
    s.summary = {
      general,
      fuertes: toList(getTag(text, 'puntos_fuertes')),
      debiles,
      plan: toList(getTag(text, 'plan_de_repaso')),
      ejercicio: getTag(text, 'ejercicio_sugerido'),
      comprension: s.comprension, fecha: new Date().toISOString(), meta, saved: false, fuentes
    };
    if (!decision.cancelado && debiles.length) {
      await guardarDebil({
        key: k, materiaId, ejeId, subId,
        materia: meta.materia, eje: meta.eje, subtema: meta.subtema,
        fecha: s.summary.fecha, origen: 'chequeo',
        comprension: s.comprension, resumen: general, puntos: debiles
      });
      s.summary.saved = true;
      updateDebilesCount();
    }
    s.busy.resumen = false;
    if (key() === k) renderTeoria();
    // Cancelar no descarga nada; el .txt sale solo al confirmar (y lleva los puntos confirmados).
    if (decision.cancelado) {
      if (key() === k) mentor('Resumen listo. No guardé puntos débiles ni descargué el .txt.');
    } else {
      const ok = await saveFile(new Blob([buildResumenTxt(s, meta)], { type: 'text/plain;charset=utf-8' }), `resumen_${slug(meta.subtema)}_${today()}.txt`);
      if (key() === k) mentor(s.summary.saved ? `Guardé tus puntos débiles${ok ? ' y descargué el resumen' : ''}. La próxima vez que estudies este subtema los voy a reforzar.` : 'Resumen listo. No detecté puntos débiles para guardar: ¡muy bien!');
    }
  } catch (e) {
    s.err.chequeo = e.code ? aiError(e) : e.message;
  } finally {
    s.busy.resumen = false;
    if (key() === k && S.tab === 'teoria') renderTeoria();
  }
}
