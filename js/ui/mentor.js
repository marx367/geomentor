// Mentor flotante: globo con mensajes y tips. En pantallas chicas el globo se oculta solo a los 9 segundos.
import { $ } from '../nucleo/dom.js';
import { S, key } from '../estado/estado.js';

export let mentorTimer = null;
// accion (opcional): { texto, abrir } muestra un botón que abre ese diálogo. El clic lo atiende
// el data-abrir delegado de eventos.js. Sin accion, el botón se oculta.
export function mentor(msg, accion = null) {
  $('#mentor-text').textContent = msg;
  const btn = $('#mentor-accion');
  btn.hidden = !accion;
  if (accion) { btn.textContent = accion.texto; btn.dataset.abrir = accion.abrir; }
  const b = $('#mentor-bubble');
  b.hidden = false;
  b.style.animation = 'none'; void b.offsetWidth; b.style.animation = '';
  clearTimeout(mentorTimer);
  if (window.innerWidth < 760) mentorTimer = setTimeout(() => { b.hidden = true; }, 9000);
}
export function tipFor(tab) {
  const c = S.cache[key()];
  const tips = c?.tips || [];
  const base = {
    teoria: 'Responde el chequeo con tus palabras: equivocarte aquí es la forma más barata de encontrar lo que te falta.',
    lab: 'Mueve un deslizador por vez y observa qué cambia: así conectas la fórmula con la figura.',
    ejercicios: 'Intenta resolver sin pistas primero. Pide una pista solo cuando lleves un rato trabado.',
    examen: 'Lee cada opción antes de elegir: los distractores salen de errores típicos.'
  }[tab];
  if (tips.length && Math.random() < 0.6) return '💡 ' + tips[Math.floor(Math.random() * tips.length)];
  return base;
}

export function iniciarMentor() {
  $('#mentor-btn').addEventListener('click', () => {
    const b = $('#mentor-bubble');
    if (b.hidden) mentor(S.view === 'mentoria' ? tipFor(S.tab) : $('#mentor-text').textContent);
    else b.hidden = true;
  });
  $('#mentor-close').addEventListener('click', () => { $('#mentor-bubble').hidden = true; });
  // Al usar el botón de acción, el globo se cierra (el diálogo lo abre eventos.js).
  $('#mentor-accion').addEventListener('click', () => { $('#mentor-bubble').hidden = true; });
}
