import { test } from 'node:test';
import assert from 'node:assert/strict';
import { aFecha, diaSemana, esFechaValida, fechaLarga, formatoHora, hoyLocal, sumarDias } from './fechas.js';

test('hoyLocal usa la fecha local, no UTC', () => {
  assert.equal(hoyLocal(new Date(2026, 9, 24, 23, 30)), '2026-10-24');
  assert.equal(hoyLocal(new Date(2026, 9, 25, 0, 5)), '2026-10-25');
});

test('dia_semana: 0 domingo – 6 sábado, sin desfase', () => {
  assert.equal(diaSemana('2026-10-25'), 0);
  assert.equal(diaSemana('2026-10-24'), 6);
  assert.equal(diaSemana('2026-10-26'), 1);
});

test('sumarDias cruza mes, año y bisiesto', () => {
  assert.equal(sumarDias('2026-10-31', 1), '2026-11-01');
  assert.equal(sumarDias('2026-12-31', 1), '2027-01-01');
  assert.equal(sumarDias('2028-03-01', -1), '2028-02-29');
  assert.equal(sumarDias('2026-10-24', -7), '2026-10-17');
});

test('rechaza fechas que no existen o con mal formato', () => {
  for (const t of ['2026-02-30', '2026-13-01', '2026-1-5', 'hoy', '', null, undefined, '0099-01-01']) {
    assert.equal(esFechaValida(t), false, String(t));
  }
  assert.ok(aFecha('2026-02-28'));
});

test('texto de fecha y hora legibles', () => {
  assert.equal(fechaLarga('2026-10-25'), 'Domingo 25 de octubre de 2026');
  assert.deepEqual(['00:00', '07:05', '12:00', '13:30', '23:59'].map(formatoHora), ['12:00 a. m.', '7:05 a. m.', '12:00 p. m.', '1:30 p. m.', '11:59 p. m.']);
});
