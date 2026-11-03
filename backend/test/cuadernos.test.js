import test from 'node:test';
import assert from 'node:assert/strict';
import lote from '../data/cuadernos-informativos.json' with {type:'json'};
import { prepararCuadernos,comprobarImagenes,cargarCuadernos } from '../src/carga-cuadernos.js';
import { crearLecturas } from '../src/lecturas.js';
import { crearApp } from '../src/app.js';
import { crearGestion } from '../src/admin/gestion.js';
import { IncomingMessage,ServerResponse } from 'node:http';
import { PassThrough } from 'node:stream';
import { memoriaCuadernos } from './fixtures/cuadernos.js';
const cuadernos=prepararCuadernos(lote);
async function pedir(app,url) {
  const socket=new PassThrough(),req=new IncomingMessage(socket);req.method='GET';req.url=url;req.headers={host:'localhost:3001'};
  const res=new ServerResponse(req);res.assignSocket(socket);socket.resume();
  const terminar=res.end;let cuerpo='';
  res.end=function(trozo,...args){if(trozo)cuerpo+=trozo.toString();return terminar.call(this,trozo,...args);};
  await new Promise((resolve,reject)=>{res.on('finish',resolve);res.on('error',reject);app(req,res);});
  return {status:res.statusCode,body:JSON.parse(cuerpo)};
}
test('ocho cuadernos, textos/créditos intactos, UUID estable e imágenes reales',async()=>{
  assert.equal(cuadernos.length,8);assert.equal(new Set(cuadernos.map(c=>c.id)).size,8);
  assert.deepEqual(cuadernos.map(({id,...c})=>c),lote.cuadernos);
  assert.deepEqual(prepararCuadernos(structuredClone(lote)),cuadernos);
  const imagenes=await comprobarImagenes(cuadernos,new URL('../../frontend/public',import.meta.url).pathname);
  assert.equal(imagenes.length,14);
  const malo=structuredClone(cuadernos);malo[0].imagen_publica='/imagenes/no-existe.jpg';
  await assert.rejects(comprobarImagenes(malo,new URL('../../frontend/public',import.meta.url).pathname),e=>e.codigo==='IMAGEN_NO_EXISTE');
});
test('rechaza duplicados, páginas inválidas, contenido de ejemplo y rutas arbitrarias',()=>{
  const mutaciones=[x=>x.cuadernos.pop(),x=>x.cuadernos[1].slug_iglesia=x.cuadernos[0].slug_iglesia,
    x=>x.cuadernos[0].paginas[0].numero=9,x=>x.cuadernos[0].es_ejemplo=true,
    x=>x.cuadernos[0].imagen_publica='/imagenes/../privado.jpg',x=>x.cuadernos[0].paginas[0].imagen_url='https://example.invalid/a.jpg'];
  for(const mutar of mutaciones){const x=structuredClone(lote);mutar(x);assert.throws(()=>prepararCuadernos(x));}
});
test('comparación solo lectura, aplicación y repetición sin duplicados ni escrituras nuevas',async()=>{
  const db=memoriaCuadernos(),antes=structuredClone(db.estado);
  const comparar=await cargarCuadernos(db,cuadernos);
  assert.equal(comparar.retiradas.length,16);assert.deepEqual(db.estado,antes);
  assert.ok(db.llamadas.every(c=>!/^\s*(INSERT|UPDATE|DELETE)/.test(c.sql)));
  await cargarCuadernos(db,cuadernos,{aplicar:true});
  assert.equal(db.estado.materiales.length,44);assert.equal(db.estado.documentos.length,28);assert.equal(db.estado.paginas.length,172);
  for(const m of antes.materiales.filter(m=>m.visibilidad==='privado'||m.tipo==='objeto'))assert.deepEqual(db.estado.materiales.find(a=>a.id===m.id),m);
  assert.deepEqual(db.estado.documentos.slice(0,20),antes.documentos);assert.deepEqual(db.estado.paginas.slice(0,140),antes.paginas);
  const frontera=db.llamadas.length,segunda=await cargarCuadernos(db,cuadernos,{aplicar:true});
  assert.ok(segunda.cambios.every(c=>c.accion==='sin_cambios'));assert.equal(segunda.retiradas.length,0);
  assert.ok(db.llamadas.slice(frontera).every(c=>!/^\s*(INSERT|UPDATE|DELETE)/.test(c.sql)));
});
test('semilla editada se conserva y un conflicto privado revierte todas las escrituras previas',async()=>{
  const db=memoriaCuadernos();db.estado.materiales[0].fuente='Contenido editado';
  const r=await cargarCuadernos(db,cuadernos,{aplicar:true});assert.equal(r.omitidas.length,1);assert.equal(r.retiradas.length,15);
  const fallo=memoriaCuadernos();fallo.estado.materiales.push({id:cuadernos[1].id,iglesia_id:fallo.iglesias[1].id,visibilidad:'privado'});
  const antes=structuredClone(fallo.estado);
  await assert.rejects(cargarCuadernos(fallo,cuadernos,{aplicar:true}),e=>e.codigo==='CONFLICTO_MATERIAL_ESTABLE');
  assert.deepEqual(fallo.estado,antes);assert.equal(fallo.llamadas.at(-1).sql,'ROLLBACK');
});
test('API Express/lector entrega páginas/imágenes exactas; retirados404, privados403 y objetos intactos',async()=>{
  const db=memoriaCuadernos();await cargarCuadernos(db,cuadernos,{aplicar:true});
  const lecturas=crearLecturas(async(sql,p)=>{
    if(sql.includes('LEFT JOIN public.materiales')) {
      const i=db.iglesias.find(i=>i.slug===p[0]);if(!i)return [];
      const lista=db.estado.materiales.filter(m=>!m.retirado_publico && m.iglesia_id===i.id && (!p[1]||m.categoria_id===p[1]));
      return lista.length?lista.map(m=>({...m,iglesia_encontrada:i.id,tiene_documento:db.estado.documentos.some(d=>d.material_id===m.id)})):[{iglesia_encontrada:i.id,id:null}];
    }
    if(sql.includes('FROM public.iglesias'))return db.iglesias.filter(i=>i.slug===p[0]);
    assert.ok(sql.includes('NOT m.retirado_publico'));
    const candidatos=db.estado.materiales.filter(m=>!m.retirado_publico);
    if(sql.includes('WHERE m.iglesia_id=$1'))return candidatos.filter(m=>m.iglesia_id===p[0]).map(m=>({...m,tiene_documento:db.estado.documentos.some(d=>d.material_id===m.id)}));
    const m=candidatos.find(m=>m.id===p[0]);if(!m)return [];
    if(sql.includes('GROUP BY')) {
      if(m.visibilidad==='privado')return [{visibilidad:'privado'}];
      return [{visibilidad:'publico',...db.estado.documentos.find(d=>d.material_id===m.id),paginas:db.estado.paginas.filter(a=>a.material_id===m.id).map(({material_id,...p})=>p)}];
    }
    return [{...m,tiene_documento:true}];
  });
  const app=crearApp(lecturas);
  for(const c of cuadernos) {
    const doc=await lecturas.obtenerDocumento(c.id);assert.equal(doc.es_ejemplo,false);assert.deepEqual(doc.paginas,c.paginas);
    const r=await pedir(app,`/api/materiales/${c.id}/documento`);assert.equal(r.status,200);
    assert.deepEqual(r.body,{data:doc});
    const ficha=await lecturas.obtenerMaterial(c.id);assert.equal(ficha.tiene_documento,true);assert.equal(ficha.bloqueado,false);
  }
  for(const m of db.estado.materiales.filter(m=>m.retirado_publico)) {
    await assert.rejects(lecturas.obtenerDocumento(m.id),{status:404});await assert.rejects(lecturas.obtenerMaterial(m.id),{status:404});
    assert.equal((await pedir(app,`/api/materiales/${m.id}/documento`)).status,404);
  }
  const reservado=db.estado.materiales.find(m=>m.visibilidad==='privado');await assert.rejects(lecturas.obtenerDocumento(reservado.id),{status:403});
  const lista=await lecturas.listarMateriales('catedral');assert.equal(lista.filter(m=>m.categoria_id==='objetos').length,3);
  assert.ok(lista.every(m=>!Object.hasOwn(m,'descripcion_interna')));
});
test('hacer privado un documento ilustrado devuelve409 antes de actualizar',async()=>{
  let actualiza=false;
  const g=crearGestion(async(_rol,fn)=>fn(async sql=>{
    if(sql.startsWith('UPDATE'))actualiza=true;
    return {rows:sql.startsWith('SELECT m.id')?[{id:cuadernos[0].id}]:[]};
  },{rol:'general',iglesia_id:null}));
  await assert.rejects(g.guardar('general','materiales',cuadernos[0].id,{visibilidad:'privado'}),{status:409,code:'CONFLICT'});
  assert.equal(actualiza,false);
});
