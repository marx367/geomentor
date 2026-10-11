// Pestaña 2 · cableado: inicia el lienzo, lo anota en el registro y escucha los avisos de la navegación
// (entrar a un subtema, cambio de acento, reinicio) y de la teoría (gráfico del tema listo).
import { $ } from '../nucleo/dom.js';
import { S, key, sess } from '../estado/estado.js';
import { Lab, iniciarLienzo } from '../laboratorio/lienzo/lienzo.js';
import { mentor } from '../ui/mentor.js';
import { registrarPestana, registrarAccion, alSuceder } from './registro.js';
import { renderLabPresets, renderAnalysis, analizarGrafico } from './laboratorio.js';

iniciarLienzo();
// Cada cambio en el lienzo se guarda en la sesión del subtema.
Lab.onChange(() => { const s = sess(); if (s) s.lab = Lab.getLines(); });
$('#lab-analyze').addEventListener('click', analizarGrafico);

registrarPestana('lab', {
  mostrar() { renderLabPresets(); renderAnalysis(); requestAnimationFrame(() => Lab.resize()); },
  redibujar() { renderLabPresets(); renderAnalysis(); }
});

// Botones data-lab="tema|ejercicio|vaciar"
const guardarLineas = () => { sess().lab = Lab.getLines(); };
registrarAccion('lab:tema', () => { Lab.setLines(S.cache[key()]?.grafico || []); guardarLineas(); });
registrarAccion('lab:ejercicio', () => {
  Lab.setLines(sess().exercise?.grafico || []); guardarLineas();
  mentor('Cargué los datos del ejercicio. Mueve los deslizadores para ver qué pasa si cambian los datos.');
});
registrarAccion('lab:vaciar', () => { Lab.setLines([]); guardarLineas(); });

alSuceder('entrar-subtema', () => { const s = sess(); Lab.setLines(s.lab || S.cache[key()]?.grafico || []); });
alSuceder('cargar-grafico', lineas => Lab.setLines(lineas));
alSuceder('cambio-acento', () => Lab.draw());
alSuceder('reiniciar', () => Lab.setLines([]));
