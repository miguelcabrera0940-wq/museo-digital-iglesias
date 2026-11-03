import test from 'node:test';
import assert from 'node:assert/strict';
import { consumirIntento } from '../src/admin/seguridad.js';
const config={secreto:'x'.repeat(40)};
const incorrecto=()=>Promise.reject(Object.assign(new Error('Credenciales incorrectas'),{body:{code:'INVALID_EMAIL_OR_PASSWORD'}}));
// Doble transaccional serializado con reloj controlado, no PostgreSQL real.
function almacen() {
  const filas=new Map(),consultas=[];let reloj=Date.parse('2026-10-30T12:00:00Z'),cola=Promise.resolve();
  const tx=async(rol,fn)=>{
    assert.equal(rol,'iglesias_auth');
    const anterior=cola;let liberar;cola=new Promise(r=>{liberar=r;});await anterior;
    const snapshot=structuredClone(filas);
    try {return await fn(async(sql,p=[])=>{
      consultas.push({sql,p});
      if(sql.startsWith('INSERT')){if(!filas.has(p[0]))filas.set(p[0],{fallos:0,ultimo_fallo:null,bloqueado_hasta:null,actualizado_en:new Date(reloj)});return {rows:[]};}
      if(sql.includes('SELECT fallos'))return {rows:[{...filas.get(p[0])}]};
      if(sql==='SELECT clock_timestamp() AS ahora')return {rows:[{ahora:new Date(reloj)}]};
      if(sql.startsWith('UPDATE')) {
        filas.set(p[0],{fallos:p.length===1?0:p[1],ultimo_fallo:p.length===1?null:new Date(reloj),
          bloqueado_hasta:p.length===1||!p[2]?null:new Date(reloj+p[2]*1000),actualizado_en:new Date(reloj)});return {rows:[]};
      }
      if(sql.startsWith('DELETE')){for(const [k,f]of filas)if(reloj-f.actualizado_en.getTime()>900000)filas.delete(k);return {rows:[]};}
      throw new Error('SQL no previsto');
    });}catch(e){filas.clear();for(const [k,v]of snapshot)filas.set(k,v);throw e;}finally{liberar();}
  };
  return {tx,filas,consultas,avanzar:s=>{reloj+=s*1000;}};
}
test('5 fallos→15s; 10→120s; espera no incrementa ni prolonga; éxito reinicia',async()=>{
  const a=almacen(),email='prueba@example.invalid';let comprobaciones=0;
  const fallo=()=>consumirIntento(a.tx,config,email,()=>{comprobaciones++;return incorrecto();});
  for(let n=1;n<=10;n++) {
    await assert.rejects(fallo(),e=>e.body?.code==='INVALID_EMAIL_OR_PASSWORD');
    const [estado]=a.filas.values();assert.equal(estado.fallos,n);
    if(n>=5) {
      const espera=n===10?120:15,antes=comprobaciones,fecha=estado.bloqueado_hasta.getTime();
      await assert.rejects(fallo(),e=>e.status===429&&e.retryAfter===espera);
      a.avanzar(1);await assert.rejects(fallo(),e=>e.status===429&&e.retryAfter===espera-1);
      assert.equal(comprobaciones,antes);assert.equal([...a.filas.values()][0].bloqueado_hasta.getTime(),fecha);
      a.avanzar(espera-1);
    }
  }
  await assert.rejects(fallo());assert.equal([...a.filas.values()][0].fallos,10);
  a.avanzar(120);
  const r=await consumirIntento(a.tx,config,email,async()=>({correcto:true}));assert.ok(r.correcto);
  assert.equal([...a.filas.values()][0].fallos,0);assert.equal([...a.filas.values()][0].bloqueado_hasta,null);
});
test('inactividad de15min expira secuencia; correo inexistente tiene la misma política',async()=>{
  const a=almacen();
  for(let n=0;n<4;n++)await assert.rejects(consumirIntento(a.tx,config,'inexistente@example.invalid',incorrecto));
  a.avanzar(900);
  await assert.rejects(consumirIntento(a.tx,config,'inexistente@example.invalid',incorrecto));
  assert.equal([...a.filas.values()][0].fallos,1);
});
test('dos instancias comparten contador, concurrencia admite solo5 fallos antes de espera',async()=>{
  const a=almacen(),instancia=()=>consumirIntento(a.tx,config,'compartida@example.invalid',incorrecto);
  const r=await Promise.allSettled(Array.from({length:12},()=>instancia()));
  assert.equal(r.filter(x=>x.reason?.body?.code==='INVALID_EMAIL_OR_PASSWORD').length,5);
  assert.equal(r.filter(x=>x.reason?.status===429).length,7);
  assert.equal([...a.filas.values()][0].fallos,5);
  assert.ok(a.consultas.some(c=>c.sql.includes('FOR UPDATE')));
  assert.ok(a.consultas.every(c=>!JSON.stringify(c).includes('compartida@example.invalid')));
});
test('fallos técnicos no cuentan como credenciales ni permiten login sin contador',async()=>{
  const a=almacen();
  await assert.rejects(consumirIntento(a.tx,config,'prueba@example.invalid',async()=>{throw new Error('DB_DOWN');}),/DB_DOWN/);
  assert.equal(a.filas.size,0);
  let verifico=false;
  await assert.rejects(consumirIntento(async()=>{throw new Error('DB_DOWN');},config,'prueba@example.invalid',async()=>{verifico=true;}),/DB_DOWN/);
  assert.equal(verifico,false);
});
