import test from 'node:test';
import assert from 'node:assert/strict';
import { randomBytes } from 'node:crypto';
import { once } from 'node:events';
import { crearApp } from '../src/app.js';
import { crearLecturas } from '../src/lecturas.js';
import { crearConsulta } from '../src/db.js';
import { crearTransaccionAdmin } from '../src/admin/db.js';
import { consumirIntento,hmac } from '../src/admin/seguridad.js';
import { opcionesAuth } from '../src/admin/auth.js';

const socket = process.env.IGLESIAS_TEST_PG_SOCKET;
// Nunca usa DATABASE_URL, .env o Neon. Solo el clúster efímero creado por Python.
test('Better Auth/pg reales: sesión, cookies, permisos, privados, CRUD, expiración y límites concurrentes', {
  skip: !socket ? 'Requiere validar_sql_local.py --servidor, Better Auth instalado y sockets locales.' : false,
}, async () => {
  assert.ok(/^\/tmp\/iglesias-sql-[^/]+$/.test(socket));
  const { betterAuth } = await import('better-auth');
  const { Pool } = await import('pg');
  const crearPool=(user,max=2)=>new Pool({host:socket,user,database:'postgres',max});
  const operativo=crearPool('iglesias_alta_admin'), publico=crearPool('iglesias_backend'), admin=crearPool('iglesias_backend_admin');
  const authPool=crearPool('iglesias_backend_admin',1);
  const fixture=crearPool('postgres'); // Solo cambia fixtures locales; nunca sirve la API.
  for(const pool of [operativo,publico,admin,fixture,authPool])pool.on('error',()=>{});
  const config={origen:'http://localhost:5173',secreto:randomBytes(48).toString('base64'),seguro:false,vercel:false};
  const password=randomBytes(32).toString('base64url'),email='temporal@example.invalid';
  let server;
  try {
    const provision=betterAuth(opcionesAuth(config,operativo,true));
    const alta=await provision.api.signUpEmail({body:{name:'Prueba temporal',email,password},headers:new Headers({origin:config.origen})});
    await operativo.query('INSERT INTO public.administrador(auth_user_id) VALUES ($1)',[alta.user.id]);
    const auth=betterAuth(opcionesAuth(config,authPool));
    const transaccion=crearTransaccionAdmin(async()=>admin);
    const lecturas=crearLecturas(crearConsulta(async()=>publico));
    const app=crearApp(lecturas,{config:()=>config,auth:async()=>auth,transaccion,
      permiso:usuario=>transaccion('iglesias_gestion',(_q,a)=>a,usuario)});
    server=app.listen(0,'127.0.0.1');await once(server,'listening');
    const base=`http://127.0.0.1:${server.address().port}/api`;
    const cabeceras={Origin:config.origen,'X-Iglesias-Admin':'1','Content-Type':'application/json'};
    let cookie='',csrf='';
    const peticion=(ruta,method='GET',body,extra={})=>fetch(base+ruta,{method,headers:{...cabeceras,...(cookie?{Cookie:cookie}:{}),...(csrf?{'X-CSRF-Token':csrf}:{}),...extra},body:body===undefined?undefined:JSON.stringify(body)});
    const privado='20000000-0000-4000-8000-000000000003',iglesia='00000000-0000-4000-8000-000000000001';
    assert.equal((await peticion(`/admin/materiales/${privado}/documento`)).status,401);
    assert.equal((await peticion('/admin/login','POST',{email,password},{Origin:'https://ajeno.invalid'})).status,403);
    assert.equal((await peticion('/admin/login','POST',{email,password:randomBytes(32).toString('base64url')})).status,401);
    const login=await peticion('/admin/login','POST',{email,password});assert.equal(login.status,200);
    assert.ok(login.headers.get('cache-control')==='no-store');
    const cookies=login.headers.getSetCookie();assert.ok(cookies.some(c=>/httponly/i.test(c)&&/samesite=lax/i.test(c)));
    cookie=cookies.map(c=>c.split(';',1)[0]).join('; ');
    const sesion=await peticion('/admin/sesion');assert.equal(sesion.status,200);
    const estado=(await sesion.json()).data;csrf=estado.csrf_token;
    const duracion=new Date(estado.expira_en).getTime()-Date.now();assert.ok(duracion>28700000&&duracion<=28800000);
    assert.ok(!('token' in estado));
    assert.equal((await peticion(`/admin/materiales/${privado}/documento`)).status,200);
    await fixture.query('UPDATE public.administrador SET activo=false');
    assert.equal((await peticion(`/admin/materiales/${privado}/documento`)).status,403);
    await fixture.query('UPDATE public.administrador SET activo=true');
    assert.equal((await peticion(`/materiales/${privado}/documento`)).status,403);
    const ficha=(await (await peticion(`/materiales/${privado}`)).json()).data;
    assert.ok(ficha.bloqueado&&!ficha.tiene_documento&&!('descripcion_interna'in ficha));
    const entrada={iglesia_id:iglesia,dia_semana:1,hora:'12:00',nota:'Ejemplo local'};
    assert.equal((await peticion('/admin/horarios','POST',entrada,{'X-CSRF-Token':'invalido'})).status,403);
    const creado=await peticion('/admin/horarios','POST',entrada);assert.equal(creado.status,201);
    const horario=(await creado.json()).data;
    assert.equal((await peticion(`/admin/horarios/${horario.id}`,'PATCH',{hora:'13:00'})).status,200);
    assert.equal((await peticion(`/admin/horarios/${horario.id}`,'DELETE')).status,204);
    const iglesias=(await (await peticion('/iglesias')).json()).data;
    assert.equal(iglesias.length,8);
    for(const i of iglesias) {
      const lista=await peticion(`/admin/iglesias/${i.slug}/materiales`);assert.equal(lista.status,200);
      assert.ok((await lista.json()).data.every(m=>m.iglesia_id===i.id));
    }
    assert.equal((await peticion('/admin/iglesias/catedral','PATCH',{descripcion:'Ejemplo local temporal',telefono:null})).status,200);
    const evento=await peticion('/admin/actividades','POST',{iglesia_id:iglesia,tipo:'otro',titulo:'Ejemplo temporal',fecha:'2026-10-28',hora_inicio:'12:00',hora_fin:'13:00',descripcion:'Ejemplo ficticio'});
    assert.equal(evento.status,201);const actividad=(await evento.json()).data;
    assert.equal(actividad.fecha,'2026-10-28');assert.equal(actividad.hora_inicio,'12:00');
    assert.equal((await peticion(`/admin/actividades/${actividad.id}`,'PATCH',{hora_inicio:'14:00'})).status,400);
    assert.equal((await peticion(`/admin/actividades/${actividad.id}`,'DELETE')).status,204);
    const guias=(await (await peticion('/iglesias/catedral/tramites')).json()).data;
    assert.equal((await peticion(`/admin/tramites/${guias[0].id}`,'PATCH',{requisitos:['Ejemplo ficticio'],estado_verificacion:'por_confirmar'})).status,200);
    assert.equal((await peticion('/admin/horarios','POST',{...entrada,iglesia_id:'ffffffff-ffff-4fff-8fff-ffffffffffff'})).status,400);
    const nuevo=await peticion('/admin/materiales','POST',{iglesia_id:iglesia,categoria_id:'objetos',tipo:'objeto',titulo:'Ejemplo local',descripcion_publica:'Ejemplo ficticio',visibilidad:'privado'});
    assert.equal(nuevo.status,201);const m=(await nuevo.json()).data;assert.ok(m.es_ejemplo&&!m.tiene_documento&&m.imagen_publica===null);
    assert.equal((await peticion(`/admin/materiales/${m.id}`,'PATCH',{iglesia_id:iglesia})).status,400);
    const publica='20000000-0000-4000-8000-000000000000';
    assert.equal((await peticion(`/admin/materiales/${publica}`,'PATCH',{visibilidad:'privado'})).status,200);
    assert.equal((await peticion(`/materiales/${publica}/documento`)).status,403);
    // RLS efectivo como login público en conexión normal, sin SET ROLE de propietario.
    const {rows:docs}=await publico.query('SELECT material_id FROM public.documentos WHERE material_id=$1',[privado]);assert.equal(docs.length,0);
    await assert.rejects(publico.query('SELECT descripcion_interna FROM public.materiales'),e=>e.code==='42501');
    await assert.rejects(admin.query('UPDATE public.administrador SET activo=false'),e=>e.code==='42501');
    await assert.rejects(admin.query('INSERT INTO public.auth_user(id,name,email) VALUES ($1,$2,$3)',['otro','Ejemplo','otro@example.invalid']),e=>e.code==='42501');
    assert.equal((await peticion('/admin/logout','POST')).status,204);
    assert.equal((await peticion(`/admin/materiales/${privado}/documento`)).status,401);
    cookie='';csrf='';
    const segundo=await peticion('/admin/login','POST',{email,password});assert.equal(segundo.status,200);
    cookie=segundo.headers.getSetCookie().map(c=>c.split(';',1)[0]).join('; ');
    await admin.query('UPDATE public.auth_session SET "expiresAt"=now()-interval \'1 second\'');
    assert.equal((await peticion('/admin/sesion')).status,401);
    // Dos cuentas parroquiales reales, sin recrear la cuenta general.
    for(const [sufijo,iglesia_id]of [['a',iglesia],['b','00000000-0000-4000-8000-000000000002']]) {
      const p=await provision.api.signUpEmail({body:{name:'Prueba parroquial',email:`${sufijo}@example.invalid`,password},headers:new Headers({origin:config.origen})});
      await operativo.query("INSERT INTO public.administrador(auth_user_id,rol,iglesia_id) VALUES ($1,'parroquial',$2)",[p.user.id,iglesia_id]);
    }
    for(const sufijo of ['a','b']) {
      cookie='';csrf='';
      const p=await peticion('/admin/login','POST',{email:`${sufijo}@example.invalid`,password});assert.equal(p.status,200);
      cookie=p.headers.getSetCookie().map(c=>c.split(';',1)[0]).join('; ');
      const ambito=(await (await peticion('/admin/sesion')).json()).data;csrf=ambito.csrf_token;
      assert.equal(ambito.rol,'parroquial');
      assert.equal((await (await peticion('/admin/iglesias')).json()).data.length,1);
      const propio=sufijo==='a'?'catedral':'tercera-orden',otro=sufijo==='a'?'tercera-orden':'catedral';
      assert.equal((await peticion(`/admin/iglesias/${propio}`,'PATCH',{telefono:null})).status,200);
      assert.equal((await peticion(`/admin/iglesias/${otro}`,'PATCH',{telefono:null})).status,403);
      assert.equal((await peticion(`/admin/iglesias/${propio}`,'PATCH',{historia:'No permitido'})).status,403);
      assert.equal((await peticion(`/admin/tramites/${guias[0].id}`,'PATCH',{requisitos:[]})).status,403);
      assert.equal((await peticion(`/admin/materiales/${privado}/documento`)).status,sufijo==='a'?200:404);
    }
    // Estado persistido real y dos pools: sin esperas reales prolongadas.
    const otroPool=crearPool('iglesias_backend_admin',1),tx2=crearTransaccionAdmin(async()=>otroPool);
    try {
      const incorrecto=async()=>{throw {body:{code:'INVALID_EMAIL_OR_PASSWORD'}};};
      const emailLimite='limite@example.invalid',clave=hmac(config.secreto,'login-email-v1',emailLimite);
      const cupos=await Promise.allSettled(Array.from({length:12},(_,i)=>consumirIntento(i%2?transaccion:tx2,config,emailLimite,incorrecto)));
      assert.equal(cupos.filter(r=>r.reason?.body?.code==='INVALID_EMAIL_OR_PASSWORD').length,5);
      assert.equal(cupos.filter(r=>r.reason?.status===429).length,7);
      for(let n=6;n<=10;n++) {
        await fixture.query("UPDATE public.login_limite SET ultimo_fallo=clock_timestamp()-interval '3 minutes',bloqueado_hasta=clock_timestamp()-interval '1 second' WHERE clave_hmac=$1",[clave]);
        await assert.rejects(consumirIntento(transaccion,config,emailLimite,incorrecto));
      }
      await assert.rejects(consumirIntento(tx2,config,emailLimite,incorrecto),e=>e.status===429&&e.retryAfter<=120&&e.retryAfter>0);
      await fixture.query("UPDATE public.login_limite SET ultimo_fallo=clock_timestamp()-interval '16 minutes',bloqueado_hasta=clock_timestamp()-interval '14 minutes' WHERE clave_hmac=$1",[clave]);
      await consumirIntento(tx2,config,emailLimite,async()=>({correcto:true}));
      const {rows:[reinicio]}=await admin.query('SELECT fallos FROM public.login_limite WHERE clave_hmac=$1',[clave]);assert.equal(reinicio.fallos,0);
    } finally {await otroPool.end();}
  } finally {
    if(server)await new Promise(resolve=>server.close(resolve));
    await Promise.all([operativo.end(),publico.end(),admin.end(),fixture.end(),authPool.end()]);
  }
});
