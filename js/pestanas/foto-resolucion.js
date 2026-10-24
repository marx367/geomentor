// Pestaña 3 · fotos: la del desarrollo manuscrito y la del enunciado de un ejercicio del profesor.
// achicarImagen() la achica a 1600 px como máximo y la pasa a JPEG (más liviana para la IA).
// Las fotos HEIC de iPhone no se pueden abrir en el navegador.
import { key, sess } from '../estado/estado.js';
import { mentor } from '../ui/mentor.js';
import { renderEjercicios } from './ejercicios.js';

export function achicarImagen(file) {
  return new Promise((resolver, rechazar) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const MAX = 1600;
      const scale = Math.min(1, MAX / Math.max(img.naturalWidth, img.naturalHeight));
      const c = document.createElement('canvas');
      c.width = Math.round(img.naturalWidth * scale); c.height = Math.round(img.naturalHeight * scale);
      const cx = c.getContext('2d');
      cx.fillStyle = '#fff'; cx.fillRect(0, 0, c.width, c.height);
      cx.drawImage(img, 0, 0, c.width, c.height);
      URL.revokeObjectURL(url);
      const dataUrl = c.toDataURL('image/jpeg', 0.85);
      c.toBlob(blob => blob ? resolver({ blob, dataUrl }) : rechazar(new Error('sin imagen')), 'image/jpeg', 0.85);
    };
    img.onerror = () => { URL.revokeObjectURL(url); rechazar(new Error('imagen ilegible')); };
    img.src = url;
  });
}

export async function loadPhoto(file) {
  const k = key(), s = sess(k);
  if (!file) return;
  try {
    s.photo = await achicarImagen(file);
    if (key() === k) renderEjercicios();
  } catch {
    mentor('No pude abrir esa imagen. Si es HEIC (iPhone), conviértela a JPG o PNG.');
  }
}
