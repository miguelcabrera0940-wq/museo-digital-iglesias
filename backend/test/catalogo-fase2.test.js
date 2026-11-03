import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { generarCatalogo } from '../sql/generar_catalogo_fase2.js';
import { IncomingMessage,ServerResponse } from 'node:http';
import { PassThrough } from 'node:stream';
import { crearApp } from '../src/app.js';
import { crearLecturas } from '../src/lecturas.js';
import { crearGestion,validarCampos } from '../src/admin/gestion.js';
import { prepararCarga,ejecutarCarga,vistaPrevia } from '../src/carga-publica.js';
import { slugsIglesias } from '../src/catalogo.js';
const merida=JSON.parse(await readFile(new URL('../data/iglesias.json',import.meta.url),'utf8'));
const nuevas=JSON.parse(await readFile(new URL('../data/iglesias-fase2.json',import.meta.url),'utf8'));
const iglesias=[...merida.map(i=>({...i,estado:'yucatan',ciudad:'Mérida'})),...nuevas.map(i=>({...i,descripcion:'',historia:'',direccion:'',telefono:null,foto_interior:null,foto_exterior:null,es_ejemplo:true}))];
function lecturas() {
  const llamadas=[];
  return {llamadas,servicio:crearLecturas(async(sql,p=[])=>{
    llamadas.push({sql,p});
    if(sql.includes('LEFT JOIN public.materiales')) {
      const i=iglesias.find(i=>i.slug===p[0]);return i?[{iglesia_encontrada:i.id,id:null}]:[];
    }
    if(sql.includes('LEFT JOIN public.tramites')) {
      const i=iglesias.find(i=>i.slug===p[0]);return i?['bautizos','bodas','misas_difuntos','otros'].map((tipo,n)=>({iglesia_encontrada:i.id,id:String(n),iglesia_id:i.id,tipo,requisitos:[],fuente:null,estado_verificacion:'por_confirmar'})):[];
    }
    if(sql.includes('WHERE ($1::text'))return iglesias.filter(i=>!p[0]||i.estado===p[0]);
    if(sql.includes('WHERE slug=$1'))return iglesias.filter(i=>i.slug===p[0]);
    if(sql.includes('GROUP BY'))return [{visibilidad:'privado'}];
    if(sql.includes('WHERE m.id=$1'))return [{visibilidad:'privado',tiene_documento:true,descripcion_interna:'NO PUBLICAR'}];
    if(sql.includes('FROM public.tramites'))return ['bautizos','bodas','misas_difuntos','otros'].map(tipo=>({iglesia_id:p[0],tipo,requisitos:[],fuente:null,estado_verificacion:'por_confirmar'}));
    return [];
  })};
}
function pedir(app,url) {
  return new Promise((resolve,reject)=>{
    const req=new IncomingMessage(new PassThrough());req.method='GET';req.url=url;req.headers={};
    const res=new ServerResponse(req);res.end=c=>resolve({status:res.statusCode,body:JSON.parse(String(c))});
    app.handle(req,res,reject);req.complete=true;req.push(null);
  });
}
test('listado y HTTP en memoria: ocho, filtro4/2/2, orden y campos sin romper Mérida',async()=>{
  const f=lecturas(),app=crearApp(f.servicio);
  const todas=await pedir(app,'/api/iglesias');assert.equal(todas.status,200);
  assert.deepEqual(todas.body.data.map(i=>i.slug),slugsIglesias);
  for(const [estado,n]of [['yucatan',4],['campeche',2],['puebla',2]]) {
    const r=await pedir(app,`/api/iglesias?estado=${estado}`);assert.equal(r.status,200);assert.equal(r.body.data.length,n);
    assert.ok(r.body.data.every(i=>i.estado===estado&&typeof i.ciudad==='string'));
  }
  for(const anterior of merida) {
    const actual=(await pedir(app,`/api/iglesias/${anterior.slug}`)).body.data;
    const {estado,ciudad,...resto}=actual;assert.deepEqual(resto,anterior);
  }
  const consulta=f.llamadas.find(c=>c.p[0]==='puebla');assert.ok(consulta.sql.includes('estado=$1'));assert.deepEqual(consulta.p,['puebla']);
});
test('filtro inválido/vacío/repetido produce400 fields.estado y no consulta',async()=>{
  const f=lecturas(),app=crearApp(f.servicio);
  for(const q of ['estado=','estado=Puebla','estado=desconocido','estado=puebla&estado=campeche','estado=%27%20OR%201%3D1']) {
    const r=await pedir(app,`/api/iglesias?${q}`);assert.equal(r.status,400);assert.ok(r.body.error.fields.estado);
  }
  assert.equal(f.llamadas.length,0);
});
test('las ocho aceptan rutas parametrizadas, secciones vacías y fechas sin perder aislamiento',async()=>{
  const f=lecturas();
  for(const i of iglesias) {
    assert.equal((await f.servicio.obtenerIglesia(i.slug)).id,i.id);
    assert.deepEqual(await f.servicio.listarMateriales(i.slug),[]);
    assert.deepEqual(await f.servicio.listarHorarios(i.slug),[]);
    assert.deepEqual(await f.servicio.listarActividades(i.slug,'2026-10-30'),[]);
    assert.deepEqual(f.llamadas.at(-1).p,[i.id,'2026-10-30']);
    const guias=await f.servicio.listarTramites(i.slug);assert.equal(guias.length,4);assert.ok(guias.every(g=>g.iglesia_id===i.id&&g.requisitos.length===0));
  }
  await assert.rejects(f.servicio.obtenerIglesia('santo-domingo'),{status:404});
});
test('administrador global lista/edita las ocho; estado/ciudad permanecen no editables',async()=>{
  const g=crearGestion(async(rol,fn,usuario)=>{
    assert.equal(rol,'iglesias_gestion');assert.equal(usuario,'global');
    return fn(async(sql,p)=>{
      if(sql.startsWith('SELECT id FROM public.iglesias'))return {rows:iglesias.filter(i=>i.slug===p[0])};
      if(sql.startsWith('UPDATE')) {assert.ok(sql.includes('estado,ciudad'));return {rows:iglesias.filter(i=>i.slug===p[1])};}
      return {rows:[]};
    },{rol:'general',iglesia_id:null,iglesia_slug:null});
  });
  for(const i of iglesias) {
    assert.deepEqual(await g.listarMateriales('global',i.slug),[]);
    assert.equal((await g.guardar('global','iglesias',i.slug,{telefono:null})).id,i.id);
  }
  assert.throws(()=>validarCampos('iglesias',{estado:'puebla'}),{status:400});
  assert.throws(()=>validarCampos('iglesias',{ciudad:'otra'}),{status:400});
  assert.deepEqual(validarCampos('iglesias',{descripcion:'',historia:''}),{descripcion:'',historia:''});
  await assert.rejects(g.listarMateriales('global','santo-domingo'),{status:404});
});
test('privados conservan flags/403; proyección pública y permiso no dependen del estado',async()=>{
  for(const i of iglesias) {
    const privado=crearLecturas(async(sql)=>sql.includes('GROUP BY')?[{visibilidad:'privado'}]:[{id:i.id,iglesia_id:i.id,visibilidad:'privado',descripcion_interna:'NO PUBLICAR',tiene_documento:true}]);
    const ficha=await privado.obtenerMaterial('20000000-0000-4000-8000-000000000003');
    assert.ok(ficha.bloqueado&&!ficha.tiene_documento&&!('descripcion_interna'in ficha));
    await assert.rejects(privado.obtenerDocumento('20000000-0000-4000-8000-000000000003'),{status:403});
  }
});
test('lote anterior de Mérida conserva su alcance con catálogo de ocho; admite lote de nuevas',async()=>{
  const datos=JSON.parse(await readFile(new URL('../data/carga-publica.json',import.meta.url),'utf8'));
  // El lote editable ya incluye ocho; esta regresión verifica el subconjunto original.
  datos.iglesias=datos.iglesias.filter(i=>merida.some(m=>m.slug===i.slug));
  const plan=prepararCarga(datos);assert.ok(plan.every(o=>merida.some(i=>i.slug===o.slug)));
  const nuevasFilas={version:1,iglesias:[{slug:'la-compania',informacion:{historia:'',direccion:''},materiales:[],horarios:[],tramites:[]}]};
  assert.equal(prepararCarga(nuevasFilas)[0].slug,'la-compania');
  assert.deepEqual(vistaPrevia(prepararCarga(nuevasFilas),'huella').iglesias,['la-compania']);
  const consultas=[];
  await ejecutarCarga({query:async(sql)=>{
    consultas.push(sql);
    if(sql.startsWith('SELECT id,slug'))return {rows:iglesias};
    if(sql.startsWith('SELECT historia'))return {rows:[{historia:'',direccion:''}]};
    return {rows:[]};
  }},prepararCarga(nuevasFilas));
  assert.ok(!consultas.some(sql=>sql.startsWith('UPDATE')));
});
test('010 coincide exactamente con generador/datos revisables y no añade datos a Mérida',async()=>{
  assert.equal(generarCatalogo(nuevas),await readFile(new URL('../sql/010_iglesias_fase2.sql',import.meta.url),'utf8'));
  assert.deepEqual(nuevas.map(i=>i.slug),slugsIglesias.slice(4));
  assert.ok(nuevas.every(i=>!merida.some(m=>m.id===i.id)&&Number.isFinite(i.latitud)&&Number.isFinite(i.longitud)));
});
