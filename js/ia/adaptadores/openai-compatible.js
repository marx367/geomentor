// Adaptador para OpenAI, OpenRouter y cualquier endpoint compatible (/chat/completions):
// DeepSeek, GLM, Qwen, Groq, Mistral, Ollama, LM Studio… Quita los bloques <think> de los modelos que razonan.
import { coded } from '../errores-ia.js';
import { httpJSON } from '../cliente-http.js';

const textOf = c => typeof c === 'string' ? c : Array.isArray(c) ? c.map(p => p?.text || '').join('') : '';

export async function llamarOpenAICompatible({ p, key, model, base, prompt, imgs, signal }) {
  const content = imgs.length ? [{ type: 'text', text: prompt }, ...imgs.map(i => ({ type: 'image_url', image_url: { url: i.url } }))] : prompt;
  const headers = key ? { Authorization: `Bearer ${key}` } : {};
  if (p === 'openrouter') { headers['X-Title'] = 'GeoMentor'; if (/^https?:/.test(location.href)) headers['HTTP-Referer'] = location.origin; }
  const data = await httpJSON(`${base}/chat/completions`, headers, { model, messages: [{ role: 'user', content }] }, signal);
  const text = textOf(data.choices?.[0]?.message?.content);
  if (!text.trim()) throw coded(data.choices?.[0]?.finish_reason === 'content_filter' ? 'blocked' : 'empty');
  return text.replace(/<think>[\s\S]*?<\/think>/g, '');
}
