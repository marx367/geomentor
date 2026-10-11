// Descarga de archivos. Dentro de claude.ai usa su capacidad de descargas; en el navegador, un enlace temporal.
import { AI } from '../ia/config-ia.js';
import { mentor } from '../ui/mentor.js';

export async function saveFile(data, filename) {
  const blob = data instanceof Blob ? data : new Blob([data], { type: 'application/octet-stream' });
  if (AI.downloads) {
    try { await AI.downloads.save({ filename, data: blob }); return true; }
    catch (e) {
      if (e?.code !== 'declined') mentor('No se pudo guardar el archivo: ' + (e?.message || e?.code || 'error'));
      return false;
    }
  }
  try {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = filename; a.style.display = 'none';
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 5000);
    return true;
  } catch (e) {
    mentor('No se pudo descargar el archivo en este navegador.');
    return false;
  }
}
