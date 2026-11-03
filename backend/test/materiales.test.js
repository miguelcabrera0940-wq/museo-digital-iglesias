import { test } from 'node:test';
import assert from 'node:assert/strict';
import iglesias from '../data/iglesias.json' with { type: 'json' };
import { materiales } from '../data/materiales.js';
import { listarMateriales, obtenerMaterial, obtenerDocumento } from '../src/materiales.js';

const falla = (status, code) => (error) => error.status === status && error.code === code;
const campos = ['id', 'iglesia_id', 'categoria_id', 'tipo', 'titulo', 'descripcion_publica',
  'imagen_publica', 'visibilidad', 'fuente', 'es_ejemplo', 'bloqueado', 'tiene_documento'].sort();

test('listado y detalle separan iglesias, mantienen orden y solo exponen campos públicos', () => {
  for (const iglesia of iglesias) {
    const lista = listarMateriales(iglesia.slug);
    assert.ok(lista.length > 0);
    assert.deepEqual(listarMateriales(iglesia.slug), lista);
    for (const material of lista) {
      assert.equal(material.iglesia_id, iglesia.id);
      assert.equal(material.es_ejemplo, true);
      assert.deepEqual(Object.keys(material).sort(), campos);
      assert.deepEqual(obtenerMaterial(material.id), material);
    }
    for (const categoria of ['libros-documentos', 'objetos']) {
      assert.deepEqual(listarMateriales(iglesia.slug, categoria),
        lista.filter((m) => m.categoria_id === categoria));
    }
  }
});

test('valida categoría, UUID e iglesia y diferencia recurso inexistente', () => {
  for (const categoria of ['', 'otra', ['objetos', 'libros-documentos'], { valor: 'objetos' }]) {
    assert.throws(() => listarMateriales('catedral', categoria), falla(400, 'VALIDATION_ERROR'));
  }
  assert.throws(() => listarMateriales('desconocida'), falla(404, 'NOT_FOUND'));
  for (const obtener of [obtenerMaterial, obtenerDocumento]) {
    for (const id of ['invalido', "' OR 1=1 --", '../../data/materiales.js']) {
      assert.throws(() => obtener(id), falla(400, 'VALIDATION_ERROR'));
    }
    assert.throws(() => obtener('ffffffff-ffff-4fff-8fff-ffffffffffff'), falla(404, 'NOT_FOUND'));
  }
});

test('todos los privados ocultan documento y metadatos internos y rechazan lectura', () => {
  const privados = materiales.filter((m) => m.visibilidad === 'privado');
  assert.ok(privados.some((m) => m.documento));
  assert.ok(privados.some((m) => !m.documento));
  for (const material of privados) {
    const ficha = obtenerMaterial(material.id);
    assert.equal(ficha.bloqueado, true);
    assert.equal(ficha.tiene_documento, false);
    assert.deepEqual(Object.keys(ficha).sort(), campos);
    assert.throws(() => obtenerDocumento(material.id), (error) => {
      assert.equal(error.status, 403);
      assert.equal(error.code, 'FORBIDDEN');
      assert.equal(error.message, 'Este documento es de acceso reservado.');
      assert.equal(error.fields, undefined);
      return true;
    });
  }
});

test('documentos públicos contienen páginas de ejemplo; material sin documento devuelve 404', () => {
  for (const material of materiales.filter((m) => m.visibilidad === 'publico')) {
    if (!material.documento) {
      assert.equal(obtenerMaterial(material.id).tiene_documento, false);
      assert.throws(() => obtenerDocumento(material.id), falla(404, 'NOT_FOUND'));
      continue;
    }
    const doc = obtenerDocumento(material.id);
    assert.equal(doc.material_id, material.id);
    assert.equal(doc.titulo, material.titulo);
    assert.equal(doc.es_ejemplo, true);
    assert.ok(doc.paginas.length > 0);
    doc.paginas.forEach((pagina, n) => {
      assert.equal(pagina.numero, n + 1);
      assert.equal(typeof pagina.texto, 'string');
      assert.equal(pagina.imagen_url, null);
    });
  }
});

test('reclasificar público a privado bloquea inmediatamente ficha y documento', () => {
  const material = materiales.find((m) => m.visibilidad === 'publico' && m.documento);
  assert.ok(obtenerDocumento(material.id).paginas.length > 0);
  try {
    material.visibilidad = 'privado';
    assert.equal(obtenerMaterial(material.id).bloqueado, true);
    assert.equal(obtenerMaterial(material.id).tiene_documento, false);
    assert.throws(() => obtenerDocumento(material.id), falla(403, 'FORBIDDEN'));
  } finally {
    material.visibilidad = 'publico';
  }
});
