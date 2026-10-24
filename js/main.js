// Punto de entrada: conecta los componentes, carga lo guardado y muestra la primera vista.
// Para sumar una pestaña nueva, importala acá: al cargarse se anota sola en pestanas/registro.js.
import { $ } from './nucleo/dom.js';
import { S } from './estado/estado.js';
import { Store } from './estado/almacen.js';
import { cargarCurso } from './estado/curso.js';
import { cargarProfesor, cargarBiblioteca, guardarProfesor } from './estado/profesor.js';
import { normalizarReglas, esDefinida } from './estado/reglas-examen.js';
import { migrarDebiles, debilesActivos, puntosVigentes } from './estado/debiles.js';
import { cargarHojas } from './estado/hojas.js';
import { initCapabilities } from './ia/config-ia.js';
import { applyIA } from './ia/panel-ia.js';
import { iniciarMentor, mentor } from './ui/mentor.js';
import { iniciarDialogos } from './ui/dialogos.js';
import { iniciarDialogoConfig } from './ui/dialogo-config.js';
import { go, rerenderCurrent, renderMaterias } from './ui/navegacion.js';
import { iniciarPuntosDebiles, updateDebilesCount } from './ui/puntos-debiles.js';
import { iniciarEventos } from './ui/eventos.js';
import { iniciarTema } from './ui/tema.js';
import { iniciarPanelApuntes, renderApuntes } from './apuntes/panel-apuntes.js';
import { iniciarDialogoPlan } from './apuntes/dialogo-plan.js';
import { iniciarDialogoTemaHoy } from './apuntes/dialogo-tema-hoy.js';
import { iniciarDialogoProfesor } from './profesor/dialogo-profesor.js';
import { iniciarDialogoBiblioTema } from './profesor/dialogo-biblio-tema.js';
import { iniciarExportarPDF } from './exportacion/exportar-pdf.js';
import { iniciarHojaErrores } from './exportacion/dialogo-hoja.js';

// Pestañas: cada una se anota sola en el registro al importarse.
import './pestanas/pestana-teoria.js';
import './pestanas/pestana-laboratorio.js';
import './pestanas/pestana-ejercicios.js';
import './pestanas/pestana-examen.js';

iniciarMentor();
iniciarDialogos();
iniciarDialogoConfig();
iniciarPanelApuntes();
iniciarPuntosDebiles();
iniciarDialogoPlan();
iniciarDialogoTemaHoy();
iniciarDialogoProfesor();
iniciarDialogoBiblioTema();
iniciarExportarPDF();
iniciarHojaErrores();
iniciarEventos();
iniciarTema();

// Cuando MathJax termina de cargar, se redibuja para mostrar las fórmulas con mejor calidad.
window.addEventListener('math-ready', rerenderCurrent);
window.addEventListener('load', () => { if (!window.__mjReady) rerenderCurrent(); });

// Si falta la regla del examen, el mentor la pregunta una vez por sesión (marca en sessionStorage).
// Si el navegador bloquea sessionStorage, pregunta en cada carga: molesta un poco, pero no rompe.
function yaPreguntoReglas() {
  try {
    if (sessionStorage.getItem('gm_pregunto_reglas')) return true;
    sessionStorage.setItem('gm_pregunto_reglas', '1');
  } catch (e) { /* sin sessionStorage */ }
  return false;
}

(async function boot() {
  go('materias');
  $('#mentor-bubble').hidden = false;
  initCapabilities().then(() => { applyIA(); rerenderCurrent(); });
  await Store.init();
  const [config, estado, debiles, curso, profesor, biblioteca, hojas] = await Promise.all([
    Store.getDoc('config', null), Store.getDoc('estado', null), Store.listDebiles(), Store.getDoc('curso', null),
    Store.getDoc('profesor', null), Store.getDoc('biblioteca', null), Store.getDoc('hojas', null)
  ]);
  // Se arma campo por campo: lo que no figure acá no se vuelve a guardar.
  if (config) S.config = { apuntes: config.apuntes || {}, asignacion: config.asignacion || {}, planes: config.planes || {}, reglasExamen: normalizarReglas(config.reglasExamen) };
  // El estilo y el modo estricto antes vivían en Config: la primera vez se pasan al documento 'profesor'.
  cargarProfesor(profesor, config);
  cargarBiblioteca(biblioteca);
  cargarHojas(hojas);
  if (!profesor && (config?.estilo || config?.estricto)) await Promise.all([guardarProfesor(), Store.setDoc('config', S.config)]);
  if (estado?.progreso) S.progreso = { temas: estado.progreso.temas || {} };
  // Al arrancar no se escribe Mi curso: si la lectura fallara (red, dato dañado), un guardado acá pisaría
  // el curso real con uno vacío. El progreso del catálogo viejo queda guardado pero no se muestra
  // (sus claves no coinciden con ningún tema de Mi curso); ejesGen se descarta al próximo guardado de config.
  cargarCurso(curso);
  // Puntos débiles del formato viejo (texto suelto) → formato con tipo; respalda antes de reescribir.
  S.debiles = await migrarDebiles(debiles);
  updateDebilesCount();
  renderApuntes();
  if (S.view === 'materias') renderMaterias();
  const n = debilesActivos().reduce((a, d) => a + puntosVigentes(d).length, 0);
  if (!esDefinida() && !yaPreguntoReglas()) mentor('¡Hola! Antes de seguir: ¿cómo es tu examen final? ¿Se puede usar material? Con eso adapto la teoría, las pistas y las preguntas.', { texto: '📋 Reglas del examen', abrir: 'profesor' });
  else if (n) mentor(`¡Hola de nuevo! Tienes ${n} puntos débiles guardados. Ábrelos con 📌 para repasarlos o elige una materia.`);
  else if (!S.curso.materias.length) mentor('¡Hola! Empieza cargando la clase de hoy con «＋ Tema de hoy».');
})();
