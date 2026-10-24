// Botones y campos de los ejercicios propios. Se anotan en el registro de pestañas (ver pestanas/registro.js);
// ui/eventos.js los dispara por data-action o por el id del campo.
import { $ } from '../../nucleo/dom.js';
import { sess } from '../../estado/estado.js';
import { mentor } from '../../ui/mentor.js';
import { registrarAccion } from '../registro.js';
import { renderEjercicios } from '../ejercicios.js';
import { ORIGENES, propio } from './estado-propio.js';
import { buscarEnApuntes } from './buscar-en-apuntes.js';
import { cargarArchivo } from './enunciado-profesor.js';
import { prepararEjercicio } from './preparar-ejercicio.js';

// Lo escrito en los campos se guarda antes de redibujar, para no perderlo.
function guardarCampos(s) {
  const p = propio(s);
  if ($('#ep-enunciado')) p.enunciado = $('#ep-enunciado').value;
  if ($('#ep-solucion')) p.solucion = $('#ep-solucion').value;
}

registrarAccion('ej-origen', boton => {
  const s = sess(); guardarCampos(s);
  propio(s).origen = ORIGENES[boton.dataset.origen] ? boton.dataset.origen : 'tutor';
  s.err.ejercicio = '';
  renderEjercicios();
});

// Vuelve a la pantalla de elección. Lo que se estaba armando (enunciado, lista encontrada) se conserva.
registrarAccion('ej-otro', () => {
  const s = sess();
  s.exercise = null; s.hints = 0; s.showSol = false; s.correction = ''; s.resolucion = ''; s.photo = null; s.pizarra = null;
  s.err.ejercicio = '';
  renderEjercicios();
});

registrarAccion('ej-buscar', () => buscarEnApuntes(renderEjercicios));

registrarAccion('ej-elegir', boton => {
  const e = propio(sess()).encontrados?.[Number(boton.dataset.i)];
  if (!e) return;
  prepararEjercicio({ origen: 'apuntes', enunciado: e.enunciado, solucionDada: e.solucionDada, fuenteNombre: e.origen }, renderEjercicios);
});

registrarAccion('ej-campo', campo => {
  const p = propio(sess());
  if (campo.id === 'ep-enunciado') p.enunciado = campo.value;
  if (campo.id === 'ep-solucion') p.solucion = campo.value;
});

registrarAccion('ej-archivo', input => {
  const s = sess(); guardarCampos(s);
  cargarArchivo(input.files?.[0], input.id === 'in-solucion' ? 'solucion' : 'enunciado', renderEjercicios);
});

registrarAccion('ej-preparar-profesor', async () => {
  const s = sess(); guardarCampos(s);
  const p = propio(s);
  if (p.enunciado.trim().length < 10) { s.err.profesor = 'Escribe o sube el enunciado antes de preparar el ejercicio.'; renderEjercicios(); return; }
  s.err.profesor = '';
  const listo = await prepararEjercicio({ origen: 'profesor', enunciado: p.enunciado.trim(), solucionDada: p.solucion.trim(), imagen: p.imagen, fuenteNombre: 'el profesor' }, renderEjercicios);
  // Ya está en el ejercicio: el formulario queda limpio para el próximo (y la foto vieja no se cuela en otro enunciado).
  if (listo) Object.assign(p, { enunciado: '', imagen: null, solucion: '' });
});

registrarAccion('ej-quitar-imagen', () => { const s = sess(); guardarCampos(s); propio(s).imagen = null; renderEjercicios(); });

// Solución oficial cargada después de armar el ejercicio: pasa a ser la referencia de la corrección.
registrarAccion('ej-usar-solucion', () => {
  const s = sess(), texto = $('#ej-sol-oficial')?.value.trim() || '';
  if (!s.exercise) return;
  if (texto.length < 5) { mentor('Pega la solución oficial antes de usarla.'); return; }
  s.exercise.solucion = texto; s.exercise.solucionOrigen = 'fuente';
  s.correction = '';
  renderEjercicios();
  mentor('Listo: ahora corrijo contra la solución oficial. Las pistas siguen siendo las que armé antes.');
});
