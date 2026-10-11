// Eventos delegados en todo el documento: un solo listener por tipo atiende los botones que se dibujan
// después (data-go, pestañas, data-lab, data-action) y los campos de las pestañas.
// Lo propio de cada pestaña se resuelve por el registro (ejecutarAccion), así este archivo no las importa.
import { S, sess } from '../estado/estado.js';
import { ejecutarAccion } from '../pestanas/registro.js';
import { mentor, tipFor } from './mentor.js';
import { go, showTab } from './navegacion.js';

export function iniciarEventos() {
  document.addEventListener('click', ev => {
    const goBtn = ev.target.closest('[data-go]');
    if (goBtn) {
      const v = goBtn.dataset.go;
      if (v === 'materias') { S.materia = S.eje = S.sub = null; }
      if (v === 'ejes') { S.eje = S.sub = null; }
      if (v === 'subtemas') { S.sub = null; }
      go(v);
      return;
    }
    const tab = ev.target.closest('.tab');
    if (tab) { showTab(tab.dataset.tab); mentor(tipFor(tab.dataset.tab)); return; }

    const lab = ev.target.closest('[data-lab]');
    if (lab) { ejecutarAccion('lab:' + lab.dataset.lab, lab); return; }

    const a = ev.target.closest('[data-action]');
    if (a) ejecutarAccion(a.dataset.action, a);
  });
  document.addEventListener('input', ev => {
    const s = sess();
    if (!s) return;
    if (ev.target.id === 'answer') s.draft = ev.target.value;
    if (ev.target.id === 'resolucion') s.resolucion = ev.target.value;
  });
  document.addEventListener('change', ev => {
    const s = sess();
    if (ev.target.id === 'ej-nivel' && s) s.nivel = ev.target.value;
    if (ev.target.id === 'in-photo') ejecutarAccion('foto', ev.target);
  });
}
