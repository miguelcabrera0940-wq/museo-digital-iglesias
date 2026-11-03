import test from 'node:test';
import assert from 'node:assert/strict';
import { crearControlAdmin } from '../src/admin/rutas.js';
import { configuracion, csrf, validarCsrf, validarLogin, validarOrigen, consumirIntento, denegado } from '../src/admin/seguridad.js';
import { crearGestion, validarCampos } from '../src/admin/gestion.js';
import { crearTransaccionAdmin } from '../src/admin/db.js';
import { opcionesAuth } from '../src/admin/auth.js';
import { crearLecturas } from '../src/lecturas.js';
const config={origen:'http://localhost:5173',secreto:'x'.repeat(40),seguro:false,vercel:false};
const id='20000000-0000-4000-8000-000000000003';
const iglesia='00000000-0000-4000-8000-000000000001';
const s={user:{id:'usuario'},session:{id:'sesion',expiresAt:new Date(Date.now()+300000)}};
const req=(headers={},body)=>({get:k=>({'origin':config.origen,'x-iglesias-admin':'1',cookie:'cookie-simulada',...headers}[k]),body,method:'PATCH',socket:{remoteAddress:'127.0.0.1'}});
const res=()=>({headers:{},statusCode:200,set(k,v){this.headers[k]=v;return this;},append(k,v){(this.headers[k]??=[]).push(v);},json(b){this.body=b;return this;},status(n){this.statusCode=n;return this;},end(){this.ended=true;}});
function deps(session=s){return {config:()=>config,permiso:async()=>({rol:'general',iglesia_id:null,iglesia_slug:null}),limitar:async(_tx,_c,_email,verificar)=>verificar(),auth:async()=>({api:{getSession:async()=>session}})};}

test('configuración cerrada, origen exacto, CSRF por sesión',()=>{
  assert.throws(()=>configuracion({APP_ORIGIN:'https://example.test',BETTER_AUTH_SECRET:'corto'}));
  assert.throws(()=>configuracion({APP_ORIGIN:'http://example.test',BETTER_AUTH_SECRET:config.secreto}));
  assert.throws(()=>validarOrigen(req({origin:'https://ajeno.test'}),config),{status:403});
  const token=csrf(config,s.session);
  validarCsrf(config,s.session,token);
  for(const otro of ['corto','g'.repeat(64),csrf(config,{id:'otra'})]) assert.throws(()=>validarCsrf(config,s.session,otro),{status:403});
  assert.equal(validarLogin({email:' UNO@example.test ',password:' con espacios '}).password,' con espacios ');
  assert.throws(()=>validarLogin({email:'a@b.test',password:'x',rol:'admin'}),{status:400});
});
test('sesión: 401 ausente/expirada, 403 sin permiso; CSRF antes de mutar',async()=>{
  for(const sesion of [null,{...s,session:{id:'vieja',expiresAt:new Date(0)}}]) {
    await assert.rejects(crearControlAdmin(deps(sesion)).proteger(req(),res(),()=>assert.fail()),{status:401});
  }
  await assert.rejects(crearControlAdmin({...deps(),permiso:async()=>{throw denegado();}}).consultarSesion(req(),res()),{status:403});
  const c=crearControlAdmin(deps());
  await assert.rejects(c.proteger(req(),res(),()=>assert.fail()),{status:403});
  const solicitud=req({'x-csrf-token':csrf(config,s.session)});let paso=false;
  await c.proteger(solicitud,res(),()=>{paso=true;});assert.equal(paso,true);assert.equal(solicitud.usuarioAdmin,'usuario');
  const respuesta=res();await c.consultarSesion(req(),respuesta);
  assert.deepEqual(Object.keys(respuesta.body.data),['administrador','rol','iglesia_id','iglesia_slug','expira_en','csrf_token']);
  assert.equal(JSON.stringify(respuesta.body).includes('"token"'),false);
});
test('login consume límite antes de contraseña, filtra tokens y revoca sesión de no administrador',async()=>{
  const orden=[],headers=new Headers();headers.append('set-cookie','biblioteca=secreto; HttpOnly; Path=/');
  const api={signInEmail:async()=>{orden.push('password');return {headers,response:{user:{id:'usuario'},token:'NO_PUBLICAR'}};},signOut:async()=>{orden.push('revocada');}};
  const d={...deps(),limitar:async(_tx,_c,_email,verificar)=>{orden.push('limite');return verificar();},auth:async()=>({api})};
  const respuesta=res();await crearControlAdmin(d).login(req({}, {email:'a@b.test',password:'x'}),respuesta);
  assert.deepEqual(orden,['limite','password']);assert.deepEqual(respuesta.body,{data:{administrador:true}});
  assert.equal(respuesta.headers['Set-Cookie'].length,1);
  orden.length=0;const rechazo=res();
  await assert.rejects(crearControlAdmin({...d,permiso:async()=>{throw denegado();}}).login(req({}, {email:'a@b.test',password:'x'}),rechazo),{status:403});
  assert.deepEqual(orden,['limite','password','revocada']);assert.equal(rechazo.headers['Set-Cookie'],undefined);
  let verificado=false;
  await assert.rejects(crearControlAdmin({...d,limitar:async()=>{throw new Error('DB_DOWN');},auth:async()=>{verificado=true;}}).login(req({}, {email:'a@b.test',password:'x'}),res()),/DB_DOWN/);
  assert.equal(verificado,false);
});
test('credenciales incorrectas tienen mensaje genérico; errores de BD siguen siendo errores',async()=>{
  for(const error of [{body:{code:'INVALID_EMAIL_OR_PASSWORD'}},new Error('DB_DOWN')]) {
    const c=crearControlAdmin({...deps(),auth:async()=>({api:{signInEmail:async()=>{throw error;}}})});
    await assert.rejects(c.login(req({}, {email:'a@b.test',password:'x'}),res()),e=>error.body ? e.status===401 && e.message==='Correo o contraseña incorrectos.' : e===error);
  }
});
test('logout requiere CSRF vigente; expirada limpia cookie; fallos no producen 204',async()=>{
  let revocada=false;
  const d={...deps(),auth:async()=>({api:{getSession:async()=>revocada?null:s,signOut:async()=>{revocada=true;return {headers:new Headers({'set-cookie':'biblioteca=; Max-Age=0'})};}}})};
  await assert.rejects(crearControlAdmin(d).logout(req(),res()),{status:403});assert.equal(revocada,false);
  const respuesta=res();await crearControlAdmin(d).logout(req({'x-csrf-token':csrf(config,s.session)}),respuesta);assert.equal(respuesta.statusCode,204);
  const expirada=crearControlAdmin({...d,auth:async()=>({api:{getSession:async()=>null,signOut:async()=>({headers:new Headers({'set-cookie':'biblioteca=; Max-Age=0'})})}})});
  const otra=res();await expirada.logout(req(),otra);assert.equal(otra.statusCode,204);assert.equal(otra.headers['Set-Cookie'].length,1);
  const rota=crearControlAdmin({...deps(),auth:async()=>({api:{getSession:async()=>null,signOut:async()=>{throw new Error('DB_DOWN');}}})});
  await assert.rejects(rota.logout(req(),res()),/DB_DOWN/);
  const persistente=crearControlAdmin({...deps(),auth:async()=>({api:{getSession:async()=>s,signOut:async()=>({headers:new Headers()})}})});
  await assert.rejects(persistente.logout(req({'x-csrf-token':csrf(config,s.session)}),res()),/SESSION_REVOKE_FAILED/);
});
test('whitelists, tipos, fechas reales, tamaños y referencias de negocio',()=>{
  const invalidos=[['iglesias',{telefono:999}],['iglesias',{nombre:'otro'}],['materiales',{iglesia_id:iglesia}],['materiales',{imagen_publica:'https://a'}],['materiales',{tipo:'objeto',categoria_id:'libros-documentos'}],['horarios',{dia_semana:7}],['horarios',{hora:'24:00'}],['actividades',{fecha:'2026-02-29'}],['actividades',{hora_inicio:'12:00',hora_fin:'11:59'}],['actividades',{es_ejemplo:'false'}],['tramites',{requisitos:[null]}],['tramites',{estado_verificacion:'oficial'}],['tramites',{titulo:'x'.repeat(161)}],['tramites',{}]];
  for(const [tabla,datos]of invalidos)assert.throws(()=>validarCampos(tabla,datos),{status:400});
  assert.deepEqual(validarCampos('iglesias',{telefono:null,historia:' Ejemplo '}),{telefono:null,historia:'Ejemplo'});
  assert.deepEqual(validarCampos('tramites',{requisitos:[]}),{requisitos:[]});
  assert.throws(()=>validarCampos('materiales',{titulo:'Ejemplo'},true),{status:400});
});
test('gestión parametriza datos, separa iglesia y deja privados solo en administración',async()=>{
  const consultas=[];
  const tx=async(rol,fn,usuario)=>{assert.equal(rol,'iglesias_gestion');assert.equal(usuario,'usuario');return fn(async(sql,p)=>{
    consultas.push({sql,p});
    if(sql.startsWith('SELECT id FROM public.iglesias'))return {rows:[{id:iglesia}]};
    if(sql.includes('FROM public.documentos d LEFT'))return {rows:[{material_id:id,titulo:'Ejemplo privado',es_ejemplo:true,paginas:[{numero:1,texto:'Ejemplo reservado',imagen_url:null}]}]};
    return {rows:[{id,iglesia_id:iglesia,visibilidad:'privado',descripcion_interna:'Nota reservada',tiene_documento:true}]};
  },{rol:'general',iglesia_id:null,iglesia_slug:null});};
  const g=crearGestion(tx);
  const lista=await g.listarMateriales('usuario','catedral');assert.equal(lista[0].bloqueado,false);assert.equal(lista[0].tiene_documento,true);
  assert.deepEqual(consultas[1].p,[iglesia]);
  const texto="Ejemplo ' ; DROP TABLE materiales; --";
  await g.guardar('usuario','materiales',id,{descripcion_publica:texto});
  const update=consultas.find(c=>c.sql.startsWith('UPDATE'));assert.equal(update.sql.includes(texto),false);assert.deepEqual(update.p,[texto,id,null]);
  assert.equal((await g.obtenerDocumento('usuario',id)).paginas.length,1);
  const publico=crearLecturas(async()=>[{visibilidad:'privado'}]);
  await assert.rejects(publico.obtenerDocumento(id),{status:403});
  const falta=crearGestion(async(_r,fn)=>fn(async()=>({rows:[]}),{rol:'general',iglesia_id:null,iglesia_slug:null}));
  await assert.rejects(falta.eliminar('usuario','horarios',id),{status:404});
  const fk=crearGestion(async()=>{throw {code:'23503'};});
  await assert.rejects(fk.guardar('usuario','horarios',null,{iglesia_id:iglesia,dia_semana:0,hora:'12:00'},true),{status:400});
});
test('transacciones administrativas rechazan propietario/sin permiso y hacen rollback sin consulta privada',async()=>{
  for(const caso of ['owner','sin-permiso','ok']) {
    const consultas=[];let liberado=false;
    const cliente={query:async(sql)=>{consultas.push(sql);if(sql.includes('AS contexto'))return {rows:[{contexto:true,miembro:true,elevado:false,propietario:caso==='owner'}]};if(sql.includes('FROM public.administrador a'))return {rows:caso==='sin-permiso'?[]:[{rol:'general',iglesia_id:null,iglesia_slug:null}]};return {rows:[]};},release:()=>{liberado=true;}};
    const tx=crearTransaccionAdmin(async()=>({connect:async()=>cliente}));
    let accedio=false;
    const intento=tx('iglesias_gestion',async()=>{accedio=true;},'usuario');
    if(caso==='ok')await intento;else await assert.rejects(intento);
    assert.equal(accedio,caso==='ok');assert.equal(liberado,true);assert.equal(consultas.at(-1),caso==='ok'?'COMMIT':'ROLLBACK');
  }
});
test('opciones Better Auth: ocho horas sin renovación, sin registro y cookies seguras en HTTPS',()=>{
  const opciones=opcionesAuth({...config,seguro:true},{});
  assert.equal(opciones.session.expiresIn,28800);assert.equal(opciones.session.disableSessionRefresh,true);
  assert.equal(opciones.session.cookieCache.enabled,false);assert.equal(opciones.emailAndPassword.disableSignUp,true);
  assert.equal(opciones.advanced.defaultCookieAttributes.httpOnly,true);assert.equal(opciones.advanced.useSecureCookies,true);
  assert.equal(opcionesAuth(config,{},true).emailAndPassword.autoSignIn,false);
});
