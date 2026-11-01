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

test('3 · tema de ayer con chequeo aprobado: no aparece', () => {
  const t = tema('recta', 1, { intentos: [intento('chequeo', 1, 8, 10)] });
  assert.deepEqual(cola([t]), []);
});

test('4 · tema de hace 3 días sin repaso D3: repasar a 3 días', () => {
  const acciones = cola([tema('tercera', 3, { nombre: 'Tercera proyección' })]);
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

test('6 · cinco temas con repasos vencidos: 3 acciones, las más viejas', () => {
  const temas = [tema('t3', 3), tema('t4', 4), tema('t5', 5), tema('t6', 6), tema('t8', 8)];
  const tres = cola(temas, { maxRepasos: 3 });
  assert.deepEqual(tres.map(a => a.temaId), ['t8', 't6', 't5']);
  // Con los valores por defecto manda maxRepasos = 2.
  assert.deepEqual(cola(temas).map(a => a.temaId), ['t8', 't6']);
});

test('7 · dos vencimientos del mismo tema: una sola acción', () => {
  const t = tema('recta', 8, { intentos: [intento('chequeo', 7, 9, 10)] });
  const pendientes = vencimientos(t, HOY).filter(v => v.tipo === 'repasar' && v.vence && !v.hecho);
  assert.equal(pendientes.length, 2, 'D3 y D7 vencidos');
  const acciones = cola([t]);
  assert.equal(acciones.length, 1);
  assert.equal(acciones[0].temaId, 'recta');
  assert.equal(acciones[0].tipo, 'repasar');
});

test('8 · tema nuevo + tema vencido: 2 acciones y la de prioridad 0 primero', () => {
  const acciones = cola([tema('vencido', 4), tema('nuevo', 0)]);
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
  const t = tema('recta', 5, {
    intentos: [intento('chequeo', 5, 8, 10), intento('drill', 2, 2, 5), intento('drill', 1, 2, 5), intento('drill', 0, 2, 5)],
  });
  assert.deepEqual(cola([t]).map(a => [a.tipo, a.prioridad, a.motivo]), [['practicar', 2, '«recta» · 60% de error en drills']]);
});

test('extra · P4: sin intentos hace 16 días → integrar', () => {
  const t = tema('recta', 30, { intentos: [intento('chequeo', 30, 9, 10), intento('drill', 16, 9, 10)] });
  assert.deepEqual(cola([t]).map(a => [a.tipo, a.prioridad, a.motivo]), [['integrar', 4, '«recta» · sin practicar hace 16 días']]);
});

test('extra · el mismo tema puede tener reconstruir + cerrar-hoja, pero no otra acción', () => {
  const t = tema('recta', 0, { hoja: { estado: 'vacia' }, intentos: [intento('chequeo', 0, 3, 10)] });
  assert.deepEqual(cola([t]).map(a => a.tipo), ['reconstruir', 'cerrar-hoja']);
});

test('entradas inválidas: devuelve []', () => {
  assert.deepEqual(colaDeHoy({ temas: [], fechaExamen: null, hoy: '2026-11-01' }), []);
  assert.deepEqual(colaDeHoy({ temas: null, hoy: HOY }), []);
  assert.deepEqual(colaDeHoy({ temas: [tema('a', 0)], hoy: '2026-02-30' }), []);
  assert.deepEqual(colaDeHoy(), []);
});
