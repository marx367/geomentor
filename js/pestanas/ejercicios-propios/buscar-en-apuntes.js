// Busca, con la IA, los ejercicios que ya están escritos en los apuntes y libros del tema.
// Después de la IA hay un control con reglas: cada enunciado se busca en el texto original
// para marcar si está tal cual o si la IA pudo haberlo reescrito o inventado.
import { norm } from '../../nucleo/utilidades.js';
import { getTag, getTags } from '../../nucleo/etiquetas-xml.js';
import { ask } from '../../ia/cliente-ia.js';
import { aiError } from '../../ia/errores-ia.js';
import { header, fitPrompt } from '../../contexto/cabecera-prompt.js';
import { FORMAT_RULES } from '../../contexto/reglas-prompt.js';
import { key, sess } from '../../estado/estado.js';
import { propio, fuentesDelTema } from './estado-propio.js';

const MAX_EJERCICIOS = 8;
// Solo letras y números, sin tildes: así no influyen los espacios, los saltos de línea ni el formato.
const compacto = s => norm(s).replace(/\$|\\[a-z]+/g, '').replace(/[^a-z0-9]/g, '');

// Control con reglas: ¿un tramo del comienzo del enunciado aparece en alguna fuente?
export function estaEnLasFuentes(enunciado, fuentes) {
  const muestra = compacto(enunciado).slice(0, 30);
  if (muestra.length < 12) return false; // demasiado corto para afirmarlo
  return fuentes.some(f => compacto(f.texto).includes(muestra));
}

function leerEncontrados(texto, fuentes) {
  return getTags(texto, 'ejercicio_encontrado').map(item => ({
    origen: getTag(item, 'origen'),
    enunciado: getTag(item, 'enunciado'),
    solucionDada: getTag(item, 'solucion_dada')
  })).filter(e => e.enunciado.length >= 10).slice(0, MAX_EJERCICIOS)
    .map(e => ({ ...e, textual: estaEnLasFuentes(e.enunciado, fuentes) }));
}

export async function buscarEnApuntes(redibujar) {
  const k = key(), s = sess(k), p = propio(s);
  const fuentes = fuentesDelTema();
  s.busy.buscar = true; s.err.buscar = '';
  redibujar();
  const prompt = fitPrompt(b => `${header(b)}

TAREA: busca en los APUNTES y en la BIBLIOGRAFÍA de arriba los ejercicios, problemas o ejemplos resueltos de este subtema. NO inventes ninguno: copia solo los que están escritos ahí. Como máximo ${MAX_EJERCICIOS}. Para cada uno:
<ejercicio_encontrado>
<origen>Nombre exacto del archivo o del libro, como figura en su encabezado «=== ... ===».</origen>
<enunciado>El enunciado copiado tal cual, con sus datos (Markdown y LaTeX).</enunciado>
<solucion_dada>Si la fuente trae la resolución o el resultado, cópialo tal cual; si no lo trae, deja la etiqueta vacía.</solucion_dada>
</ejercicio_encontrado>
Si no hay ningún ejercicio, responde solo <ninguno></ninguno>.

${FORMAT_RULES}`);
  try {
    const texto = await ask(prompt, { fresh: true });
    p.encontrados = leerEncontrados(texto, fuentes);
  } catch (e) {
    s.err.buscar = e.code ? aiError(e) : e.message;
  } finally {
    s.busy.buscar = false;
    if (key() === k) redibujar();
  }
}
