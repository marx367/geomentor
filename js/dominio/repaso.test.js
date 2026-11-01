import { test } from 'node:test';
import assert from 'node:assert/strict';
import { vencimientos, fechaExamen, diasHastaExamen, modoExpress, EXAMEN_ESTIMADO } from './repaso.js';

test('vencimientos: fechas, atraso y hecho', () => {
  const tema = { id: 'a', nombre: 'Recta', fechaClase: '2026-11-10', intentos: [{ fecha: '2026-11-13', tipo: 'drill', aciertos: 5, total: 10 }] };
  const v = vencimientos(tema, '2026-11-17');
  assert.deepEqual(v.map(x => x.fecha), ['2026-11-10', '2026-11-11', '2026-11-13', '2026-11-17', '2026-11-24']);
  assert.deepEqual(v.map(x => x.vence), [true, true, true, true, false]);
  assert.deepEqual(v.map(x => x.diasVencido), [7, 6, 4, 0, 0]);
  assert.deepEqual(v.map(x => x.hecho), [true, true, true, false, false]);
  assert.deepEqual(vencimientos({ id: 'b', intentos: [] }, '2026-11-17'), []);
});

test('9 · fechaExamen null usa EXAMEN_ESTIMADO', () => {
  assert.equal(fechaExamen({ fechaExamen: null }), EXAMEN_ESTIMADO);
  assert.equal(fechaExamen(), EXAMEN_ESTIMADO);
  assert.equal(fechaExamen(null), EXAMEN_ESTIMADO);
  assert.equal(fechaExamen({ fechaExamen: '2026-12-10' }), '2026-12-10');
  assert.equal(diasHastaExamen('2026-11-13', null), 20);
  assert.equal(modoExpress({ fechaClase: '2026-11-13' }, '2026-11-13', null), false);
});

test('modoExpress: por cercanía de hoy o de la clase al examen', () => {
  assert.equal(modoExpress({ fechaClase: '2026-11-01' }, '2026-12-01', '2026-12-03'), true);
  assert.equal(modoExpress({ fechaClase: '2026-12-01' }, '2026-11-25', '2026-12-03'), true);
  assert.equal(modoExpress({ fechaClase: '2026-11-25' }, '2026-11-25', '2026-12-03'), false);
  assert.equal(diasHastaExamen('2026-12-05', '2026-12-03'), 0);
});
