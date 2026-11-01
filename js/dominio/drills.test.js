import { test } from 'node:test';
import assert from 'node:assert/strict';
import { generarDrill, corregirDrill, METODOS } from './drills.js';
import { diedroDe, TRAZAS } from './drills-banco.js';

// Junta n ítems de un tipo recorriendo semillas fijas (siempre las mismas: el test es determinista).
function itemsDeTipo(metodo, tipo, n) {
  const encontrados = [];
  for (let semilla = 1; encontrados.length < n && semilla < 2000; semilla++) {
    encontrados.push(...generarDrill({ metodo, semilla }).filter(i => i.tipo === tipo));
  }
  return encontrados.slice(0, n);
}
const numero = (signo, cifra) => (signo === '−' ? -1 : 1) * Number(cifra);
const cotaYAlejamiento = pregunta => {
  const [, sc, c, sa, a] = /cota ([+−])(\d) y alejamiento ([+−])(\d)/.exec(pregunta);
  return [numero(sc, c), numero(sa, a)];
};

test('drills · determinismo: misma semilla, mismos ítems; otra semilla, otros', () => {
  const a = generarDrill({ metodo: 'tercera-proyeccion', semilla: 42 });
  const b = generarDrill({ metodo: 'tercera-proyeccion', semilla: 42 });
  const c = generarDrill({ metodo: 'tercera-proyeccion', semilla: 43 });
  assert.deepEqual(a.map(i => [i.id, i.pregunta]), b.map(i => [i.id, i.pregunta]));
  assert.notDeepEqual(a.map(i => i.pregunta), c.map(i => i.pregunta));
});

test('drills · 10 ítems, ids únicos y una sola opción correcta en cada uno', () => {
  const items = generarDrill({ metodo: 'recta', semilla: 7 });
  assert.equal(items.length, 10);
  assert.deepEqual(items.map(i => i.id), ['i1', 'i2', 'i3', 'i4', 'i5', 'i6', 'i7', 'i8', 'i9', 'i10']);
  for (const i of items) {
    assert.equal(i.opciones.length, 4, i.pregunta);
    assert.equal(i.opciones.filter(o => o.v === i.respuesta).length, 1, i.pregunta);
  }
});

test('drills · diedro: los 4 casos y la regla en 40 ítems generados', () => {
  assert.deepEqual([diedroDe(2, 3), diedroDe(2, -3), diedroDe(-2, -3), diedroDe(-2, 3)], ['I', 'II', 'III', 'IV']);
  const items = itemsDeTipo('tercera-proyeccion', 'diedro', 40);
  assert.equal(items.length, 40);
  for (const i of items) assert.equal(i.respuesta, diedroDe(...cotaYAlejamiento(i.pregunta)), i.pregunta);
});

test('drills · tercera-lado: derecha si y solo si alejamiento > 0, arriba si y solo si cota > 0', () => {
  const items = itemsDeTipo('tercera-proyeccion', 'tercera-lado', 40);
  assert.equal(items.length, 40);
  for (const i of items) {
    const [cota, alejamiento] = cotaYAlejamiento(i.pregunta);
    const texto = i.opciones.find(o => o.v === i.respuesta).texto;
    assert.equal(texto.includes('derecha'), alejamiento > 0, i.pregunta);
    assert.equal(texto.includes('arriba'), cota > 0, i.pregunta);
  }
});

test('drills · traza-particular: frontal → H propia y V impropia; de perfil → las dos propias', () => {
  const texto = (item, v) => item.opciones.find(o => o.v === v).texto;
  const items = itemsDeTipo('recta', 'traza-particular', 40);
  const frontal = items.find(i => i.pregunta.startsWith('Una recta frontal:'));
  const perfil = items.find(i => i.pregunta.startsWith('Una recta de perfil:'));
  assert.equal(texto(frontal, frontal.respuesta), 'H propia y V impropia');
  assert.equal(texto(perfil, perfil.respuesta), 'las dos propias');
  for (const i of items) assert.equal(i.respuesta, TRAZAS[/^Una recta (.+):/.exec(i.pregunta)[1]], i.pregunta);
});

test('drills · corregirDrill: todo bien 10/10, todo mal 0/10', () => {
  const items = generarDrill({ metodo: 'tercera-proyeccion', semilla: 3 });
  const bien = Object.fromEntries(items.map(i => [i.id, i.respuesta]));
  const mal = Object.fromEntries(items.map(i => [i.id, i.opciones.find(o => o.v !== i.respuesta).v]));
  assert.deepEqual([corregirDrill(items, bien).aciertos, corregirDrill(items, bien).total], [10, 10]);
  assert.equal(corregirDrill(items, mal).aciertos, 0);
});

test('drills · corregirDrill: una respuesta faltante cuenta como error', () => {
  const items = generarDrill({ metodo: 'recta', semilla: 5 });
  const casi = Object.fromEntries(items.slice(1).map(i => [i.id, i.respuesta]));
  const r = corregirDrill(items, casi);
  assert.equal(r.aciertos, 9);
  assert.deepEqual(r.detalle[0], { id: 'i1', ok: false, esperado: items[0].respuesta, dado: null });
});

test('drills · METODOS y cada método genera 10 ítems válidos', () => {
  assert.deepEqual(METODOS, ['tercera-proyeccion', 'recta']);
  for (const metodo of METODOS) {
    const items = generarDrill({ metodo, semilla: 11 });
    assert.equal(items.length, 10, metodo);
    assert.equal(new Set(items.map(i => i.pregunta)).size, 10, `${metodo}: preguntas repetidas`);
    assert.ok(items.every(i => i.opciones.some(o => o.v === i.respuesta)), metodo);
  }
  assert.deepEqual(generarDrill({ metodo: 'otro' }), []);
});
