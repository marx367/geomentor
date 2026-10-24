// Cabecera común de todos los prompts del tutor: materia, subtema, apuntes relevantes, bibliografía del tema, estilo del profesor,
// reglas del examen y puntos débiles. fitPrompt() achica el presupuesto de apuntes y libros hasta que el prompt entra en el límite.
import { clip, byteLen } from '../nucleo/utilidades.js';
import { S, key } from '../estado/estado.js';
import { textoEstilo } from '../estado/profesor.js';
import { apuntesRelevantes, Apuntes } from './busqueda-apuntes.js';
import { bibliografiaRelevante, capitulosDelTema, Biblio } from './bibliografia-tema.js';
import { materialPermitido, diasHastaExamen } from '../estado/reglas-examen.js';
import { etiquetaTipo, SIN_CLASIFICAR } from '../estado/tipos-error.js';
import { debilesActivos, puntosVigentes } from '../estado/debiles.js';
import { CITE_RULES, STRICT_RULES, REGLAS_EXAMEN, BIB_RULES, BIB_RULES_ESTRICTO } from './reglas-prompt.js';

export function debilesDelTema() {
  const k = key();
  return debilesActivos().filter(d => d.key === k).flatMap(d => puntosVigentes(d).map(p => p.tipo === SIN_CLASIFICAR ? p.texto : `${p.texto} [${etiquetaTipo(p.tipo)}]`)).slice(0, 12);
}
// Bloque de reglas del examen. Sin regla definida, no agrega nada.
function bloqueReglas() {
  const regla = REGLAS_EXAMEN[materialPermitido()];
  if (!regla) return '';
  const dias = diasHastaExamen();
  const cuando = dias === null ? '' : dias === 0 ? ' El examen es hoy.' : ` Faltan ${dias} ${dias === 1 ? 'día' : 'días'} para el examen.`;
  return `\n\n[REGLAS DEL EXAMEN]\n${regla}${cuando}`;
}
// Bloque de la bibliografía del tema. Sin capítulos asociados al subtema, no agrega nada.
function bloqueBibliografia(texto) {
  if (!texto) return '';
  return `\n\n[BIBLIOGRAFÍA DEL TEMA · FUENTE SECUNDARIA]\n${texto}\n\n${S.profesor.estricto ? BIB_RULES_ESTRICTO : BIB_RULES}`;
}
export function header(budget) {
  // Con capítulos asociados, el 40 % del presupuesto va a los libros y el resto a los apuntes (que mandan).
  const presupuestoLibros = capitulosDelTema().length ? Math.floor(budget * 0.4) : 0;
  const ap = apuntesRelevantes(budget - presupuestoLibros);
  const bib = bibliografiaRelevante(presupuestoLibros);
  // La línea de fuentes de cada respuesta lee Apuntes.last: se le suman los capítulos usados.
  Apuntes.last = { ...Apuntes.last, libros: [...Biblio.last] };
  const estilo = textoEstilo(); // estilo escrito + análisis del cuestionario (🎓 Profesor y bibliografía)
  const est = estilo ? clip(estilo, budget >= 12000 ? 11000 : budget >= 6000 ? 6000 : 3000) : '';
  const deb = debilesDelTema();
  return `Eres GeoMentor, un tutor universitario de matemática que prepara a un estudiante para exámenes reglamentados. Escribe en español neutro, con tono cercano y riguroso.
MATERIA: ${S.materia.nombre}
EJE TEMÁTICO: ${S.eje.nombre}
SUBTEMA: ${S.sub.nombre} (${S.sub.desc})

${ap ? `[APUNTES DEL CURSO · FUENTE PRINCIPAL]
${ap}

PRIORIDAD DE FUENTES: los apuntes anteriores son la referencia principal. Usa sus definiciones, su notación, sus nombres y sus métodos de resolución, aunque difieran de otros textos. ${S.profesor.estricto ? STRICT_RULES : 'Si necesitas algo que no está en los apuntes, compleméntalo con conocimiento general y márcalo con «(complemento: no figura en tus apuntes)».'} Si los apuntes tienen un error evidente, señálalo con respeto en lugar de repetirlo.

${CITE_RULES}` : `[APUNTES DEL CURSO]
${Object.keys(S.config.apuntes || {}).length ? '(Ninguno de los apuntes cargados corresponde a este subtema: usa el programa universitario estándar.)' : '(No hay apuntes cargados: usa el programa universitario estándar.)'}`}${bloqueBibliografia(bib)}

[ESTILO Y CRITERIOS DEL PROFESOR]
${est || '(Sin indicaciones: exige notación rigurosa, justificación de cada paso y verificación de condiciones.)'}${bloqueReglas()}

[PUNTOS DÉBILES GUARDADOS DEL ESTUDIANTE EN ESTE SUBTEMA]
${deb.length ? deb.map(p => '- ' + p).join('\n') : '(ninguno todavía)'}`;
}
export function fitPrompt(build) {
  for (const b of [20000, 12000, 6000, 2000, 0]) {
    const p = build(b);
    if (byteLen(p) < 60000) return p;
  }
  return build(0).slice(0, 25000);
}
