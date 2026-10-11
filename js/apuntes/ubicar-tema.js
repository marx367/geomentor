// Lógica de "＋ Tema de hoy" (sin pantalla: el diálogo está en dialogo-tema-hoy.js).
// La IA propone en qué eje va la clase (uno que ya existe o uno nuevo) y cómo se llama el subtema.
// Sin IA configurada, se arma una propuesta simple con el título de la clase.
import { clip, limpiarTexto } from '../nucleo/utilidades.js';
import { getTag } from '../nucleo/etiquetas-xml.js';
import { ask } from '../ia/cliente-ia.js';
import { aiReady } from '../ia/config-ia.js';

const MAX_APUNTES = 20000; // caracteres de apuntes que se mandan: alcanzan para ubicar el tema

// Propuesta sin IA: el subtema se llama como la clase; el eje es el elegido o uno nuevo (con su nombre o el título).
export function propuestaLocal({ eje, ejeNuevoNombre, titulo }) {
  return {
    ejeId: eje?.id || '',
    ejeNuevo: eje ? null : { nombre: ejeNuevoNombre || titulo, icono: '📚', desc: '' },
    subtema: { nombre: titulo, desc: '' }
  };
}

// materia: la materia elegida (null si es nueva). eje: el eje elegido. ejeNuevoNombre: eje nuevo que escribió
// el estudiante. Sin ninguno de los dos, la IA elige o propone el eje.
export async function proponerUbicacion({ materia, nombreMateria, eje, ejeNuevoNombre, titulo, texto }) {
  if (!aiReady()) return { ...propuestaLocal({ eje, ejeNuevoNombre, titulo }), sinIA: true };
  const ejes = materia?.ejes || [];
  const listaEjes = ejes.length
    ? ejes.map(e => `- ${e.id}: ${e.nombre} (subtemas: ${e.subtemas.map(s => s.nombre).join(', ') || 'ninguno'})`).join('\n')
    : '(la materia todavía no tiene ejes)';
  const tareaEje = eje
    ? `El estudiante ya eligió el eje «${eje.nombre}»: en <eje_existente> escribe exactamente ${eje.id}.`
    : ejeNuevoNombre
    ? `El estudiante crea el eje nuevo «${ejeNuevoNombre}»: deja <eje_existente> vacío y en <eje_nuevo> usa ese nombre.`
    : 'Si la clase encaja en uno de los ejes existentes, escribe su id en <eje_existente>. Si no encaja en ninguno, deja <eje_existente> vacío y propone un eje nuevo, amplio (una unidad del programa, no un tema suelto).';
  const out = await ask(`Eres GeoMentor, tutor universitario de matemática. El estudiante cargó la clase de hoy.
MATERIA: ${nombreMateria}
EJES QUE YA EXISTEN:
${listaEjes}
TÍTULO DE LA CLASE: ${titulo}
[APUNTES DE LA CLASE]
${texto ? clip(texto, MAX_APUNTES) : '(sin apuntes: usa solo el título)'}

TAREA: ubica la clase dentro de la materia. ${tareaEje} El subtema es lo que se vio hoy: nombre corto (máximo 8 palabras) y una frase que diga qué se estudia.
Formato exacto:
<eje_existente>id o vacío</eje_existente>
<eje_nuevo><nombre>nombre del eje</nombre><icono>un solo emoji</icono><desc>una frase</desc></eje_nuevo>
<subtema><nombre>nombre del subtema</nombre><desc>una frase</desc></subtema>
Responde solo con las etiquetas.`, { fresh: true });

  // La respuesta se valida: un id que no existe se ignora y los textos se recortan.
  const idPropuesto = getTag(out, 'eje_existente').trim();
  const ejeOk = eje || (ejeNuevoNombre ? null : ejes.find(e => e.id === idPropuesto)) || null;
  const bloqueEje = getTag(out, 'eje_nuevo'), bloqueSub = getTag(out, 'subtema');
  const nombreEje = limpiarTexto(getTag(bloqueEje, 'nombre'), 80);
  return {
    ejeId: ejeOk?.id || '',
    ejeNuevo: ejeOk ? null : { nombre: ejeNuevoNombre || nombreEje || titulo, icono: [...(getTag(bloqueEje, 'icono') || '📚')].slice(0, 2).join(''), desc: limpiarTexto(getTag(bloqueEje, 'desc'), 300) },
    subtema: { nombre: limpiarTexto(getTag(bloqueSub, 'nombre')) || titulo, desc: limpiarTexto(getTag(bloqueSub, 'desc'), 300) }
  };
}
