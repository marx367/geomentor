# Cómo agregar una materia, eje o subtema

El catálogo vive en `js/datos/materias/`, **un archivo por materia**. Es `.js` y no `.json` porque leer un JSON con `fetch` falla si la app se abre sin servidor.

## Agregar un subtema o un eje

Editá el archivo de la materia y sumá un objeto a la lista. Cada `id` debe ser único dentro de su lista, en minúsculas y sin espacios: se usa para guardar el progreso (`materia/eje/subtema`). **No cambies el `id` de algo existente**, porque se pierde el progreso guardado.

```js
{ id: 'distancia', nombre: 'Distancia punto-recta', desc: 'Fórmula de distancia y distancia entre paralelas.' }
```

## Agregar una materia

1. Creá `js/datos/materias/nombre-de-materia.js`, copiando la forma de uno existente:
   ```js
   export const nombreDeMateria = {
     id: 'id-unico', nombre: 'Nombre visible', icono: '📐', desc: 'Descripción corta.',
     acc: ['#0e7490', '#22d3ee'],   // colores de acento (oscuro, claro)
     ejes: [
       { id: 'eje', nombre: '…', icono: '…', desc: '…', subtemas: [
         { id: 'sub', nombre: '…', desc: '…' }
       ] }
     ]
   };
   ```
2. Importala en `js/datos/catalogo.js` y agregala a `MATERIAS`.
3. Revisá que el acento tenga buen contraste sobre el fondo azul marino.

## Ejes generados desde apuntes

El estudiante también puede generar ejes con la IA a partir de sus apuntes (`js/apuntes/ejes-generados.js`). Esos ejes se guardan en su navegador, no en estos archivos.
