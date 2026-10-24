# Formato de las respuestas de la IA

La IA responde **solo con etiquetas XML** (`<nombre>…</nombre>`). `js/nucleo/etiquetas-xml.js` las lee con `getTag` (una) y `getTags` (varias). Dentro de cada etiqueta va Markdown simple y LaTeX (`$…$` en línea, `$$…$$` en bloque).

## Por pestaña

| Uso | Etiquetas |
|---|---|
| Teoría | `teoria`, `ideas_clave`, `pregunta`, `tips`, `grafico` |
| Chequeo socrático | `feedback`, `comprension` (0-100), `entendido`, `falta` (con `punto`), `siguiente_pregunta`, `tip` |
| Resumen | `resumen_general`, `puntos_fuertes`, `puntos_debiles` (con `punto`), `plan_de_repaso`, `ejercicio_sugerido` |
| Ejercicio | `enunciado`, `pista` (varias), `solucion`, `grafico` |
| Ejercicio propio (preparar) | `pista` (varias), `solucion` (solo si la fuente no trae), `grafico` (vacío si no es del plano) |
| Ejercicios en los apuntes | `ejercicio_encontrado` (varios) → `origen`, `enunciado`, `solucion_dada` |
| Transcripción de una foto | `transcripcion` |
| Corrección | `correccion`, `falta` (con `punto`) |
| Examen | `pregunta` (varias) → dentro: `enunciado`, opciones, `correcta`, `explicacion`, `tipo`, `por_que_…` |
| Hoja de errores | `recordar`, `encarar` (máximo 12 líneas cada una; no se recortan; si falta, queda vacía) |
| Ejes desde apuntes | `eje` (varios) → `nombre`, `icono`, `desc`, `subtema` (varios) → `nombre`, `desc`, `archivos` |

`grafico` contiene expresiones en la sintaxis del laboratorio (texto plano, una por línea, nunca LaTeX).

## Reglas que se agregan a cada prompt

Están en `js/contexto/reglas-prompt.js`:

- **Formato:** LaTeX + Markdown simple, sin tablas ni bloques de código, nada fuera de las etiquetas.
- **Citas:** si algo viene de los apuntes, se cierra con `(según NOMBRE_DEL_ARCHIVO)`.
- **Modo estricto** (opcional): solo con lo que está en los apuntes. Lo que se agregue va en un bloque aparte:
  ```
  :::complemento
  **Qué agrego:** …
  **Por qué:** …
  **Para qué:** …
  :::
  ```

- **Bibliografía del tema** (si el subtema tiene capítulos asociados): bloque `[BIBLIOGRAFÍA DEL TEMA · FUENTE SECUNDARIA]` después de los apuntes, con `BIB_RULES` (mandan apuntes y profesor; cita `(libro: NOMBRE)`) o, con modo estricto, `BIB_RULES_ESTRICTO` (lo del libro solo en bloques `:::complemento`). Se lleva el 40 % del presupuesto de apuntes.

## Si cambiás un prompt

Si agregás o renombrás una etiqueta, actualizá a la vez el prompt, el código que la lee y esta tabla.

## Puntos débiles con tipo

Los puntos débiles (chequeo, resumen y corrección) llegan uno por etiqueta:

```
<punto><texto>Descripción concreta y autocontenida</texto><tipo>calculo</tipo></punto>
```

`tipo` es un id de la lista fija de `js/estado/tipos-error.js` (`signo`, `notacion`, `condicion`, `calculo`, `concepto`, `metodo`). En el examen, cada `pregunta` trae su `tipo`. Si el tipo no está en la lista, queda `sin-clasificar`; si la IA no usa `<punto>`, se toma una línea por punto, sin clasificar (`leerPuntos`). El texto del formato está en `FORMATO_PUNTOS` (`js/contexto/reglas-prompt.js`).
