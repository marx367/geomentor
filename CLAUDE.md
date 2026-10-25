# GeoMentor

Tutor de matemática con IA, sin backend: el estudiante arma su curso (materias, ejes, subtemas) y cada subtema tiene Teoría, Laboratorio, Ejercicios y Examen; apuntes y capa multi-LLM.

## Stack (definitivo)

HTML + CSS + JS vanilla con módulos ES, sin build ni npm. Librerías por CDN (ver index.html): KaTeX, MathJax, html2pdf, pdf.js (solo bajo demanda) y Google Fonts.

- Persistencia: localStorage. Al correr como artefacto de claude.ai, puede usar además su base de datos.
- IA: el navegador llama directo a cada proveedor (ver js/ia/). Las claves las carga el estudiante y quedan en su navegador.

Por qué: cero herramientas para empezar; los import muestran las dependencias. Si crece, js/ pasa casi igual a src/ con Vite.

Limitación: los módulos ES no cargan con file://. Abrir con iniciar-servidor.ps1 o Live Server.

Reevaluar el stack si: ~100+ archivos JS o ganas de tests (→ Vite + Vitest); se necesita funcionar sin internet (→ vendor/); varios usuarios con cuentas o claves compartidas (→ backend: las claves nunca deben ir al navegador de otros).

## Estructura

```
index.html          → js/tema-inicial.js, css/estilos.css, js/main.js
css/                → tema, base, componentes/, vistas/, movimiento, responsive
js/                 → main.js · nucleo/ · datos/ · estado/ · render/ · ia/ · contexto/ · laboratorio/ (parser sin eval) · pizarra/ · pestanas/ · apuntes/ · profesor/ · exportacion/ · ui/
docs/               → arquitectura y guías; docs/fichas/ (ficha por función nueva)
scripts/            → verificar.ps1 · .claude/agents/ → árbitro (revisa contra el listón de la ficha)
```

Detalle de cada archivo: docs/modulos.md. Dependencias: docs/arquitectura.md.

## Convenciones

- Archivos y carpetas en minúsculas, con guiones, sin tildes. Código y comentarios en español.
- Un archivo = una responsabilidad; si pasa de ~300 líneas, se parte.
- Eventos delegados en js/ui/eventos.js (sin onclick en el HTML).
- Las capas bajas nunca importan a las altas (docs/arquitectura.md).

## Diseño

«Pizarra y papel milimetrado». Todo sale de los tokens de css/tema.css, nada de valores sueltos. --marca es fija; --accent cambia con cada materia (setAccent); los colores de la paleta anterior migran solos (COLORES_ANTERIORES).
- Movimiento: solo transform y opacity, easing --resorte; entrada orquestada por vista (css/movimiento.css) con animation-fill-mode: backwards (con both, anula el resorte del hover); prefers-reduced-motion la apaga.
- Accesibilidad: clickeables ≥44×44 con :hover, :focus-visible y :active; contraste ≥4.5:1 en Light, Dim y Dark.
- PDF (html2pdf): sin ancho fijo (~698 px en A4) y render con scrollX/scrollY en 0, o el scroll de la página corre el PDF.

## Estado

Siguiente: Fase 2 de ROADMAP.md.

## Ramas y commits

- Nunca trabajar en main ni en mi-curso: pedir crear feat/<nombre> o fix/<nombre> antes de tocar código.
- Commit y push solo cuando Marcelo lo pida, mostrando antes qué archivos entran y el mensaje.
