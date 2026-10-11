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
  deleteDebil(id) {
    localSet('debiles', localGet('debiles', []).filter(d => d.id !== id));
  }
};
