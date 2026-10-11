# Arquitectura

## Idea general

App estática: el navegador carga `index.html`, que trae `css/estilos.css` y un único script de entrada, `js/main.js` (`type="module"`). Desde ahí, cada módulo importa lo que necesita. No hay servidor propio: la IA se llama directo desde el navegador.

## Capas

Las dependencias van **solo hacia abajo**. Una capa puede importar las que están debajo, nunca las de arriba.

```
main.js                      → arranque: inicializa todo en orden
  │
ui/                          → navegación, migas, mentor, diálogos, eventos delegados
  │   (usa pestanas/registro.js, nunca las pestañas directamente)
pestanas/  pizarra/          → teoría, laboratorio, ejercicios, examen
  │
apuntes/  exportacion/  laboratorio/lienzo/
  │
contexto/                    → arma los prompts (reglas + apuntes relevantes + débiles)
  │
ia/  render/                 → hablar con la IA · mostrar Markdown y fórmulas
  │
estado/                      → estado en memoria y almacenamiento
  │
datos/  laboratorio/parser/  → catálogo fijo · parser puro (sin DOM)
  │
nucleo/                      → utilidades sin dependencias
```

## Reglas

1. **Sin ciclos.** Si dos módulos se necesitan entre sí, la parte común baja a una capa inferior.
2. **Registro de pestañas.** Cada pestaña se anota en `pestanas/registro.js` al cargarse:
   - `registrarPestana('teoria', { mostrar, redibujar })`: qué hacer al abrirla y al redibujar.
   - `registrarAccion('verificar', fn)`: botones `data-action="verificar"` (los dispara `ui/eventos.js`). Los botones `data-lab="x"` llegan como acción `lab:x`.
   - `alSuceder('entrar-subtema', fn)`: avisos que dispara la navegación (`entrar-subtema`, `cambio-acento`, `reiniciar`).

   Así la navegación no importa las pestañas y se evita el ciclo navegación ↔ pestañas. Las pestañas sí pueden usar la "carcasa" de la interfaz (`ui/navegacion.js`, `ui/mentor.js`), igual que los diálogos de `apuntes/`. Para sumar una pestaña, alcanza con importarla en `main.js`.
3. **Un solo punto de salida a la IA:** `ia/cliente-ia.js` → `ask()`. Las pestañas nunca llaman a un proveedor directo.
4. **Un solo punto de guardado:** `estado/almacen.js`. Elige localStorage o la base de claude.ai sin que el resto lo sepa.
5. **El parser no toca el DOM.** Recibe texto y devuelve valores o errores. Así se puede probar solo.
6. **Eventos delegados.** `ui/eventos.js` escucha `click`, `input` y `change` en `document` y deriva según `data-accion`. No hay `onclick` en el HTML.

## Arranque de la IA

`main.js` llama, en orden: `initCapabilities()` (detecta claude.ai y elige proveedor) → `applyIA()` (aviso en pantalla) → redibuja la vista. En el prototipo, `initCapabilities` redibujaba sola; se separó para que `ia/` no dependa de `ui/`.

## Flujo típico (pedir teoría)

1. El usuario elige un subtema → `ui/navegacion.js` actualiza `estado.js` y muestra la pestaña.
2. `pestanas/contenido-teoria.js` arma el prompt con `contexto/cabecera-prompt.js` (reglas + apuntes relevantes + puntos débiles).
3. `ia/cliente-ia.js` lo envía al proveedor activo mediante su adaptador.
4. La respuesta trae etiquetas XML (`docs/formato-prompts.md`) → `nucleo/etiquetas-xml.js` las separa.
5. `render/markdown.js` y `render/matematica.js` la muestran. `estado/almacen.js` guarda el progreso.

## Librerías externas (CDN, globales)

Se cargan con `<script defer>` en `index.html` y quedan en `window`: `MathJax`, `katex`, `html2pdf`. `pdf.js` se carga bajo demanda desde `apuntes/lector-pdf.js`. Si una no cargó, la app sigue funcionando y muestra texto plano.
