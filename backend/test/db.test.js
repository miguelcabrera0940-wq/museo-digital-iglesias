import { test } from 'node:test';
import assert from 'node:assert/strict';
import { crearConsulta, opcionesConexion, prepararLecturaSql } from '../src/db.js';

const seguro = { sin_cambio_rol: true, puede_leer: true, privilegiado: false, propietario: false };
function entorno(rol = seguro, falloConsulta = false, falloRollback = false) {
  const llamadas = [];
  const cliente = {
    async query(sql, valores) {
      llamadas.push([sql, valores]);
      if (sql === prepararLecturaSql) {
        const codigo=!rol.sin_cambio_rol?'P1001':!rol.puede_leer?'P1002':rol.privilegiado?'P1003':rol.propietario?'P1004':null;
        if(codigo)throw Object.assign(new Error('Denegado por guardia SQL'),{code:codigo});
        return [{rows:[]},{rows:[]},{rows:[]}];
      }
      if (falloRollback && sql === 'ROLLBACK') throw new Error('conexión perdida');
      if (falloConsulta && sql === 'SELECT $1::text') throw new Error('fallo SQL');
      return { rows: [{ valor: 'respuesta' }] };
    },
    release(descartar) { llamadas.push(['release', descartar]); },
  };
  return { llamadas, consultar: crearConsulta(async () => ({ connect: async () => cliente })) };
}

test('conexión restringida: transacción read only, rol local, parámetros y liberación', async () => {
  const { consultar, llamadas } = entorno();
  assert.deepEqual(await consultar('SELECT $1::text', ["' OR 1=1 --"]), [{ valor: 'respuesta' }]);
  assert.deepEqual(llamadas.map(([sql]) => sql), [
    prepararLecturaSql, 'SELECT $1::text', 'COMMIT', 'release',
  ]);
  assert.deepEqual(llamadas[1][1], ["' OR 1=1 --"]);
});

test('rechaza propietario, bypass, membresías elevadas y login sin iglesias_api', async () => {
  for (const rol of [{ ...seguro, propietario: true }, { ...seguro, privilegiado: true },
    { ...seguro, puede_leer: false }, { ...seguro, sin_cambio_rol: false }]) {
    const { consultar, llamadas } = entorno(rol);
    await assert.rejects(consultar('SELECT $1::text', ['dato']), (e) => e.codigoDiagnostico.startsWith('ROLE_'));
    assert.equal(llamadas.some(([sql]) => sql === 'SELECT $1::text'), false);
    assert.deepEqual(llamadas.at(-2), ['ROLLBACK', undefined]);
    assert.deepEqual(llamadas.at(-1), ['release', false]);
  }
});

test('error SQL no devuelve datos locales: rollback y descarte si conexión rota', async () => {
  for (const falloRollback of [false, true]) {
    const { consultar, llamadas } = entorno(seguro, true, falloRollback);
    await assert.rejects(consultar('SELECT $1::text', ['dato']), /fallo SQL/);
    assert.deepEqual(llamadas.at(-1), ['release', falloRollback]);
    assert.equal(llamadas.some(([sql]) => sql === 'COMMIT'), false);
  }
});

test('TLS verifica certificados y configuración inválida no revela la URL', () => {
  const opciones = opcionesConexion('postgresql://usuario:clave@example.invalid/base?sslmode=require&channel_binding=require');
  assert.deepEqual(opciones.ssl, { rejectUnauthorized: true });
  assert.equal(new URL(opciones.connectionString).searchParams.has('sslmode'), false);
  assert.equal(opciones.max, 3);
  for (const url of [undefined, '', 'postgresql://usuario:clave@example.invalid/base?sslmode=disable',
    'https://usuario:clave@example.invalid/base', 'postgresql://usuario@example.invalid/base']) {
    assert.throws(() => opcionesConexion(url), (e) => !e.message.includes('clave') && !e.message.includes('postgresql://'));
  }
});

test('no cachea permisos entre transacciones y hace rollback si falla la preparación agrupada',async()=>{
  let prefijos=0,negocio=0;const comandos=[];
  const consultar=crearConsulta(async()=>({connect:async()=>({query:async(sql)=>{
    comandos.push(sql);
    if(sql===prepararLecturaSql && ++prefijos===2)throw Object.assign(new Error('Permiso retirado'),{code:'P1002'});
    if(sql==='SELECT $1::text'){negocio++;return {rows:[{valor:'público'}]};}return {rows:[]};
  },release:()=>{}})}));
  await consultar('SELECT $1::text',['dato']);
  await assert.rejects(consultar('SELECT $1::text',['dato']),e=>e.codigoDiagnostico==='ROLE_MEMBERSHIP_REQUIRED');
  assert.equal(prefijos,2);assert.equal(negocio,1);assert.equal(comandos.at(-1),'ROLLBACK');
});
