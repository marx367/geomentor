// Pestaña 1 · pide a la IA el material del subtema (teoría, ideas clave, primera pregunta, tips y gráfico)
// y lo guarda en S.cache. El gráfico se manda al laboratorio con el aviso 'cargar-grafico'.
import { getTag, toList } from '../nucleo/etiquetas-xml.js';
import { S, key, sess } from '../estado/estado.js';
import { ask } from '../ia/cliente-ia.js';
import { aiError } from '../ia/errores-ia.js';
import { Apuntes } from '../contexto/busqueda-apuntes.js';
import { header, fitPrompt } from '../contexto/cabecera-prompt.js';
import { FORMAT_RULES, LAB_SYNTAX } from '../contexto/reglas-prompt.js';
import { avisar } from './registro.js';
import { rerenderCurrent } from '../ui/navegacion.js';
import { renderTeoria } from './teoria.js';

export async function loadContent(fresh) {
  const k = key(), s = sess(k), sub = S.sub;
  s.busy.teoria = true; s.err.teoria = '';
  if (S.tab === 'teoria') renderTeoria();
  const prompt = fitPrompt(b => `${header(b)}

TAREA: prepara el material de estudio del subtema.
<teoria>Explicación de 300 a 500 palabras: definiciones, fórmulas en LaTeX, notación que se exige en examen, un ejemplo resuelto breve y los errores frecuentes. Usa ### para los apartados.</teoria>
<ideas_clave>Entre 6 y 10 líneas, cada una empezando con "- ".</ideas_clave>
<pregunta>Una pregunta socrática inicial que obligue a razonar (no a recitar una definición). Si hay puntos débiles guardados, apunta a uno de ellos.</pregunta>
<tips>3 o 4 consejos de examen muy breves, cada uno en una línea que empiece con "- ", sin LaTeX.</tips>
<grafico>De 2 a 6 líneas en la sintaxis del laboratorio que ilustren el subtema.</grafico>

${LAB_SYNTAX}

${FORMAT_RULES}`);
  try {
    const fuentes = Apuntes.last;
    const text = await ask(prompt, { fresh });
    const teoria = getTag(text, 'teoria');
    if (!teoria) throw new Error('La respuesta no trajo el contenido esperado. Vuelve a intentarlo.');
    const c = {
      teoria,
      ideas: toList(getTag(text, 'ideas_clave')).slice(0, 10),
      pregunta: getTag(text, 'pregunta') || `Explica con tus palabras la idea central de «${sub.nombre}».`,
      tips: toList(getTag(text, 'tips')),
      grafico: getTag(text, 'grafico').split('\n').map(l => l.replace(/^\s*[-*]\s+/, '').replace(/`/g, '').trim()).filter(Boolean)
    };
    c.fuentes = fuentes;
    S.cache[k] = c;
    if (!s.currentQ) s.currentQ = c.pregunta;
    if (!s.lab) { s.lab = c.grafico; if (key() === k) avisar('cargar-grafico', c.grafico); }
  } catch (e) {
    s.err.teoria = e.code ? aiError(e) : e.message;
  } finally {
    s.busy.teoria = false;
    if (key() === k) rerenderCurrent();
  }
}
