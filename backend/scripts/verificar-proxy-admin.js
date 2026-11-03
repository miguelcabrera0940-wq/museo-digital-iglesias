// Prueba LOCAL optativa: Express + Better Auth reales y Vite, sin .env ni Neon.
// Solo el almacén Auth, permisos, contador y negocio son temporales/simulados.
// Requiere 3001 y 5173 libres; no detiene procesos ajenos ni cambia el frontend.
import assert from 'node:assert/strict';
import { randomBytes } from 'node:crypto';
import { createServer as crearServidorHttp } from 'node:http';
import { createRequire } from 'node:module';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { betterAuth } from 'better-auth';
import { memoryAdapter } from 'better-auth/adapters/memory';
import { crearApp } from '../src/app.js';
import { opcionesAuth } from '../src/admin/auth.js';
import { denegado } from '../src/admin/seguridad.js';
import { ErrorApi } from '../src/errores.js';

let etapa='biblioteca_local', backend, vite, temporal;
try {
  const config={origen:'http://localhost:5173',secreto:randomBytes(48).toString('base64'),seguro:false,vercel:false};
  const database=memoryAdapter({auth_user:[],auth_account:[],auth_session:[],auth_verification:[]});
  const credenciales={email:'temporal@example.invalid',password:randomBytes(32).toString('base64url')};
  const provision=betterAuth(opcionesAuth(config,database,true));
  const alta=await provision.api.signUpEmail({body:{...credenciales,name:'Prueba temporal'},headers:new Headers({origin:config.origen})});
  const auth=betterAuth(opcionesAuth(config,database));
  let activo=true, escrituras=0;
  const app=crearApp({obtenerDocumento:async()=>{throw new ErrorApi(403,'FORBIDDEN','Acceso reservado.');}},
    {auth:async()=>auth,config:()=>config,limitar:async(_tx,_c,_email,verificar)=>verificar(),
      permiso:async usuario=>{if(!activo||usuario!==alta.user.id)throw denegado();return {rol:'general',iglesia_id:null,iglesia_slug:null};},
      gestion:{guardar:async()=>{escrituras++;return {id:'ejemplo-local'};},
        obtenerDocumento:async()=>({material_id:'ejemplo-local',titulo:'Ejemplo ficticio',es_ejemplo:true,paginas:[]})}});
  etapa='backend_3001';backend=crearServidorHttp(app);
  await new Promise((resolve,reject)=>{backend.once('error',reject);backend.listen(3001,'127.0.0.1',resolve);});
  etapa='vite_5173';
  const front=new URL('../../frontend/',import.meta.url);
  const requireFront=createRequire(new URL('package.json',front));
  const {createServer}=await import(pathToFileURL(requireFront.resolve('vite')));
  const {default:original}=await import(new URL('vite.config.js',front));
  temporal=await mkdtemp(join(tmpdir(),'iglesias-proxy-'));
  vite=await createServer({...original,root:fileURLToPath(front),configFile:false,envFile:false,
    cacheDir:temporal,logLevel:'silent',clearScreen:false,optimizeDeps:{noDiscovery:true,include:[]},
    server:{...original.server,host:'localhost',port:5173,strictPort:true}});
  await vite.listen();
  const base='http://localhost:5173';let cookie='',csrf='';
  const pedir=(ruta,method='GET',body,extra={})=>fetch(base+ruta,{method,
    headers:{'X-Iglesias-Admin':'1',...(cookie?{cookie}:{}),...(csrf?{'X-CSRF-Token':csrf}:{}),
      ...(method!=='GET'?{origin:base}:{}),...(body?{'Content-Type':'application/json'}:{}),...extra},
    body:body===undefined?undefined:JSON.stringify(body)});
  etapa='proxy_rutas';
  assert.equal((await pedir('/admin/login')).status,200); // página servida por Vite
  assert.equal((await pedir('/api/admin/sesion')).status,401); // API, no fallback HTML/404
  etapa='proxy_origin';
  assert.equal((await pedir('/api/admin/login','POST',credenciales,{origin:'http://localhost:3001'})).status,403);
  assert.equal((await pedir('/api/admin/login','POST',credenciales,{origin:''})).status,403);
  etapa='proxy_login_cookie';
  const login=await pedir('/api/admin/login','POST',credenciales);assert.equal(login.status,200);
  const cookies=login.headers.getSetCookie();
  assert.ok(cookies.some(c=>/HttpOnly/i.test(c)&&/SameSite=Lax/i.test(c)&&/Max-Age=28800/i.test(c)));
  assert.ok(cookies.every(c=>!/;\s*(Secure|Domain=)/i.test(c)));
  cookie=cookies.map(c=>c.split(';',1)[0]).join('; ');
  const sesion=await pedir('/api/admin/sesion');assert.equal(sesion.status,200);
  assert.equal(sesion.headers.get('cache-control'),'no-store');
  const data=(await sesion.json()).data;csrf=data.csrf_token;
  assert.ok(data.administrador&&!('token'in data));
  etapa='proxy_csrf';
  const ruta='/api/admin/iglesias/catedral',body={historia:'Ejemplo ficticio local'};
  assert.equal((await pedir(ruta,'PATCH',body,{'X-CSRF-Token':''})).status,403);
  assert.equal((await pedir(ruta,'PATCH',body,{origin:'https://ajeno.invalid'})).status,403);
  assert.equal((await pedir(ruta,'PATCH',body)).status,200);assert.equal(escrituras,1);
  etapa='proxy_privados';
  assert.equal((await pedir('/api/admin/materiales/ejemplo/documento')).status,200);
  assert.equal((await pedir('/api/materiales/ejemplo/documento')).status,403);
  activo=false;assert.equal((await pedir('/api/admin/materiales/ejemplo/documento')).status,403);
  etapa='proxy_logout';
  const logout=await pedir('/api/admin/logout','POST');assert.equal(logout.status,204);
  assert.ok(logout.headers.getSetCookie().some(c=>/Max-Age=0/i.test(c)));
  assert.equal((await pedir('/api/admin/sesion')).status,401);
  console.info(JSON.stringify({etapa:'completado',codigo:'OK_LOCAL_MEMORIA',neon:false,navegador:false}));
} catch(error) {
  const codigo=['EPERM','EACCES','EADDRINUSE','ECONNREFUSED'].includes(error.code)?error.code:'PRUEBA_FALLIDA';
  console.error(JSON.stringify({etapa,codigo}));process.exitCode=1;
} finally {
  if(vite)await vite.close().catch(()=>{});
  if(backend?.listening)await new Promise(resolve=>{backend.closeAllConnections();backend.close(resolve);});
  if(temporal)await rm(temporal,{recursive:true,force:true});
}
