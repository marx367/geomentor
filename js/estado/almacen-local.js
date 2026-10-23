// Backend de guardado en localStorage. Cada documento se guarda como JSON con el prefijo 'gm_'.
// Si el navegador bloquea localStorage (modo privado, cuota llena), devuelve el valor por defecto sin romper.
import { newId } from '../nucleo/utilidades.js';

export function localGet(k, fallback) { try { const v = localStorage.getItem('gm_' + k); return v ? JSON.parse(v) : fallback; } catch (e) { return fallback; } }
export function localSet(k, v) { try { localStorage.setItem('gm_' + k, JSON.stringify(v)); return true; } catch (e) { return false; } }

export const almacenLocal = {
  getDoc: (name, fallback) => localGet(name, fallback),
  setDoc: (name, data) => localSet(name, data),
  listDebiles: () => localGet('debiles', []),
  addDebil(item) {
    const list = localGet('debiles', []);
    const withId = { id: newId(), ...item };
    list.unshift(withId);
    localSet('debiles', list);
    return withId;
  },
  // Reemplaza un ítem por id (migración, superado). false si no existe o no se pudo guardar.
  updateDebil(id, item) {
    const list = localGet('debiles', []);
    const i = list.findIndex(d => d.id === id);
    if (i < 0) return false;
    list[i] = { ...item, id };
    return localSet('debiles', list);
  },
  // Borra los documentos pedidos y la lista de débiles. No toca 'gm_ia' (clave de la IA) ni el tema.
  borrarTodo(nombres) {
    try { for (const n of [...nombres, 'debiles']) localStorage.removeItem('gm_' + n); return true; } catch (e) { return false; }
  }
  // Sin deleteDebil: un punto superado se marca (ver estado/debiles.js), no se borra, para no perder el historial.
};
