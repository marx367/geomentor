// Diálogo ⚙️ Config: abre el panel de IA y el de apuntes, y guarda todo junto con "Guardar configuración".
// Al final, la zona "Datos y reinicio": reiniciar la sesión (solo memoria) o borrar todos los datos guardados.
// El estilo del profesor y el modo estricto están en "🎓 Profesor y bibliografía" (profesor/dialogo-profesor.js).
import { $ } from '../nucleo/dom.js';
import { S } from '../estado/estado.js';
import { Store } from '../estado/almacen.js';
import { PROVIDERS } from '../ia/proveedores.js';
import { IA, aiReady, modelOf } from '../ia/config-ia.js';
import { renderIAConfig, commitIA, testIA, descartarBorradorIA, cambiarProveedorBorrador } from '../ia/panel-ia.js';
import { renderApuntes } from '../apuntes/panel-apuntes.js';
import { registrarAccion } from '../pestanas/registro.js';
import { mentor } from './mentor.js';
import { rerenderCurrent, reiniciarSesion } from './navegacion.js';

export function openConfig() { descartarBorradorIA(); renderApuntes(); renderIAConfig(); $('#dlg-apuntes').showModal(); }

export async function saveApuntes() {
  commitIA();
  let total = JSON.stringify(S.config).length;
  const ok = total < 240000 ? await Store.setDoc('config', S.config) : false;
  renderApuntes();
  $('#dlg-apuntes').close();
  rerenderCurrent();
  mentor(!aiReady() ? 'Configuración guardada, pero falta completar el proveedor de IA (clave o modelo).' : ok ? `Listo: uso ${PROVIDERS[IA.provider].nombre.split(' (')[0]}${IA.provider !== 'claude' ? ' · ' + modelOf(IA.provider) : ''}. Tus apuntes quedaron guardados.` : 'Los apuntes se usarán en esta sesión, pero son demasiado grandes para guardarlos. Divide los archivos si quieres conservarlos.');
}

// Borra todo lo guardado del estudiante y recarga la página: al arrancar de nuevo, la app lee
// el almacén vacío y queda como recién instalada. Pide confirmar dos veces porque no se puede deshacer.
async function borrarTodosLosDatos() {
  if (!confirm('¿Borrar todos los datos? Se eliminan Mi curso, tus apuntes, el profesor y la biblioteca, el progreso, los puntos débiles y las hojas de errores. No se puede deshacer.')) return;
  const palabra = prompt('Para confirmar, escribe BORRAR:');
  if (palabra?.trim().toUpperCase() !== 'BORRAR') { mentor('No se borró nada.'); return; }
  if (!(await Store.borrarTodo())) {
    mentor('No se pudo borrar todo. Revisa la conexión y vuelve a intentarlo.');
    return;
  }
  // Las reglas del examen se borraron: que el mentor las vuelva a preguntar al arrancar (ver main.js).
  try { sessionStorage.removeItem('gm_pregunto_reglas'); } catch (e) { /* sin sessionStorage */ }
  location.reload();
}

export function iniciarDialogoConfig() {
  $('#btn-apuntes').addEventListener('click', openConfig);
  $('#ia-provider').addEventListener('change', ev => cambiarProveedorBorrador(ev.target.value));
  $('#ia-test').addEventListener('click', testIA);
  $('#ia-key-eye').addEventListener('click', () => { const k = $('#ia-key'); k.type = k.type === 'password' ? 'text' : 'password'; });
  $('#dlg-apuntes').addEventListener('close', descartarBorradorIA);
  $('#apuntes-save').addEventListener('click', saveApuntes);
  // El clic llega por el data-action delegado de eventos.js. Al cerrar se descarta lo no guardado de la IA.
  registrarAccion('reiniciar-sesion', () => { if (reiniciarSesion()) $('#dlg-apuntes').close(); });
  registrarAccion('borrar-todo', borrarTodosLosDatos);
}
