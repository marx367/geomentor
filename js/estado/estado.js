// Estado en memoria de la app: vista actual, selección (materia/eje/subtema), configuración,
// progreso y una sesión de trabajo por subtema. No se guarda solo: ver almacen.js.
export const S = {
  view: 'materias', tab: 'teoria',
  materia: null, eje: null, sub: null,
  config: { apuntes: {}, estilo: '', asignacion: {}, estricto: false, ejesGen: {}, planes: {} },
  progreso: { temas: {} },
  debiles: [],
  cache: {}, sessions: {}
};
export const ejesDe = m => [...m.ejes, ...((S.config.ejesGen || {})[m.id] || [])];
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
