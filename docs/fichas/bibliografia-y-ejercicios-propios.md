# Ficha: Bibliografía en el tutor y ejercicios propios

## Problema
1. La biblioteca guardaba libros y capítulos, pero el tutor nunca los leía (la cabecera del prompt solo
   mandaba apuntes, estilo del profesor, reglas del examen y puntos débiles).
2. El tutor siempre inventaba los ejercicios. No había forma de practicar los que están en los apuntes
   o en un libro, ni de cargar y corregir uno que dio el profesor (ej.: Grupo 5 de Fernández Val).

## Decisiones (Marcelo, 2026-10-24)
- Los libros son fuente secundaria: mandan los apuntes y el profesor.
- Con modo estricto, lo que sale de un libro va en un recuadro aparte (`:::complemento`).
- Los ejercicios propios se hacen ahora, como módulo aparte (`js/pestanas/ejercicios-propios/`),
  para mudarlo entero al Paso 5 (Repaso 1) cuando la pestaña Ejercicios cambie.
- Formatos del enunciado del profesor: foto (JPG, PNG, WEBP) y PDF con texto. Word queda para después.

## Escalón de IA
Flujo, no agente: cada paso es una consulta a la IA seguida de un control con reglas.
- Transcripción de una foto → si viene vacía o con menos de 10 letras, error y no se sigue.
- Ejercicios encontrados → cada enunciado se busca en el texto original (`estaEnLasFuentes`):
  ✔ «Está tal cual» o ⚠ «No lo encontré textual».
- Preparar el ejercicio → sin solución de referencia no se arma (se pide cargar la oficial).

## Listón
1. En la vista del subtema, «📖 Bibliografía del tema» marca capítulos; se guardan en Mi curso y
   sobreviven a recargar. Si el guardado falla, lo marcado vuelve atrás.
2. Con capítulos asociados, todo prompt del tutor (teoría, chequeo, ejercicios, examen, corrección)
   lleva el bloque de bibliografía y la regla correspondiente al modo estricto.
3. Cada respuesta que usó libros muestra «📖 Bibliografía consultada: …».
4. Al abrir Ejercicios no se genera nada solo: se elige el origen (tutor, apuntes y libros, profesor).
5. «De mis apuntes y libros» solo busca si el tema tiene material; si no, explica cómo sumarlo.
6. Del profesor: foto → transcripción editable con vista previa y «Quitar foto»; PDF con texto → texto
   directo; PDF escaneado → aviso de sacarle una foto. Archivo de otro tipo o de más de 20 MB → aviso.
7. El ejercicio propio muestra de dónde salió y si la solución es de la fuente (✔) o de la IA (⚠ no
   verificada), con opción de cargar la oficial después.
8. La corrección manda la imagen del enunciado (si hay) además de la del desarrollo, y avisa a la IA
   si la solución es oficial o no verificada.
9. El ejercicio del tutor funciona igual que antes (pistas, solución, laboratorio, foto, pizarra, exportar).
10. Sin errores en consola; a 375 px no hay desplazamiento horizontal.

## Verificado en el chat (Playwright con el proveedor simulado)
1 a 9 sí, salvo la lectura de PDF (pdf.js viene por CDN y no había internet). Pendiente probar en el
navegador: PDF con texto, PDF escaneado y una IA real con foto (Grupo 5 como caso de prueba).
