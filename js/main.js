// Punto de entrada: conecta los componentes, carga lo guardado y muestra la primera vista.
// Para sumar una pestaña nueva, importala acá: al cargarse se anota sola en pestanas/registro.js.
import { $ } from './nucleo/dom.js';
import { S } from './estado/estado.js';
import { Store } from './estado/almacen.js';
import { cargarCurso, guardarCurso } from './estado/curso.js';
import { cargarProfesor, cargarBiblioteca, guardarProfesor } from './estado/profesor.js';
import { initCapabilities } from './ia/config-ia.js';
import { applyIA } from './ia/panel-ia.js';
import { iniciarMentor, mentor } from './ui/mentor.js';
import { iniciarDialogos } from './ui/dialogos.js';
import { iniciarDialogoConfig } from './ui/dialogo-config.js';
import { iniciarNavegacion, go, rerenderCurrent, renderMaterias } from './ui/navegacion.js';
import { iniciarPuntosDebiles, updateDebilesCount } from './ui/puntos-debiles.js';
import { iniciarEventos } from './ui/eventos.js';
import { iniciarTema } from './ui/tema.js';
import { iniciarPanelApuntes, renderApuntes } from './apuntes/panel-apuntes.js';
import { iniciarDialogoPlan } from './apuntes/dialogo-plan.js';
import { iniciarDialogoTemaHoy } from './apuntes/dialogo-tema-hoy.js';
import { iniciarDialogoProfesor } from './profesor/dialogo-profesor.js';
import { iniciarExportarPDF } from './exportacion/exportar-pdf.js';

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
iniciarExportarPDF();
iniciarNavegacion();
iniciarEventos();
iniciarTema();

// Cuando MathJax termina de cargar, se redibuja para mostrar las fórmulas con mejor calidad.
window.addEventListener('math-ready', rerenderCurrent);
window.addEventListener('load', () => { if (!window.__mjReady) rerenderCurrent(); });

(async function boot() {
  go('materias');
  $('#mentor-bubble').hidden = false;
  initCapabilities().then(() => { applyIA(); rerenderCurrent(); });
  await Store.init();
  const [config, estado, debiles, curso, profesor, biblioteca] = await Promise.all([
    Store.getDoc('config', null), Store.getDoc('estado', null), Store.listDebiles(), Store.getDoc('curso', null),
    Store.getDoc('profesor', null), Store.getDoc('biblioteca', null)
  ]);
  if (config) S.config = { apuntes: config.apuntes || {}, asignacion: config.asignacion || {}, planes: config.planes || {} };
  // El estilo y el modo estricto antes vivían en Config: la primera vez se pasan al documento 'profesor'.
  cargarProfesor(profesor, config);
  cargarBiblioteca(biblioteca);
  if (!profesor && (config?.estilo || config?.estricto)) await Promise.all([guardarProfesor(), Store.setDoc('config', S.config)]);
  if (estado?.progreso) S.progreso = { temas: estado.progreso.temas || {} };
  cargarCurso(curso);
  // Primera vez con Mi curso: el progreso del catálogo fijo ya no corresponde a ningún tema, así que se borra.
  // Los ejes generados viejos (ejesGen) tampoco se usan más. Los apuntes y puntos débiles se conservan.
  if (!curso) {
    S.progreso = { temas: {} };
    await Promise.all([guardarCurso(), Store.setDoc('estado', { progreso: S.progreso }), config ? Store.setDoc('config', S.config) : null]);
  }
  S.debiles = Array.isArray(debiles) ? debiles : [];
  updateDebilesCount();
  renderApuntes();
  if (S.view === 'materias') renderMaterias();
  const n = S.debiles.reduce((a, d) => a + (d.puntos?.length || 0), 0);
  if (n) mentor(`¡Hola de nuevo! Tienes ${n} puntos débiles guardados. Ábrelos con 📌 para repasarlos o elige una materia.`);
  else if (!S.curso.materias.length) mentor('¡Hola! Empieza cargando la clase de hoy con «＋ Tema de hoy».');
})();
