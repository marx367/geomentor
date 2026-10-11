=== PLAN "MI CURSO" ===
Objetivo: pasar del catálogo fijo a una app de estudio y repaso armada con lo que se da en clase, orientada al examen final reglamentado. Se conserva la jerarquía Materia › Eje › Subtema, las migas y los títulos actuales.
1. Datos de Mi curso: materias/ejes/subtemas guardados en el almacén, con fecha, en lugar de js/datos/materias/*. Inicio vacío con mensaje y botón "＋ Tema de hoy". Se borra el catálogo fijo (el progreso viejo se pierde).
2. "＋ Tema de hoy": fecha, título, apuntes (.txt, .md, .pdf), materia y eje (elegir o crear). La IA propone eje y subtema y yo confirmo. Reemplaza a "Generar ejes desde mis apuntes".
3. "🎓 Profesor y bibliografía" (botón al lado de "＋ Tema de hoy"): estilo del profesor (archivo, texto y cuestionario de opción múltiple con análisis de la IA), biblioteca única de libros y capítulos (texto/PDF; en "Tema de hoy" se elige de cuál libro y capítulo salió), y modo estricto de apuntes. Se saca todo eso de Config.
4. Pestañas por subtema: Teoría (usa apuntes y libros del tema, cita el libro, sigue el estilo del profesor), Laboratorio y Examen y ficha. Salen la pestaña Ejercicios y el chequeo socrático.
5. Repaso 1: ejercicios guiados (Parcial, pistas, solución, laboratorio) y ejercicios del día (pizarra, foto o texto); corrección y pistas con el criterio del profesor.
6. Repaso 2: por tema, con técnica Feynman (4 pasos) + chequeo socrático; los huecos se guardan como puntos débiles.
7. Repaso 3: plan por días: ingreso los días hasta el examen y la app reparte qué estudiar cada día (cálculo local sin IA, ponderando puntos débiles y antigüedad del tema).
8. Repaso 4: examen mixto con ejercicios tipo examen sobre todos los temas dados, más seguimiento.
9. Limpieza y docs (dialogo-plan, plan-estudios, "Completar temas típicos", docs/, CLAUDE.md, ROADMAP).
10. Al final, aparte: IndexedDB e imágenes de libros (mostrarlas como referencia en Teoría; opcional: enviarlas a la IA con visión).
Fuera de alcance: backend, cuentas, compartir la app con libros cargados.
=== FIN DEL PLAN ===

=== AGREGADOS AL PLAN (2026-10-11) ===

REGLAS DEL EXAMEN (hecho: base)
Condicionan las ayudas rápidas, el plan por días y el examen mixto.
1. Material permitido, tres opciones: "Sin material" / "Cuaderno abierto, solo manuscrito" / "Cuaderno abierto, se puede imprimir".
2. Fecha del examen (opcional). Con ella, el plan por días calcula solo los días que faltan.
3. Dónde: sección "📋 Reglas del examen" en 🎓 Profesor y bibliografía. Si falta la regla, el mentor la pregunta al arrancar (una vez por sesión) con un botón que abre ese diálogo.
4. Qué cambia según la opción:
   - Con material: preguntas de aplicación y de saber dónde buscar. Las ayudas se exportan a PDF solo si se puede imprimir; si es manuscrito, son una guía para copiar a mano.
   - Sin material: se exigen fórmulas y notación de memoria, y las ayudas pasan a ser fichas para memorizar.
   Hecho por ahora: guardar la regla (S.config.reglasExamen), mostrarla y sumarla a los prompts. El resto lo leen los pasos que vienen.

AYUDAS RÁPIDAS (ideas aprobadas)
a. La hoja de cada tema suma "Mis errores" y "Errores más frecuentes", calculados localmente contando repeticiones en los puntos débiles que salen de la corrección de ejercicios y del repaso.
b. La IA propone cada hoja y el estudiante la edita antes de exportar. Hoja por tema + cuadernillo con índice.

PASO NUEVO, ANTES DEL PASO 4: PUNTOS DÉBILES CON TIPO
Lo necesitan la corrección de ejercicios (paso 5) y los "errores frecuentes" de las ayudas.
- La corrección de ejercicios también guarda puntos débiles (hoy no lo hace).
- Tipos de error: lista corta y fija, igual para todos los temas (signo, notación, condición sin verificar, cálculo, concepto, orientación). La IA elige uno por punto.
- Origen como código (chequeo, examen, ejercicio, repaso) en lugar de texto libre.
- Migración: los puntos guardados hoy pasan al formato nuevo con tipo "sin clasificar"; no se pierde nada.
- "Superado" marca con fecha en lugar de borrar. El contador 📌 y la lista cuentan solo los no superados; el historial queda para calcular los frecuentes.
