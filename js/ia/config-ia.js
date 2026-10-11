// Configuración de la IA: proveedor activo, claves, modelos y URLs (IA, se guarda en localStorage 'gm_ia')
// y capacidades del entorno (AI: Claude integrado, imágenes y descargas cuando la app corre en claude.ai).
import { PROVIDERS } from './proveedores.js';

export const AI = { sample: null, claudeImages: false, claudeTypes: 'image/*', images: true, imageTypes: 'image/jpeg,image/png,image/webp', downloads: null };
export const IA = { provider: null, keys: {}, models: {}, bases: {} };

export function loadIA() {
  try { Object.assign(IA, JSON.parse(localStorage.getItem('gm_ia') || '{}')); } catch (e) { /* sin datos */ }
  IA.keys ||= {}; IA.models ||= {}; IA.bases ||= {};
}
export function saveIA() { try { localStorage.setItem('gm_ia', JSON.stringify(IA)); } catch (e) { /* sin persistencia */ } }
export const inClaude = () => !!(window.claude && typeof claude.use === 'function');
export const modelOf = p => (IA.models[p] || PROVIDERS[p].modelo || '').trim();
export const baseOf = p => (IA.bases[p] || PROVIDERS[p].base || '').trim().replace(/\/+$/, '');
export function aiReady() {
  const p = IA.provider;
  if (!p) return false;
  if (p === 'claude') return !!AI.sample;
  if (inClaude()) return false; // la política de seguridad de claude.ai bloquea llamadas externas
  return !!(IA.keys[p] || PROVIDERS[p].keyOptional) && !!modelOf(p);
}

// Detecta qué hay disponible y elige el proveedor inicial. No toca la pantalla:
// después de llamarla, main.js ejecuta applyIA() y vuelve a dibujar la vista.
export async function initCapabilities() {
  loadIA();
  if (inClaude()) {
    const [sample, downloads] = await Promise.all([
      claude.use('sample').catch(() => null),
      claude.use('downloads').catch(() => null)
    ]);
    AI.sample = sample;
    AI.downloads = downloads;
    if (sample) {
      const lim = await sample.limits().catch(() => null);
      AI.claudeImages = !!lim?.images;
      if (lim?.images?.mediaTypes?.length) AI.claudeTypes = lim.images.mediaTypes.join(',');
    }
    if (sample) IA.provider = 'claude';
  } else if (!IA.provider || IA.provider === 'claude') {
    IA.provider = 'gemini';
  }
}
