// Ejercicio del profesor: lee el enunciado (o la solución oficial) desde una foto o un PDF.
// - PDF con texto (o .txt / .md): se lee directo, sin IA.
// - Foto: la IA la transcribe. La imagen del enunciado se guarda para mostrarla y mandarla
//   en la corrección, porque puede traer una figura que la transcripción no reemplaza.
// El estudiante siempre revisa y edita la transcripción antes de practicar.
import { getTag } from '../../nucleo/etiquetas-xml.js';
import { ask } from '../../ia/cliente-ia.js';
import { aiError } from '../../ia/errores-ia.js';
import { leerArchivoApunte } from '../../apuntes/lector-archivos.js';
import { key, sess } from '../../estado/estado.js';
import { achicarImagen } from '../foto-resolucion.js';
import { propio } from './estado-propio.js';

const MAX_MB = 20;
const esImagen = f => /^image\//.test(f.type) || /\.(jpe?g|png|webp)$/i.test(f.name);
const esTexto = f => /\.(pdf|txt|md)$/i.test(f.name) || ['application/pdf', 'text/plain', 'text/markdown'].includes(f.type);

const PEDIDO = {
  enunciado: 'Transcribe el ENUNCIADO del ejercicio de la imagen, tal como está. Si hay una figura, descríbela en una línea entre corchetes, con sus rótulos y datos: [figura: …]. No lo resuelvas.',
  solucion: 'Transcribe la RESOLUCIÓN o la RESPUESTA del ejercicio que muestra la imagen, tal como está, paso a paso. No agregues ni corrijas nada.'
};

async function transcribir(imagen, que) {
  const texto = await ask(`TAREA: ${PEDIDO[que]} Si una parte es ilegible, escribe [ilegible] en su lugar.
<transcripcion>El texto en Markdown, con fórmulas en LaTeX ($...$ en línea, $$...$$ en bloque).</transcripcion>
Responde SOLO con esa etiqueta.`, { fresh: true, images: [imagen.blob] });
  const t = getTag(texto, 'transcripcion');
  // Control con reglas: una transcripción vacía o de pocas letras no sirve para practicar.
  if (t.replace(/\s/g, '').length < 10) throw new Error('No pude leer la imagen. Prueba con una foto más nítida, de frente y con buena luz.');
  return t;
}

// que: 'enunciado' | 'solucion'. Deja el texto en s.propio para que el estudiante lo revise.
export async function cargarArchivo(file, que, redibujar) {
  if (!file) return;
  const k = key(), s = sess(k), p = propio(s);
  s.err.profesor = '';
  if (file.size > MAX_MB * 1024 * 1024) { s.err.profesor = `«${file.name}» pesa más de ${MAX_MB} MB.`; redibujar(); return; }
  if (!esImagen(file) && !esTexto(file)) { s.err.profesor = `«${file.name}» no es una foto (JPG, PNG o WEBP) ni un PDF.`; redibujar(); return; }
  p.leyendo = file.name;
  redibujar();
  try {
    if (esImagen(file)) {
      const imagen = await achicarImagen(file);
      const texto = await transcribir(imagen, que);
      if (que === 'enunciado') { p.enunciado = texto; p.imagen = imagen; } else p.solucion = texto;
    } else {
      const texto = (await leerArchivoApunte(file)).trim();
      if (que === 'enunciado') { p.enunciado = texto; p.imagen = null; } else p.solucion = texto;
    }
  } catch (e) {
    s.err.profesor = e.code === 'escaneado' ? `«${file.name}» parece escaneado (no tiene texto). Sácale una foto y súbela como imagen.`
      : e.code ? aiError(e) : e.message === 'imagen ilegible' ? 'No pude abrir esa imagen. Si es HEIC (iPhone), conviértela a JPG o PNG.' : e.message;
  } finally {
    p.leyendo = '';
    if (key() === k) redibujar();
  }
}
