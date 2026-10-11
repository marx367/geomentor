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

export async function llamarSimulado({ prompt, signal }) {
  await new Promise((resolver, rechazar) => {
    const timer = setTimeout(resolver, DEMORA_MS);
    // Si se cancela el pedido (tiempo máximo), se corta igual que una llamada real
    signal?.addEventListener('abort', () => { clearTimeout(timer); rechazar(new DOMException('Cancelado', 'AbortError')); });
  });
  // "Probar conexión" pide responder solo OK
  if (/únicamente con la palabra OK/i.test(prompt)) return 'OK';
  return RESPUESTA;
}
