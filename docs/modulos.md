# Módulos

Qué hace cada archivo. Al sumar, mover o borrar un archivo, actualizar esta lista. Entre corchetes: paso del roadmap en que se creó ([F2] = Fase 2; [MCn] = paso n de `docs/plan-mi-curso.md`; [MC-R] = Reglas del examen y [MC-D] = Puntos débiles con tipo, del mismo plan).

## Raíz
| Archivo | Qué hace |
|---|---|
| `index.html` | Estructura: cabecera (📌, ⚙️ y tema), vistas, diálogos (Profesor con Reglas del examen), mentor con botón de acción. Carga CSS y `js/main.js` [2] |
| `iniciar-servidor.ps1` | Levanta un servidor local en el puerto 8080 [1] |

## css/ [2]
| Archivo | Qué hace |
|---|---|
| `estilos.css` | Entrada: `@import` del resto, en el mismo orden que el prototipo (la cascada depende del orden) |
| `tema.css` | Variables de color de los temas Light, Dim (azul marino, también Auto oscuro) y Dark (negro OLED), tipografía, radios, sombras [F2] |
| `base.css` | Reset y estilos de elementos, mobile-first |
| `layout.css` | Contenedor central y encabezado de cada vista |
| `componentes/botones.css` | Botones y fila de botones |
| `componentes/cabecera.css` | Barra superior, marca, acciones (📌 Puntos débiles), botones de ícono (⚙️ y tema), menú de tema y línea de aviso de IA [F2] |
| `componentes/migas.css` | Migas Materia › Eje › Subtema |
| `componentes/tarjetas.css` | Tarjetas de selección y pastillas |
| `componentes/formularios.css` | Campos (fecha incluida), botón de archivo, clave, interruptor |
| `componentes/contenido.css` | Contenido de la IA: Markdown, fórmulas, carga, errores, fuentes, complementos |
| `componentes/mentor.css` | Mentor flotante y su botón de acción |
| `componentes/dialogos.css` | Diálogos de configuración (con la zona "Datos y reinicio"), Tema de hoy, Profesor y bibliografía, plan y débiles (pastilla del tipo de error) |
| `componentes/ficha-pdf.css` | PDF de la ficha y del ejercicio (siempre en claro, con la foto o pizarra) |
| `componentes/pizarra.css` | Pizarra de Ejercicios [10] |
| `vistas/mentoria.css` | Contenedor y pestañas del subtema |
| `vistas/teoria.css` · `ejercicios.css` · `examen.css` · `laboratorio.css` | Una pestaña cada uno |
| `responsive.css` | Breakpoints y movimiento reducido |

## js/
| Archivo | Qué hace |
|---|---|
| `config-mathjax.js` | Configuración de MathJax. Script clásico que se carga antes que MathJax; avisa con el evento `math-ready` [2] |
| `tema-inicial.js` | Script clásico en `<head>`, antes de los estilos: aplica el tema guardado (`data-theme`) para que no haya parpadeo [F2] |
| `main.js` | Punto de entrada: inicializa almacén, IA, lienzo, eventos y la primera vista [7] |
| `nucleo/dom.js` | `$` y `$$` (selectores) [3] |
| `nucleo/utilidades.js` | `newId`, `escapeHTML`, formateos, `today` (fecha local), `limpiarTexto` y `esFechaValida` para validar lo que escribe el estudiante [3] |
| `nucleo/etiquetas-xml.js` | `getTag`, `getTags`, `toList`: leen la respuesta de la IA [3] |
| `datos/colores-materias.js` | Colores de acento e íconos que toman las materias nuevas, en orden [MC1] |
| `datos/cuestionario-profesor.js` | Preguntas de opción múltiple sobre el profesor [MC3] |
| `datos/sinonimos.js` | Sinónimos matemáticos para buscar en apuntes [3] |
| `render/matematica.js` | Fórmulas LaTeX con KaTeX/MathJax [3] |
| `render/markdown.js` | Markdown simple → HTML, sin librerías [3] |
| `estado/estado.js` | Estado en memoria: vista, materia, Mi curso, sesión por subtema [4] |
| `estado/curso.js` | Mi curso: materias, ejes y subtemas con fecha en el documento `curso`; validación, ids únicos, crear y buscar [MC1] |
| `estado/tipos-error.js` | Lista fija de tipos de error (`signo`, `notacion`, `condicion`, `calculo`, `concepto`, `metodo`), `normalizarTipo()` (lo desconocido → `sin-clasificar`), `etiquetaTipo()` y `leerPuntos()` para leer `<punto>` de la IA [MC-D] |
| `estado/debiles.js` | Puntos débiles: formato `{ origen, detalle, puntos: [{ texto, tipo }], superado }`, migración del formato viejo con respaldo único (`debiles-respaldo`), `guardarDebil()`, `debilesActivos()`, `marcarSuperado()` y `etiquetaOrigen()` [MC-D] |
| `estado/errores-frecuentes.js` | Función pura: cuenta los tipos de error de un subtema (o de todos), superados incluidos → `[{ tipo, veces, ultimaFecha }]` [MC-D] |
| `estado/reglas-examen.js` | Reglas del examen en `S.config.reglasExamen` (material permitido y fecha): `normalizarReglas`, `materialPermitido()`, `esDefinida()`, `diasHastaExamen()`, `guardarReglas()` [MC-R] |
| `estado/profesor.js` | Estilo del profesor (texto, cuestionario, análisis), modo estricto y biblioteca de libros por capítulo, en los documentos `profesor` y `biblioteca`; `textoEstilo()` para los prompts [MC3] |
| `estado/almacen.js` | Fachada de guardado: elige backend; puntos débiles con `addDebil` y `updateDebil` (no se borran uno por uno); `borrarTodo()` limpia todo el estudiante en los dos backends (lista `DOCUMENTOS`) [4] [MC-D] |
| `estado/almacen-local.js` | Backend localStorage (`updateDebil` reemplaza por id) [4] |
| `estado/almacen-claude.js` | Backend base de datos de claude.ai (opcional; `updateDebil` reescribe el documento) [4] |
| `ia/proveedores.js` | Lista de proveedores, modelos sugeridos y URLs [5] |
| `ia/config-ia.js` | Proveedor activo, claves, modelos (`IA`), capacidades de claude.ai (`AI`), `aiReady()` e `initCapabilities()` (no toca la pantalla) [5] |
| `ia/errores-ia.js` | Códigos de error → mensajes en español (`aiError`, `coded`) [5] |
| `ia/cliente-http.js` | POST JSON que traduce fallas HTTP a códigos; imagen → base64 [5] |
| `ia/adaptadores/*.js` | Un formato de API por archivo (Gemini, OpenAI-compatible, Anthropic, Claude integrado, simulado para pruebas) [5] |
| `ia/cliente-ia.js` | `ask()`: único punto de salida a la IA [5] |
| `ia/panel-ia.js` | Aviso de IA sin configurar (`applyIA`: línea breve afuera y detalle dentro del diálogo), panel de configuración con borrador y "Probar conexión" [5] |
| `contexto/reglas-prompt.js` | Reglas de formato, citas, modo estricto, sintaxis del laboratorio, una línea por regla del examen (`REGLAS_EXAMEN`) y formato de puntos débiles con tipo (`FORMATO_PUNTOS`) [6] [MC-R] [MC-D] |
| `contexto/busqueda-apuntes.js` | Palabras clave, trozos y apuntes relevantes [6] |
| `contexto/cabecera-prompt.js` | Arma la cabecera (con el bloque de reglas del examen y los días que faltan, si hay regla, y los puntos débiles pendientes con su tipo) y ajusta el prompt al presupuesto [6] [MC-R] [MC-D] |
| `contexto/fuentes.js` | Etiquetas de transparencia de fuente [6] |
| `apuntes/lector-archivos.js` | Lee .txt, .md y .pdf; avisa si un PDF es escaneado (código `escaneado`) [6] |
| `apuntes/lector-pdf.js` | Carga pdf.js bajo demanda y extrae el texto página por página [6] |
| `apuntes/estructura-ejes.js` | Lógica: apuntes de la materia, índices por partes y propuesta de ejes por la IA (la usa el plan consolidado) [6] |
| `apuntes/ubicar-tema.js` | Lógica de "＋ Tema de hoy": la IA propone eje (existente o nuevo) y subtema; sin IA, propuesta con el título [MC2] |
| `apuntes/dialogo-tema-hoy.js` | Diálogo "＋ Tema de hoy": fecha, título, apuntes, capítulos de libros, materia y eje → propuesta editable → guarda en Mi curso [MC2] |
| `apuntes/plan-estudios.js` | Lógica: prompt de cada sección, limpieza, cronograma y armado del plan .md [6] |
| `apuntes/panel-apuntes.js` | Lista de apuntes en Config, asignación a temas y carga de archivos [7] |
| `apuntes/dialogo-plan.js` | Diálogo "Consolidar apuntes en un plan", con progreso y cancelación [7] |
| `ui/navegacion.js` | Vistas de Mi curso (materias, con inicio vacío; ejes; subtemas por fecha), acento por materia, entrar a un subtema, pestañas, `reiniciarSesion()` (el botón está en Config) [7] |
| `ui/migas.js` | Migas de pan [7] |
| `ui/tarjetas.js` | Tarjetas de selección y conteo de puntos débiles pendientes [7] |
| `ui/mentor.js` | Mentor flotante y tips por pestaña; `mentor(msg, { texto, abrir })` suma un botón que abre un diálogo (`data-abrir`) [7] [MC-R] |
| `ui/dialogos.js` | Botón ✕ de todos los diálogos [7] |
| `ui/dialogo-config.js` | Diálogo ⚙️ Config (botón engranaje): abre IA + apuntes y guarda todo; zona final "Datos y reinicio" (acciones `reiniciar-sesion` y `borrar-todo`, con doble confirmación y recarga) [7] |
| `profesor/dialogo-profesor.js` | Diálogo "🎓 Profesor y bibliografía": estilo (archivo, texto, cuestionario, análisis), modo estricto; incluye la sección de reglas del examen; guarda solo [MC3] |
| `profesor/analisis-estilo.js` | Pide a la IA el análisis del estilo con el texto y las respuestas del cuestionario [MC3] |
| `profesor/panel-reglas.js` | Sección "📋 Reglas del examen": material permitido y fecha (valida que no sea pasada); guarda sola [MC-R] |
| `profesor/panel-biblioteca.js` | Biblioteca: agregar y quitar libros y capítulos (archivo o texto pegado) [MC3] |
| `ui/tema.js` | Menú de tema (Light, Dim, Dark, Auto): guarda en localStorage y dispara el evento `cambio-tema` [F2] |
| `ui/puntos-debiles.js` | Contador, diálogo 📌 (con el tipo de cada punto), repasar, marcar superado (guarda la fecha, no borra), exportar .txt; solo los pendientes [7] [MC-D] |
| `ui/eventos.js` | Listeners delegados del documento (data-go, data-abrir: Tema de hoy y Profesor, pestañas, data-lab, data-action, campos) [7] |
| `exportacion/descargas.js` | `saveFile`: descarga con claude.ai o con enlace temporal [7] |
| `pestanas/registro.js` | Conecta navegación y pestañas: `registrarPestana`, `registrarAccion`, avisos `alSuceder`/`avisar` (`entrar-subtema`, `cambio-acento`, `reiniciar`) [7] |
| `pestanas/pestana-teoria.js` | Pestaña 1 · cableado: registro, acciones y pedido de teoría al entrar a un subtema [8] |
| `pestanas/teoria.js` | Pestaña 1 · pantalla: teoría, ideas clave, chequeo y tarjeta de resumen [8] |
| `pestanas/contenido-teoria.js` | Pestaña 1 · pide el material a la IA; manda el gráfico al laboratorio (`cargar-grafico`) [8] |
| `pestanas/chequeo-socratico.js` | Pestaña 1 · evalúa la respuesta y actualiza comprensión, entendido/falta (con tipo) y pregunta [8] |
| `pestanas/resumen-sesion.js` | Pestaña 1 · resumen por IA, guarda puntos débiles con tipo (origen `chequeo`) y descarga el .txt [8] |
| `estado/progreso.js` | `saveProgreso`: comprensión y mejor examen por subtema [8] |
| `exportacion/resumen-txt.js` | Arma el texto del resumen .txt [8] |
| `exportacion/exportar-pdf.js` | PDF con html2pdf: `generarPDF()` común, ficha del subtema (acción `pdf`, en Examen y ficha) y ejercicio con resolución y solución (acción `pdf-ejercicio`, en Ejercicios) [8] |
| `laboratorio/parser/funciones.js` | Funciones (sen, ln…), palabras especiales y constantes [9] |
| `laboratorio/parser/tokenizador.js` | Texto → tokens; normaliza ², π, ·, √ [9] |
| `laboratorio/parser/parser.js` | Tokens → árbol, sin eval; `varsOf` [9] |
| `laboratorio/parser/operaciones.js` | Tipos de valor (punto, vector, segmento, recta) y sus operaciones [9] |
| `laboratorio/parser/evaluador.js` | Árbol → función; evalúa todas las líneas resolviendo dependencias [9] |
| `laboratorio/parser/analisis-linea.js` | Clasifica cada línea (parámetro, función, implícita, valor, error) [9] |
| `laboratorio/parser/formato-numeros.js` | `fmtNum` [9] |
| `laboratorio/lienzo/estado-lienzo.js` | Objeto compartido `lz` (DOM, tamaño, vista, expresiones) y conversión plano ↔ píxeles [9] |
| `laboratorio/lienzo/cuadricula.js` | Grilla, ejes y escala con colores del tema [9] |
| `laboratorio/lienzo/trazado.js` | Curvas y = f(x), x = g(y) e implícitas [9] |
| `laboratorio/lienzo/objetos.js` | Puntos, vectores, segmentos y rectas con etiquetas; manijas arrastrables [9] |
| `laboratorio/lienzo/dibujo.js` | Tamaño del lienzo y redibujo completo [9] |
| `laboratorio/lienzo/lista-expresiones.js` | Filas de expresiones, deslizadores, errores y "＋ deslizador" [9] |
| `laboratorio/lienzo/interaccion.js` | Arrastre, zoom (rueda, pellizco, botones), coordenadas, alta de expresiones [9] |
| `laboratorio/lienzo/lienzo.js` | `iniciarLienzo()` y la API `Lab` que usan las pestañas [9] |
| `pestanas/laboratorio.js` | Pestaña 2 · presets y "Explicar lo que veo" [9] |
| `pestanas/pestana-laboratorio.js` | Pestaña 2 · cableado: registro, acciones `lab:*` y avisos [9] |
| `pestanas/ejercicios.js` | Pestaña 3 · pide el ejercicio y dibuja la pantalla (pistas, solución, resolución con texto, foto o pizarra, 📄 Exportar) [10] |
| `pestanas/foto-resolucion.js` | Pestaña 3 · foto del desarrollo: achica a 1600 px y pasa a JPEG [10] |
| `pestanas/correccion.js` | Pestaña 3 · corrección por IA con texto e imagen; guarda lo que faltó como puntos débiles con tipo (origen `ejercicio`) [10] [MC-D] |
| `pestanas/pestana-ejercicios.js` | Pestaña 3 · cableado: registro, botones y acciones de la pizarra [10] |
| `pizarra/pizarra.js` | Monta, limpia y exporta la pizarra (estado en la sesión: abierta, herramienta, dibujo) [10] |
| `pizarra/herramientas.js` | Lápiz y línea recta con vista previa (mouse, lápiz y táctil) [10] |
| `pizarra/cuadricula-pizarra.js` | Fondo cuadriculado con ejes, en colores del tema [10] |
| `pestanas/examen.js` | Pestaña 4 · pide las 5 preguntas (cada una con su tipo de error) y dibuja examen y resultado [10] |
| `pestanas/examen-resultado.js` | Pestaña 4 · entrega (nota, mejor resultado) y guardar errores como débiles con el tipo de cada pregunta (origen `examen`) [10] |
| `pestanas/pestana-examen.js` | Pestaña 4 · cableado: registro y botones [10] |
