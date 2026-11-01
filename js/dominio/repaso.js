// Vencimientos de repaso de cada tema (offsets desde su fecha de clase) y cercanía del examen.
import { esFecha, sumarDias, diasEntre } from './fechas.js';
import { intentosHasta } from './estudio.js';

export const EXAMEN_ESTIMADO = '2026-12-03';   // fecha estimada; el examen real no está confirmado
export const OFFSETS = [
  { dia: 0,  tipo: 'reconstruir' },
  { dia: 1,  tipo: 'practicar'   },
  { dia: 3,  tipo: 'repasar'     },
  { dia: 7,  tipo: 'repasar'     },
  { dia: 14, tipo: 'integrar'    },
];

// Con menos días que estos, no hay tiempo para el ciclo completo.
const DIAS_CICLO_MINIMO = 3;

/**
 * Un vencimiento está hecho si hubo algún intento desde su fecha hasta hoy.
 * @returns {{tipo:string, fecha:string, vence:boolean, diasVencido:number, dia:number, hecho:boolean}[]}
 */
export function vencimientos(tema, hoy) {
  if (!esFecha(tema?.fechaClase) || !esFecha(hoy)) return [];
  const fechasIntentos = intentosHasta(tema, hoy).map(i => i.fecha);
  return OFFSETS
    .map(({ dia, tipo }) => ({ dia, tipo, fecha: sumarDias(tema.fechaClase, dia) }))
    .filter(v => v.fecha)
    .map(({ dia, tipo, fecha }) => {
      const vence = fecha <= hoy;
      return { tipo, fecha, vence, diasVencido: vence ? diasEntre(fecha, hoy) : 0, dia, hecho: fechasIntentos.some(f => f >= fecha) };
    });
}

/** La fecha confirmada si es válida; si no, la estimada. Acepta null o undefined. */
export function fechaExamen(opciones) {
  const confirmada = opciones?.fechaExamen;
  return esFecha(confirmada) ? confirmada : EXAMEN_ESTIMADO;
}

/** Días que faltan para el examen (0 si ya pasó). null si hoy es inválido. */
export function diasHastaExamen(hoy, examen) {
  if (!esFecha(hoy)) return null;
  return Math.max(0, diasEntre(hoy, fechaExamen({ fechaExamen: examen })));
}

/** true si el examen está demasiado cerca de hoy o de la clase del tema para un ciclo completo. */
export function modoExpress(tema, hoy, examen) {
  const fin = fechaExamen({ fechaExamen: examen });
  if (esFecha(hoy) && diasEntre(hoy, fin) < DIAS_CICLO_MINIMO) return true;
  return esFecha(tema?.fechaClase) && diasEntre(tema.fechaClase, fin) < DIAS_CICLO_MINIMO;
}
