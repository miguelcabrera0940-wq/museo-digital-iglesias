import { test } from 'node:test';
import assert from 'node:assert/strict';
import { pedir, ErrorApi } from './cliente.js';

const responder = (status, cuerpo) => {
  globalThis.fetch = async () => ({
    status,
    ok: status >= 200 && status < 300,
    json: async () => {
      if (cuerpo === undefined) throw new Error('sin cuerpo');
      return cuerpo;
    },
  });
};

test('devuelve data en éxito', async () => {
  responder(200, { data: [{ slug: 'catedral' }] });
  assert.deepEqual(await pedir('/iglesias'), [{ slug: 'catedral' }]);
});

test('204 devuelve null', async () => {
  responder(204);
  assert.equal(await pedir('/admin/horarios/1', { method: 'DELETE' }), null);
});

test('convierte el error del contrato conservando code, message y fields', async () => {
  responder(400, { error: { code: 'VALIDATION_ERROR', message: 'Revisa los campos indicados.', fields: { titulo: 'Es obligatorio.' } } });
  await assert.rejects(pedir('/x'), (e) => {
    assert.ok(e instanceof ErrorApi);
    assert.deepEqual([e.status, e.code, e.message, e.fields], [400, 'VALIDATION_ERROR', 'Revisa los campos indicados.', { titulo: 'Es obligatorio.' }]);
    return true;
  });
});

test('error sin cuerpo JSON se vuelve INTERNAL_ERROR, no datos ficticios', async () => {
  responder(502);
  await assert.rejects(pedir('/x'), (e) => e.code === 'INTERNAL_ERROR' && e.status === 502);
});

test('éxito sin data es respuesta inválida', async () => {
  responder(200, { otra: 1 });
  await assert.rejects(pedir('/x'), (e) => e.code === 'INTERNAL_ERROR');
});

test('fallo de red es NETWORK_ERROR', async () => {
  globalThis.fetch = async () => { throw new TypeError('fetch failed'); };
  await assert.rejects(pedir('/x'), (e) => e.code === 'NETWORK_ERROR' && e.status === 0);
});
