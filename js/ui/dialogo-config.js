// Diálogo ⚙️ Config: abre el panel de IA y el de apuntes, y guarda todo junto con "Guardar configuración".
import { $ } from '../nucleo/dom.js';
import { S } from '../estado/estado.js';
import { Store } from '../estado/almacen.js';
import { PROVIDERS } from '../ia/proveedores.js';
import { IA, aiReady, modelOf } from '../ia/config-ia.js';
import { renderIAConfig, commitIA, testIA, descartarBorradorIA, cambiarProveedorBorrador } from '../ia/panel-ia.js';
import { renderApuntes } from '../apuntes/panel-apuntes.js';
import { mentor } from './mentor.js';
import { rerenderCurrent } from './navegacion.js';

export function openConfig() { descartarBorradorIA(); renderApuntes(); renderIAConfig(); $('#dlg-apuntes').showModal(); }

export async function saveApuntes() {
  commitIA();
  S.config.estilo = $('#estilo-text').value;
  S.config.estricto = $('#estricto').checked;
  let total = JSON.stringify(S.config).length;
  const ok = total < 240000 ? await Store.setDoc('config', S.config) : false;
  renderApuntes();
  $('#dlg-apuntes').close();
  rerenderCurrent();
  mentor(!aiReady() ? 'Configuración guardada, pero falta completar el proveedor de IA (clave o modelo).' : ok ? `Listo: uso ${PROVIDERS[IA.provider].nombre.split(' (')[0]}${IA.provider !== 'claude' ? ' · ' + modelOf(IA.provider) : ''}. Tus apuntes quedaron guardados.` : 'Los apuntes se usarán en esta sesión, pero son demasiado grandes para guardarlos. Divide los archivos si quieres conservarlos.');
}

export function iniciarDialogoConfig() {
  $('#btn-apuntes').addEventListener('click', openConfig);
  $('#ai-notice').addEventListener('click', ev => { if (ev.target.closest('[data-open-config]')) openConfig(); });
  $('#ia-provider').addEventListener('change', ev => cambiarProveedorBorrador(ev.target.value));
  $('#ia-test').addEventListener('click', testIA);
  $('#ia-key-eye').addEventListener('click', () => { const k = $('#ia-key'); k.type = k.type === 'password' ? 'text' : 'password'; });
  $('#dlg-apuntes').addEventListener('close', descartarBorradorIA);
  $('#apuntes-save').addEventListener('click', saveApuntes);
}
