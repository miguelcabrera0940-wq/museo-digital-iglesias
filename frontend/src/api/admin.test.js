import { test } from 'node:test';
import assert from 'node:assert/strict';
import { pedirAdmin } from './admin.js';

let llamada;
const responder = (status, cuerpo, cabeceras = {}) => {
  globalThis.fetch = async (url, init) => {
    llamada = { url, ...init };
    return { status, ok: status < 300, headers: { get: (k) => cabeceras[k] ?? null }, json: async () => cuerpo };
  };
};

test('GET admin lleva X-Iglesias-Admin, cookie same-origin y nunca CSRF', async () => {
  responder(200, { data: { administrador: true } });
  await pedirAdmin('/admin/sesion', {}, 'tok');
  assert.equal(llamada.headers['X-Iglesias-Admin'], '1');
  assert.equal(llamada.headers['X-CSRF-Token'], undefined);
  assert.equal(llamada.credentials, 'same-origin');
});

test('mutaciones llevan CSRF y JSON; logout sin cuerpo ni Content-Type', async () => {
  responder(200, { data: {} });
  await pedirAdmin('/admin/horarios', { method: 'POST', body: { hora: '07:00' } }, 'tok');
  assert.equal(llamada.headers['X-CSRF-Token'], 'tok');
  assert.equal(llamada.headers['Content-Type'], 'application/json');
  responder(204, null);
  assert.equal(await pedirAdmin('/admin/logout', { method: 'POST' }, 'tok'), null);
  assert.equal(llamada.body, undefined);
  assert.equal(llamada.headers['Content-Type'], undefined);
  assert.equal(llamada.headers['X-CSRF-Token'], 'tok');
});

test('login no envía CSRF; logout sin sesión conocida sigue permitido', async () => {
  responder(200, { data: { administrador: true } });
  await pedirAdmin('/admin/login', { method: 'POST', body: { email: 'a@b.c', password: 'x' } }, 'tok');
  assert.equal(llamada.headers['X-CSRF-Token'], undefined);
  responder(204, null);
  await pedirAdmin('/admin/logout', { method: 'POST' }, null);
  assert.equal(llamada.headers['X-CSRF-Token'], undefined);
});

test('una mutación sin CSRF no sale a la red', async () => {
  llamada = null;
  await assert.rejects(pedirAdmin('/admin/horarios/1', { method: 'DELETE' }, null), (e) => e.code === 'NO_CSRF');
  assert.equal(llamada, null);
});

test('429 conserva Retry-After', async () => {
  responder(429, { error: { code: 'RATE_LIMITED', message: 'Demasiados intentos.' } }, { 'Retry-After': '120' });
  await assert.rejects(pedirAdmin('/admin/login', { method: 'POST', body: {} }), (e) => e.status === 429 && e.retryAfter === 120);
});
