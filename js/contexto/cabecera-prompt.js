// Cabecera común de todos los prompts del tutor: materia, subtema, apuntes relevantes, estilo del profesor
// y puntos débiles. fitPrompt() achica el presupuesto de apuntes hasta que el prompt entra en el límite.
import { clip, byteLen } from '../nucleo/utilidades.js';
import { S, key } from '../estado/estado.js';
import { apuntesRelevantes } from './busqueda-apuntes.js';
import { CITE_RULES, STRICT_RULES } from './reglas-prompt.js';

export function debilesDelTema() {
  const k = key();
  return S.debiles.filter(d => d.key === k).flatMap(d => d.puntos || []).slice(0, 12);
}
export function header(budget) {
  const ap = apuntesRelevantes(budget);
  const est = S.config.estilo ? clip(S.config.estilo, budget >= 12000 ? 11000 : budget >= 6000 ? 6000 : 3000) : '';
  const deb = debilesDelTema();
  return `Eres GeoMentor, un tutor universitario de matemática que prepara a un estudiante para exámenes reglamentados. Escribe en español neutro, con tono cercano y riguroso.
MATERIA: ${S.materia.nombre}
EJE TEMÁTICO: ${S.eje.nombre}
SUBTEMA: ${S.sub.nombre} (${S.sub.desc})

${ap ? `[APUNTES DEL CURSO · FUENTE PRINCIPAL]
${ap}

PRIORIDAD DE FUENTES: los apuntes anteriores son la referencia principal. Usa sus definiciones, su notación, sus nombres y sus métodos de resolución, aunque difieran de otros textos. ${S.config.estricto ? STRICT_RULES : 'Si necesitas algo que no está en los apuntes, compleméntalo con conocimiento general y márcalo con «(complemento: no figura en tus apuntes)».'} Si los apuntes tienen un error evidente, señálalo con respeto en lugar de repetirlo.

${CITE_RULES}` : `[APUNTES DEL CURSO]
${Object.keys(S.config.apuntes || {}).length ? '(Ninguno de los apuntes cargados corresponde a este subtema: usa el programa universitario estándar.)' : '(No hay apuntes cargados: usa el programa universitario estándar.)'}`}

[ESTILO Y CRITERIOS DEL PROFESOR]
${est || '(Sin indicaciones: exige notación rigurosa, justificación de cada paso y verificación de condiciones.)'}

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
