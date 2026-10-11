// Errores de la IA: códigos internos → mensajes en español para el estudiante.
export const SAMPLE_ERRORS = {
  unavailable: 'El mentor con IA no está disponible. Configura un proveedor en ⚙️ Config.',
  no_key: 'Falta la API key del proveedor elegido. Agrégala en ⚙️ Config.',
  no_model: 'Falta el nombre del modelo. Escríbelo en ⚙️ Config.',
  timeout: 'El proveedor tardó demasiado en responder. Prueba de nuevo o elige un modelo más rápido.',
  network: 'No se pudo conectar con el proveedor. Revisa tu conexión, la URL base o, si usas un servidor local, que permita solicitudes del navegador (CORS).',
  bad_key: 'La API key fue rechazada. Revisa que esté bien copiada y activa.',
  not_found: 'El proveedor no encontró ese modelo o endpoint. Revisa el nombre del modelo y la URL base.',
  empty: 'El modelo respondió vacío. Prueba de nuevo o con otro modelo.',
  blocked: 'El proveedor bloqueó la respuesta por sus filtros de seguridad. Reformula o prueba otro modelo.',
  not_granted: 'No se concedió permiso para usar Claude en esta página.',
  rate_limited: 'Demasiadas consultas seguidas o cuota agotada. Espera un momento y vuelve a intentarlo.',
  prompt_too_large: 'El material es demasiado largo para una consulta. Quita algunos apuntes e inténtalo de nuevo.',
  images_unavailable: 'Esta vista no permite enviar imágenes.',
  image_rejected: 'La imagen fue rechazada. Prueba con una foto en JPG o PNG.',
  session_expired: 'La sesión expiró. Recarga la página.',
  sampling_disabled: 'El uso de Claude está desactivado para esta página.',
  refused: 'El modelo no pudo responder a esta solicitud.'
};
export const aiError = e => SAMPLE_ERRORS[e?.code] || `No se pudo completar la consulta (${e?.message || e?.code || 'error desconocido'}).`;
export const coded = (code, message) => Object.assign(new Error(message || code), { code });
