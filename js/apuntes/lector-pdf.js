// Lector de PDF: carga pdf.js desde CDN solo la primera vez que se sube un PDF y extrae el texto página por página.
// Un PDF escaneado (solo imágenes) devuelve casi nada de texto.
let pdfjsPromise = null;
function loadScript(src) {
  return new Promise((res, rej) => {
    const el = document.createElement('script');
    el.src = src; el.onload = res;
    el.onerror = () => rej(new Error('no se pudo cargar el lector de PDF; revisa tu conexión'));
    document.head.appendChild(el);
  });
}
function loadPdfJs() {
  return pdfjsPromise ||= (async () => {
    const base = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/';
    await loadScript(base + 'pdf.worker.min.js'); // en el hilo principal: evita crear un Worker externo
    await loadScript(base + 'pdf.min.js');
    const lib = window.pdfjsLib || window['pdfjs-dist/build/pdf'];
    if (!lib) throw new Error('el lector de PDF no se inicializó');
    lib.GlobalWorkerOptions.workerSrc = base + 'pdf.worker.min.js';
    return lib;
  })().catch(e => { pdfjsPromise = null; throw e; });
}
export async function pdfToText(file) {
  const lib = await loadPdfJs();
  const pdf = await lib.getDocument({ data: new Uint8Array(await file.arrayBuffer()) }).promise;
  const pages = [];
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const tc = await page.getTextContent();
    let t = '';
    for (const it of tc.items) t += (it.str || '') + (it.hasEOL ? '\n' : ' ');
    pages.push(t.replace(/[ \t]+\n/g, '\n').replace(/[ \t]{2,}/g, ' ').trim());
  }
  return pages.join('\n\n');
}
