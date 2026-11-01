import { test } from 'node:test';
import assert from 'node:assert/strict';
import { etapaDe, proximaEtapa, aprobado } from './estudio.js';

const HOY = '2026-11-20';

test('1 · sin fechaClase la etapa es captura', () => {
  assert.equal(etapaDe({ id: 'a', nombre: 'Recta', intentos: [] }, HOY), 'captura');
  assert.equal(etapaDe({ id: 'a', nombre: 'Recta', fechaClase: '2026-02-30', intentos: [] }, HOY), 'captura');
});

test('etapa: recorre las compuertas en orden', () => {
  const tema = { id: 'a', nombre: 'Recta', fechaClase: '2026-11-10', intentos: [] };
  assert.equal(etapaDe(tema, HOY), 'reconstruccion');

  tema.intentos.push({ fecha: '2026-11-10', tipo: 'chequeo', aciertos: 6, total: 10 });
  assert.equal(etapaDe(tema, HOY), 'reconstruccion', 'un chequeo al 60% no alcanza');

  tema.intentos.push({ fecha: '2026-11-10', tipo: 'chequeo', aciertos: 7, total: 10 });
  assert.equal(etapaDe(tema, HOY), 'practica');

  tema.intentos.push({ fecha: '2026-11-11', tipo: 'drill', aciertos: 8, total: 10 });
  assert.equal(etapaDe(tema, HOY), 'recuperacion', 'aprobado pero a 1 día de la clase');

  tema.intentos.push({ fecha: '2026-11-13', tipo: 'drill', aciertos: 9, total: 10 });
  assert.equal(etapaDe(tema, HOY), 'simulacion');
});

test('etapa: ignora intentos futuros o con datos inválidos', () => {
  const tema = {
    id: 'a', nombre: 'Recta', fechaClase: '2026-11-19', intentos: [
      { fecha: '2026-11-25', tipo: 'chequeo', aciertos: 10, total: 10 },
      { fecha: '2026-11-19', tipo: 'chequeo', aciertos: 12, total: 10 },
      { fecha: '2026-11-19', tipo: 'chequeo', aciertos: 0, total: 0 },
    ],
  };
  assert.equal(etapaDe(tema, HOY), 'reconstruccion');
  assert.equal(aprobado(null), false);
});

test('proximaEtapa', () => {
  assert.equal(proximaEtapa('captura'), 'reconstruccion');
  assert.equal(proximaEtapa('recuperacion'), 'simulacion');
  assert.equal(proximaEtapa('simulacion'), null);
  assert.equal(proximaEtapa('otra'), null);
});
