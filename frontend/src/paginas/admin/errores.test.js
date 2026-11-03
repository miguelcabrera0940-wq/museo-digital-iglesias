import { test } from 'node:test';
import assert from 'node:assert/strict';
import { esperaTexto, mensajeError } from './errores.js';

test('429 indica la espera de Retry-After en segundos o minutos', () => {
  assert.match(mensajeError({ status: 429, retryAfter: 45 }), /45 segundos/);
  assert.match(mensajeError({ status: 429, retryAfter: 61 }), /2 minutos/);
  assert.match(mensajeError({ status: 429, retryAfter: 60 }), /1 minuto /);
  assert.equal(esperaTexto(undefined), 'unos minutos');
});

test('cada estado del contrato tiene su mensaje y ninguno promete que se guardó', () => {
  for (const status of [0, 400, 401, 403, 404, 409, 413, 429, 500, undefined]) {
    const m = mensajeError({ status, message: 'Revisa los campos indicados.' });
    assert.ok(m.length > 10);
    assert.doesNotMatch(m, /guardado|guardó correctamente/i);
  }
  assert.match(mensajeError({ status: 500 }), /no se guardó nada/);
  assert.equal(mensajeError({ status: 401, message: 'Correo o contraseña incorrectos.' }), 'Correo o contraseña incorrectos.');
});
