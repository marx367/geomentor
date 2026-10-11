// Pestaña 3 · cableado: registro, botones (nuevo, pista, solución, laboratorio, foto, corregir) y pizarra.
import { $, $$ } from '../nucleo/dom.js';
import { sess } from '../estado/estado.js';
import { Lab } from '../laboratorio/lienzo/lienzo.js';
import { mentor } from '../ui/mentor.js';
import { showTab } from '../ui/navegacion.js';
import { pizarraNueva, limpiarPizarra, exportarPizarra } from '../pizarra/pizarra.js';
import { registrarPestana, registrarAccion } from './registro.js';
import { generarEjercicio, renderEjercicios } from './ejercicios.js';
import { loadPhoto } from './foto-resolucion.js';
import { corregir } from './correccion.js';

// Al abrir la pestaña: si todavía no hay ejercicio (ni uno en curso ni un error), se pide uno.
registrarPestana('ejercicios', {
  mostrar() { const s = sess(); if (!s.exercise && !s.busy.ejercicio && !s.err.ejercicio) generarEjercicio(false); else renderEjercicios(); },
  redibujar: renderEjercicios
});

// Antes de redibujar se guarda lo escrito, para no perderlo.
const guardarResolucion = s => { s.resolucion = $('#resolucion')?.value ?? s.resolucion; };

registrarAccion('nuevo-ej', () => generarEjercicio(true));
registrarAccion('pista', () => { const s = sess(); if (s.exercise && s.hints < s.exercise.pistas.length) { guardarResolucion(s); s.hints++; renderEjercicios(); } });
registrarAccion('solucion', () => { const s = sess(); guardarResolucion(s); s.showSol = !s.showSol; renderEjercicios(); });
registrarAccion('abrir-lab', () => {
  const s = sess();
  Lab.setLines(s.exercise.grafico); s.lab = Lab.getLines(); showTab('lab');
  mentor('Estos son los datos del ejercicio. Mueve los deslizadores para ver cómo cambia la figura.');
});
registrarAccion('quitar-foto', () => { sess().photo = null; renderEjercicios(); });
registrarAccion('foto', input => loadPhoto(input.files?.[0]));
registrarAccion('corregir', corregir);

// Pizarra
registrarAccion('pizarra-abrir', () => {
  const s = sess();
  guardarResolucion(s);
  s.pizarra ||= pizarraNueva();
  s.pizarra.abierta = !s.pizarra.abierta;
  renderEjercicios();
});
registrarAccion('pizarra-herramienta', boton => {
  sess().pizarra.herramienta = boton.dataset.herramienta;
  $$('[data-action="pizarra-herramienta"]').forEach(b => b.setAttribute('aria-pressed', String(b === boton)));
});
registrarAccion('pizarra-limpiar', () => limpiarPizarra($('#pizarra-lienzo'), sess().pizarra));
registrarAccion('pizarra-usar', async () => {
  const s = sess();
  if (!s.pizarra?.dataUrl) { mentor('Dibuja tu desarrollo en la pizarra antes de adjuntarlo.'); return; }
  guardarResolucion(s);
  s.photo = await exportarPizarra($('#pizarra-lienzo'));
  s.pizarra.abierta = false;
  renderEjercicios();
  mentor('Adjunté tu dibujo. Toca «Corregir mi resolución» cuando quieras.');
});
