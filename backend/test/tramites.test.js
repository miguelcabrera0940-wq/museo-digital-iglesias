import { test } from 'node:test';
import assert from 'node:assert/strict';
import iglesias from '../data/iglesias.json' with { type: 'json' };
import { listarTramites } from '../src/tramites.js';

test('cada iglesia devuelve cuatro guías únicas con campos del contrato y orden estable', () => {
  const ids = new Set();
  for (const iglesia of iglesias) {
    const lista = listarTramites(iglesia.slug);
    assert.equal(lista.length, 4);
    assert.deepEqual(lista.map((guia) => guia.tipo), ['bautizos', 'bodas', 'misas_difuntos', 'otros']);
    assert.deepEqual(listarTramites(iglesia.slug), lista);
    for (const guia of lista) {
      assert.equal(guia.iglesia_id, iglesia.id);
      assert.deepEqual(Object.keys(guia).sort(), ['id', 'iglesia_id', 'tipo', 'titulo',
        'requisitos', 'fuente', 'estado_verificacion'].sort());
      assert.match(guia.id, /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
      assert.equal(ids.has(guia.id), false);
      ids.add(guia.id);
      assert.ok(guia.titulo.trim().length > 0 && guia.titulo.length <= 160);
      assert.ok(Array.isArray(guia.requisitos) && guia.requisitos.length <= 30);
      assert.ok(guia.requisitos.every((r) => typeof r === 'string' && r.trim().length > 0 && r.length <= 1000));
    }
  }
  assert.equal(ids.size, 16);
});

test('guías sintéticas conservan estado ejemplo, sin fuentes oficiales ni teléfonos inventados', () => {
  for (const iglesia of iglesias) {
    for (const guia of listarTramites(iglesia.slug)) {
      assert.equal(guia.estado_verificacion, 'ejemplo');
      assert.equal(guia.fuente, null);
      assert.ok(guia.requisitos.length > 0);
      for (const requisito of guia.requisitos) {
        assert.match(requisito, /Ejemplo ficticio pendiente de confirmar/);
      }
      assert.equal('telefono' in guia, false);
    }
    assert.equal(iglesia.telefono, null);
  }
});

test('slug inexistente, código de diseño o entrada inválida devuelve NOT_FOUND sin datos', () => {
  for (const slug of ['desconocida', 'CATEDRAL', 'cat', '', null, undefined, '../catedral', "' OR 1=1 --"]) {
    assert.throws(() => listarTramites(slug), (error) => {
      assert.equal(error.status, 404);
      assert.equal(error.code, 'NOT_FOUND');
      assert.equal(error.message, 'El recurso solicitado no existe.');
      assert.equal(error.fields, undefined);
      return true;
    });
  }
});
