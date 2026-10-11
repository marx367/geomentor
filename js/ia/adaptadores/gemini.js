// Adaptador de Google Gemini (API generateContent). Descarta las partes de "pensamiento" del modelo.
import { coded } from '../errores-ia.js';
import { httpJSON } from '../cliente-http.js';

export async function llamarGemini({ key, model, prompt, imgs, signal }) {
  const parts = [{ text: prompt }, ...imgs.map(i => ({ inline_data: { mime_type: i.mime, data: i.data } }))];
  const data = await httpJSON(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`,
    { 'x-goog-api-key': key }, { contents: [{ role: 'user', parts }] }, signal);
  if (data.promptFeedback?.blockReason) throw coded('blocked');
  const cand = data.candidates?.[0];
  if (cand?.finishReason === 'SAFETY') throw coded('blocked');
  const text = (cand?.content?.parts || []).filter(x => !x.thought).map(x => x.text || '').join('');
  if (!text.trim()) throw coded('empty');
  return text;
}
