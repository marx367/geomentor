// Herramientas de la pizarra: lápiz (trazo libre) y línea recta (con vista previa mientras se arrastra).
// Usa eventos pointer, así funciona con mouse, lápiz óptico y pantalla táctil.
import { coloresPizarra } from './cuadricula-pizarra.js';

// estado.herramienta: 'lapiz' | 'linea'. alTerminarTrazo se llama al soltar, para guardar el dibujo.
export function conectarHerramientas(canvas, estado, alTerminarTrazo) {
  const ctx = canvas.getContext('2d');
  let dibujando = false;
  let inicio = null, ultimo = null;
  let fotoPrevia = null; // imagen antes de empezar la línea, para redibujar la vista previa

  // El canvas se ve escalado por CSS: convierte coordenadas de pantalla a coordenadas internas.
  const posicion = ev => {
    const r = canvas.getBoundingClientRect();
    return { x: (ev.clientX - r.left) * (canvas.width / r.width), y: (ev.clientY - r.top) * (canvas.height / r.height) };
  };
  const estiloTrazo = () => {
    ctx.strokeStyle = coloresPizarra().trazo;
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  };

  canvas.addEventListener('pointerdown', ev => {
    ev.preventDefault();
    canvas.setPointerCapture(ev.pointerId);
    dibujando = true;
    inicio = ultimo = posicion(ev);
    if (estado.herramienta === 'linea') fotoPrevia = ctx.getImageData(0, 0, canvas.width, canvas.height);
  });

  canvas.addEventListener('pointermove', ev => {
    if (!dibujando) return;
    const p = posicion(ev);
    estiloTrazo();
    if (estado.herramienta === 'linea' && fotoPrevia) {
      ctx.putImageData(fotoPrevia, 0, 0);
      ctx.beginPath(); ctx.moveTo(inicio.x, inicio.y); ctx.lineTo(p.x, p.y); ctx.stroke();
    } else {
      ctx.beginPath(); ctx.moveTo(ultimo.x, ultimo.y); ctx.lineTo(p.x, p.y); ctx.stroke();
      ultimo = p;
    }
  });

  const terminar = () => {
    if (!dibujando) return;
    dibujando = false;
    fotoPrevia = null;
    alTerminarTrazo();
  };
  canvas.addEventListener('pointerup', terminar);
  canvas.addEventListener('pointercancel', terminar);
}
