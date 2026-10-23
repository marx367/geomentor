# Ficha: Hoja por tema con "Mis errores"

## Problema
El examen de Matemática C es escrito, con ejercicios y con material. Necesito una hoja por subtema,
de una página, que me diga qué recordar y qué errores no repetir, para llevar al examen (impresa)
o copiar a mano en el cuaderno (si solo se permite manuscrito).

## Secciones de la hoja (en este orden)
1. "Qué tengo que recordar" (la propone la IA): fórmulas, notación y condiciones clave del subtema.
2. "Cómo encarar cada tipo de ejercicio" (la propone la IA): pasos cortos por tipo de ejercicio.
3. "Mis errores" (LOCAL, sin IA): los puntos del subtema, primero los pendientes y después los
   superados marcados con ✔. Los descartados NUNCA aparecen.
4. "Errores más frecuentes" (LOCAL, sin IA): erroresFrecuentes(S.debiles, key) del subtema, con la
   etiqueta del tipo y las veces.

## IA
- Una sola llamada con ask(). Misma cabecera y reglas de contexto que el resto de la app
  (contexto/cabecera-prompt.js y reglas-prompt.js: apuntes, estilo del profesor, reglas del examen,
  modo estricto). Respuesta en etiquetas XML, leída con nucleo/etiquetas-xml.js.
- Control con reglas después de la IA: si falta una etiqueta o viene vacía, esa sección queda vacía
  para completarla a mano, sin romper nada.
- Largo (decisión de la ronda 4): NO se recorta nada automáticamente. Cortar LaTeX por líneas es frágil
  (por ejemplo, `\\[2pt]` dentro de `cases` parecía un bloque abierto) y borraba contenido sin avisar.
  En su lugar, el prompt pide máximo 12 líneas por sección y el diálogo muestra debajo de cada textarea
  un contador de líneas y caracteres que avisa, sin bloquear, al pasar de 12 líneas o 1200 caracteres:
  "Muy larga para una página: recortala vos".
- Sin IA disponible (o con el proveedor simulado): la hoja se arma igual, con las secciones 3 y 4
  y las 1 y 2 vacías y editables.

## Edición
Antes de exportar, se editan las secciones 1 y 2 en un textarea con Markdown y LaTeX, con vista previa
renderizada (markdownToHTML + MathJax). Las secciones 3 y 4 no se editan: se recalculan cada vez que se
abre la hoja.

## Guardado
La versión editada de las secciones 1 y 2 se guarda por subtema y persiste al recargar (documento
`hojas`, incluido en DOCUMENTOS de estado/almacen.js para que "Borrar todos los datos" lo borre).
Mismo tope de tamaño que los otros documentos.

## Material permitido (estado/reglas-examen.js)
- impreso → botón "Exportar PDF" con generarPDF() de exportacion/exportar-pdf.js.
- manuscrito → sin PDF; la hoja se muestra como guía para copiar a mano, con un aviso de una línea.
- ninguno → avisa que la hoja no se puede llevar y ofrece usarla igual como ficha para memorizar.
- sin definir → avisa y ofrece el botón que abre "Reglas del examen" (en Profesor).

## Dónde
Botón "📝 Hoja de errores" junto al de exportar la ficha del subtema (data-action="pdf", en Examen) y,
además, arriba de la pestaña Examen, visible siempre (decisión de Marcelo: el botón de la ficha solo
aparece después de entregar un examen). Abre un diálogo propio. Eventos delegados, sin onclick en el HTML.

## Fuera de alcance
Cuadernillo con índice de todos los temas, editar las secciones 3 y 4, reorganizar pestañas (paso 4 del plan).

## Listón (comprobable)
- [ ] scripts/verificar.ps1 en verde (salida pegada)
- [ ] Con el proveedor simulado, la hoja se abre con las secciones 3 y 4 correctas y las 1 y 2 vacías
- [ ] "Mis errores" no muestra descartados; los superados aparecen con ✔ después de los pendientes
- [ ] "Errores más frecuentes" coincide con erroresFrecuentes(S.debiles, key) (mostrar la prueba)
- [ ] Editar la sección 1, cerrar, recargar con F5: la edición sigue ahí
- [ ] "Borrar todos los datos" también borra las hojas guardadas
- [ ] Cada valor de material (impreso, manuscrito, ninguno, sin definir) muestra lo que dice la ficha
- [ ] Ninguna sección se recorta sola; el contador avisa al pasar 12 líneas o 1200 caracteres, sin bloquear
- [ ] Con material impreso, el PDF sale en 1 página A4 para un subtema típico y las fórmulas se ven bien
- [ ] Todo texto que viene de la IA o de los apuntes pasa por escapeHTML, mdInline o markdownToHTML
- [ ] Se usa solo con teclado (Tab, Enter, Escape cierra sin perder lo editado) y se ve bien a 375 px
- [ ] Sin errores en la consola; ningún archivo pasa de ~300 líneas
