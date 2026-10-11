# GeoMentor

Tutor de matemática con IA. Elegís materia, eje y subtema, y trabajás en cuatro pestañas:

- **Teoría y notación:** explicación, chequeo socrático, medidor de comprensión, puntos débiles y resumen exportable (.txt).
- **Laboratorio visual:** plano cartesiano que grafica funciones, rectas, vectores y puntos (parser propio, sin `eval`).
- **Ejercicios guiados:** pistas, foto o pizarra con tu desarrollo y corrección por IA.
- **Examen tipo test.**

Materias: Geometría Analítica, Funciones y Precálculo, Trigonometría, Cálculo Diferencial y Álgebra Lineal. Podés cargar tus apuntes (.txt, .md, .pdf) para que la IA se base en ellos.

## Cómo abrirlo

La app usa módulos ES, que **no cargan con doble clic** sobre `index.html`. Usá una de estas opciones:

1. **VS Code:** extensión *Live Server* → clic derecho sobre `index.html` → *Open with Live Server*.
2. **PowerShell**, en la carpeta del proyecto:
   ```powershell
   .\iniciar-servidor.ps1
   ```
   y abrí `http://localhost:8080`.

Hace falta conexión a internet: las librerías de fórmulas, PDF y la fuente se cargan por CDN.

## Configurar la IA

Botón de configuración → elegí proveedor → pegá tu clave → *Probar conexión*. La clave queda guardada **solo en tu navegador** (ver `docs/seguridad.md`).

## Documentación

- `docs/arquitectura.md`: capas y regla de dependencias
- `docs/modulos.md`: qué hace cada archivo
- `docs/formato-prompts.md`: etiquetas que devuelve la IA
- `docs/seguridad.md`: claves y riesgos
- `docs/plan-mi-curso.md`: plan de la transformación en "Mi curso"
