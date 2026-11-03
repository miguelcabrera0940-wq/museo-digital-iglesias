import { test } from 'node:test';
import assert from 'node:assert/strict';
import { enlaceTelefono } from './telefono.js';

test('limpia separadores y conserva el + inicial', () => {
  assert.equal(enlaceTelefono('999 123 4567'), 'tel:9991234567');
  assert.equal(enlaceTelefono('+52 (999) 123-4567'), 'tel:+529991234567');
});

test('sin teléfono utilizable no hay enlace', () => {
  for (const t of [null, undefined, '', 'Por confirmar', 'ext. 5', '12 34']) assert.equal(enlaceTelefono(t), null, String(t));
});
