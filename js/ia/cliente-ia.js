// Único punto por donde la app habla con la IA.
// ask() usa el proveedor activo; callProvider() permite probar uno concreto (lo usa "Probar conexión").
import { PROVIDERS } from './proveedores.js';
import { IA, aiReady, inClaude, modelOf, baseOf } from './config-ia.js';
import { coded } from './errores-ia.js';
import { blobToB64 } from './cliente-http.js';
import { llamarGemini } from './adaptadores/gemini.js';
import { llamarAnthropic } from './adaptadores/anthropic.js';
import { llamarOpenAICompatible } from './adaptadores/openai-compatible.js';
import { llamarClaudeIntegrado } from './adaptadores/claude-integrado.js';

const TIEMPO_MAXIMO_MS = 180000; // 3 minutos: los apuntes largos pueden tardar

export async function callProvider(p, prompt, images, cfg = {}) {
  const key = (cfg.key ?? IA.keys[p] ?? '').trim();
  const model = (cfg.model ?? modelOf(p)).trim();
  const base = (cfg.base ?? baseOf(p)).replace(/\/+$/, '');
  if (!key && !PROVIDERS[p].keyOptional) throw coded('no_key');
  if (!model) throw coded('no_model');
  const imgs = images?.length ? await Promise.all(images.map(blobToB64)) : [];
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), TIEMPO_MAXIMO_MS);
  const pedido = { p, key, model, base, prompt, imgs, signal: ctrl.signal };
  try {
    if (p === 'gemini') return await llamarGemini(pedido);
    if (p === 'anthropic') return await llamarAnthropic(pedido);
    return await llamarOpenAICompatible(pedido); // OpenRouter, OpenAI y cualquier endpoint compatible
  } finally {
    clearTimeout(timer);
  }
}

export async function ask(prompt, { images = null, fresh = false } = {}) {
  const p = IA.provider;
  if (p === 'claude') return llamarClaudeIntegrado(prompt, { images, fresh });
  if (!p || !aiReady()) throw coded(inClaude() ? 'unavailable' : (!IA.keys[p] && !PROVIDERS[p]?.keyOptional ? 'no_key' : 'unavailable'));
  return callProvider(p, prompt, images);
}
