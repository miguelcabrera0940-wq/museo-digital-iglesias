import test from 'node:test';
import assert from 'node:assert/strict';
import { restablecerClave,validarDestino } from '../scripts/restablecer-demo.js';

function clienteFalso({login=true,falla=false,cambia=false}={}) {
  const llamadas=[];let lecturas=0;
  return {llamadas,query:async(sql,p)=>{
    llamadas.push({sql,p});
    if(sql.startsWith('SELECT rolcanlogin'))return {rows:[{rolcanlogin:login,rolsuper:false,
      rolconnlimit:cambia && lecturas++?9:1,membresias:['provision']}]};
    if(sql.startsWith('DO ') && falla)throw Object.assign(new Error('Error privado no serializable'),{code:'42501'});
    return {rows:[]};
  }};
}
test('NOLOGIN detiene el restablecimiento antes de generar escrituras',async()=>{
  const cliente=clienteFalso({login:false});
  await assert.rejects(restablecerClave(cliente),e=>e.codigoSeguro==='IGLESIAS_ALTA_ADMIN_NOLOGIN_SIN_CAMBIOS');
  assert.equal(cliente.llamadas.length,1);
});
test('genera clave aleatoria y solo cambia PASSWORD mediante SQL sin hash de cliente',async()=>{
  const a=clienteFalso(),b=clienteFalso();
  const clave=await restablecerClave(a),otra=await restablecerClave(b);
  assert.match(clave,/^[a-f0-9]{64}$/);assert.notEqual(clave,otra);
  const parametro=a.llamadas.find(c=>c.sql.includes('set_config'));
  assert.equal(parametro.p[0],clave);
  assert.ok(a.llamadas.every(c=>!c.sql.includes(clave)));
  const cambio=a.llamadas.find(c=>c.sql.startsWith('DO ')).sql;
  assert.match(cambio,/ALTER ROLE iglesias_alta_admin PASSWORD %L/);
  assert.doesNotMatch(cambio,/\b(LOGIN|GRANT|REVOKE|CREATE|DROP|INSERT|UPDATE|DELETE)\b/);
  assert.equal(a.llamadas.at(-1).sql,'COMMIT');
});
test('error de ALTER o cambio de atributos causa rollback sin reintentar',async()=>{
  for(const opciones of [{falla:true},{cambia:true}]) {
    const cliente=clienteFalso(opciones);
    await assert.rejects(restablecerClave(cliente));
    assert.equal(cliente.llamadas.at(-1).sql,'ROLLBACK');
    assert.equal(cliente.llamadas.filter(c=>c.sql.startsWith('DO ')).length,1);
  }
});
test('operador y runtime deben apuntar a la misma rama/base Neon, con o sin pooler',()=>{
  // Credenciales ficticias exclusivamente para validar URL; ninguna conexión.
  const operador='postgresql://operador:solo-fixture@ep-demo.us-east-2.aws.neon.tech/base?sslmode=require';
  const api='postgresql://api:solo-fixture@ep-demo-pooler.us-east-2.aws.neon.tech/base?sslmode=require';
  assert.equal(validarDestino(operador,{DATABASE_URL:api,DATABASE_URL_ADMIN:api}).username,'operador');
  for(const distinto of [api.replace('ep-demo','ep-otra'),api.replace('/base','/otra')]) {
    assert.throws(()=>validarDestino(operador,{DATABASE_URL:api,DATABASE_URL_ADMIN:distinto}),e=>e.codigoSeguro==='RAMA_O_BASE_DISTINTA');
  }
  assert.throws(()=>validarDestino(operador.replace('us-east-2.aws.neon.tech','localhost'),{}),e=>e.codigoSeguro==='NEON_HOST_REQUIRED');
});
