// Adaptador de Claude integrado: usa la capacidad 'sample' de claude.ai, sin clave.
// Solo funciona cuando la app corre como artefacto dentro de claude.ai.
import { AI } from '../config-ia.js';
import { coded } from '../errores-ia.js';

export async function llamarClaudeIntegrado(prompt, { images = null, fresh = false } = {}) {
  if (!AI.sample) throw coded('unavailable');
  const opts = {};
  if (images) opts.images = images;
  if (fresh) opts.cache = false;
  const { text } = await AI.sample(prompt, opts);
  return text;
}
