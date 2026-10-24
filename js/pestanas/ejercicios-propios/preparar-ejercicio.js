// Convierte un enunciado que ya existe (de los apuntes, de un libro o del profesor) en un ejercicio guiado:
// la IA arma las pistas, el gráfico y, solo si la fuente no trae solución, una solución de referencia.
// El resultado queda en s.exercise con el mismo formato que el ejercicio del tutor, así la pantalla,
// las pistas y la corrección funcionan igual. solucionOrigen dice de dónde salió la solución:
// 'fuente' (la de los apuntes, el libro o el profesor) o 'ia' (no verificada).
import { getTag, getTags } from '../../nucleo/etiquetas-xml.js';
import { ask } from '../../ia/cliente-ia.js';
import { aiError } from '../../ia/errores-ia.js';
import { Apuntes } from '../../contexto/busqueda-apuntes.js';
import { header, fitPrompt } from '../../contexto/cabecera-prompt.js';
import { FORMAT_RULES, LAB_SYNTAX } from '../../contexto/reglas-prompt.js';
import { key, sess } from '../../estado/estado.js';

const DE_DONDE = { apuntes: 'figura en los apuntes o en la bibliografía del estudiante', profesor: 'lo dio el profesor' };

// datos: { origen: 'apuntes' | 'profesor', enunciado, solucionDada, imagen, fuenteNombre }. Devuelve true si quedó listo.
export async function prepararEjercicio(datos, redibujar) {
  const k = key(), s = sess(k);
  const { origen, enunciado, solucionDada = '', imagen = null, fuenteNombre = '' } = datos;
  s.busy.ejercicio = true; s.err.ejercicio = '';
  redibujar();
  const prompt = fitPrompt(b => `${header(b)}

TAREA: prepara la práctica guiada de ESTE ejercicio, que ${DE_DONDE[origen]}. No cambies el enunciado ni inventes datos.
[ENUNCIADO]
${enunciado}
${imagen ? 'Se adjunta la imagen original del enunciado: puede tener una figura necesaria para resolverlo.' : ''}
${solucionDada ? `[SOLUCIÓN DE LA FUENTE]\n${solucionDada}\nEs la referencia: las pistas tienen que llevar a esa solución.` : ''}
<pista>Pista 1: orienta hacia el concepto a usar, sin cálculos.</pista>
<pista>Pista 2: plantea la ecuación o el procedimiento.</pista>
<pista>Pista 3: casi resuelto, deja solo el último paso.</pista>
${solucionDada ? '' : '<solucion>Resolución completa, paso a paso, con justificación y verificación final.</solucion>'}
<grafico>Solo si el ejercicio es del plano cartesiano: de 2 a 6 líneas en la sintaxis del laboratorio con sus datos. Si no lo es (por ejemplo, geometría del espacio o descriptiva), deja la etiqueta vacía.</grafico>

${LAB_SYNTAX}

${FORMAT_RULES}`);
  try {
    const fuentes = Apuntes.last;
    const texto = await ask(prompt, { fresh: true, images: imagen ? [imagen.blob] : null });
    const solucion = solucionDada || getTag(texto, 'solucion');
    // Control con reglas: sin solución de referencia no se puede corregir contra nada.
    if (!solucion) throw new Error('No llegó la solución de referencia. Vuelve a intentarlo o carga la solución oficial.');
    s.exercise = {
      origen, fuenteNombre, fuentes, enunciado, imagen,
      pistas: getTags(texto, 'pista').slice(0, 3),
      solucion, solucionOrigen: solucionDada ? 'fuente' : 'ia',
      grafico: getTag(texto, 'grafico').split('\n').map(l => l.replace(/^\s*[-*]\s+/, '').replace(/`/g, '').trim()).filter(Boolean)
    };
    s.hints = 0; s.showSol = false; s.correction = ''; s.resolucion = ''; s.photo = null; s.pizarra = null;
    return true;
  } catch (e) {
    s.err.ejercicio = e.code ? aiError(e) : e.message;
    return false;
  } finally {
    s.busy.ejercicio = false;
    if (key() === k) redibujar();
  }
}
