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
| `estilos.css` | Entrada: `@import` del resto, en el mismo orden que el prototipo (la cascada depende del orden) |
| `tema.css` | Variables de color (claro y oscuro azul marino/cian), tipografía, radios, sombras |
| `base.css` | Reset y estilos de elementos, mobile-first |
| `layout.css` | Contenedor central y encabezado de cada vista |
| `componentes/botones.css` | Botones y fila de botones |
| `componentes/cabecera.css` | Barra superior, marca, acciones y aviso de IA |
| `componentes/migas.css` | Migas Materia › Eje › Subtema |
| `componentes/tarjetas.css` | Tarjetas de selección y pastillas |
| `componentes/formularios.css` | Campos, botón de archivo, clave, interruptor |
| `componentes/contenido.css` | Contenido de la IA: Markdown, fórmulas, carga, errores, fuentes, complementos |
| `componentes/mentor.css` | Mentor flotante |
| `componentes/dialogos.css` | Diálogos de configuración, ejes, plan y débiles |
| `componentes/ficha-pdf.css` | Ficha PDF (siempre en claro) |
| `componentes/pizarra.css` | Pizarra de Ejercicios [10] |
| `vistas/mentoria.css` | Contenedor y pestañas del subtema |
| `vistas/teoria.css` · `ejercicios.css` · `examen.css` · `laboratorio.css` | Una pestaña cada uno |
| `responsive.css` | Breakpoints y movimiento reducido |

## js/
| Archivo | Qué hace |
|---|---|
| `config-mathjax.js` | Configuración de MathJax. Script clásico que se carga antes que MathJax; avisa con el evento `math-ready` [2] |
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
| `ia/config-ia.js` | Proveedor activo, claves, modelos (`IA`), capacidades de claude.ai (`AI`), `aiReady()` e `initCapabilities()` (no toca la pantalla) [5] |
| `ia/errores-ia.js` | Códigos de error → mensajes en español (`aiError`, `coded`) [5] |
| `ia/cliente-http.js` | POST JSON que traduce fallas HTTP a códigos; imagen → base64 [5] |
| `ia/adaptadores/*.js` | Un formato de API por archivo (Gemini, OpenAI-compatible, Anthropic, Claude integrado) [5] |
| `ia/cliente-ia.js` | `ask()`: único punto de salida a la IA [5] |
| `ia/panel-ia.js` | Aviso de IA sin configurar (`applyIA`), panel de configuración con borrador y "Probar conexión" [5] |
| `contexto/reglas-prompt.js` | Reglas de formato, citas, modo estricto y sintaxis del laboratorio [6] |
| `contexto/busqueda-apuntes.js` | Palabras clave, trozos y apuntes relevantes [6] |
| `contexto/cabecera-prompt.js` | Arma la cabecera y ajusta el prompt al presupuesto [6] |
| `contexto/fuentes.js` | Etiquetas de transparencia de fuente [6] |
| `apuntes/lector-archivos.js` | Lee .txt, .md y .pdf; avisa si un PDF es escaneado (código `escaneado`) [6] |
| `apuntes/lector-pdf.js` | Carga pdf.js bajo demanda y extrae el texto página por página [6] |
| `apuntes/estructura-ejes.js` | Lógica: apuntes de la materia, índices por partes, propuesta de ejes por la IA y normalización de ids [6] |
| `apuntes/plan-estudios.js` | Lógica: prompt de cada sección, limpieza, cronograma y armado del plan .md [6] |
| `apuntes/panel-apuntes.js` | Lista de apuntes en Config, asignación a temas, carga de archivos y guardado [7] |
| `apuntes/dialogo-ejes.js` | Diálogo "Generar ejes desde mis apuntes" [7] |
| `apuntes/dialogo-plan.js` | Diálogo "Consolidar apuntes en un plan", con progreso y cancelación [7] |
| `ui/navegacion.js` | Vistas materias/ejes/subtemas, acento por materia, entrar a un subtema, pestañas, tema personalizado, reiniciar [7] |
| `ui/migas.js` | Migas de pan [7] |
| `ui/tarjetas.js` | Tarjetas de selección y conteo de puntos débiles [7] |
| `ui/mentor.js` | Mentor flotante y tips por pestaña [7] |
| `ui/dialogos.js` | Botón ✕ de todos los diálogos [7] |
| `ui/dialogo-config.js` | Diálogo ⚙️ Config: abre IA + apuntes y guarda todo [7] |
| `ui/puntos-debiles.js` | Contador, diálogo 📌, repasar, marcar superado, exportar .txt [7] |
| `ui/eventos.js` | Listeners delegados del documento (data-go, pestañas, data-lab, data-action, campos) [7] |
| `exportacion/descargas.js` | `saveFile`: descarga con claude.ai o con enlace temporal [7] |
| `pestanas/registro.js` | Conecta navegación y pestañas: `registrarPestana`, `registrarAccion`, avisos `alSuceder`/`avisar` (`entrar-subtema`, `cambio-acento`, `reiniciar`) [7] |
| `pestanas/contenido-teoria.js` · `teoria.js` · `chequeo-socratico.js` | Pestaña 1 [8] |
| `exportacion/*.js` | Descargas, resumen .txt, ficha PDF [8] |
| `laboratorio/parser/*.js` | Tokenizador, parser, evaluador, análisis de líneas, formato de números [9] |
| `laboratorio/lienzo/*.js` | Cuadrícula, trazado, objetos, interacción, lista de expresiones [9] |
| `pestanas/laboratorio.js` | Pestaña 2: presets y análisis del gráfico por IA [9] |
| `pestanas/ejercicios.js` · `foto-resolucion.js` · `correccion.js` | Pestaña 3 [10] |
| `pizarra/*.js` | Pizarra a mano alzada (lápiz, línea, limpiar) que se exporta como imagen [10] |
| `pestanas/examen.js` | Pestaña 4 [10] |
