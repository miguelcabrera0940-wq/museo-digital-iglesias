// Biblioteca real y Express en memoria; NO PostgreSQL, Neon, navegador o proxy HTTP.
import test from 'node:test';
import assert from 'node:assert/strict';
import { randomBytes } from 'node:crypto';
import { PassThrough } from 'node:stream';
import { IncomingMessage, ServerResponse } from 'node:http';
import { betterAuth } from 'better-auth';
import { memoryAdapter } from 'better-auth/adapters/memory';
import { opcionesAuth } from '../src/admin/auth.js';
import { crearApp } from '../src/app.js';
import { denegado } from '../src/admin/seguridad.js';

function pedir(app,ruta,{method='GET',body,cookie='',csrf,origin,host='localhost:3001'}={}) {
  return new Promise((resolve,reject)=>{
    const req=new IncomingMessage(Object.assign(new PassThrough(),{remoteAddress:'127.0.0.1'}));
    req.url=ruta;req.method=method;
    const bytes=body===undefined?null:Buffer.from(JSON.stringify(body));
    req.headers={host,'x-iglesias-admin':'1',...(cookie?{cookie}:{}),...(csrf?{'x-csrf-token':csrf}:{}),
      ...(origin?{origin}:{}),...(bytes?{'content-type':'application/json','content-length':String(bytes.length)}:{})};
    const res=new ServerResponse(req);let texto='';
    res.write=c=>{texto+=c;return true;};
    res.end=c=>{if(c)texto+=c;resolve({status:res.statusCode,headers:res.getHeaders(),body:texto?JSON.parse(texto):null});};
    app.handle(req,res,reject);req.complete=true;if(bytes)req.push(bytes);req.push(null);
  });
}
async function entorno(seguro=false) {
  const config={origen:seguro?'https://prueba.example.invalid':'http://localhost:5173',
    secreto:randomBytes(48).toString('base64'),seguro,vercel:false};
  const db={auth_user:[],auth_account:[],auth_session:[],auth_verification:[]};
  const database=memoryAdapter(db);
  const credenciales={email:'temporal@example.invalid',password:randomBytes(32).toString('base64url')};
  const provision=betterAuth(opcionesAuth(config,database,true));
  const alta=await provision.api.signUpEmail({body:{...credenciales,name:'Prueba temporal'},headers:new Headers({origin:config.origen})});
  const auth=betterAuth(opcionesAuth(config,database));
  let activo=true, escrituras=0, intentos=0;
  const app=crearApp({}, {config:()=>config,auth:async()=>auth,
    permiso:async usuario=>{if(!activo||usuario!==alta.user.id)throw denegado();return {rol:'general',iglesia_id:null,iglesia_slug:null};},
    limitar:async(_tx,_c,_email,verificar)=>{intentos++;return verificar();},
    gestion:{guardar:async()=>{escrituras++;return {id:'ejemplo-local'};},
      obtenerDocumento:async()=>({material_id:'ejemplo-local',titulo:'Ejemplo ficticio',es_ejemplo:true,paginas:[]})}});
  const login=(extra={})=>pedir(app,'/api/admin/login',{method:'POST',body:credenciales,origin:config.origen,...extra});
  return {config,db,app,login,desactivar:()=>{activo=false;},contadores:()=>({intentos,escrituras})};
}
const cookiesDe=r=>[r.headers['set-cookie']??[]].flat();
const cookieDe=r=>cookiesDe(r).map(c=>c.split(';',1)[0]).join('; ');

test('Better Auth real: cookie de 8h, Origin 5173 independiente de Host, CSRF, logout y expiración',async()=>{
  const e=await entorno();
  assert.equal((await pedir(e.app,'/api/admin/sesion')).status,401);
  assert.equal((await e.login({origin:'http://localhost:3001'})).status,403);
  assert.equal(e.contadores().intentos,0);
  const login=await e.login();assert.equal(login.status,200);
  assert.equal(login.headers['cache-control'],'no-store');
  assert.ok(login.body.data.administrador && !('token' in login.body.data));
  const cookies=cookiesDe(login);
  assert.ok(cookies.some(c=>/HttpOnly/i.test(c)&&/SameSite=Lax/i.test(c)&&/Path=\//i.test(c)&&/Max-Age=28800/i.test(c)));
  assert.ok(cookies.every(c=>!/;\s*(Secure|Domain=)/i.test(c)));
  const cookie=cookieDe(login);
  const sesion=await pedir(e.app,'/api/admin/sesion',{cookie});assert.equal(sesion.status,200);
  const csrf=sesion.body.data.csrf_token;
  const tiempo=Date.parse(sesion.body.data.expira_en)-Date.now();assert.ok(tiempo>28700000&&tiempo<=28800000);
  const mutacion={method:'PATCH',body:{historia:'Ejemplo ficticio'},cookie,origin:e.config.origen};
  assert.equal((await pedir(e.app,'/api/admin/iglesias/catedral',mutacion)).status,403);
  assert.equal((await pedir(e.app,'/api/admin/iglesias/catedral',{...mutacion,csrf:'x'.repeat(64)})).status,403);
  assert.equal((await pedir(e.app,'/api/admin/iglesias/catedral',{...mutacion,csrf,origin:'https://ajeno.invalid'})).status,403);
  assert.equal((await pedir(e.app,'/api/admin/iglesias/catedral',{...mutacion,csrf})).status,200);
  assert.equal(e.contadores().escrituras,1);
  const cierre=await pedir(e.app,'/api/admin/logout',{method:'POST',cookie,csrf,origin:e.config.origen});
  assert.equal(cierre.status,204);assert.ok(cookiesDe(cierre).some(c=>/Max-Age=0/i.test(c)));
  assert.equal((await pedir(e.app,'/api/admin/sesion',{cookie})).status,401);
  assert.equal((await pedir(e.app,'/api/admin/logout',{method:'POST',origin:e.config.origen})).status,204);
  const siguiente=await e.login();assert.equal(siguiente.status,200);
  const cookie2=cookieDe(siguiente);
  assert.equal((await pedir(e.app,'/api/admin/iglesias/catedral',{...mutacion,cookie:cookie2,csrf})).status,403);
  for(const fila of e.db.auth_session)fila.expiresAt=new Date(0);
  assert.equal((await pedir(e.app,'/api/admin/sesion',{cookie:cookie2})).status,401);
});
test('Better Auth real: permiso retirado deniega privados; login sin permiso revoca y no entrega cookie',async()=>{
  const e=await entorno(), login=await e.login();assert.equal(login.status,200);
  const cookie=cookieDe(login);
  assert.equal((await pedir(e.app,'/api/admin/materiales/ejemplo/documento',{cookie})).status,200);
  e.desactivar();
  assert.equal((await pedir(e.app,'/api/admin/materiales/ejemplo/documento',{cookie})).status,403);
  const cantidad=e.db.auth_session.length;
  const sinPermiso=await e.login();assert.equal(sinPermiso.status,403);
  assert.ok(!sinPermiso.headers['set-cookie']);assert.equal(e.db.auth_session.length,cantidad);
});
test('Better Auth real: cookies Secure sin Domain en HTTPS',async()=>{
  const e=await entorno(true),r=await e.login();assert.equal(r.status,200);
  assert.ok(cookiesDe(r).some(c=>/;\s*Secure/i.test(c)&&/HttpOnly/i.test(c)));
  assert.ok(cookiesDe(r).every(c=>!/;\s*Domain=/i.test(c)));
});

test('Better Auth real: contraseña incorrecta/correo inexistente reciben el mismo401 genérico',async()=>{
  const e=await entorno(),password=randomBytes(32).toString('base64url');
  const incorrecta=await e.login({body:{email:'temporal@example.invalid',password}});
  const inexistente=await e.login({body:{email:'inexistente@example.invalid',password}});
  assert.equal(incorrecta.status,401);assert.equal(inexistente.status,401);
  assert.deepEqual(incorrecta.body,inexistente.body);
  assert.equal(incorrecta.body.error.message,'Correo o contraseña incorrectos.');
});
