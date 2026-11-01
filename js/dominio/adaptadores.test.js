import { test } from 'node:test';
import assert from 'node:assert/strict';
import { claveDe, aplanarCurso, buscarPorClave, temasDesdeEstado } from './adaptadores.js';

const HOY = '2026-11-20';
const curso = {
  materias: [
    { id: 'geo', nombre: 'Geometría', ejes: [
      { id: 'monge', nombre: 'Monge', subtemas: [{ id: 'recta', nombre: 'Recta', fecha: '2026-11-18' }, { id: 'plano', nombre: 'Plano', fecha: '2026-11-19' }] },
      { id: 'vacio', nombre: 'Sin subtemas', subtemas: [] },
    ] },
    { id: 'alg', nombre: 'Álgebra', ejes: [{ id: 'mat', nombre: 'Matrices', subtemas: [{ id: 'det', nombre: 'Determinantes', fecha: '2026-11-10' }] }] },
  ],
};

test('adaptadores · claveDe arma materia/eje/subtema', () => {
  assert.equal(claveDe('geo', 'monge', 'recta'), 'geo/monge/recta');
});

test('adaptadores · aplanarCurso recorre materia > eje > subtema', () => {
  const plano = aplanarCurso(curso);
  assert.deepEqual(plano.map(f => [f.materia.id, f.eje.id, f.subtema.id]), [
    ['geo', 'monge', 'recta'], ['geo', 'monge', 'plano'], ['alg', 'mat', 'det'],
  ]);
  assert.deepEqual(aplanarCurso(null), []);
});

test('adaptadores · buscarPorClave encuentra el subtema o devuelve null', () => {
  const f = buscarPorClave(curso, 'alg/mat/det');
  assert.equal(f.subtema.nombre, 'Determinantes');
  assert.equal(f.materia.nombre, 'Álgebra');
  assert.equal(buscarPorClave(curso, 'geo/monge/nada'), null);
});

test('adaptadores · temasDesdeEstado incluye el subtema sin fecha (el dominio lo deja en captura)', () => {
  const sinFecha = { materias: [{ id: 'm', ejes: [{ id: 'e', subtemas: [{ id: 's', nombre: 'Sin fecha' }] }] }] };
  const temas = temasDesdeEstado({ curso: sinFecha, progreso: { temas: {} }, hojas: {}, intentos: {} }, HOY);
  assert.equal(temas.length, 1);
  assert.deepEqual(temas[0], { id: 'm/e/s', nombre: 'Sin fecha', fechaClase: undefined, intentos: [], hoja: { estado: 'vacia' } });
});

test('adaptadores · estado de la hoja: vacía, hecha y obsoleta', () => {
  const hojas = {
    'geo/monge/plano': { recordar: 'Trazas', encarar: 'Primero el abatimiento', fecha: '2026-11-19T22:10:00.000Z' },
    'alg/mat/det': { recordar: 'Laplace', encarar: 'Fila con más ceros', fecha: '2026-11-11T10:00:00.000Z' },
  };
  const intentos = { 'alg/mat/det': [{ fecha: '2026-11-15', tipo: 'drill', aciertos: 4, total: 5 }] };
  const estados = Object.fromEntries(temasDesdeEstado({ curso, hojas, intentos }, HOY).map(t => [t.id, t.hoja.estado]));
  assert.deepEqual(estados, { 'geo/monge/recta': 'vacia', 'geo/monge/plano': 'hecha', 'alg/mat/det': 'obsoleta' });
  // Con una sola sección escrita no está hecha.
  const media = { 'geo/monge/plano': { recordar: 'Trazas', encarar: '  ', fecha: '2026-11-19T22:10:00.000Z' } };
  assert.equal(temasDesdeEstado({ curso, hojas: media, intentos: {} }, HOY)[1].hoja.estado, 'vacia');
});
