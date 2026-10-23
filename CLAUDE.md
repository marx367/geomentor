# GeoMentor

Tutor de matemática con IA: materias, ejes y subtemas que arma el estudiante (Mi curso), cuatro pestañas por subtema (Teoría, Laboratorio, Ejercicios, Examen), apuntes del estudiante y capa multi-LLM. App web estática, sin backend.

## Stack (definitivo)

- **Tecnología:** HTML + CSS + JavaScript vanilla con **módulos ES** (`import`/`export`). Sin build ni npm.
- **Librerías por CDN:** KaTeX y MathJax (fórmulas), html2pdf (ficha PDF), pdf.js (lectura de apuntes PDF, se carga bajo demanda), fuente Lexend.
- **Persistencia:** localStorage. Opcional: la base de datos de claude.ai cuando la app corre como artefacto.
- **IA:** el navegador llama directo a cada proveedor (Gemini, OpenAI, Anthropic, OpenRouter, DeepSeek, GLM, Qwen y compatibles con OpenAI). Las claves las carga el estudiante y quedan en su navegador.

**Por qué:** cero herramientas para empezar. Los `import` muestran qué depende de qué. Si el proyecto crece, la carpeta `js/` se mueve casi igual a `src/` con Vite.

**Limitación:** los módulos ES no cargan con doble clic (`file://`). Se abre con `iniciar-servidor.ps1` o con Live Server de VS Code.

**Señales para reevaluar el stack:**
- Más de ~100 archivos JS o ganas de tests automáticos → pasar a Vite + Vitest.
- Necesidad de funcionar sin internet → bajar las librerías a `vendor/` o instalarlas con npm.
- Varios usuarios con cuentas, o claves de IA compartidas → hace falta un backend (las claves nunca deben ir al navegador de otros).

## Estructura

```
index.html          → estructura HTML; carga js/tema-inicial.js, css/estilos.css y js/main.js
css/                → tema, base, componentes/, vistas/, responsive
js/main.js          → punto de entrada
js/nucleo/          → utilidades sin dependencias
js/datos/           → colores de materias y sinónimos
js/estado/          → estado en memoria y almacenamiento
js/render/          → Markdown y fórmulas
js/ia/              → proveedores, adaptadores, cliente y panel de IA
js/contexto/        → armado de prompts con apuntes y reglas
js/laboratorio/     → parser de expresiones (sin eval) y lienzo
js/pizarra/         → pizarra a mano alzada para Ejercicios
js/pestanas/        → teoría, laboratorio, ejercicios, examen
js/apuntes/         → lectores de archivos, Tema de hoy, plan de estudios
js/profesor/        → estilo del profesor, cuestionario y biblioteca
js/exportacion/     → descargas, resumen .txt, ficha PDF
js/ui/              → navegación, migas, mentor, diálogos, eventos, tema
docs/               → arquitectura y guías; docs/fichas/ con la ficha de cada función nueva
scripts/            → verificar.ps1 (sintaxis, gitleaks, TODO/FIXME)
.claude/agents/     → árbitro: revisa los cambios contra el listón de la ficha
```

Detalle de cada archivo: `docs/modulos.md`. Regla de dependencias: `docs/arquitectura.md`.

## Convenciones

- Nombres de archivos y carpetas en minúsculas, con guiones, sin tildes. Código y comentarios en español.
- Un archivo = una responsabilidad. Si pasa de ~300 líneas, se parte.
- Sin `onclick` en el HTML: los eventos van delegados en `js/ui/eventos.js`.
- Las capas bajas nunca importan a las altas (ver `docs/arquitectura.md`).
- Nunca claves en el código.
- Los PDF (html2pdf) no llevan ancho fijo: el contenido usa el ancho de la página (~698 px en A4) y las palabras largas pasan de línea; `generarPDF` pasa `scrollX: 0` y `scrollY: 0` a html2canvas porque, si no, el scroll de la página corre el PDF.

## Estado

Migración desde el prototipo terminada (2026-10-11). Abierto a nuevas implementaciones: ver Fase 2 en `ROADMAP.md`.

## Ramas y commits
- Nunca trabajes en main ni en mi-curso. Si la rama actual es una de esas, pará y pedime crear
  una rama feat/<nombre> o fix/<nombre> antes de tocar código.
- Commit y push solo cuando yo lo pida, después de mostrarme qué archivos entran y el mensaje.
