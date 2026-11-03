import { test } from 'node:test';
import assert from 'node:assert/strict';
import iglesias from '../data/iglesias.json' with { type: 'json' };
import { listarHorarios, listarActividades, validarFecha } from '../src/agenda.js';

const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;
const hora = /^(?:[01]\d|2[0-3]):[0-5]\d$/;

test('horarios de las cuatro iglesias: contrato, aislamiento y orden por día/hora', () => {
  const ids = new Set();
  for (const iglesia of iglesias) {
    const lista = listarHorarios(iglesia.slug);
    assert.ok(lista.length > 0);
    assert.deepEqual(listarHorarios(iglesia.slug), lista);
    for (const registro of lista) {
      assert.deepEqual(Object.keys(registro).sort(),
        ['id', 'iglesia_id', 'dia_semana', 'hora', 'nota', 'es_ejemplo'].sort());
      assert.match(registro.id, uuid);
      assert.equal(ids.has(registro.id), false);
      ids.add(registro.id);
      assert.equal(registro.iglesia_id, iglesia.id);
      assert.ok(Number.isInteger(registro.dia_semana) && registro.dia_semana >= 0 && registro.dia_semana <= 6);
      assert.match(registro.hora, hora);
      assert.ok(registro.nota === null || typeof registro.nota === 'string');
      assert.equal(registro.es_ejemplo, true);
      assert.equal('fecha' in registro, false);
    }
    assert.deepEqual(lista, [...lista].sort((a, b) =>
      a.dia_semana - b.dia_semana || a.hora.localeCompare(b.hora) || a.id.localeCompare(b.id)));
    assert.ok(lista.some((h) => h.dia_semana === 0)); // Domingo sigue siendo 0.
  }
});

test('actividades: filtra exactamente fecha e iglesia, con campos y horas del contrato', () => {
  const ids = new Set();
  for (const iglesia of iglesias) {
    for (const fecha of ['2026-10-24', '2026-10-25']) {
      const lista = listarActividades(iglesia.slug, fecha);
      assert.ok(lista.length > 0);
      assert.deepEqual(listarActividades(iglesia.slug, fecha), lista);
      for (const actividad of lista) {
        assert.deepEqual(Object.keys(actividad).sort(), ['id', 'iglesia_id', 'tipo',
          'titulo', 'fecha', 'hora_inicio', 'hora_fin', 'descripcion', 'nota_visitas', 'es_ejemplo'].sort());
        assert.match(actividad.id, uuid);
        assert.equal(ids.has(actividad.id), false);
        ids.add(actividad.id);
        assert.equal(actividad.iglesia_id, iglesia.id);
        assert.equal(actividad.fecha, fecha);
        assert.equal(actividad.es_ejemplo, true);
        assert.ok(['misa', 'bautizo', 'boda', 'difuntos', 'visita', 'otro'].includes(actividad.tipo));
        assert.equal(typeof actividad.titulo, 'string');
        assert.equal(typeof actividad.descripcion, 'string');
        assert.ok(actividad.nota_visitas === null || typeof actividad.nota_visitas === 'string');
        assert.match(actividad.hora_inicio, hora);
        if (actividad.hora_fin !== null) {
          assert.match(actividad.hora_fin, hora);
          assert.ok(actividad.hora_fin >= actividad.hora_inicio);
        }
        assert.equal('dia_semana' in actividad, false);
      }
      assert.deepEqual(lista, [...lista].sort((a, b) =>
        a.hora_inicio.localeCompare(b.hora_inicio) || a.id.localeCompare(b.id)));
    }
  }
});

test('día sin eventos devuelve [] y mantiene las misas habituales y su día', () => {
  for (const iglesia of iglesias) {
    const antes = structuredClone(listarHorarios(iglesia.slug));
    assert.deepEqual(listarActividades(iglesia.slug, '2026-10-26'), []);
    assert.deepEqual(listarHorarios(iglesia.slug), antes);
    if (iglesia.slug !== 'santa-lucia') assert.ok(antes.some((h) => h.dia_semana === 1));
  }
  assert.equal(listarHorarios('santa-lucia').some((h) => h.dia_semana === 1), false);
  assert.ok(listarActividades('santa-lucia', '2026-10-24').length > 0);
});

test('fecha obligatoria: rechaza formato, calendario imposible y parámetros repetidos', () => {
  for (const fecha of [undefined, null, '', 20261024, '2026-2-03', '26-10-24',
    '2026/10/24', ' 2026-10-24', '2026-10-24 ', '2026-10-24T00:00:00Z',
    '2026-02-29', '2026-02-30', '2026-04-31', '1900-02-29', '2100-02-29',
    '0000-01-01', '2026-00-01', '2026-13-01', '2026-01-00', '2026-01-32',
    ['2026-10-24', '2026-10-25'], { fecha: '2026-10-24' }, "' OR 1=1 --"]) {
    assert.throws(() => listarActividades('catedral', fecha), (error) => {
      assert.equal(error.status, 400);
      assert.equal(error.code, 'VALIDATION_ERROR');
      assert.equal(typeof error.fields.fecha, 'string');
      return true;
    });
  }
});

test('admite bisiestos y extremos sin cambiar el calendario ni generar eventos', () => {
  for (const fecha of ['2000-02-29', '2028-02-29', '2026-02-28', '2026-12-31',
    '2027-01-01', '0001-01-01', '0099-12-31', '9999-12-31']) {
    assert.equal(validarFecha(fecha), fecha);
    assert.deepEqual(listarActividades('catedral', fecha), []);
  }
  assert.equal(listarActividades('catedral', '2026-10-24')[0].fecha, '2026-10-24');
});

test('slug inexistente o inválido no permite consultar otra iglesia', () => {
  for (const slug of ['desconocida', 'CATEDRAL', 'cat', '', '../catedral', "' OR 1=1 --", undefined]) {
    for (const consultar of [() => listarHorarios(slug), () => listarActividades(slug, '2026-10-24')]) {
      assert.throws(consultar, (error) => error.status === 404 && error.code === 'NOT_FOUND');
    }
  }
});
