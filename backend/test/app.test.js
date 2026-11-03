import assert from 'node:assert/strict';
import { after, before, describe, test } from 'node:test';
import { once } from 'node:events';
import { crearApp } from '../src/app.js';
import iglesias from '../data/iglesias.json' with { type: 'json' };
import * as materiales from '../src/materiales.js';
import * as agenda from '../src/agenda.js';
import * as tramites from '../src/tramites.js';
import { ErrorApi } from '../src/errores.js';

// Fixture explícita solo para esta suite HTTP; producción nunca importa estos datos.
const app = crearApp({
  listarIglesias: () => iglesias,
  obtenerIglesia(slug) {
    const iglesia = iglesias.find((i) => i.slug === slug);
    if (!iglesia) throw new ErrorApi(404, 'NOT_FOUND', 'El recurso solicitado no existe.');
    return iglesia;
  },
  ...materiales, ...agenda, ...tramites,
});

describe('API HTTP', () => {
  let server;
  let base;
  before(async () => {
    server = app.listen(0, '127.0.0.1');
    await once(server, 'listening');
    base = `http://127.0.0.1:${server.address().port}`;
  });
  after(async () => {
    if (server?.listening) await new Promise((resolve, reject) => {
      server.close((error) => error ? reject(error) : resolve());
      server.closeIdleConnections();
    });
  });

  test('lista pública estable y detalle de las cuatro iglesias cumplen el contrato', async () => {
    const response = await fetch(`${base}/api/iglesias`);
    assert.equal(response.status, 200);
    assert.match(response.headers.get('content-type'), /application\/json/);
    const { data } = await response.json();
    assert.deepEqual(data.map(({ slug }) => slug), [
      'catedral', 'tercera-orden', 'santa-lucia', 'santa-ana',
    ]);
    const campos = ['id', 'slug', 'nombre', 'descripcion', 'historia', 'direccion',
      'latitud', 'longitud', 'telefono', 'foto_exterior', 'foto_interior', 'fuente', 'es_ejemplo'];
    for (const iglesia of data) {
      assert.deepEqual(Object.keys(iglesia).sort(), [...campos].sort());
      assert.match(iglesia.id, /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
      assert.equal(typeof iglesia.latitud, 'number');
      assert.equal(typeof iglesia.longitud, 'number');
      assert.equal(iglesia.es_ejemplo, true);
      const detalle = await fetch(`${base}/api/iglesias/${iglesia.slug}`);
      assert.equal(detalle.status, 200);
      assert.deepEqual(await detalle.json(), { data: iglesia });
    }
  });

  test('slug inexistente, intentos de inyección y rutas fuera del alcance devuelven 404 JSON', async () => {
    for (const ruta of ['/api/iglesias/desconocida', '/api/iglesias/CATEDRAL',
      `/api/iglesias/${encodeURIComponent("' OR 1=1 --")}`, '/iglesias',
      '/api/iglesias/desconocida/materiales']) {
      const response = await fetch(`${base}${ruta}`);
      assert.equal(response.status, 404);
      assert.deepEqual(await response.json(), {
        error: { code: 'NOT_FOUND', message: 'El recurso solicitado no existe.' },
      });
    }
  });

  test('rechaza rutas con codificación inválida sin exponer trazas', async () => {
    const response = await fetch(`${base}/api/iglesias/%E0%A4%A`);
    assert.equal(response.status, 400);
    assert.deepEqual(await response.json(), {
      error: { code: 'VALIDATION_ERROR', message: 'La ruta contiene caracteres inválidos.' },
    });
  });

  test('no permite escrituras ni altera datos al recibir POST o PATCH', async () => {
    const anterior = await (await fetch(`${base}/api/iglesias/catedral`)).json();
    for (const method of ['POST', 'PATCH', 'DELETE']) {
      const response = await fetch(`${base}/api/iglesias/catedral`, {
        method, headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre: 'Cambio no permitido', auth_user_id: 'intruso' }),
      });
      assert.equal(response.status, 404);
      assert.equal((await response.json()).error.code, 'NOT_FOUND');
    }
    assert.deepEqual(await (await fetch(`${base}/api/iglesias/catedral`)).json(), anterior);
  });

  test('materiales: listado por iglesia, filtro opcional y detalle público', async () => {
    const lista = await fetch(`${base}/api/iglesias/catedral/materiales`);
    assert.equal(lista.status, 200);
    const { data } = await lista.json();
    assert.ok(data.length > 0);
    const filtrada = await fetch(`${base}/api/iglesias/catedral/materiales?categoria=objetos`);
    assert.equal(filtrada.status, 200);
    assert.deepEqual((await filtrada.json()).data, data.filter((m) => m.categoria_id === 'objetos'));
    for (const material of data) {
      const response = await fetch(`${base}/api/materiales/${material.id}`);
      assert.equal(response.status, 200);
      assert.deepEqual((await response.json()).data, material);
      assert.equal('documento' in material, false);
      assert.equal('descripcion_interna' in material, false);
    }
  });

  test('documento público legible; privados 403 sin contenido ni referencias y sin caché', async () => {
    const { data } = await (await fetch(`${base}/api/iglesias/catedral/materiales`)).json();
    for (const material of data) {
      const response = await fetch(`${base}/api/materiales/${material.id}/documento`);
      assert.equal(response.headers.get('cache-control'), 'no-store');
      if (material.visibilidad === 'privado') {
        assert.equal(material.bloqueado, true);
        assert.equal(material.tiene_documento, false);
        assert.equal(response.status, 403);
        assert.deepEqual(await response.json(), {
          error: { code: 'FORBIDDEN', message: 'Este documento es de acceso reservado.' },
        });
      } else if (material.tiene_documento) {
        assert.equal(response.status, 200);
        const { data: documento } = await response.json();
        assert.equal(documento.material_id, material.id);
        assert.equal(documento.es_ejemplo, true);
        assert.ok(documento.paginas.every((p) => typeof p.texto === 'string'));
      } else {
        assert.equal(response.status, 404);
        assert.equal((await response.json()).error.code, 'NOT_FOUND');
      }
    }
  });

  test('entradas inválidas devuelven 400 y UUID desconocido devuelve 404', async () => {
    for (const ruta of ['/api/iglesias/catedral/materiales?categoria=invalida',
      '/api/iglesias/catedral/materiales?categoria=',
      '/api/iglesias/catedral/materiales?categoria=objetos&categoria=libros-documentos',
      '/api/materiales/no-es-uuid', '/api/materiales/no-es-uuid/documento']) {
      const response = await fetch(`${base}${ruta}`);
      assert.equal(response.status, 400);
      const { error } = await response.json();
      assert.equal(error.code, 'VALIDATION_ERROR');
      assert.ok(error.fields);
    }
    for (const sufijo of ['', '/documento']) {
      const response = await fetch(`${base}/api/materiales/ffffffff-ffff-4fff-8fff-ffffffffffff${sufijo}`);
      assert.equal(response.status, 404);
      assert.equal((await response.json()).error.code, 'NOT_FOUND');
    }
  });

  test('agenda: respuestas, filtros de fecha y aislamiento para las cuatro iglesias', async () => {
    const { data: iglesias } = await (await fetch(`${base}/api/iglesias`)).json();
    for (const iglesia of iglesias) {
      const ruta = `${base}/api/iglesias/${iglesia.slug}`;
      const response = await fetch(`${ruta}/horarios`);
      assert.equal(response.status, 200);
      const { data: horarios } = await response.json();
      assert.ok(horarios.length > 0);
      assert.ok(horarios.every((h) => h.iglesia_id === iglesia.id && h.es_ejemplo && !('fecha' in h)));
      for (const fecha of ['2026-10-24', '2026-10-25']) {
        const actividades = await fetch(`${ruta}/actividades?fecha=${fecha}`);
        assert.equal(actividades.status, 200);
        const { data } = await actividades.json();
        assert.ok(data.length > 0);
        assert.ok(data.every((a) => a.fecha === fecha && a.iglesia_id === iglesia.id && a.es_ejemplo));
      }
      const vacia = await fetch(`${ruta}/actividades?fecha=2026-10-26`);
      assert.equal(vacia.status, 200);
      assert.deepEqual(await vacia.json(), { data: [] });
      assert.deepEqual(await (await fetch(`${ruta}/horarios`)).json(), { data: horarios });
    }
  });

  test('agenda: fecha inválida o ausente devuelve 400 con fields.fecha', async () => {
    for (const query of ['', '?fecha=', '?fecha=2026-02-30', '?fecha=2026-02-29',
      '?fecha=2026-13-01', '?fecha=2026-1-01', '?fecha=2026-10-24T00:00:00Z',
      '?fecha=2026-10-24&fecha=2026-10-25']) {
      const response = await fetch(`${base}/api/iglesias/catedral/actividades${query}`);
      assert.equal(response.status, 400);
      assert.deepEqual(await response.json(), { error: {
        code: 'VALIDATION_ERROR', message: 'Revisa los campos indicados.',
        fields: { fecha: 'Debe ser una fecha real en formato YYYY-MM-DD.' },
      } });
    }
    const bisiesto = await fetch(`${base}/api/iglesias/catedral/actividades?fecha=2028-02-29`);
    assert.equal(bisiesto.status, 200);
    assert.deepEqual(await bisiesto.json(), { data: [] });
  });

  test('agenda: slug desconocido y escritura rechazada con error JSON', async () => {
    for (const sufijo of ['/horarios', '/actividades?fecha=2026-10-24']) {
      for (const slug of ['desconocida', 'CATEDRAL', 'cat']) {
        const response = await fetch(`${base}/api/iglesias/${slug}${sufijo}`);
        assert.equal(response.status, 404);
        assert.equal((await response.json()).error.code, 'NOT_FOUND');
      }
      const response = await fetch(`${base}/api/iglesias/catedral${sufijo}`, { method: 'POST' });
      assert.equal(response.status, 404);
      assert.equal((await response.json()).error.code, 'NOT_FOUND');
    }
  });

  test('trámites: cuatro guías de ejemplo por iglesia con respuesta data y sin teléfono', async () => {
    const { data: iglesias } = await (await fetch(`${base}/api/iglesias`)).json();
    for (const iglesia of iglesias) {
      const response = await fetch(`${base}/api/iglesias/${iglesia.slug}/tramites`);
      assert.equal(response.status, 200);
      assert.match(response.headers.get('content-type'), /application\/json/);
      const { data } = await response.json();
      assert.deepEqual(data.map((g) => g.tipo), ['bautizos', 'bodas', 'misas_difuntos', 'otros']);
      assert.equal(new Set(data.map((g) => g.id)).size, 4);
      for (const guia of data) {
        assert.equal(guia.iglesia_id, iglesia.id);
        assert.equal(guia.estado_verificacion, 'ejemplo');
        assert.equal(guia.fuente, null);
        assert.ok(Array.isArray(guia.requisitos));
        assert.equal('telefono' in guia, false);
      }
    }
  });

  test('trámites: slug inexistente conserva error 404 del contrato', async () => {
    for (const slug of ['desconocida', 'CATEDRAL', 'cat']) {
      const response = await fetch(`${base}/api/iglesias/${slug}/tramites`);
      assert.equal(response.status, 404);
      assert.deepEqual(await response.json(), {
        error: { code: 'NOT_FOUND', message: 'El recurso solicitado no existe.' },
      });
    }
  });

  test('datos de servidor no se sirven como archivos estáticos', async () => {
    for (const ruta of ['/data/materiales.js', '/backend/data/materiales.js']) {
      const response = await fetch(`${base}${ruta}`);
      assert.equal(response.status, 404);
      assert.equal((await response.json()).error.code, 'NOT_FOUND');
    }
  });
});
