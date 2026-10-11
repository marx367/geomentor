// Comunicación HTTP con los proveedores: POST JSON que traduce fallas de red y códigos HTTP a errores con código.
import { coded } from './errores-ia.js';

// Convierte una imagen (Blob) a base64 para mandarla dentro del JSON.
export function blobToB64(blob) {
  return new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => { const url = r.result; res({ mime: blob.type || 'image/jpeg', data: url.split(',')[1], url }); };
    r.onerror = () => rej(new Error('No se pudo leer la imagen.'));
    r.readAsDataURL(blob);
  });
}
export async function httpJSON(url, headers, body, signal) {
  let res;
  try {
    res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json', ...headers }, body: JSON.stringify(body), signal });
  } catch (e) {
    if (e.name === 'AbortError') throw coded('timeout');
    throw coded('network');
  }
  let data = null;
  try { data = await res.json(); } catch (e) { /* sin cuerpo JSON */ }
  if (!res.ok) {
    const msg = data?.error?.message || data?.message || (typeof data?.error === 'string' ? data.error : '') || `HTTP ${res.status}`;
    if (res.status === 401 || res.status === 403) throw coded('bad_key', msg);
    if (res.status === 404) throw coded('not_found', msg);
    if (res.status === 429) throw coded('rate_limited', msg);
    if (res.status === 413) throw coded('prompt_too_large', msg);
    throw coded('http', msg);
  }
  return data || {};
}
