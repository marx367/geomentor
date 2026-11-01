// Tipos del dominio del método (solo JSDoc). Las fechas son siempre texto 'YYYY-MM-DD'.

/** @typedef {'captura'|'reconstruccion'|'practica'|'recuperacion'|'simulacion'} Etapa */

/** @typedef {Object} Intento
 *  @property {string} fecha          'YYYY-MM-DD'
 *  @property {'chequeo'|'drill'|'construccion'|'examen'} tipo
 *  @property {number} aciertos
 *  @property {number} total
 *  @property {string[]} [errores]    ids o etiquetas de lo que falló
 */

/** @typedef {Object} Tema
 *  @property {string} id
 *  @property {string} nombre
 *  @property {string} fechaClase     'YYYY-MM-DD'
 *  @property {string} [metodo]
 *  @property {Intento[]} intentos
 *  @property {{estado:'vacia'|'hecha'|'obsoleta'}} [hoja]
 *  @property {string[]} [pasos]
 */

/** @typedef {Object} Accion
 *  @property {'reconstruir'|'practicar'|'repasar'|'cerrar-hoja'|'integrar'} tipo
 *  @property {string} temaId
 *  @property {number} minutos
 *  @property {string} motivo         texto en español, listo para mostrar
 *  @property {0|1|2|3|4} prioridad
 */

export {};
