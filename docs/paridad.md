# Paridad con el prototipo

Lista para el Paso 11: confirma que la app nueva hace todo lo que hacía `geomentor-matematica.html`
(y lo que se tomó de `geomentor-ai.html`). Cuando todo está marcado, se pueden borrar los originales.

**Comprobación automática (2026-10-11):** las 128 funciones, las 20 acciones de botones y los 77 `id`
del HTML del prototipo tienen su equivalente en la app nueva. Eso prueba que el código está, no que funcione:
por eso hace falta la prueba en el navegador.

**Prueba automática en Edge sin ventana (2026-10-11):** 25 de 25 pasos bien, sin errores en la consola.
Lo marcado con `[x]` quedó probado así. Ejercicios y Examen se probaron con datos de ejemplo cargados a mano:
la pantalla funciona, pero falta confirmar que las respuestas de una IA real se lean bien (los 🤖 sin marcar).

**Cómo probar:** abrir con `iniciar-servidor.ps1`, con la consola abierta (F12) para ver errores.
- 🧪 = alcanza con el **modo prueba** (Configuración → IA → "Modo prueba").
- 🤖 = necesita un **proveedor real** (Gemini gratis alcanza): la pantalla espera respuestas con etiquetas.
- ⚙️ = no usa IA.

Marcar `[x]` al probar. Si algo falla, anotar qué pasó al lado.

## Arranque y navegación
- [x] ⚙️ Abre sin errores en la consola (`main.js`)
- [x] ⚙️ Materia › Eje › Subtema con tarjetas, color de la materia y migas para volver (`ui/navegacion.js`, `ui/migas.js`, `ui/tarjetas.js`)
- [x] ⚙️ Las cuatro pestañas cambian y recuerdan su contenido al volver (`pestanas/registro.js`)
- [ ] ⚙️ Mentor flotante con consejos según la pestaña (`ui/mentor.js`)
- [ ] ⚙️ Aviso "IA sin configurar" cuando falta clave o modelo (`ia/panel-ia.js`)
- [ ] ⚙️ Al recargar se mantienen configuración, apuntes, progreso y puntos débiles (`estado/almacen*.js`)

## Configuración e IA
- [x] ⚙️ Diálogo de configuración: abrir, cancelar sin guardar, guardar (`ui/dialogo-config.js`)
- [ ] ⚙️ Cambiar de proveedor muestra su nota, el modelo sugerido, el enlace a la clave y la URL base si corresponde
- [x] 🧪 "Probar conexión" con el modo prueba da OK
- [x] ⚙️ "Probar conexión" con `TU_CLAVE_ACA` en Gemini da un error de clave claro (`ia/errores-ia.js`)
- [ ] 🤖 "Probar conexión" con una clave real da OK

## Apuntes
- [ ] ⚙️ Subir `.txt`/`.md` y un `.pdf`; se ven en la lista y se pueden quitar (`apuntes/panel-apuntes.js`, `apuntes/lector-pdf.js`)
- [ ] ⚙️ Elegir el alcance de los apuntes (materia, eje, subtema)
- [ ] 🤖 Las respuestas citan los apuntes y aparecen las "fuentes" debajo (`contexto/fuentes.js`)

## Pestaña 1 · Teoría
- [x] 🧪 Se genera la teoría con Markdown y fórmulas bien dibujadas (`pestanas/contenido-teoria.js`, `render/`)
- [x] 🧪 "Regenerar" pide otra versión
- [ ] 🤖 Chequeo socrático: responder, "No sé" y verificar (`pestanas/chequeo-socratico.js`)
- [ ] 🤖 "Lo que te falta" se llena con el chequeo y con la corrección de Ejercicios
- [ ] 🧪 Resumen de la sesión y descarga `.txt` (`pestanas/resumen-sesion.js`, `exportacion/resumen-txt.js`)

## Pestaña 2 · Laboratorio
- [ ] ⚙️ Presets del tema cargan sus expresiones (`pestanas/laboratorio.js`)
- [x] ⚙️ Escribir funciones, puntos, vectores, rectas, cónicas implícitas; deslizadores para parámetros (`laboratorio/`)
- [ ] ⚙️ Arrastrar puntos, zoom con la rueda, mover el plano
- [x] ⚙️ Error claro en una expresión mal escrita (sin romper las demás)
- [x] 🧪 "Explicar lo que veo" muestra la respuesta

## Pestaña 3 · Ejercicios
- [ ] 🤖 Genera ejercicio según el nivel elegido; "Nuevo ejercicio" no repite el anterior (`pestanas/ejercicios.js`)
- [ ] 🤖 Pistas de a una (hasta 3) y ver/ocultar solución
- [ ] 🤖 "Abrir datos en el laboratorio" pasa el gráfico a la pestaña 2
- [ ] 🤖 Corregir con texto escrito (`pestanas/correccion.js`)
- [ ] 🤖 Subir foto (JPG/PNG), quitarla y corregir con foto (`pestanas/foto-resolucion.js`)
- [ ] 🤖 Pizarra: lápiz, línea, limpiar, cerrar y volver a abrir sin perder el dibujo, adjuntarlo y corregir (`pizarra/`, tomado de `geomentor-ai.html`)

## Pestaña 4 · Examen
- [ ] 🤖 Genera 5 preguntas; elegir opciones; "Entregar" se habilita con todas respondidas (`pestanas/examen.js`)
- [ ] 🤖 Nota sobre 10, barra de color y explicación de cada pregunta (`pestanas/examen-resultado.js`)
- [ ] 🤖 Reintentar, nuevo examen y se guarda el mejor resultado en la tarjeta del subtema
- [ ] 🤖 "Guardar mis errores como puntos débiles"

## Puntos débiles
- [x] ⚙️ Contador 📌, lista, "Repasar este tema" lleva al subtema, "Marcar como superado", "Exportar todo (.txt)" (`ui/puntos-debiles.js`)

## Ejes y plan de estudios desde apuntes
- [ ] 🤖 Proponer ejes desde los apuntes, editar el borrador y guardarlos (`apuntes/dialogo-ejes.js`, `apuntes/estructura-ejes.js`)
- [ ] 🤖 Armar el plan de estudios por secciones con cronograma (`apuntes/dialogo-plan.js`, `apuntes/plan-estudios.js`)

## Exportación
- [ ] 🧪 Ficha PDF desde Teoría y desde Examen (`exportacion/exportar-pdf.js`)

## Tema y accesibilidad
- [ ] ⚙️ Modo claro y oscuro del sistema; la pizarra y el laboratorio toman los colores del tema
- [ ] ⚙️ Navegar con Tab por botones y pestañas; foco visible
