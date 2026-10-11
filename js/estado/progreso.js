// Progreso por subtema (comprensión, mejor examen), guardado con el almacén en el documento 'estado'.
import { S } from './estado.js';
import { Store } from './almacen.js';

export async function saveProgreso(k, patch) {
  S.progreso.temas[k] = { ...(S.progreso.temas[k] || {}), ...patch, fecha: new Date().toISOString() };
  await Store.setDoc('estado', { progreso: S.progreso });
}
