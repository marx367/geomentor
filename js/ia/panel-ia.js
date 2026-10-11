// Parte visual de la IA: aviso superior cuando falta configurarla y panel de configuración
// (proveedor, clave, modelo, URL base y "Probar conexión"). Los cambios se editan en un borrador
// (iaDraft) y se guardan recién con commitIA(), al tocar "Guardar configuración".
import { $ } from '../nucleo/dom.js';
import { escapeHTML, clip, spinnerHTML } from '../nucleo/utilidades.js';
import { PROVIDERS } from './proveedores.js';
import { IA, AI, saveIA, inClaude, aiReady } from './config-ia.js';
import { aiError, coded } from './errores-ia.js';
import { callProvider } from './cliente-ia.js';
import { llamarClaudeIntegrado } from './adaptadores/claude-integrado.js';

// Muestra u oculta los avisos de "configurá un proveedor" y habilita lo que depende de la IA.
// Afuera queda una línea breve que remite al engranaje; el detalle va dentro del diálogo.
export function applyIA() {
  const p = IA.provider;
  AI.images = p === 'claude' ? AI.claudeImages : true;
  AI.imageTypes = p === 'claude' ? AI.claudeTypes : 'image/jpeg,image/png,image/webp';
  const notice = $('#ai-notice'), avisoDlg = $('#ia-aviso-dlg');
  const listo = aiReady();
  notice.hidden = avisoDlg.hidden = listo;
  if (!listo) {
    notice.textContent = 'Para activar el mentor, configura un proveedor de IA en ⚙️ (arriba a la derecha). El laboratorio funciona sin IA.';
    avisoDlg.textContent = inClaude() && p !== 'claude'
      ? 'Dentro de claude.ai solo funciona «Claude integrado». Para usar otro proveedor, abre el archivo HTML en tu navegador.'
      : 'Elige un proveedor de IA (Gemini, OpenRouter, OpenAI, Anthropic, DeepSeek, GLM, Qwen o uno local) y completa su clave para activar el mentor.';
  }
  const la = $('#lab-analyze');
  if (la) la.disabled = !aiReady();
}

export let iaDraft = null;
export function renderIAConfig() {
  iaDraft ||= { provider: IA.provider, keys: { ...IA.keys }, models: { ...IA.models }, bases: { ...IA.bases } };
  const sel = $('#ia-provider');
  sel.innerHTML = Object.entries(PROVIDERS)
    .filter(([id]) => id !== 'claude' || AI.sample)
    .map(([id, pr]) => `<option value="${id}" ${id === iaDraft.provider ? 'selected' : ''}>${escapeHTML(pr.nombre)}</option>`).join('');
  const p = iaDraft.provider, pr = PROVIDERS[p];
  const external = p !== 'claude';
  $('#ia-provider-note').textContent = (inClaude() && external)
    ? '⚠️ Dentro de claude.ai las llamadas a otros proveedores están bloqueadas. Descarga el HTML y ábrelo en tu navegador para usarlos.'
    : pr.nota || '';
  $('#ia-key-row').hidden = !external;
  $('#ia-model-row').hidden = !external;
  $('#ia-base-row').hidden = !pr.baseEditable;
  $('#ia-key-opt').textContent = pr.keyOptional ? '(opcional en servidores locales)' : '';
  $('#ia-key').value = iaDraft.keys[p] || '';
  $('#ia-model').value = iaDraft.models[p] || pr.modelo || '';
  $('#ia-models').innerHTML = (pr.modelos || []).map(m => `<option value="${escapeHTML(m)}">`).join('');
  $('#ia-base').value = iaDraft.bases[p] || pr.base || '';
  const link = $('#ia-key-link');
  link.hidden = !pr.keyUrl;
  if (pr.keyUrl) { link.href = pr.keyUrl; link.textContent = '🔑 Obtener una API key'; }
  $('#ia-test-result').textContent = '';
}
export function readIADraft() {
  if (!iaDraft) return;
  const p = iaDraft.provider;
  if (p === 'claude') return;
  iaDraft.keys[p] = $('#ia-key').value.trim();
  iaDraft.models[p] = $('#ia-model').value.trim();
  if (PROVIDERS[p].baseEditable) iaDraft.bases[p] = $('#ia-base').value.trim();
}
export function commitIA() {
  readIADraft();
  if (!iaDraft) return;
  Object.assign(IA, { provider: iaDraft.provider, keys: iaDraft.keys, models: iaDraft.models, bases: iaDraft.bases });
  iaDraft = null;
  saveIA();
  applyIA();
}
export async function testIA() {
  readIADraft();
  const p = iaDraft.provider;
  const out = $('#ia-test-result');
  out.innerHTML = `${spinnerHTML} Probando…`;
  out.style.color = '';
  try {
    let text;
    if (p === 'claude') text = await llamarClaudeIntegrado('Responde únicamente con la palabra OK.', { fresh: true });
    else {
      if (inClaude()) throw coded('network');
      text = await callProvider(p, 'Responde únicamente con la palabra OK.', null, { key: iaDraft.keys[p] || '', model: iaDraft.models[p] || PROVIDERS[p].modelo || '', base: iaDraft.bases[p] || PROVIDERS[p].base || '' });
    }
    out.textContent = `✔ Conectado. Respuesta: «${clip(text.trim(), 40)}»`;
    out.style.color = 'var(--ok)';
  } catch (e) {
    out.textContent = '✖ ' + aiError(e);
    out.style.color = 'var(--bad)';
  }
}

// Descarta el borrador sin guardar (al abrir o cerrar el diálogo de configuración).
export function descartarBorradorIA() { iaDraft = null; }

// Cambia el proveedor del borrador conservando lo que ya se escribió para el anterior.
export function cambiarProveedorBorrador(p) { readIADraft(); iaDraft.provider = p; renderIAConfig(); }
