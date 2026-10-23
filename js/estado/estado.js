// Estado en memoria de la app: vista actual, selección (materia/eje/subtema), Mi curso (ver curso.js),
// profesor y biblioteca (ver profesor.js), hojas de errores (ver hojas.js), configuración, progreso y una sesión de trabajo por subtema. No se guarda solo: ver almacen.js.
export const S = {
  view: 'materias', tab: 'teoria',
  materia: null, eje: null, sub: null,
  curso: { materias: [] },
  profesor: { estilo: '', respuestas: {}, analisis: '', estricto: false },
  biblioteca: { libros: [] },
  config: { apuntes: {}, asignacion: {}, planes: {}, reglasExamen: { material: null, fecha: '' } }, // reglas: ver reglas-examen.js
  progreso: { temas: {} },
  debiles: [],
  hojas: {}, // hojas de errores editadas, por subtema: ver hojas.js
  cache: {}, sessions: {}
};
export const key = () => S.sub ? `${S.materia.id}/${S.eje.id}/${S.sub.id}` : null;
export function sess(k = key()) {
  if (!k) return null;
  return S.sessions[k] ||= {
    turns: [], currentQ: '', draft: '', comprension: 0, entendido: [], falta: [], summary: null,
    exercise: null, hints: 0, showSol: false, nivel: 'Parcial', resolucion: '', photo: null, correction: '',
    exam: null, lab: null, analysis: '',
    busy: {}, err: {}
  };
}
