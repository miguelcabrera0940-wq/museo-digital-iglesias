import test from 'node:test';
import assert from 'node:assert/strict';
import { medirHttp,recorridoHttp,perfilarNeon } from '../scripts/diagnosticar-rendimiento.js';
import { prepararLecturaSql } from '../src/db.js';

test('HTTP mide cabeceras/cuerpo/bytes y el recorrido no guarda cuerpos en resultados',async()=>{
  const fetchImpl=async url=>{
    const ruta=new URL(url).pathname;
    const data=ruta.endsWith('/materiales')?[{id:'publico',visibilidad:'publico',tiene_documento:true,es_ejemplo:false,imagen_publica:'/imagenes/muestra.jpg'}]:
      ruta.endsWith('/documento')?{paginas:[{numero:1,texto:'cuerpo-no-exportable',imagen_url:null}]}:{slug:'catedral'};
    return new Response(JSON.stringify({data}),{status:200});
  };
  const r=await medirHttp('http://localhost:3001','/api/materiales/x/documento',fetchImpl);
  assert.equal(r.medicion.estado,200);assert.ok(r.medicion.bytes>0 && r.medicion.total_ms>=0 && r.medicion.cabeceras_ms>=0);
  const recorrido=await recorridoHttp('http://localhost:3001',fetchImpl);
  assert.equal(recorrido.resultados.length,2);assert.ok(recorrido.resultados.every(r=>r.pasos.length===7));
  assert.ok(recorrido.resultados.every(r=>r.pasos.flatMap(p=>p.peticiones).length===11));
  assert.ok(!JSON.stringify(recorrido.resultados).includes('cuerpo-no-exportable'));
});
test('EPERM detiene el recorrido tras una petición y no expone el error original',async()=>{
  let llamadas=0;
  const r=await recorridoHttp('http://localhost:3001',async()=>{
    llamadas++;throw Object.assign(new Error('dato-secreto-que-no-sale'),{cause:{code:'EPERM'}});
  });
  assert.equal(llamadas,1);assert.equal(r.bloqueado,true);
  assert.equal(r.resultados[0].error.codigo,'NET_EPERM');
  assert.ok(!JSON.stringify(r).includes('dato-secreto-que-no-sale'));
});
function doblePool(propietario=false) {
  const consultas=[];let cerrado=false;
  const id='ab6d29dd-a307-88f6-ab6b-dcf7d4f18c43';
  const cliente={query:async(sql)=>{
    consultas.push(sql);
    if(sql===prepararLecturaSql) {
      if(propietario)throw Object.assign(new Error('Prohibido'),{code:'P1004'});
      return [{rows:[]},{rows:[]},{rows:[]}];
    }
    if(sql.startsWith('EXPLAIN'))return {rows:[{'QUERY PLAN':[{'Planning Time':0.1,'Execution Time':0.2}]}]};
    if(sql.includes('GROUP BY'))return {rows:[{material_id:id,visibilidad:'publico',titulo:'Público',es_ejemplo:false,paginas:[]}]};
    return {rows:[{id,slug:'catedral',visibilidad:'publico',tiene_documento:true,es_ejemplo:false}]};
  },release:()=>{}};
  return {consultas,get cerrado(){return cerrado;},Pool:class {waitingCount=0;on(){}async connect(){return cliente;}async end(){cerrado=true;}}};
}
const url='postgresql://fixture:solo-prueba@example.invalid/base?sslmode=require';
test('perfil separa adquisición, guardias y negocio; dos rondas y planes públicos sin escrituras',async()=>{
  const p=doblePool(),r=await perfilarNeon(url,p.Pool);
  assert.equal(r.error,undefined);assert.equal(r.operaciones.length,12);assert.ok(r.planes.length>0);
  assert.equal(r.operaciones[0].adquisiciones[0].conexion_nueva,true);
  assert.ok(r.operaciones.slice(1).flatMap(o=>o.adquisiciones).every(a=>a.conexion_nueva===false));
  assert.deepEqual(r.operaciones[0].comandos.map(c=>c.fase),['preparacion_segura','consulta','commit']);
  assert.equal(r.operaciones[2].comandos.length,3); // búsqueda y listado en un solo SELECT.
  assert.ok(p.consultas.every(sql=>!/^\s*(INSERT|UPDATE|DELETE|ALTER|CREATE|DROP)/i.test(sql)));
  assert.equal(p.cerrado,true);assert.ok(!JSON.stringify(r).includes(url));
});
test('el diagnóstico rechaza propietario antes de consultar negocio y cierra solo su pool',async()=>{
  const p=doblePool(true),r=await perfilarNeon(url,p.Pool);
  assert.equal(r.error.codigo,'OWNER_LOGIN');assert.equal(p.cerrado,true);
  assert.deepEqual(p.consultas,[prepararLecturaSql,'ROLLBACK']);
});
