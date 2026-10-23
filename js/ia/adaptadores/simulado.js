// Adaptador de prueba: responde sin conectarse a ningún proveedor ni usar clave.
// Sirve para probar la interfaz (cargando, Markdown, fórmulas) sin gastar saldo.
const DEMORA_MS = 1000; // simula la espera de una IA real para ver el estado "cargando"

const RESPUESTA = `## Respuesta simulada

Este texto viene del **modo prueba**: no lo generó ninguna IA.

Ejemplo de fórmula en línea: $a^2 + b^2 = c^2$.

Ejemplo de fórmula en bloque:

$$\\int_0^1 x^2 \\, dx = \\frac{1}{3}$$

- Punto uno
- Punto dos`;

// La pestaña Teoría lee la respuesta por etiquetas (ver docs/formato-prompts.md): sin ellas mostraría un error.
const TEORIA = `<teoria>${RESPUESTA}</teoria>
<ideas_clave>
- Idea clave de ejemplo
- Otra idea con fórmula: $m = \\frac{y_2 - y_1}{x_2 - x_1}$
</ideas_clave>
<pregunta>¿Qué representa la pendiente de una recta? (pregunta de ejemplo)</pregunta>
<tips>
- Consejo de ejemplo para el examen
</tips>
<grafico>
y = x^2
P = (1, 1)
</grafico>`;

// Puntos débiles con tipo (ver FORMATO_PUNTOS). "orientacion" no es un tipo válido: prueba la vuelta a 'sin-clasificar'.
const PUNTOS = `<punto><texto>Cambia el signo al pasar un término de miembro (ejemplo)</texto><tipo>signo</tipo></punto>
<punto><texto>Usa un método que no corresponde (ejemplo)</texto><tipo>Método</tipo></punto>
<punto><texto>Punto con tipo inválido (ejemplo)</texto><tipo>orientacion</tipo></punto>`;
const CHEQUEO = `<feedback>Devolución simulada del chequeo.</feedback>
<comprension>60</comprension>
<entendido>
- Idea entendida de ejemplo
</entendido>
<falta>${PUNTOS}</falta>
<siguiente_pregunta>Siguiente pregunta de ejemplo</siguiente_pregunta>
<tip>Consejo de ejemplo</tip>`;
const RESUMEN = `<resumen_general>Resumen simulado de la sesión.</resumen_general>
<puntos_fuertes>
- Punto fuerte de ejemplo
</puntos_fuertes>
<puntos_debiles>${PUNTOS}</puntos_debiles>
<plan_de_repaso>
- Paso de ejemplo
</plan_de_repaso>
<ejercicio_sugerido>Ejercicio de ejemplo</ejercicio_sugerido>`;
const CORRECCION = `<correccion>### Lo que interpreté
Corrección simulada.</correccion>
<falta>${PUNTOS}</falta>`;
// Examen: 5 preguntas con la correcta en A; la primera con tipo "calculo" y el resto inválido o vacío.
const EXAMEN = [1, 2, 3, 4, 5].map(i => `<pregunta>
<enunciado>Pregunta simulada ${i}</enunciado>
<a>Correcta</a><b>Distractor</b><c>Distractor</c><d>Distractor</d>
<correcta>A</correcta>
<explicacion>Explicación simulada ${i}</explicacion>
<tipo>${i === 1 ? 'calculo' : i === 2 ? 'cualquiera' : ''}</tipo>
</pregunta>`).join('\n');

// "＋ Tema de hoy": si la materia ya tiene ejes, elige el primero; si no, propone uno nuevo.
function ubicacion(prompt) {
  const primerEje = prompt.match(/^- ([a-z0-9-]+): /m)?.[1] || '';
  return `<eje_existente>${primerEje}</eje_existente>
<eje_nuevo><nombre>Eje de prueba</nombre><icono>🧪</icono><desc>Eje propuesto en modo prueba.</desc></eje_nuevo>
<subtema><nombre>Subtema de prueba</nombre><desc>Propuesto por el modo prueba.</desc></subtema>`;
}

export async function llamarSimulado({ prompt, signal }) {
  await new Promise((resolver, rechazar) => {
    const timer = setTimeout(resolver, DEMORA_MS);
    // Si se cancela el pedido (tiempo máximo), se corta igual que una llamada real
    signal?.addEventListener('abort', () => { clearTimeout(timer); rechazar(new DOMException('Cancelado', 'AbortError')); });
  });
  // "Probar conexión" pide responder solo OK
  if (/únicamente con la palabra OK/i.test(prompt)) return 'OK';
  if (prompt.includes('<teoria>')) return TEORIA;
  if (prompt.includes('<eje_existente>')) return ubicacion(prompt);
  if (prompt.includes('<feedback>')) return CHEQUEO;
  if (prompt.includes('<resumen_general>')) return RESUMEN;
  if (prompt.includes('<correccion>')) return CORRECCION;
  if (prompt.includes('<por_que_a>')) return EXAMEN;
  if (prompt.includes('<analisis>')) return `<analisis>
- Análisis de ejemplo: justificar cada paso
- Usar la notación de clase
</analisis>`;
  return RESPUESTA;
}
