import { test } from 'node:test';
import assert from 'node:assert/strict';
import { diferencias, lineas, paraCrear } from './formularios.js';

test('PATCH solo envía lo que cambió; vacío en un opcional borra con null', () => {
  const original = { titulo: 'A', nota: 'x', fuente: null };
  assert.deepEqual(diferencias(original, { titulo: ' A ', nota: 'x', fuente: '  ' }, ['nota', 'fuente']), {});
  assert.deepEqual(diferencias(original, { titulo: 'B', nota: '', fuente: 'F' }, ['nota', 'fuente']), { titulo: 'B', nota: null, fuente: 'F' });
});

test('un obligatorio vacío se envía vacío para que el servidor lo rechace con fields', () => {
  assert.deepEqual(diferencias({ titulo: 'A' }, { titulo: '  ' }), { titulo: '' });
});

test('compara números, booleanos y listas', () => {
  const o = { dia_semana: 1, es_ejemplo: true, requisitos: ['a', 'b'] };
  assert.deepEqual(diferencias(o, { dia_semana: 1, es_ejemplo: true, requisitos: ['a', 'b'] }), {});
  assert.deepEqual(diferencias(o, { dia_semana: 0, es_ejemplo: false, requisitos: ['a'] }), { dia_semana: 0, es_ejemplo: false, requisitos: ['a'] });
});

test('POST omite opcionales vacíos y conserva el resto', () => {
  assert.deepEqual(paraCrear({ iglesia_id: 'i', dia_semana: 0, hora: '07:00', nota: ' ' }, ['nota']), { iglesia_id: 'i', dia_semana: 0, hora: '07:00' });
});

test('requisitos: una línea por requisito, sin vacías', () => {
  assert.deepEqual(lineas('  uno \n\n dos\n   \n'), ['uno', 'dos']);
  assert.deepEqual(lineas(''), []);
});
