# Ficha: Pestaña 1 · confirmar puntos débiles antes de guardar

## Contexto
Pestaña 1 (Teoría y chequeo socrático). Hoy el botón "Resumen de la sesión (.txt)"
(js/pestanas/chequeo-socratico.js) le vuelve a pedir los puntos débiles a la IA, los guarda
directo con guardarDebil (js/estado/debiles.js) y descarga resumen_….txt.
Problemas comprobados en una sesión real:
1. En pantalla ("Lo que te falta") había 4 puntos y se guardaron 6.
2. Tres puntos eran la misma confusión dicha de tres formas, y "Errores más frecuentes" cuenta Concepto ×3.
3. Se guardan como errores cosas que explicó el mentor o que fueron preguntas mías, no errores que cometí.
4. Hay tipos mal asignados: "Condición sin verificar" usado fuera de dominio o hipótesis,
   una imprecisión guardada como Signo y redacción imprecisa guardada como Notación.
5. Apretar el botón dos veces duplica todo.

## Qué cambia (solo pestaña 1)
1. Al apretar "Resumen de la sesión", después de la respuesta de la IA y ANTES de guardar,
   abrir un panel de confirmación. Cada punto propuesto lleva una casilla "Guardar" (marcada por
   defecto), su texto editable y un selector de tipo con la lista de tipos que ya usa la app.
   El panel termina con los botones "Guardar seleccionados" y "Cancelar".
   Si el 📌 ya tiene un formulario "Editar" con selector de tipo, reusalo en vez de duplicarlo.
2. "Cancelar" no guarda ni descarga nada.
3. Solo se guardan los puntos confirmados, y solo esos van en la sección de puntos débiles del
   resumen .txt. El resto del .txt queda igual (lo que entendiste, plan de repaso, ejercicio
   sugerido, anexo).
4. Ajustar el prompt del resumen así:
   - Partir de los puntos de "Lo que te falta" ya mostrados en la sesión, y no agregar nuevos
     salvo que salgan de una respuesta mía.
   - Incluir solo errores o huecos que yo mostré en mis respuestas, no lo que explicó el mentor
     ni mis preguntas.
   - Fusionar en uno solo los puntos que son la misma confusión.
   - Definir cada tipo dentro del prompt. "Condición sin verificar" es dominio, hipótesis o
     condición de existencia. "Signo" es un error de signo efectivo. Una imprecisión al redactar
     no es Signo, y tampoco es Notación salvo que sea de notación matemática.
5. Evitar duplicados:
   - Deshabilitar el botón mientras procesa.
   - Si ya existe en el 📌 un punto con el mismo texto normalizado y el mismo subtema, marcarlo
     en el panel como "ya guardado" y dejarlo desmarcado por defecto.
6. Armar el panel como componente propio, en un archivo nuevo dentro de la carpeta que
   corresponda, que reciba la lista y devuelva los confirmados. Por ahora conectarlo solo a la
   pestaña 1.

## Fuera de alcance
- Las pestañas 2, 3 y 4, el 📌, la Hoja de errores y las exportaciones existentes no cambian su
  comportamiento.
- No cambiar la firma, el comportamiento ni el formato de guardado de guardarDebil, porque la
  pestaña 3 la usa. Si hace falta algo nuevo (por ejemplo, buscar duplicados), agregar una
  función aparte.
- No tocar el formato del .txt de "Exportar todo", el parser ni la estructura de carpetas.

## Antes de editar
- Buscá con grep todos los usos de guardarDebil y de cada función que pienses tocar, y listalos
  en el plan con la pestaña que los usa.
- Trabajá en una rama nueva: pestana1-confirmar-debiles.

## Listón
- [ ] scripts/verificar.ps1 en verde
- [ ] Con el proveedor simulado, el panel aparece y puedo desmarcar puntos y editar texto y tipo.
- [ ] El 📌 sube exactamente la cantidad de puntos confirmados.
- [ ] "Cancelar" deja el 📌 igual y no descarga nada.
- [ ] Apretar el botón dos veces seguidas no duplica.
- [ ] El .txt del resumen lista solo los puntos confirmados.
- [ ] En la pestaña 3, corregir un ejercicio sigue guardando puntos débiles como antes.
- [ ] La Hoja de errores muestra los dos orígenes.
- [ ] El panel se maneja con teclado (Tab, Enter, Esc) y se ve bien en celular.
- [ ] Las partes nuevas tienen comentarios cortos en español.

Al terminar, decime qué archivos cambiaste, sugerime un mensaje de commit y agregá una
sección corta "Qué aprendimos acá".
