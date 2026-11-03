import test from 'node:test';
import assert from 'node:assert/strict';
import { medirMapa,medirEtapa,anotar,registrarConexion,medicionActual } from '../src/medicion-mapa.js';
import { crearConsulta,prepararLecturaSql } from '../src/db.js';
import { repetirMapa,comprobarPublico } from '../scripts/diagnosticar-rendimiento.js';
import cuadernos from '../data/cuadernos-informativos.json' with {type:'json'};
import objetos from '../data/objetos-museo.json' with {type:'json'};
const req=(direccion='127.0.0.1',cabecera='mapa')=>({socket:{remoteAddress:direccion},get:()=>cabecera});
function respuesta(){return {headers:{},set(k,v){this.headers[k]=v;}};}
test('instrumentación opt-in y loopback, sin cambios en datos o cabeceras habituales',async()=>{
  for(const entrada of [req('198.51.100.1'),req('127.0.0.1','')]) {
    const res=respuesta();assert.deepEqual(await medirMapa(entrada,res,async()=>{anotar('api',10);return [1];}),[1]);
    assert.deepEqual(res.headers,{});
  }
  const res=respuesta();await medirMapa(req(),res,async()=>{
    await medirEtapa('db_guard',async()=>{});anotar('api',3);anotar('secreto-prohibido',123);return [];
  });
  assert.match(res.headers['Server-Timing'],/db_guard;dur=/);assert.ok(!res.headers['Server-Timing'].includes('secreto'));
  assert.equal(medicionActual(),undefined);
});
test('telemetría del pool distingue nueva/reutilizada y espera con cliente simulado',async()=>{
  const cliente={query:async(sql)=>({rows:sql===prepararLecturaSql?[]:[{dato:'público'}]}),release:()=>{}};
  let primero=true;
  const pool={idleCount:0,totalCount:1,options:{max:1},connect:async()=>{
    if(primero){registrarConexion(cliente);primero=false;}return cliente;
  }};
  const consultar=crearConsulta(async()=>pool),res1=respuesta(),res2=respuesta();
  await medirMapa(req(),res1,()=>consultar('SELECT $1::text',['público']));
  assert.match(res1.headers['Server-Timing'],/pool_nueva;dur=/);assert.match(res1.headers['Server-Timing'],/pool_queue;dur=/);
  pool.idleCount=1;
  await medirMapa(req(),res2,()=>consultar('SELECT $1::text',['público']));
  assert.match(res2.headers['Server-Timing'],/pool_reutilizada;dur=/);
  assert.match(res2.headers['Server-Timing'],/db_init;dur=/);assert.match(res2.headers['Server-Timing'],/sql_driver;dur=/);
});
test('contextos concurrentes no comparten métricas',async()=>{
  const a=respuesta(),b=respuesta();
  await Promise.all([medirMapa(req(),a,async()=>{await new Promise(r=>setImmediate(r));anotar('db_guard',111);}),
    medirMapa(req(),b,async()=>{anotar('sql_driver',222);})]);
  assert.ok(!a.headers['Server-Timing'].includes('sql_driver'));assert.ok(!b.headers['Server-Timing'].includes('db_guard'));
});
test('muestreo repetido alterna primer origen tras pausa y exige backend instrumentado',async()=>{
  const pausas=[],peticiones=[];
  const fetchImpl=async(url,opciones)=>{
    peticiones.push({url,opciones});return new Response('{"data":[]}',{status:200,headers:{'server-timing':'db_guard;dur=60, pool_reutilizada;dur=0.1'}});
  };
  const r=await repetirMapa({fetchImpl,dormir:async ms=>{pausas.push(ms);},inmediatas:2,rondasInactivas:2});
  assert.equal(r.error,undefined);assert.equal(r.muestras.length,10);assert.deepEqual(pausas,[12000,12000]);
  assert.ok(peticiones.every(p=>p.opciones.headers['X-Iglesias-Diagnostico']==='mapa'));
  assert.deepEqual(r.muestras.filter(m=>m.fase==='primera_tras_pausa_del_diagnostico').map(m=>m.origen),['api','vite']);
  let n=0;const ausente=await repetirMapa({fetchImpl:async()=>{n++;return new Response('{"data":[]}',{status:200});}});
  assert.equal(n,1);assert.equal(ausente.error.codigo,'BACKEND_INSTRUMENTATION_REQUIRED');
});
test('muestreo EPERM se detiene tras una llamada y no publica mensajes',async()=>{
  let n=0;const r=await repetirMapa({fetchImpl:async()=>{n++;throw Object.assign(new Error('no revelar'),{cause:{code:'EPERM'}});}});
  assert.equal(n,1);assert.equal(r.bloqueado,true);assert.ok(!JSON.stringify(r).includes('no revelar'));
});
test('comprobaciones públicas registran fallo sin guardar un cuerpo privado inesperado',async()=>{
  const fetchImpl=async url=>{
    const path=new URL(url).pathname;
    if(path==='/api/iglesias')return new Response(JSON.stringify({data:[{slug:'catedral'}]}),{status:200});
    if(path.endsWith('/materiales'))return new Response(JSON.stringify({data:[{id:'reservado',bloqueado:true}]}),{status:200});
    if(path.endsWith('/documento'))return new Response(JSON.stringify({data:{texto:'CUERPO_PRIVADO_NO_GUARDAR'}}),{status:200});
    return new Response(JSON.stringify({data:[]}),{status:200});
  };
  const r=await comprobarPublico(fetchImpl);assert.equal(r.correcto,false);
  assert.ok(!JSON.stringify(r).includes('CUERPO_PRIVADO_NO_GUARDAR'));
});
test('recorrido público exige ocho cuadernos, diez fichas de objetos y privados403, sin cookies',async()=>{
  const iglesias=cuadernos.cuadernos.map(c=>({slug:c.slug_iglesia}));
  const fichas=objetos.objetos.map(o=>({...o,id:o.clave,visibilidad:'publico',bloqueado:false,tiene_documento:false}));
  const fetchImpl=async(url,opciones)=>{
    assert.equal(opciones.credentials,'omit');
    const p=new URL(url).pathname;
    const r=(estado,data)=>new Response(JSON.stringify({data}),{status:estado});
    if(p==='/api/admin/iglesias')return r(401,null);
    if(p==='/api/iglesias')return r(200,iglesias);
    if(p.endsWith('/actividades'))return r(200,[]);
    if(p.endsWith('/materiales')) {
      const slug=p.split('/')[3];
      return r(200,[{id:'cuaderno-'+slug,visibilidad:'publico',tipo:'documento',es_ejemplo:false,tiene_documento:true},
        ...fichas.filter(o=>o.slug_iglesia===slug),{id:'privado-'+slug,bloqueado:true}]);
    }
    if(p.endsWith('/documento')) {
      if(p.includes('/privado-'))return r(403,null);
      if(p.includes('/cuaderno-'))return r(200,{es_ejemplo:false,paginas:[1,2,3,4].map(numero=>({numero,texto:'Público',imagen_url:null}))});
      return r(404,null);
    }
    const f=fichas.find(o=>p.endsWith('/'+o.id));return f?r(200,f):r(404,null);
  };
  const r=await comprobarPublico(fetchImpl);
  assert.equal(r.correcto,true);assert.equal(r.cuadernos,8);assert.equal(r.objetos,10);assert.equal(r.privados_bloqueados,8);
});
