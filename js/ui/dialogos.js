// Comportamiento común de los diálogos: el botón ✕ (data-close) cierra el diálogo que lo contiene.
import { $$ } from '../nucleo/dom.js';

export function iniciarDialogos() {
  $$('dialog [data-close]').forEach(b => b.addEventListener('click', () => b.closest('dialog').close()));
}
