// Punto de entrada: conecta los componentes, carga lo guardado y muestra la primera vista.
// Para sumar una pestaña nueva, importala acá: al cargarse se anota sola en pestanas/registro.js.
import { $ } from './nucleo/dom.js';
import { S } from './estado/estado.js';
import { Store } from './estado/almacen.js';
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
import { iniciarDialogoEjes } from './apuntes/dialogo-ejes.js';
import { iniciarDialogoPlan } from './apuntes/dialogo-plan.js';
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
iniciarDialogoEjes();
iniciarDialogoPlan();
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
  const [config, estado, debiles] = await Promise.all([
    Store.getDoc('config', null), Store.getDoc('estado', null), Store.listDebiles()
  ]);
  if (config) S.config = { apuntes: config.apuntes || {}, estilo: config.estilo || '', asignacion: config.asignacion || {}, estricto: !!config.estricto, ejesGen: config.ejesGen || {}, planes: config.planes || {} };
  if (estado?.progreso) S.progreso = { temas: estado.progreso.temas || {} };
  S.debiles = Array.isArray(debiles) ? debiles : [];
  updateDebilesCount();
  renderApuntes();
  if (S.view === 'materias') renderMaterias();
  const n = S.debiles.reduce((a, d) => a + (d.puntos?.length || 0), 0);
  if (n) mentor(`¡Hola de nuevo! Tienes ${n} puntos débiles guardados. Ábrelos con 📌 para repasarlos o elige una materia.`);
})();
