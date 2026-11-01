import { test } from 'node:test';
import assert from 'node:assert/strict';
import { sumarDias, diasEntre, esFecha } from './fechas.js';

test('11 · fechas: cruce de mes y año, distancia, bisiesto y fecha inexistente', () => {
  assert.equal(sumarDias('2026-11-30', 3), '2026-12-03');
  assert.equal(sumarDias('2026-12-31', 1), '2027-01-01');
  assert.equal(diasEntre('2026-11-01', '2026-12-03'), 32);
  assert.equal(sumarDias('2028-02-28', 1), '2028-02-29');
  assert.equal(esFecha('2026-02-30'), false);
});

test('fechas: restar días, distancia negativa y años no bisiestos', () => {
  assert.equal(sumarDias('2027-01-01', -1), '2026-12-31');
  assert.equal(sumarDias('2026-02-28', 1), '2026-03-01');
  assert.equal(sumarDias('2100-02-28', 1), '2100-03-01');
  assert.equal(sumarDias('2000-02-28', 1), '2000-02-29');
  assert.equal(diasEntre('2026-12-03', '2026-11-01'), -32);
  assert.equal(diasEntre('2026-11-01', '2026-11-01'), 0);
});

test('fechas: entradas inválidas devuelven null o false', () => {
  for (const malo of ['2026-13-01', '2026-1-01', '26-11-01', '', null, undefined, 20261101, '2026-11-01T00:00']) {
    assert.equal(esFecha(malo), false, `esFecha(${malo})`);
    assert.equal(sumarDias(malo, 1), null);
    assert.equal(diasEntre(malo, '2026-11-01'), null);
  }
  assert.equal(sumarDias('2026-11-01', 1.5), null);
  assert.equal(sumarDias('2026-11-01', '1'), null);
});
