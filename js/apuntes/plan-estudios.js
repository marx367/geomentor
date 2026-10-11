// Lógica del plan de estudios consolidado (sin pantalla: el diálogo está en dialogo-plan.js):
// qué apuntes entran, el prompt de cada sección, la limpieza de la respuesta, el cronograma y el armado del .md.
import { slug, stamp } from '../nucleo/utilidades.js';
import { S } from '../estado/estado.js';
import { header, fitPrompt } from '../contexto/cabecera-prompt.js';
import { apuntesDeMateria } from './estructura-ejes.js';

export const planFileName = m => `plan_de_estudios_${slug(m.nombre)}.md`;
export const esPlan = t => /^#\s*PLAN DE ESTUDIOS CONSOLIDADO/m.test(t) && /ESTRUCTURA DEL PLAN/.test(t);
// Fuentes para consolidar: los apuntes de la materia que no son ya un plan consolidado.
export function fuentesPlan(m) {
  const fname = planFileName(m);
  const todos = apuntesDeMateria(m).filter(([n]) => n !== fname);
  return { files: todos.filter(([, t]) => !esPlan(t)), omitidos: todos.filter(([, t]) => esPlan(t)).map(([n]) => n) };
}

// Pone un tema temporal en el estado para reutilizar header() y lo restaura al terminar.
export function conTema(m, e, sb, fn) {
  const prev = { materia: S.materia, eje: S.eje, sub: S.sub };
  S.materia = m;
  S.eje = { id: 'tmp-eje', nombre: e.nombre, desc: e.desc || '', subtemas: [] };
  S.sub = { id: 'tmp-sub', nombre: sb.nombre, desc: sb.desc || '', archivos: sb.archivos || [] };
  try { return fn(); } finally { Object.assign(S, prev); }
}
export function promptSeccion(m, e, sb, num, completar) {
  const esComp = /\(complemento\)\s*$/i.test(sb.nombre);
  return conTema(m, e, sb, () => fitPrompt(b => `${header(b)}

TAREA: redacta la sección ${num} de un PLAN DE ESTUDIOS CONSOLIDADO para el examen, sobre el subtema «${sb.nombre}» (eje «${e.nombre}»). El plan reemplaza a los apuntes originales, así que debe ser completo, limpio y coherente.
Reglas:
- Une lo que dicen todas las fuentes sobre este subtema sin repetir contenido.
- Elimina marcas de citas numéricas como [12] o «1, 2», y cualquier pregunta final de chatbot (por ejemplo «¿Querés que…?»).
- Usa la notación y los métodos del ESTILO DEL PROFESOR. Si las fuentes se contradicen o contradicen al profesor, sigue al profesor y aclara la corrección en una frase.
- Valores exactos: fracciones simplificadas y radicales extraídos. Un decimal solo entre paréntesis como aproximación, por ejemplo $\\sqrt{5}$ ($\\approx 2{,}24$).
- Verifica cada cálculo del ejercicio modelo antes de escribirlo.
- Para esta tarea ignora la regla de CITAS: en lugar de citar en el texto, lista los archivos usados en la línea «**Fuentes:**».
- ${completar
    ? `Si falta algo necesario para el examen, agrégalo SOLO dentro de bloques con este formato exacto (cada marca en su línea):
:::complemento
**Qué agrego:** …
**Por qué:** qué falta en los apuntes.
**Para qué:** qué le permite entender o resolver al estudiante.
:::${esComp ? '\n- Este subtema entero no figura en los apuntes: todo su contenido va dentro de bloques «complemento».' : ''}`
    : 'Usa SOLO lo que está en los apuntes; si algo falta, dilo en una frase sin completarlo.'}
- Extensión: entre 250 y 650 palabras.

Formato exacto (Markdown, sin texto antes ni después):
## ${num} ${sb.nombre}

**Fuentes:** nombres exactos de los archivos usados (o «complemento»)

### Teoría
### Fórmulas clave
### Notación y criterios del profesor
### Errores y trampas de parcial
### Ejercicio modelo
Resolución con los pasos del profesor: identificación de datos, fórmula completa, desarrollo exacto, verificación, qué debe mostrar el gráfico y respuesta final.`));
}
export function limpiarSeccion(txt, num, nombre) {
  let t = String(txt || '').replace(/^```[a-z]*\n?|```\s*$/gim, '').trim();
  const i = t.search(/^##\s/m);
  if (i > 0) t = t.slice(i);
  if (!/^##\s/.test(t)) t = `## ${num} ${nombre}\n\n${t}`;
  return t;
}
export function cronogramaPlan(ejes, dias) {
  dias = Math.max(3, Math.min(90, Math.round(dias) || 12));
  const subs = ejes.flatMap((e, i) => e.subtemas.map((s, j) => ({ eje: i + 1, num: `${i + 1}.${j + 1}`, nombre: s.nombre, ultimo: j === e.subtemas.length - 1 })));
  const reserva = dias >= 6 ? 2 : 1;
  const estudio = dias - reserva;
  const per = subs.length / estudio;
  const L = [];
  for (let d = 0; d < estudio; d++) {
    const del = subs.slice(Math.round(d * per), Math.round((d + 1) * per));
    const cierre = del.filter(x => x.ultimo).map(x => `Examen de práctica del Eje ${x.eje}.`).join(' ');
    L.push(`- **Día ${d + 1}:** ${del.length ? del.map(x => `${x.num} ${x.nombre}`).join(', ') + '.' : 'repaso de lo visto y ejercicios extra de nivel «Parcial».'}${cierre ? ' ' + cierre : ''}`);
  }
  if (reserva === 2) L.push(`- **Día ${dias - 1}:** repaso de todos los 📌 puntos débiles guardados y un examen de práctica por eje.`);
  L.push(`- **Día ${dias}:** simulacro completo en nivel «Examen reglamentado» y descanso.`);
  return { dias, texto: L.join('\n') };
}
export function armarPlan(m, ejes, secciones, nombres, dias, completar) {
  const cr = cronogramaPlan(ejes, dias);
  const estructura = ejes.map((e, i) => `- **Eje ${i + 1}: ${e.nombre}**\n${e.subtemas.map((s, j) => `  - ${i + 1}.${j + 1} ${s.nombre}`).join('\n')}`).join('\n');
  return `# PLAN DE ESTUDIOS CONSOLIDADO · ${m.nombre}

**Generado:** ${stamp()}
**Fuentes consolidadas:** ${nombres.join(' · ')}
**Criterios de notación y corrección:** estilo del profesor cargado en 🎓 Profesor y bibliografía.

**Cómo leer este plan.** El contenido proviene de las fuentes listadas.${completar ? ' Lo que no figuraba en ellas aparece dentro de bloques «complemento», con qué se agrega, por qué y para qué.' : ''}

---

## ESTRUCTURA DEL PLAN (ejes y subtemas)

${estructura}

---

## CRONOGRAMA (${cr.dias} días)

Rutina diaria en GeoMentor para cada subtema del día: (1) leer la teoría y responder el chequeo socrático hasta llegar a 70 % de comprensión; (2) resolver un ejercicio nivel «Parcial» con los pasos del profesor, gráfico incluido, y corregirlo; (3) exportar el resumen de la sesión para guardar los puntos débiles.

${cr.texto}

---

${secciones.join('\n\n---\n\n')}
`;
}
