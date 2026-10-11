# Módulos

Qué hace cada archivo. Se completa a medida que avanza la migración (paso del roadmap entre corchetes).

## Raíz
| Archivo | Qué hace |
|---|---|
| `index.html` | Estructura: cabecera, vistas, diálogos, mentor. Carga CSS y `js/main.js` [2] |
| `iniciar-servidor.ps1` | Levanta un servidor local en el puerto 8080 [1] |

## css/ [2]
| Archivo | Qué hace |
|---|---|
| `estilos.css` | Entrada: `@import` del resto, en orden |
| `tema.css` | Variables de color (azul marino, cian), tipografía, radios, sombras |
| `base.css` | Reset y estilos base, mobile-first |
| `componentes/botones.css` · `cabecera.css` · `tarjetas.css` · `mentor.css` · `dialogos.css` · `ficha-pdf.css` · `pizarra.css` | Una pieza visual cada uno |
| `vistas/mentoria.css` | Pestañas de teoría, ejercicios y examen |
| `vistas/laboratorio.css` | Canvas y lista de expresiones |
| `responsive.css` | Breakpoints |

## js/
| Archivo | Qué hace |
|---|---|
| `main.js` | Punto de entrada: inicializa almacén, IA, lienzo, eventos y la primera vista [7] |
| `nucleo/dom.js` | `$` y `$$` (selectores) [3] |
| `nucleo/utilidades.js` | `newId`, `escapeHTML`, formateos [3] |
| `nucleo/etiquetas-xml.js` | `getTag`, `getTags`, `toList`: leen la respuesta de la IA [3] |
| `datos/catalogo.js` | Junta las materias y exporta `MATERIAS` [3] |
| `datos/materias/*.js` | Una materia por archivo: ejes y subtemas [3] |
| `datos/sinonimos.js` | Sinónimos matemáticos para buscar en apuntes [3] |
| `render/matematica.js` | Fórmulas LaTeX con KaTeX/MathJax [3] |
| `render/markdown.js` | Markdown simple → HTML, sin librerías [3] |
| `estado/estado.js` | Estado en memoria: vista, materia, sesión por subtema [4] |
| `estado/almacen.js` | Fachada de guardado: elige backend [4] |
| `estado/almacen-local.js` | Backend localStorage [4] |
| `estado/almacen-claude.js` | Backend base de datos de claude.ai (opcional) [4] |
| `ia/proveedores.js` | Lista de proveedores, modelos sugeridos y URLs [5] |
| `ia/config-ia.js` | Proveedor activo, claves, modelos; `aiReady()` [5] |
| `ia/errores-ia.js` | Traduce errores de red/API a español [5] |
| `ia/cliente-http.js` | `fetch` JSON con tiempo límite [5] |
| `ia/adaptadores/*.js` | Un formato de API por archivo (Gemini, OpenAI-compatible, Anthropic, Claude integrado) [5] |
| `ia/cliente-ia.js` | `ask()`: único punto de salida a la IA [5] |
| `ia/panel-ia.js` | Panel de configuración y "Probar conexión" [5] |
| `contexto/reglas-prompt.js` | Reglas de formato, citas, modo estricto y sintaxis del laboratorio [6] |
| `contexto/busqueda-apuntes.js` | Palabras clave, trozos y apuntes relevantes [6] |
| `contexto/cabecera-prompt.js` | Arma la cabecera y ajusta el prompt al presupuesto [6] |
| `contexto/fuentes.js` | Etiquetas de transparencia de fuente [6] |
| `apuntes/apuntes.js` | Lista, alcance y guardado de apuntes [6] |
| `apuntes/lector-archivos.js` | Lee .txt y .md [6] |
| `apuntes/lector-pdf.js` | Carga pdf.js bajo demanda y extrae texto [6] |
| `apuntes/ejes-generados.js` | Ejes propuestos por la IA desde los apuntes [6] |
| `apuntes/plan-estudios.js` | Consolida apuntes en un plan de estudios [6] |
| `ui/*.js` | Navegación, migas, catálogo, mentor, diálogos, puntos débiles, eventos [7] |
| `pestanas/registro.js` | Tabla pestaña → función de render [7] |
| `pestanas/contenido-teoria.js` · `teoria.js` · `chequeo-socratico.js` | Pestaña 1 [8] |
| `exportacion/*.js` | Descargas, resumen .txt, ficha PDF [8] |
| `laboratorio/parser/*.js` | Tokenizador, parser, evaluador, análisis de líneas, formato de números [9] |
| `laboratorio/lienzo/*.js` | Cuadrícula, trazado, objetos, interacción, lista de expresiones [9] |
| `pestanas/laboratorio.js` | Pestaña 2: presets y análisis del gráfico por IA [9] |
| `pestanas/ejercicios.js` · `foto-resolucion.js` · `correccion.js` | Pestaña 3 [10] |
| `pizarra/*.js` | Pizarra a mano alzada (lápiz, línea, limpiar) que se exporta como imagen [10] |
| `pestanas/examen.js` | Pestaña 4 [10] |
