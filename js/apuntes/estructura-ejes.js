// Lógica para generar ejes y subtemas desde los apuntes con la IA (sin pantalla: el diálogo está en dialogo-ejes.js).
// Etapa 1: material (texto completo, o índices por partes si es largo). Etapa 2: la IA propone ejes en etiquetas.
import { clip, slug } from '../nucleo/utilidades.js';
import { getTag, getTags } from '../nucleo/etiquetas-xml.js';
import { S } from '../estado/estado.js';
import { ask } from '../ia/cliente-ia.js';
import { coded } from '../ia/errores-ia.js';
import { chunksOf } from '../contexto/busqueda-apuntes.js';

// Apuntes de una materia: los asignados a ella (o a un eje/subtema suyo) y los sin asignar.
export function apuntesDeMateria(m) {
  return Object.entries(S.config.apuntes || {}).filter(([n]) => {
    const sc = (S.config.asignacion || {})[n] || '';
    return !sc || sc === m.id || sc.startsWith(m.id + '/');
  });
}
// Si algún apunte trae una sección «ESTRUCTURA DEL PLAN», se usa tal cual.
export function estructuraDePlan(files) {
  const pref = S.materia ? (S.config.planes || {})[S.materia.id] : null;
  const orden = [...files].sort((a, b) => (b[0] === pref) - (a[0] === pref));
  for (const [n, t] of orden) {
    const i = t.search(/^#{1,3}\s*ESTRUCTURA DEL PLAN/im);
    if (i < 0) continue;
    const rest = t.slice(i);
    const end = rest.slice(1).search(/\n---|\n#{1,2}\s/);
    return { file: n, text: end >= 0 ? rest.slice(0, end + 1) : rest.slice(0, 8000) };
  }
  return null;
}
// Etapa 1: material para decidir la estructura (texto completo o índices por partes).
export async function materialDeApuntes(m, files, onProgress, cancelado = () => false) {
  const total = files.reduce((a, [, t]) => a + t.length, 0);
  if (total <= 28000) return files.map(([n, t]) => `=== ${n} ===\n${t}`).join('\n\n');
  const lotes = [];
  let cur = [], size = 0;
  for (const c of files.flatMap(([n, t]) => chunksOf(n, t))) {
    if (size + c.p.length > 24000 && cur.length) { lotes.push(cur); cur = []; size = 0; }
    cur.push(c); size += c.p.length;
  }
  if (cur.length) lotes.push(cur);
  const indices = [];
  for (let i = 0; i < lotes.length; i++) {
    if (cancelado()) throw coded('cancelado', 'Cancelado.');
    onProgress(`Leyendo tus apuntes (parte ${i + 1} de ${lotes.length})…`);
    let txt = '', fileCur = null;
    for (const c of lotes[i]) { if (c.file !== fileCur) { txt += `\n\n=== ${c.file} ===\n`; fileCur = c.file; } else txt += '\n\n'; txt += c.p; }
    const out = await ask(`Eres un asistente que ordena apuntes universitarios de ${m.nombre}.
[FRAGMENTO DE APUNTES]
${txt}

TAREA: extrae el índice detallado de este fragmento, en el orden en que aparece. Una línea por tema con el formato:
- [nombre_del_archivo] Tema: qué se ve (definiciones, fórmulas y métodos clave)
Máximo 40 líneas. Responde solo con la lista.`, { fresh: true });
    indices.push(out.trim());
  }
  return `(Índices extraídos de los apuntes, en orden)\n${clip(indices.join('\n'), 40000)}`;
}
// Etapa 2: ejes y subtemas en etiquetas.
export async function proponerEstructura(m, material, nombres, { completar = false, explicita = false } = {}) {
  const tarea = explicita
    ? 'TAREA: el material trae una estructura de plan definida por el estudiante. Reprodúcela EXACTAMENTE: mismos ejes, subtemas, nombres y orden (puedes quitar la numeración de los nombres).'
    : `TAREA: organiza el contenido de los apuntes en ejes temáticos y subtemas para preparar el examen. Respeta el orden y los nombres que usan los apuntes. ${completar
      ? 'Incluye todos los temas de los apuntes y AGREGA los temas típicos del programa que falten y sean necesarios para el examen; marca esos subtemas agregados terminando su nombre con « (complemento)».'
      : 'Incluye SOLO temas que aparezcan en ellos.'} Entre 1 y 8 ejes; cada eje con 2 a 8 subtemas.`;
  const text = await ask(`Eres GeoMentor, tutor universitario de matemática. MATERIA: ${m.nombre}.
Archivos disponibles: ${nombres.join(', ')}

[MATERIAL]
${material}

${tarea}
Formato exacto, repetido por cada eje:
<eje>
<nombre>nombre del eje</nombre>
<icono>un solo emoji</icono>
<desc>una frase que resuma el eje</desc>
<subtema><nombre>nombre del subtema</nombre><desc>qué se estudia, en una frase</desc><archivos>nombres exactos de los archivos donde está, separados por coma (vacío si es complemento)</archivos></subtema>
</eje>
Responde solo con las etiquetas.`, { fresh: true });
  const lower = nombres.map(n => n.toLowerCase());
  const ejes = getTags(text, 'eje').map(block => {
    const head = block.split('<subtema>')[0];
    return {
      nombre: getTag(head, 'nombre'),
      icono: [...(getTag(head, 'icono') || '📚')].slice(0, 2).join('') || '📚',
      desc: getTag(head, 'desc'),
      subtemas: getTags(block, 'subtema').map(sb => ({
        nombre: getTag(sb, 'nombre'),
        desc: getTag(sb, 'desc'),
        archivos: getTag(sb, 'archivos').split(/[,;\n]/).map(x => x.trim().replace(/^\[|\]$/g, '')).map(x => { const i = lower.indexOf(x.toLowerCase()); return i >= 0 ? nombres[i] : null; }).filter(Boolean)
      })).filter(x => x.nombre)
    };
  }).filter(e => e.nombre && e.subtemas.length);
  if (!ejes.length) throw new Error('No se pudieron armar ejes con la respuesta del modelo. Prueba de nuevo.');
  return ejes;
}

// Convierte la propuesta editada en ejes definitivos, con ids únicos que no choquen con los fijos.
export function normalizarEjes(m, draft) {
  const usados = new Set(m.ejes.map(e => e.id));
  return draft.filter(e => e.nombre && e.subtemas.some(x => x.nombre)).map(e => {
    let id = 'ap-' + slug(e.nombre), n = 2;
    while (usados.has(id)) id = `ap-${slug(e.nombre)}-${n++}`;
    usados.add(id);
    const subIds = new Set();
    return {
      id, nombre: e.nombre, icono: e.icono || '📚', desc: e.desc || 'Generado desde tus apuntes.', generado: true,
      subtemas: e.subtemas.filter(x => x.nombre).map(x => {
        let sid = slug(x.nombre), k = 2;
        while (subIds.has(sid)) sid = `${slug(x.nombre)}-${k++}`;
        subIds.add(sid);
        return { id: sid, nombre: x.nombre, desc: x.desc || 'Tema de tus apuntes.', archivos: x.archivos };
      })
    };
  });
}
