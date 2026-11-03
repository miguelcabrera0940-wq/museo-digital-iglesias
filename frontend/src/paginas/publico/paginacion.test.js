import { test } from 'node:test';
import assert from 'node:assert/strict';
import { vista } from './paginacion.js';

test('móvil: una página; extremos deshabilitados', () => {
  assert.deepEqual(vista(7, 0, false), { ini: 0, paso: 1, indices: [0], hayAnterior: false, haySiguiente: true });
  assert.equal(vista(7, 6, false).haySiguiente, false);
});

test('escritorio: pares desde índice par; la última página impar queda sola', () => {
  assert.deepEqual(vista(7, 3, true).indices, [2, 3]);
  const ultima = vista(7, 6, true);
  assert.deepEqual([ultima.indices, ultima.haySiguiente, ultima.hayAnterior], [[6], false, true]);
});

test('el índice se acota y un documento vacío no falla', () => {
  assert.equal(vista(7, 99, false).ini, 6);
  assert.equal(vista(7, -5, true).ini, 0);
  assert.deepEqual(vista(0, 0, true).indices, []);
});
