// Pestaña 1 · cableado: la anota en el registro con sus acciones y le pide la teoría al entrar a un subtema.
import { slug, today } from '../nucleo/utilidades.js';
import { S, key, sess } from '../estado/estado.js';
import { saveFile } from '../exportacion/descargas.js';
import { buildResumenTxt } from '../exportacion/resumen-txt.js';
import { registrarPestana, registrarAccion, alSuceder } from './registro.js';
import { renderTeoria } from './teoria.js';
import { loadContent } from './contenido-teoria.js';
import { verificar } from './chequeo-socratico.js';
import { exportResumen } from './resumen-sesion.js';

registrarPestana('teoria', { mostrar: renderTeoria, redibujar: renderTeoria });

registrarAccion('regen-teoria', () => loadContent(true));
registrarAccion('verificar', () => verificar(false));
registrarAccion('nose', () => verificar(true));
registrarAccion('export-resumen', exportResumen);
registrarAccion('descargar-resumen', () => {
  const s = sess();
  if (s.summary) saveFile(new Blob([buildResumenTxt(s, s.summary.meta)], { type: 'text/plain;charset=utf-8' }), `resumen_${slug(s.summary.meta.subtema)}_${today()}.txt`);
});

// Al entrar a un subtema, si su teoría no está en caché, se pide a la IA.
alSuceder('entrar-subtema', () => { if (!S.cache[key()]) loadContent(false); });
