// Hoja de errores de un subtema (una página para llevar al examen): lógica, sin tocar el diálogo.
// - Secciones 1 y 2: las propone la IA con UNA consulta (proponerHoja) y el estudiante las edita.
// - Secciones 3 y 4: locales, sin IA (misErrores y erroresFrecuentes), recalculadas en cada apertura.
import { getTag } from '../nucleo/etiquetas-xml.js';
import { escapeHTML } from '../nucleo/utilidades.js';
import { S } from '../estado/estado.js';
import { misErrores } from '../estado/mis-errores.js';
import { erroresFrecuentes } from '../estado/errores-frecuentes.js';
import { etiquetaTipo } from '../estado/tipos-error.js';
import { IA, aiReady } from '../ia/config-ia.js';
import { ask } from '../ia/cliente-ia.js';
import { header, fitPrompt } from '../contexto/cabecera-prompt.js';
import { FORMAT_RULES } from '../contexto/reglas-prompt.js';
import { markdownToHTML, mdInline } from '../render/markdown.js';

// Tope de cada sección 1 y 2 para que la hoja entre en una página. No se recorta nada solo (cortar LaTeX
// por líneas rompe fórmulas y borra sin avisar): se le pide a la IA y el diálogo avisa si se pasa.
export const LIMITE = { lineas: 12, caracteres: 1200 };
const MAX_MIS_ERRORES = 15;

// Con el proveedor simulado no se pide nada: sus respuestas son de ejemplo y ensuciarían la hoja.
export const iaDisponible = () => aiReady() && IA.provider !== 'simulado';

// Mide una sección sin cambiarla. Las líneas en blanco del medio cuentan: ocupan lugar en la hoja.
export function medirSeccion(texto) {
  const t = String(texto || '').replace(/\r\n?/g, '\n').trim();
  const lineas = t ? t.split('\n').length : 0;
  return { lineas, caracteres: t.length, larga: lineas > LIMITE.lineas || t.length > LIMITE.caracteres };
}

// Una sola llamada. Etiqueta faltante o vacía → sección vacía (se completa a mano).
export async function proponerHoja() {
  const prompt = fitPrompt(b => `${header(b)}

TAREA: arma las dos primeras secciones de una hoja de UNA página que el estudiante va a llevar al examen de este subtema. La hoja ya incluye aparte la lista de sus errores: no la repitas, pero haz que estas secciones ayuden a no cometerlos.
<recordar>Entre 6 y 10 líneas (máximo 12) que empiecen con "- ": fórmulas en LaTeX, notación que se exige y condiciones de validez clave. Una idea por línea, sin explicaciones largas.</recordar>
<encarar>Los 2 a 4 tipos de ejercicio típicos del subtema. Para cada uno, una línea con el tipo en **negrita** y después sus pasos cortos numerados ("1. ", "2. "…). Máximo 12 líneas en total.</encarar>

${FORMAT_RULES}`);
  const text = await ask(prompt);
  return { recordar: getTag(text, 'recordar'), encarar: getTag(text, 'encarar') };
}

const vacia = '<p class="muted">(Vacía: complétala a mano.)</p>';
const seccionMd = (titulo, md) => `<h2>${titulo}</h2>${md.trim() ? `<div class="md">${markdownToHTML(md)}</div>` : vacia}`;

// Sección 3: pendientes y después superados con ✔. Con muchos, muestra los primeros y avisa cuántos faltan.
function misErroresHTML(k) {
  const lista = misErrores(S.debiles, k);
  if (!lista.length) return '<h2>Mis errores</h2><p class="muted">(Sin puntos débiles guardados en este subtema.)</p>';
  const resto = lista.length - MAX_MIS_ERRORES;
  return `<h2>Mis errores</h2><ul class="mis-errores">${lista.slice(0, MAX_MIS_ERRORES).map(p =>
    `<li${p.superado ? ' class="superado"' : ''}>${p.superado ? '✔ ' : ''}${mdInline(p.texto)} <span class="pill tipo">${escapeHTML(etiquetaTipo(p.tipo))}</span></li>`).join('')}</ul>
    ${resto > 0 ? `<p class="muted small">(+${resto} más en 📌)</p>` : ''}`;
}

// Sección 4: el conteo tal cual lo devuelve erroresFrecuentes (mismo orden, mismas veces).
export const frecuentesTexto = k => erroresFrecuentes(S.debiles, k).map(f => `${etiquetaTipo(f.tipo)} — ${f.veces} ${f.veces === 1 ? 'vez' : 'veces'}`);
function frecuentesHTML(k) {
  const lista = frecuentesTexto(k);
  return `<h2>Errores más frecuentes</h2>${lista.length ? `<ul>${lista.map(t => `<li>${escapeHTML(t)}</li>`).join('')}</ul>` : '<p class="muted">(Todavía no hay errores con tipo en este subtema.)</p>'}`;
}

// Las cuatro secciones, en orden. Sirve para la vista previa y para el PDF.
export function hojaHTML({ recordar, encarar }, k) {
  return `${seccionMd('Qué tengo que recordar', recordar)}
    ${seccionMd('Cómo encarar cada tipo de ejercicio', encarar)}
    ${misErroresHTML(k)}
    ${frecuentesHTML(k)}`;
}
