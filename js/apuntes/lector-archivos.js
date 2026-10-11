// Lee un archivo de apuntes (.txt, .md o .pdf) y devuelve su texto.
// Si es un PDF escaneado (sin texto), lanza un error con código 'escaneado' para avisar al estudiante.
import { pdfToText } from './lector-pdf.js';

export const esPDF = f => /\.pdf$/i.test(f.name) || f.type === 'application/pdf';

export async function leerArchivoApunte(f) {
  if (!esPDF(f)) return f.text();
  const text = await pdfToText(f);
  if (text.replace(/\s/g, '').length < 50) throw Object.assign(new Error('PDF sin texto'), { code: 'escaneado' });
  return text;
}
