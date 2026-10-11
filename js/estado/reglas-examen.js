// Reglas del examen final: qué material se puede usar y cuándo es. Viven en S.config.reglasExamen
// (documento 'config'). Las leen los prompts y, más adelante, las ayudas rápidas, el plan por días y el examen mixto.
import { esFechaValida, today } from '../nucleo/utilidades.js';
import { S } from './estado.js';
import { Store } from './almacen.js';

export const MATERIALES = {
  ninguno: 'Sin material',
  manuscrito: 'Cuaderno abierto, solo manuscrito',
  impreso: 'Cuaderno abierto, se puede imprimir'
};

// Lo guardado puede venir de otra versión o dañado: solo se aceptan valores conocidos.
export function normalizarReglas(r) {
  return {
    material: Object.hasOwn(MATERIALES, r?.material) ? r.material : null,
    fecha: esFechaValida(r?.fecha) ? r.fecha : ''
  };
}

export const materialPermitido = () => S.config.reglasExamen.material;
// Definida = se eligió el material. La fecha es opcional.
export const esDefinida = () => materialPermitido() !== null;

// Días que faltan (0 si es hoy). null si no hay fecha o si ya pasó.
export function diasHastaExamen() {
  const f = S.config.reglasExamen.fecha;
  if (!f) return null;
  const dias = Math.round((new Date(f + 'T00:00:00') - new Date(today() + 'T00:00:00')) / 86400000);
  return dias >= 0 ? dias : null;
}

// Mismo tope que el resto de los guardados de 'config' (la base de claude.ai limita el tamaño del documento).
export async function guardarReglas() {
  return JSON.stringify(S.config).length < 240000 ? Store.setDoc('config', S.config) : false;
}
