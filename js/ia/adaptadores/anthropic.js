// Adaptador de Anthropic (API Messages), llamada directa desde el navegador.
// El encabezado 'anthropic-dangerous-direct-browser-access' es obligatorio para permitirlo: la clave queda
// visible en el navegador del estudiante (ver docs/seguridad.md).
import { coded } from '../errores-ia.js';
import { httpJSON } from '../cliente-http.js';

export async function llamarAnthropic({ key, model, prompt, imgs, signal }) {
  const content = [...imgs.map(i => ({ type: 'image', source: { type: 'base64', media_type: i.mime, data: i.data } })), { type: 'text', text: prompt }];
  const data = await httpJSON('https://api.anthropic.com/v1/messages', {
    'x-api-key': key, 'anthropic-version': '2023-06-01', 'anthropic-dangerous-direct-browser-access': 'true'
  }, { model, max_tokens: 8000, messages: [{ role: 'user', content }] }, signal);
  const text = (data.content || []).filter(b => b.type === 'text').map(b => b.text).join('');
  if (!text.trim()) throw coded(data.stop_reason === 'refusal' ? 'refused' : 'empty');
  return text;
}
