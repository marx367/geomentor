import { test } from 'node:test';
import assert from 'node:assert/strict';
import { colaDeHoy } from './cola.js';
import { sumarDias } from './fechas.js';
import { etapaDe } from './estudio.js';
import { vencimientos } from './repaso.js';

// Hoy de referencia: a 13 días del examen estimado, así no entra en modo express.
const HOY = '2026-11-20';
const haceDias = n => sumarDias(HOY, -n);
// La hoja va 'hecha' por defecto para que solo aparezca en los tests que la prueban.
const tema = (id, diasDesdeClase, extra = {}) => ({
  id, nombre: id, fechaClase: haceDias(diasDesdeClase), intentos: [], hoja: { estado: 'hecha' }, ...extra,
});
const intento = (tipo, diasAtras, aciertos, total) => ({ tipo, fecha: haceDias(diasAtras), aciertos, total });
const cola = (temas, opciones) => colaDeHoy({ temas, fechaExamen: null, hoy: HOY }, opciones);
// Chequeo y drill aprobados en D0 y D1: etapa recuperación, sin marcar hecho el D3.
const recuperado = diasDesdeClase => [intento('chequeo', diasDesdeClase, 9, 10), intento('drill', diasDesdeClase - 1, 9, 10)];

test('1 · tema sin fechaClase: captura y fuera de la cola', () => {
  const t = { id: 'recta', nombre: 'Recta', intentos: [], hoja: { estado: 'vacia' } };
  assert.equal(etapaDe(t, HOY), 'captura');
  assert.deepEqual(cola([t]), []);
});

test('2 · tema de hoy sin intentos: una acción reconstruir con prioridad 0', () => {
  const acciones = cola([tema('recta', 0, { nombre: 'Recta' })]);
  assert.deepEqual(acciones, [
    { tipo: 'reconstruir', temaId: 'recta', minutos: 30, motivo: '«Recta» · clase de hoy, sin reconstruir', prioridad: 0 },
  ]);
});

// Cambió con el parche de etapas (2026-11-01): antes esperaba [], ahora manda el escenario 15.
test('3 · tema de ayer con chequeo aprobado: primera práctica', () => {
  const t = tema('recta', 1, { intentos: [intento('chequeo', 1, 8, 10)] });
  assert.deepEqual(cola([t]), [
    { tipo: 'practicar', temaId: 'recta', minutos: 25, motivo: '«recta» · primera práctica', prioridad: 1 },
  ]);
});

// Datos migrados en el PROMPT 01d: sin intentos el tema está en reconstrucción (eso lo prueba el 17).
test('4 · tema de hace 3 días sin repaso D3: repasar a 3 días', () => {
  const acciones = cola([tema('tercera', 3, { nombre: 'Tercera proyección', intentos: recuperado(3) })]);
  assert.equal(acciones.length, 1);
  assert.equal(acciones[0].tipo, 'repasar');
  assert.equal(acciones[0].motivo, '«Tercera proyección» · repaso a 3 días');
});

test('5 · tema de hace 10 días con D3 hecho y D7 pendiente: repasar, no integrar', () => {
  const t = tema('recta', 10, { intentos: [intento('chequeo', 10, 9, 10), intento('drill', 7, 9, 10)] });
  const acciones = cola([t]);
  assert.equal(acciones.length, 1);
  assert.equal(acciones[0].tipo, 'repasar');
  assert.match(acciones[0].motivo, /a 7 días/);
});

// Datos migrados en el PROMPT 01d: los temas tienen que estar en recuperación para que el remedio sea repasar.
test('6 · cinco temas con repasos vencidos: 3 acciones, las más viejas', () => {
  const temas = [3, 4, 5, 6, 8].map(d => tema(`t${d}`, d, { intentos: recuperado(d) }));
  const tres = cola(temas, { maxRepasos: 3 });
  assert.deepEqual(tres.map(a => a.temaId), ['t8', 't6', 't5']);
  // Con los valores por defecto manda maxRepasos = 2.
  assert.deepEqual(cola(temas).map(a => a.temaId), ['t8', 't6']);
});

// Datos migrados en el PROMPT 01d: se suma un drill aprobado en D1 (sin él, etapa práctica).
test('7 · dos vencimientos del mismo tema: una sola acción', () => {
  const t = tema('recta', 8, { intentos: [intento('chequeo', 7, 9, 10), intento('drill', 7, 9, 10)] });
  const pendientes = vencimientos(t, HOY).filter(v => v.tipo === 'repasar' && v.vence && !v.hecho);
  assert.equal(pendientes.length, 2, 'D3 y D7 vencidos');
  const acciones = cola([t]);
  assert.equal(acciones.length, 1);
  assert.equal(acciones[0].temaId, 'recta');
  assert.equal(acciones[0].tipo, 'repasar');
});

// Datos migrados en el PROMPT 01d: el tema vencido pasa a recuperación (sin intentos daba reconstruir).
test('8 · tema nuevo + tema vencido: 2 acciones y la de prioridad 0 primero', () => {
  const acciones = cola([tema('vencido', 4, { intentos: recuperado(4) }), tema('nuevo', 0)]);
  assert.deepEqual(acciones.map(a => [a.temaId, a.prioridad]), [['nuevo', 0], ['vencido', 1]]);
});

test('9 · fechaExamen null: usa el estimado (tema a 20 días)', () => {
  const t = { id: 'recta', nombre: 'Recta', fechaClase: '2026-11-13', intentos: [] };
  const acciones = colaDeHoy({ temas: [t], fechaExamen: null, hoy: '2026-11-13' });
  assert.deepEqual(acciones.map(a => a.tipo), ['reconstruir']);
  // El mismo tema dado a 2 días del estimado sí entra en express.
  const tarde = { ...t, fechaClase: '2026-12-01' };
  const express = colaDeHoy({ temas: [tarde], fechaExamen: null, hoy: '2026-12-01' });
  assert.equal(express[0].tipo, 'integrar');
});

test('10 · modo express: hoy 2026-12-01 y examen 2026-12-03 → integrar, no reconstruir', () => {
  const t = { id: 'recta', nombre: 'Recta', fechaClase: '2026-12-01', intentos: [] };
  const acciones = colaDeHoy({ temas: [t], fechaExamen: '2026-12-03', hoy: '2026-12-01' });
  assert.deepEqual(acciones, [
    { tipo: 'integrar', temaId: 'recta', minutos: 25, motivo: '«Recta» · express (quedan 2 días)', prioridad: 0 },
  ]);
});

test('12 · práctica hecha y hoja vacía: cerrar-hoja si hay lugar, nada si la cola está llena', () => {
  const conHoja = tema('recta', 1, {
    nombre: 'Recta', hoja: { estado: 'vacia' }, intentos: [intento('chequeo', 1, 9, 10), intento('drill', 0, 9, 10)],
  });
  assert.deepEqual(cola([conHoja]), [
    { tipo: 'cerrar-hoja', temaId: 'recta', minutos: 5, motivo: '«Recta» · cerrar hoja (5 min)', prioridad: 3 },
  ]);
  const llena = cola([conHoja, tema('nuevo', 0), tema('v4', 4), tema('v5', 5)]);
  assert.equal(llena.length, 3);
  assert.ok(!llena.some(a => a.tipo === 'cerrar-hoja'));
});

test('extra · P2: más de 40% de error en los últimos 3 drills → practicar', () => {
  // El drill aprobado del día 1 saca al tema de la etapa práctica, así P2 no queda tapada por la primera práctica.
  const t = tema('recta', 5, {
    intentos: [intento('chequeo', 5, 8, 10), intento('drill', 4, 4, 5), intento('drill', 2, 2, 5), intento('drill', 1, 2, 5), intento('drill', 0, 2, 5)],
  });
  assert.deepEqual(cola([t]).map(a => [a.tipo, a.prioridad, a.motivo]), [['practicar', 2, '«recta» · 60% de error en drills']]);
});

// Expectativa cambiada en el PROMPT 01d: el error de los drills se fusiona en el motivo de la primera práctica.
test('extra · drills fallados sin ninguno aprobado → primera práctica con el error en el motivo', () => {
  const t = tema('recta', 5, {
    intentos: [intento('chequeo', 5, 8, 10), intento('drill', 2, 2, 5), intento('drill', 1, 2, 5), intento('drill', 0, 2, 5)],
  });
  assert.deepEqual(cola([t]).map(a => [a.tipo, a.prioridad, a.motivo]), [['practicar', 1, '«recta» · primera práctica · 60% de error en drills']]);
});

test('extra · P4: sin intentos hace 16 días → integrar', () => {
  const t = tema('recta', 30, { intentos: [intento('chequeo', 30, 9, 10), intento('drill', 16, 9, 10)] });
  assert.deepEqual(cola([t]).map(a => [a.tipo, a.prioridad, a.motivo]), [['integrar', 4, '«recta» · sin practicar hace 16 días']]);
});

test('extra · el mismo tema puede tener reconstruir + cerrar-hoja, pero no otra acción', () => {
  const t = tema('recta', 0, { hoja: { estado: 'vacia' }, intentos: [intento('chequeo', 0, 3, 10)] });
  assert.deepEqual(cola([t]).map(a => a.tipo), ['reconstruir', 'cerrar-hoja']);
});

// Parche de etapas (2026-11-01): la acción sigue a la etapa. Datos exactos de la sonda, con id y nombre
// porque colaDeHoy descarta los temas sin id.
const EXAMEN = '2026-12-03';
const chequeo = (fecha, aciertos, total) => ({ fecha, tipo: 'chequeo', aciertos, total });

test('13 · reconstrucción fallada hace 3 días → reconstruir, no repasar', () => {
  const t = { id: 't13', nombre: 'Recta', fechaClase: '2026-11-01', intentos: [chequeo('2026-11-01', 1, 3)], hoja: { estado: 'hecha' } };
  const acciones = colaDeHoy({ temas: [t], fechaExamen: EXAMEN, hoy: '2026-11-04' });
  assert.deepEqual(acciones.map(a => [a.tipo, a.minutos, a.prioridad]), [['reconstruir', 30, 0]]);
  assert.equal(acciones[0].motivo, '«Recta» · reconstrucción pendiente');
});

test('14 · dos chequeos fallados → primero reconstruir, no practicar', () => {
  const t = {
    id: 't14', nombre: 'Recta', fechaClase: '2026-11-01', hoja: { estado: 'hecha' },
    intentos: [chequeo('2026-11-01', 1, 3), chequeo('2026-11-04', 1, 3)],
  };
  const acciones = colaDeHoy({ temas: [t], fechaExamen: EXAMEN, hoy: '2026-11-05' });
  assert.equal(acciones[0].tipo, 'reconstruir');
  assert.equal(acciones[0].prioridad, 0);
});

test('15 · chequeo aprobado sin práctica → practicar, primera práctica', () => {
  const t = { id: 't15', nombre: 'Recta', fechaClase: '2026-11-03', intentos: [chequeo('2026-11-03', 3, 4)], hoja: { estado: 'hecha' } };
  const acciones = colaDeHoy({ temas: [t], fechaExamen: EXAMEN, hoy: '2026-11-04' });
  assert.equal(acciones.length, 1);
  assert.deepEqual([acciones[0].tipo, acciones[0].minutos, acciones[0].prioridad], ['practicar', 25, 1]);
  assert.match(acciones[0].motivo, /primera práctica/);
});

test('16 · reconstrucción fallada hace 2 días (sin vencimientos) → reconstruir', () => {
  const t = { id: 't16', nombre: 'Recta', fechaClase: '2026-11-02', intentos: [chequeo('2026-11-02', 1, 3)], hoja: { estado: 'hecha' } };
  const acciones = colaDeHoy({ temas: [t], fechaExamen: EXAMEN, hoy: '2026-11-04' });
  assert.deepEqual(acciones.map(a => [a.tipo, a.prioridad]), [['reconstruir', 0]]);
});

// Expectativa cambiada en el PROMPT 01d: sin ningún chequeo el tema sigue en reconstrucción (regla 1b).
test('17 · sin intentos a 3 días de la clase → reconstruir, no repasar', () => {
  const t = { id: 't17', nombre: 'Recta', fechaClase: '2026-11-01', intentos: [], hoja: { estado: 'hecha' } };
  const acciones = colaDeHoy({ temas: [t], fechaExamen: EXAMEN, hoy: '2026-11-04' });
  assert.deepEqual(acciones.map(a => [a.tipo, a.prioridad, a.motivo]), [['reconstruir', 0, '«Recta» · reconstrucción pendiente']]);
});

test('18 · invariante: la etapa decide el tipo de la primera acción', () => {
  const casos = [
    { etapa: 'captura', t: { id: 'cap', nombre: 'cap', intentos: [] }, tipo: null },
    { etapa: 'reconstruccion', t: tema('rec', 5), tipo: 'reconstruir' },
    { etapa: 'practica', t: tema('pra', 5, { intentos: [intento('chequeo', 5, 9, 10)] }), tipo: 'practicar' },
    { etapa: 'recuperacion', t: tema('recu', 3, { intentos: recuperado(3) }), tipo: 'repasar' },
    {
      etapa: 'simulacion', tipo: 'integrar',
      t: tema('sim', 14, { intentos: [intento('chequeo', 14, 9, 10), intento('drill', 11, 9, 10), intento('drill', 7, 9, 10)] }),
    },
  ];
  for (const { etapa, t, tipo } of casos) {
    assert.equal(etapaDe(t, HOY), etapa, `etapa de ${t.id}`);
    assert.equal(cola([t])[0]?.tipo ?? null, tipo, `primera acción en ${etapa}`);
  }
});

test('entradas inválidas: devuelve []', () => {
  assert.deepEqual(colaDeHoy({ temas: [], fechaExamen: null, hoy: '2026-11-01' }), []);
  assert.deepEqual(colaDeHoy({ temas: null, hoy: HOY }), []);
  assert.deepEqual(colaDeHoy({ temas: [tema('a', 0)], hoy: '2026-02-30' }), []);
  assert.deepEqual(colaDeHoy(), []);
});
