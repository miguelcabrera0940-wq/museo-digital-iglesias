import test from 'node:test';
import assert from 'node:assert/strict';
import { PassThrough } from 'node:stream';
import { IncomingMessage, ServerResponse } from 'node:http';
import { crearApp } from '../src/app.js';
import { ErrorApi } from '../src/errores.js';
import { csrf } from '../src/admin/seguridad.js';
const config={origen:'http://localhost:5173',secreto:'x'.repeat(40),seguro:false};
const s={user:{id:'u'},session:{id:'s',expiresAt:new Date(Date.now()+600000)}};
const id='20000000-0000-4000-8000-000000000003';
// Ejecuta Express y sus parsers en memoria. No es una prueba HTTP de puerto/cookie real.
function pedir(app,url,method='GET',body,headers={}) {
  return new Promise((resolve,reject)=>{
    const req=new IncomingMessage(Object.assign(new PassThrough(),{remoteAddress:'127.0.0.1'}));req.url=url;req.method=method;
    const bytes=body===undefined?null:Buffer.from(typeof body==='string'?body:JSON.stringify(body));
    req.headers={'origin':config.origen,'x-iglesias-admin':'1',cookie:'cookie-simulada',...(bytes?{'content-type':'application/json','content-length':String(bytes.length)}:{}),...headers};
    const res=new ServerResponse(req);let contenido='';
    res.write=c=>{contenido+=c;return true;};res.end=c=>{if(c)contenido+=c;resolve({status:res.statusCode,headers:res.getHeaders(),body:contenido?JSON.parse(contenido):null});};
    app.handle(req,res,reject);
    req.complete=true;if(bytes)req.push(bytes);req.push(null);
  });
}
const opciones=(session=s)=>({config:()=>config,auth:async()=>({api:{getSession:async()=>session}}),permiso:async()=>({rol:'general',iglesia_id:null,iglesia_slug:null})});
test('sesión sin cookie devuelve 401 sin biblioteca/configuración/SQL administrativo',async()=>{
  let consulto=false;
  const app=crearApp({}, {auth:async()=>{consulto=true;throw new Error('NO_DEBE_CONECTAR');}});
  const r=await pedir(app,'/api/admin/sesion','GET',undefined,{cookie:''});
  assert.equal(r.status,401);assert.equal(r.body.error.code,'UNAUTHENTICATED');
  assert.equal(r.headers['cache-control'],'no-store');assert.equal(consulto,false);
});
test('Express rechaza privados/escrituras sin sesión y mantiene no-store',async()=>{
  const app=crearApp({},opciones(null));
  for(const [ruta,method,body]of [[`/materiales/${id}/documento`,'GET'],['/materiales','POST',{titulo:'Ejemplo'}],['/horarios/'+id,'DELETE']]) {
    const r=await pedir(app,'/api/admin'+ruta,method,body);
    assert.equal(r.status,401);assert.equal(r.headers['cache-control'],'no-store');
  }
});
test('Express aplica origen, JSON y tamaños; no expone rutas nativas de registro',async()=>{
  const app=crearApp({},opciones());
  assert.equal((await pedir(app,'/api/admin/login','POST',{}, {origin:'https://otro.invalid'})).status,403);
  assert.equal((await pedir(app,'/api/admin/login','POST','{')).status,400);
  assert.equal((await pedir(app,'/api/admin/login','POST',{email:'a@b.invalid',password:'x'.repeat(5000)})).status,413);
  assert.equal((await pedir(app,'/api/admin/login','POST','x',{'content-type':'text/plain'})).status,400);
  const r=await pedir(app,'/api/admin/auth-interno/sign-up/email','POST',{}, {'x-csrf-token':csrf(config,s.session)});
  assert.equal(r.status,404);assert.equal(r.headers['cache-control'],'no-store');
});
test('Express conserva 429 y Retry-After sin llamar al verificador de contraseña',async()=>{
  const app=crearApp({}, {...opciones(),limitar:async()=>{const e=new ErrorApi(429,'RATE_LIMITED','Demasiados intentos.');e.retryAfter=900;throw e;}});
  const r=await pedir(app,'/api/admin/login','POST',{email:'a@b.invalid',password:'x'});
  assert.equal(r.status,429);assert.equal(r.headers['retry-after'],'900');assert.equal(r.body.error.code,'RATE_LIMITED');
});
test('Express enlaza todas las operaciones de negocio y protege cada mutación con CSRF',async()=>{
  const llamadas=[];
  const gestion={guardar:async(...args)=>{llamadas.push(args);return {id};},eliminar:async(...args)=>{llamadas.push(args);},obtenerDocumento:async()=>({material_id:id,paginas:[]}),obtenerMaterial:async()=>({id,descripcion_interna:'Ejemplo interno'}),listarMateriales:async()=>[]};
  const app=crearApp({}, {...opciones(),gestion});
  const headers={'x-csrf-token':csrf(config,s.session)};
  for(const tabla of ['materiales','horarios','actividades','tramites']) {
    assert.equal((await pedir(app,`/api/admin/${tabla}/${id}`,'PATCH',{titulo:'Ejemplo'},headers)).status,200);
    assert.equal((await pedir(app,`/api/admin/${tabla}/${id}`,'PATCH',{titulo:'Ejemplo'})).status,403);
  }
  for(const tabla of ['materiales','horarios','actividades'])assert.equal((await pedir(app,`/api/admin/${tabla}`,'POST',{titulo:'Ejemplo'},headers)).status,201);
  for(const tabla of ['horarios','actividades'])assert.equal((await pedir(app,`/api/admin/${tabla}/${id}`,'DELETE',undefined,headers)).status,204);
  assert.equal((await pedir(app,'/api/admin/iglesias/catedral','PATCH',{historia:'Ejemplo'},headers)).status,200);
  assert.equal((await pedir(app,'/api/admin/iglesias/catedral/materiales')).status,200);
  assert.equal((await pedir(app,`/api/admin/materiales/${id}`)).status,200);
  assert.equal((await pedir(app,`/api/admin/materiales/${id}/documento`)).status,200);
  assert.ok(llamadas.every(args=>args[0]==='u'));
});
