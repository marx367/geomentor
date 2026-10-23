# Ficha: Editar y descartar puntos débiles

## Problema
La IA a veces genera puntos débiles mal redactados o con el tipo de error equivocado.
Hoy solo se pueden marcar como superados, y entonces siguen sumando en "Errores más frecuentes",
lo que ensucia la hoja de errores que voy a llevar al examen.

## Funciones (por PUNTO, no por ítem)
1. Editar el texto de un punto (textarea; vacío no se guarda; mismo límite que limpiarTexto: 600).
2. Cambiar el tipo de un punto (select con TIPOS_ERROR + "Sin clasificar").
3. Descartar un punto: se marca `descartado` con fecha ISO, no se borra (regla del proyecto: sin
   deleteDebil). Pide confirmación.

## Reglas de datos
- Cada punto pasa a ser { texto, tipo, descartado } con descartado: null | fecha ISO.
- leerPunto/normalizarDebil deben CONSERVAR descartado (hoy lo perderían al normalizar).
  Datos viejos sin el campo → descartado: null, sin migración ni respaldo nuevo.
- Crear UNA función en js/estado/debiles.js, puntosVigentes(d) = puntos no descartados, y usarla en
  todos los lugares que hoy recorren d.puntos para contar o mostrar: ui/puntos-debiles.js,
  ui/tarjetas.js (countDebiles), main.js (contador), contexto/cabecera-prompt.js y
  estado/errores-frecuentes.js. Buscá con grep "\.puntos" que no quede ninguno sin revisar.
- debilesActivos() excluye además los ítems sin puntos vigentes.
- Superado SIGUE contando en errores frecuentes; descartado NO cuenta en nada.
- Guardar con Store.updateDebil (local y Claude). Si falla, no cambiar nada en memoria y avisar con
  mentor(), igual que marcarSuperado.

## Interfaz
En el diálogo 📌, cada punto con botones "✏️ Editar" y "🗑️ Descartar". Editar abre un
formulario dentro del mismo artículo (Guardar / Cancelar). Eventos delegados como el resto del
archivo, sin onclick en el HTML. Si ui/puntos-debiles.js pasa de ~300 líneas, partilo.
Sin IA: es lógica local pura.

## Fuera de alcance
Deshacer un descarte, editar origen o fecha, borrar ítems enteros.

## Listón (comprobable)
- [ ] scripts/verificar.ps1 en verde (salida pegada)
- [ ] grep "\.puntos" revisado: cada uso cuenta o muestra solo puntos vigentes, o justifica por qué no
- [ ] Editar texto y tipo, recargar la página: el cambio persiste
- [ ] Descartar 1 de 3 puntos: el contador 📌 baja 1 y "Errores más frecuentes" deja de contarlo
- [ ] Descartar todos los puntos de un ítem: el ítem desaparece de la lista y de los contadores
- [ ] Un punto superado sigue contando en errores frecuentes
- [ ] Datos guardados antes de este cambio cargan sin errores (descartado: null)
- [ ] Texto vacío al editar: no se guarda y avisa
- [ ] Se puede usar solo con teclado (Tab y Enter) y se ve bien a 375 px
- [ ] Sin errores en la consola al recorrer todo el flujo
