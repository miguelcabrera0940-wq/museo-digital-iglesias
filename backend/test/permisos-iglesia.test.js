// Autorización y SQL del servicio reales; cliente/filas/sesión simulados. Sin Neon.
import test from 'node:test';
import assert from 'node:assert/strict';
import { crearGestion } from '../src/admin/gestion.js';
import { crearControlAdmin } from '../src/admin/rutas.js';
import { denegado } from '../src/admin/seguridad.js';
const A='00000000-0000-4000-8000-000000000001',B='00000000-0000-4000-8000-000000000002';
const id=(n,s)=>`${n}0000000-0000-4000-8000-00000000000${s}`;
function entorno() {
  const ambitos={general:{rol:'general',iglesia_id:null,iglesia_slug:null,activo:true},
    a:{rol:'parroquial',iglesia_id:A,iglesia_slug:'catedral',activo:true},
    b:{rol:'parroquial',iglesia_id:B,iglesia_slug:'tercera-orden',activo:true}};
  const tablas={iglesias:[{id:A,slug:'catedral',historia:'Ejemplo A',telefono:null},{id:B,slug:'tercera-orden',historia:'Ejemplo B',telefono:null}]};
  for(const [tabla,n]of [['materiales',2],['horarios',3],['actividades',4],['tramites',5]])
    tablas[tabla]=[A,B].map((iglesia_id,k)=>({id:id(n,k+1),iglesia_id,titulo:'Ejemplo',descripcion_interna:`Interno ${k}`,tiene_documento:true,visibilidad:'privado'}));
  const llamadas=[];
  const transaccion=async(rol,fn,u)=>{
    assert.equal(rol,'iglesias_gestion');const a=ambitos[u];if(!a?.activo)throw denegado();
    const copia=structuredClone(tablas);
    try{return await fn(async(sql,p=[])=>{
      llamadas.push({sql,p});
      if(sql.startsWith('SELECT id FROM public.iglesias'))return {rows:tablas.iglesias.filter(i=>i.slug===p[0])};
      if(sql.includes('FROM public.documentos d LEFT JOIN')) {
        assert.ok(sql.includes('m.iglesia_id=$2'));
        const m=tablas.materiales.find(m=>m.id===p[0]&&(!p[1]||m.iglesia_id===p[1]));
        return {rows:m?[{material_id:m.id,titulo:'Ejemplo reservado',es_ejemplo:true,paginas:[{numero:1,texto:'Ejemplo reservado',imagen_url:null}]}]:[]};
      }
      const tabla=sql.includes('FROM public.materiales WHERE')?'materiales':sql.match(/(?:FROM|UPDATE|INTO) public\.(\w+)/)?.[1];
      if(sql.startsWith('SELECT')) {
        if(sql.includes('WHERE id=$1')) {
          assert.ok(sql.includes('iglesia_id=$2'));
          return {rows:tablas[tabla].filter(m=>m.id===p[0]&&(!p[1]||m.iglesia_id===p[1]))};
        }
        if(tabla==='iglesias')return {rows:tablas.iglesias.filter(i=>!p[0]||i.id===p[0])};
        return {rows:tablas[tabla].filter(m=>m.iglesia_id===p[0])};
      }
      if(sql.startsWith('UPDATE')) {
        const campos=sql.match(/ SET (.*?) WHERE/)[1].split(',').map(c=>c.split('=')[0]);
        assert.ok(sql.includes('::uuid IS NULL OR'));
        const r=tablas[tabla].find(r=>r[tabla==='iglesias'?'slug':'id']===p[campos.length]&&(!p.at(-1)||(tabla==='iglesias'?r.id:r.iglesia_id)===p.at(-1)));
        if(r)campos.forEach((c,n)=>r[c]=p[n]);return {rows:r?[r]:[]};
      }
      if(sql.startsWith('DELETE')) {
        assert.ok(sql.includes('iglesia_id=$2'));
        const n=tablas[tabla].findIndex(r=>r.id===p[0]&&(!p[1]||r.iglesia_id===p[1]));
        return {rows:n<0?[]:tablas[tabla].splice(n,1)};
      }
      throw new Error('SQL no previsto');
    },a);}catch(e){Object.assign(tablas,copia);throw e;}
  };
  return {ambitos,tablas,llamadas,g:crearGestion(transaccion)};
}
test('dos cuentas parroquiales: privados propios legibles, UUID/slug ajenos denegados sin datos',async()=>{
  const e=entorno();
  for(const [usuario,propio,ajeno,slugAjeno]of [['a',1,2,'tercera-orden'],['b',2,1,'catedral']]) {
    assert.equal((await e.g.obtenerDocumento(usuario,id(2,propio))).material_id,id(2,propio));
    await assert.rejects(e.g.obtenerDocumento(usuario,id(2,ajeno)),{status:404});
    await assert.rejects(e.g.obtenerMaterial(usuario,id(2,ajeno)),{status:404});
    await assert.rejects(e.g.listarMateriales(usuario,slugAjeno),{status:403});
    const lista=await e.g.listarIglesias(usuario);assert.equal(lista.length,1);assert.equal(lista[0].id,e.ambitos[usuario].iglesia_id);
  }
  assert.equal((await e.g.listarIglesias('general')).length,2);
  assert.equal((await e.g.obtenerDocumento('general',id(2,2))).material_id,id(2,2));
});
test('parroquial edita solo teléfono propio; campos prohibidos se rechazan sin ignorarlos',async()=>{
  const e=entorno();await e.g.guardar('a','iglesias','catedral',{telefono:null});
  await assert.rejects(e.g.guardar('a','iglesias','tercera-orden',{telefono:null}),{status:403});
  for(const patch of [{historia:'Ejemplo'},{descripcion:'Ejemplo'},{telefono:null,historia:'Ejemplo'}])await assert.rejects(e.g.guardar('a','iglesias','catedral',patch),{status:403});
  for(const patch of [{rol:'general'},{iglesia_id:B},{estado:'puebla'}])assert.throws(()=>e.g.guardar('a','iglesias','catedral',patch),{status:400});
  await e.g.guardar('general','iglesias','tercera-orden',{historia:'Ejemplo actualizado'});
  assert.equal(e.tablas.iglesias[1].historia,'Ejemplo actualizado');
});
test('materiales/horarios/actividades: PATCH/DELETE/cuerpos alterados no cruzan iglesia',async()=>{
  const e=entorno();
  for(const [tabla,n,patch]of [['materiales',2,{titulo:'Ejemplo propio'}],['horarios',3,{hora:'12:00'}],['actividades',4,{titulo:'Ejemplo propio'}]]) {
    await e.g.guardar('a',tabla,id(n,1),patch);
    await assert.rejects(e.g.guardar('a',tabla,id(n,2),patch),{status:404});
    assert.equal(e.tablas[tabla][1].titulo,'Ejemplo');
  }
  for(const [tabla,n]of [['horarios',3],['actividades',4]]) {
    await assert.rejects(e.g.eliminar('a',tabla,id(n,2)),{status:404});
    await e.g.eliminar('a',tabla,id(n,1));assert.equal(e.tablas[tabla].length,1);
  }
  const cuerpo={iglesia_id:B,categoria_id:'objetos',tipo:'objeto',titulo:'Ejemplo',descripcion_publica:'Ejemplo',visibilidad:'publico'};
  await assert.rejects(e.g.guardar('a','materiales',null,cuerpo,true),{status:403});
  await assert.rejects(e.g.guardar('a','horarios',null,{iglesia_id:B,dia_semana:0,hora:'12:00'},true),{status:403});
  await assert.rejects(e.g.guardar('a','actividades',null,{iglesia_id:B,tipo:'otro',titulo:'Ejemplo',fecha:'2026-10-30',hora_inicio:'12:00',descripcion:'Ejemplo'},true),{status:403});
});
test('trámites de solo lectura para parroquial, general conserva gestión; cambio/desactivación inmediato',async()=>{
  const e=entorno();
  await assert.rejects(e.g.guardar('a','tramites',id(5,1),{requisitos:[]}),{status:403});
  await e.g.guardar('general','tramites',id(5,1),{requisitos:[]});
  e.ambitos.a={...e.ambitos.a,iglesia_id:B,iglesia_slug:'tercera-orden'};
  await assert.rejects(e.g.obtenerDocumento('a',id(2,1)),{status:404});
  assert.equal((await e.g.obtenerDocumento('a',id(2,2))).material_id,id(2,2));
  e.ambitos.a.activo=false;const antes=e.llamadas.length;
  await assert.rejects(e.g.obtenerDocumento('a',id(2,2)),{status:403});assert.equal(e.llamadas.length,antes);
});
test('sesión devuelve ámbito fresco del servidor, nunca de cuerpo/rol del navegador',async()=>{
  let a={rol:'parroquial',iglesia_id:A,iglesia_slug:'catedral'};
  const control=crearControlAdmin({config:()=>({secreto:'x'.repeat(40)}),permiso:async()=>a,
    auth:async()=>({api:{getSession:async()=>({user:{id:'a'},session:{id:'s',expiresAt:new Date(Date.now()+100000)}})}})});
  const req={get:k=>k==='cookie'?'cookie-simulada':k==='x-iglesias-admin'?'1':undefined,body:{rol:'general',iglesia_id:B}};
  const res={json(b){this.body=b;}};
  await control.consultarSesion(req,res);assert.equal(res.body.data.rol,'parroquial');assert.equal(res.body.data.iglesia_id,A);
  a={rol:'parroquial',iglesia_id:B,iglesia_slug:'tercera-orden'};
  await control.consultarSesion(req,res);assert.equal(res.body.data.iglesia_id,B);
  a=null;await assert.rejects(control.consultarSesion(req,res),{status:403});
});

test('urna informativa reutiliza guía pública sin disponibilidad ni teléfono inventado',async()=>{
  const {crearLecturas}=await import('../src/lecturas.js');
  const lecturas=crearLecturas(async(sql,p)=>{
    if(sql.includes('WHERE slug=$1'))return [{id:A,telefono:null}];
    assert.ok(sql.includes("WHEN 'urnas_nichos' THEN 5"));assert.deepEqual(p,['catedral']);
    return [{iglesia_id:A,tipo:'urnas_nichos',titulo:'Urnas y nichos',requisitos:[],fuente:null,estado_verificacion:'por_confirmar'}];
  });
  const guias=await lecturas.listarTramites('catedral');
  assert.equal(guias[0].tipo,'urnas_nichos');assert.equal(guias[0].requisitos.length,0);
  assert.ok(!('disponibles'in guias[0])&&!('precio'in guias[0]));
  assert.equal((await lecturas.obtenerIglesia('catedral')).telefono,null);
});

test('ámbito ausente/incoherente nunca se interpreta como general',async()=>{
  for(const a of [undefined,true,{rol:'parroquial',iglesia_id:null},{rol:'general',iglesia_id:A}]) {
    let consulto=false;
    const g=crearGestion(async(_rol,fn)=>fn(async()=>{consulto=true;return {rows:[]};},a));
    await assert.rejects(g.obtenerDocumento('identidad',id(2,1)),{status:403});assert.equal(consulto,false);
  }
});
