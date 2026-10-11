// Registro que conecta la navegación con las pestañas sin que se importen entre sí (evita ciclos).
// Cada pestaña se anota al cargar su módulo:
//  - registrarPestana('teoria', { mostrar, redibujar }): qué hacer al abrirla y al redibujar la vista.
//  - registrarAccion('verificar', fn): botones con data-action="verificar" (ver ui/eventos.js).
//  - alSuceder('entrar-subtema', fn): avisos generales; la navegación los dispara con avisar().
// Avisos usados: 'entrar-subtema', 'cambio-acento', 'reiniciar'.
const pestanas = {};
const acciones = {};
const ganchos = {};

export function registrarPestana(nombre, { mostrar, redibujar }) { pestanas[nombre] = { mostrar, redibujar }; }
export function mostrarPestana(nombre) { pestanas[nombre]?.mostrar?.(); }
export function redibujarPestana(nombre) { pestanas[nombre]?.redibujar?.(); }

export function registrarAccion(nombre, fn) { acciones[nombre] = fn; }
export function ejecutarAccion(nombre, elemento) { acciones[nombre]?.(elemento); }

export function alSuceder(evento, fn) { (ganchos[evento] ||= []).push(fn); }
export function avisar(evento, ...args) { (ganchos[evento] || []).forEach(fn => fn(...args)); }
