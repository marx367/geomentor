// Texto del resumen de la sesión de comprensión (.txt): datos, resumen, fortalezas, débiles, plan y registro.
import { stamp } from '../nucleo/utilidades.js';

export function buildResumenTxt(s, meta) {
  const r = s.summary;
  const L = [];
  const line = '='.repeat(60);
  L.push(line, 'GEOMENTOR · RESUMEN DE LA SESIÓN DE COMPRENSIÓN', line);
  L.push(`Materia:   ${meta.materia}`, `Eje:       ${meta.eje}`, `Subtema:   ${meta.subtema}`, `Fecha:     ${stamp(new Date(r.fecha))}`, `Comprensión estimada: ${r.comprension}%`);
  if (r.fuentes?.total) L.push(`Apuntes consultados: ${r.fuentes.files.length ? r.fuentes.files.join(', ') : 'ninguno corresponde a este tema'}`);
  L.push('');
  L.push('RESUMEN GENERAL', '-'.repeat(60), r.general, '');
  if (r.fuertes.length) L.push('LO QUE YA ENTENDISTE', '-'.repeat(60), ...r.fuertes.map(x => '  ✔ ' + x), '');
  if (r.debiles.length) L.push('PUNTOS DÉBILES A REFORZAR', '-'.repeat(60), ...r.debiles.map(x => '  ✖ ' + x), '');
  if (r.plan.length) L.push('PLAN DE REPASO', '-'.repeat(60), ...r.plan.map((x, i) => `  ${i + 1}. ${x}`), '');
  if (r.ejercicio) L.push('EJERCICIO SUGERIDO', '-'.repeat(60), r.ejercicio, '');
  L.push(line, 'ANEXO · REGISTRO DE LA SESIÓN (fórmulas en notación LaTeX)', line);
  s.turns.forEach((t, i) => L.push(`[${i + 1}] Pregunta: ${t.q}`, `    Tu respuesta: ${t.a}`, `    Devolución del mentor:`, t.feedback.split('\n').map(x => '    ' + x).join('\n'), ''));
  return L.join('\n');
}
