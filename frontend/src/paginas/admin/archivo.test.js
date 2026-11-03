import { test } from 'node:test';
import assert from 'node:assert/strict';
import { esPdf, formatoTamano, tituloSugerido } from './archivo.js';

test('tamaños legibles', () => {
  assert.deepEqual([0, 1023, 1536, 1048576, 5.5 * 1048576].map(formatoTamano), ['0 B', '1023 B', '1,5 KB', '1,0 MB', '5,5 MB']);
});

test('solo se acepta PDF por tipo o por extensión', () => {
  assert.equal(esPdf({ name: 'a.bin', type: 'application/pdf' }), true);
  assert.equal(esPdf({ name: 'LIBRO.PDF', type: '' }), true);
  assert.equal(esPdf({ name: 'foto.png', type: 'image/png' }), false);
});

test('el título sugerido quita la extensión y los separadores', () => {
  assert.equal(tituloSugerido('libro_de-bautizos 1850.PDF'), 'libro de bautizos 1850');
  assert.equal(tituloSugerido('.pdf'), '');
});
