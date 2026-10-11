// Proveedores de IA disponibles. Los modelos son sugerencias: en el panel se puede escribir cualquier otro.
// Para sumar un proveedor compatible con OpenAI alcanza con agregarlo acá (con su 'base').
// baseEditable: muestra el campo "URL base" en el panel (para servidores propios o endpoints por región).
export const PROVIDERS = {
  claude: { nombre: 'Claude integrado (solo dentro de claude.ai)', needsKey: false,
    nota: 'Usa Claude sin clave cuando la app se abre como artefacto en claude.ai.' },
  gemini: { nombre: 'Google Gemini', modelo: 'gemini-2.5-flash', modelos: ['gemini-2.5-flash', 'gemini-2.5-pro', 'gemini-2.5-flash-lite'],
    keyUrl: 'https://aistudio.google.com/apikey', nota: 'Tiene un nivel gratuito generoso. Clave en Google AI Studio.' },
  openrouter: { nombre: 'OpenRouter (cientos de modelos con una sola clave)', modelo: 'google/gemini-2.5-flash',
    modelos: ['google/gemini-2.5-flash', 'openai/gpt-4o-mini', 'deepseek/deepseek-chat', 'meta-llama/llama-3.3-70b-instruct', 'qwen/qwen-2.5-72b-instruct'],
    base: 'https://openrouter.ai/api/v1', keyUrl: 'https://openrouter.ai/keys', nota: 'Escribe el identificador del modelo tal como figura en openrouter.ai/models.' },
  openai: { nombre: 'OpenAI', modelo: 'gpt-4o-mini', modelos: ['gpt-4o-mini', 'gpt-4o', 'gpt-4.1-mini', 'gpt-4.1'],
    base: 'https://api.openai.com/v1', baseEditable: true, keyUrl: 'https://platform.openai.com/api-keys', nota: '' },
  anthropic: { nombre: 'Anthropic (API directa)', modelo: 'claude-sonnet-5', modelos: ['claude-sonnet-5', 'claude-opus-5-5', 'claude-haiku-4-5-20251001'],
    keyUrl: 'https://console.anthropic.com/settings/keys', nota: '' },
  deepseek: { nombre: 'DeepSeek', modelo: 'deepseek-v4-flash', modelos: ['deepseek-v4-flash', 'deepseek-v4-pro'],
    base: 'https://api.deepseek.com', baseEditable: true, keyUrl: 'https://platform.deepseek.com/api_keys',
    nota: 'Económico. deepseek-v4-flash es el rápido; deepseek-v4-pro razona más. No admite imágenes: la corrección por foto dará error.' },
  glm: { nombre: 'GLM (Z.ai / Zhipu)', modelo: 'glm-5.1', modelos: ['glm-5.1', 'glm-4.7', 'glm-4.6'],
    base: 'https://api.z.ai/api/paas/v4', baseEditable: true, keyUrl: 'https://z.ai/manage-apikey/apikey-list',
    nota: 'Clave de z.ai. Si tu clave es de la plataforma china, cambia la URL base a https://open.bigmodel.cn/api/paas/v4.' },
  qwen: { nombre: 'Qwen (Alibaba Model Studio)', modelo: 'qwen3.6-plus', modelos: ['qwen3.6-plus', 'qwen3.6-flash', 'qwen3-max'],
    base: 'https://dashscope-intl.aliyuncs.com/compatible-mode/v1', baseEditable: true, keyUrl: 'https://modelstudio.console.alibabacloud.com/',
    nota: 'La clave solo sirve en su región. Internacional: dashscope-intl…; China: https://dashscope.aliyuncs.com/compatible-mode/v1.' },
  compatible: { nombre: 'Otro compatible con OpenAI (Groq, Mistral, Ollama, LM Studio…)', modelo: 'llama3.1', modelos: [],
    base: 'http://localhost:11434/v1', baseEditable: true, keyOptional: true,
    nota: 'Cualquier servicio con endpoint /chat/completions. Para Ollama local inicia el servidor con OLLAMA_ORIGINS=* para permitir el navegador.' },
  simulado: { nombre: 'Modo prueba (sin IA real)', modelo: 'simulado', modelos: ['simulado'], keyOptional: true,
    nota: 'Responde siempre el mismo texto de ejemplo, sin internet ni clave. Solo para probar la interfaz.' }
};
