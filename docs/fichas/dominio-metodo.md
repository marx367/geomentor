# Ficha: Dominio del método (etapas, vencimientos y cola del día)

## Problema
La app tiene pestañas paralelas y un progreso sin historial: no sabe en qué etapa está cada tema,
qué repaso vence ni qué conviene hacer hoy. Con 14 temas en pocas semanas y el examen cerca, esa
pregunta ("¿qué hago ahora?") es la que más importa y hoy nadie la responde.

## Qué es
Lógica pura en `js/dominio/`, sin pantalla, sin almacenamiento y sin IA. Todavía no se conecta a la UI
(eso es la Fase 2: pantalla Hoy).
- `fechas.js`: fechas `'YYYY-MM-DD'` operadas como texto y número de día, nunca con `Date` (zona horaria).
- `estudio.js`: la etapa de cada tema se deriva de su fecha de clase y sus intentos, nunca se asigna a mano.
  Compuertas: sin fecha → captura; sin chequeo ≥ 70% → reconstrucción; sin drill o construcción ≥ 80%
  → práctica; sin aprobado a 3 días o más de la clase → recuperación; si no, simulación.
- `repaso.js`: vencimientos D0/D1/D3/D7/D14 desde la fecha de clase; examen estimado 2026-12-03 si no hay
  fecha confirmada; modo express si quedan menos de 3 días.
- `cola.js`: `colaDeHoy()` → hasta 3 acciones con prioridad (P0 clase nueva, P1 repaso vencido, P2 mucho
  error, P3 cerrar hoja, P4 tema olvidado), minutos y motivo listo para mostrar.

## Decisiones
- Máximo 2 repasos por día y una acción por tema, salvo clase nueva + cerrar hoja.
- Un repaso cuenta como hecho si hubo cualquier intento desde su fecha; si salió mal, lo toma P2.
- Varios repasos pendientes del mismo tema → una sola acción, la del offset más avanzado.
- Orden: prioridad, después el vencimiento más viejo, después el id del tema (siempre el mismo resultado).

## Fuera de alcance
Pantalla Hoy, guardar intentos y hojas, topes por prioridad del diseño original (P0, P2 y P4 en 1),
usar el campo `errores` de cada intento.

## Listón (comprobable)
- [ ] `node --test js/dominio/*.test.js` en verde, con los 12 escenarios del PROMPT 01 (salida pegada)
- [ ] `colaDeHoy({ temas: [], fechaExamen: null, hoy: '2026-11-01' })` devuelve `[]`
- [ ] `js/dominio/` sin `document`, `window`, `localStorage`, `fetch`, `new Date` ni `console.`
- [ ] `js/dominio/` no importa nada de fuera de su carpeta
- [ ] `scripts/verificar.ps1` en verde
- [ ] La app online funciona igual que antes (no se tocó nada fuera de `js/dominio/`, salvo docs y verificar.ps1)
