// Fachada de guardado: el resto de la app usa solo Store y no sabe dónde se guardan los datos.
// mode = 'db' si hay base de claude.ai; 'local' si no. En modo 'db', si una operación falla,
// se usa localStorage como respaldo (igual que el prototipo).
import { almacenLocal } from './almacen-local.js';
import { conectarClaude } from './almacen-claude.js';

export const Store = {
  mode: 'local', remoto: null,
  async init() {
    const remoto = await conectarClaude();
    if (remoto) { this.remoto = remoto; this.mode = 'db'; }
  },
  async conRespaldo(operacionRemota, operacionLocal) {
    if (this.mode === 'db') {
      try { return await operacionRemota(this.remoto); } catch (e) { /* respaldo local */ }
    }
    return operacionLocal(almacenLocal);
  },
  getDoc(name, fallback) { return this.conRespaldo(r => r.getDoc(name, fallback), l => l.getDoc(name, fallback)); },
  setDoc(name, data) { return this.conRespaldo(r => r.setDoc(name, data), l => l.setDoc(name, data)); },
  listDebiles() { return this.conRespaldo(r => r.listDebiles(), l => l.listDebiles()); },
  addDebil(item) { return this.conRespaldo(r => r.addDebil(item), l => l.addDebil(item)); },
  updateDebil(id, item) { return this.conRespaldo(r => r.updateDebil(id, item), l => l.updateDebil(id, item)); }
};
