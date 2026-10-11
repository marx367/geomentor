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
