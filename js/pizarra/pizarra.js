// Pizarra de Ejercicios: el estudiante dibuja su desarrollo y lo adjunta como imagen a la corrección por IA.
// El estado vive en la sesión del subtema ({ abierta, herramienta, dataUrl }) para sobrevivir a los redibujos.
import { dibujarCuadricula } from './cuadricula-pizarra.js';
import { conectarHerramientas } from './herramientas.js';

export const pizarraNueva = () => ({ abierta: false, herramienta: 'lapiz', dataUrl: null });

// Prepara un <canvas> recién creado: fondo cuadriculado, dibujo anterior (si había) y herramientas.
export function montarPizarra(canvas, estado) {
  const ctx = canvas.getContext('2d');
  dibujarCuadricula(ctx, canvas.width, canvas.height);
  if (estado.dataUrl) {
    const img = new Image();
    img.onload = () => ctx.drawImage(img, 0, 0);
    img.src = estado.dataUrl;
  }
  conectarHerramientas(canvas, estado, () => { estado.dataUrl = canvas.toDataURL('image/png'); });
}

export function limpiarPizarra(canvas, estado) {
  dibujarCuadricula(canvas.getContext('2d'), canvas.width, canvas.height);
  estado.dataUrl = null;
}

// Devuelve el dibujo como JPEG ({ blob, dataUrl }), el mismo formato que una foto subida.
export function exportarPizarra(canvas) {
  return new Promise(resolve => {
    const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
    canvas.toBlob(blob => resolve({ blob, dataUrl }), 'image/jpeg', 0.9);
  });
}
