import test from 'node:test';
import assert from 'node:assert/strict';
import { randomBytes } from 'node:crypto';
import { hashPassword } from 'better-auth/crypto';
import { cuentasDemo,revisarCuentas,completarCuentas,verificarCuenta } from '../scripts/lib/cuentas-demo.js';

function almacen(usuarios={},asignadas={},permitido=true) {
  const consultas=[];
  return {consultas,query:async(sql,p)=>{
    consultas.push({sql,p});
    if(sql.includes('AS permitido'))return {rows:[{permitido,elevado:false,propietario:false}]};
    if(sql.includes("rol='general'"))return {rows:[{id:'general-preservado'}]};
    if(sql.includes('FROM public.iglesias'))return {rows:[{id:p[0]}]};
    if(sql.includes('FROM public.auth_user u'))return {rows:usuarios[p[0]]??[]};
    if(sql.includes('WHERE iglesia_id'))return {rows:asignadas[p[0]]??[]};
    throw new Error('Consulta inesperada');
  }};
}
test('revisa primero las dos previas, conserva hashes Better Auth coincidentes y no escribe',async()=>{
  const password=randomBytes(20).toString('hex'),hash=await hashPassword(password);
  const usuarios={},asignadas={};
  for(const c of cuentasDemo.slice(0,2)) {
    usuarios[c.correo]=[{id:c.correo,activo:true,rol:'parroquial',iglesia_id:c.iglesia,password:hash}];
    asignadas[c.iglesia]=[{auth_user_id:c.correo}];
  }
  const pool=almacen(usuarios,asignadas);
  const filas=await revisarCuentas(pool,password,password);
  assert.deepEqual(filas.map(f=>f.resultado),['EXISTENTE_CONSERVADA','EXISTENTE_CONSERVADA',...Array(6).fill('FALTANTE')]);
  assert.deepEqual(pool.consultas.filter(c=>c.sql.includes('FROM public.auth_user u')).map(c=>c.p[0]),cuentasDemo.map(c=>c.correo));
  assert.ok(pool.consultas.every(c=>!/^\s*(INSERT|UPDATE|DELETE|ALTER|GRANT)/.test(c.sql)));
  assert.ok(!JSON.stringify(filas).includes(hash));assert.ok(!JSON.stringify(filas).includes(password));
});
test('contraseña diferente, inactividad, vínculo ajeno y asignación ocupada se conservan como conflictos',async()=>{
  const password=randomBytes(20).toString('hex'),otro=await hashPassword(randomBytes(20).toString('hex'));
  const [a,b,c,d]=cuentasDemo;
  const pool=almacen({
    [a.correo]:[{id:a.correo,activo:true,rol:'parroquial',iglesia_id:a.iglesia,password:otro}],
    [b.correo]:[{id:b.correo,activo:false,rol:'parroquial',iglesia_id:b.iglesia,password:otro}],
    [c.correo]:[{id:c.correo,activo:true,rol:'general',iglesia_id:null,password:otro}],
  },{[a.iglesia]:[{auth_user_id:a.correo}],[d.iglesia]:[{auth_user_id:'otro'}]});
  const filas=await revisarCuentas(pool,password,password);
  assert.deepEqual(filas.slice(0,4).map(f=>f.resultado),['CONFLICTO_PASSWORD',...Array(3).fill('CONFLICTO_ASIGNACION')]);
  const emitidas=[];
  await completarCuentas(filas.slice(0,4),password,{obtenerPool:()=>{throw new Error('No crear conflictos');}},f=>emitidas.push(f));
  assert.equal(emitidas.length,4);
});
test('validación ocurre antes de SQL y rol elevado/no operativo se rechaza antes de leer hashes',async()=>{
  const pool=almacen({}, {},false),password=randomBytes(20).toString('hex');
  await assert.rejects(revisarCuentas(pool,password,'distinta'));
  assert.equal(pool.consultas.length,0);
  await assert.rejects(revisarCuentas(pool,password,password),/PROVISION_ROLE_INVALID/);
  assert.equal(pool.consultas.length,1);
});
test('un fallo de alta interrumpe el lote sin reintentar ni crear otras cuentas',async()=>{
  let intentos=0;const filas=cuentasDemo.map(c=>({...c,resultado:'FALTANTE'}));
  const password=randomBytes(20).toString('hex'),emitidas=[];
  await assert.rejects(completarCuentas(filas,password,{obtenerPool:async()=>{intentos++;throw new Error('fallo');}},f=>emitidas.push(f)),/NO_RETRY/);
  assert.equal(intentos,1);assert.equal(emitidas[0].resultado,'ALTA_FALLIDA_REVISAR_ESTADO');
  assert.equal(filas[1].resultado,'FALTANTE');
});
test('solo las seis faltantes pasan por la provisión individual; las dos existentes no se escriben',async()=>{
  const filas=cuentasDemo.map((c,n)=>({...c,resultado:n<2?'EXISTENTE_CONSERVADA':'FALTANTE'}));
  const altas=[],vinculos=[],password=randomBytes(20).toString('hex');
  const pool={query:async(sql,p)=>{
    if(sql.includes('AS permitido'))return {rows:[{permitido:true,elevado:false,propietario:false}]};
    if(sql.includes('FROM public.iglesias'))return {rows:[{id:p[0]}]};
    if(sql.includes("rol='general'"))return {rows:[{id:'general'}]};
    if(sql.startsWith('INSERT')){vinculos.push(p);return {rows:[]};}
    assert.ok(sql.startsWith('SELECT'));return {rows:[]};
  }};
  await completarCuentas(filas,password,{origen:'http://localhost:5173',obtenerPool:async()=>pool,
    crearAuth:()=>({api:{signUpEmail:async({body})=>{altas.push(body.email);return {user:{id:body.email}};}}})},()=>{});
  assert.deepEqual(altas,cuentasDemo.slice(2).map(c=>c.correo));
  assert.deepEqual(vinculos,cuentasDemo.slice(2).map(c=>[c.correo,'parroquial',c.iglesia]));
  assert.equal(filas.filter(f=>f.resultado==='CREADA').length,6);
});

function httpFalso(permitirAjena=false,revocar=true) {
  let cerrada=false;
  const llamadas=[],propia={id:'propia',slug:'catedral',telefono:null};
  const catalogo=[propia,...cuentasDemo.slice(1).map((c,n)=>({id:String(n),slug:c.iglesia,telefono:n?'555-ejemplo':null}))];
  return {llamadas,fetchImpl:async(url,opciones)=>{
    const path=new URL(url).pathname;llamadas.push({path,...opciones});
    const respuesta=(status,data)=>new Response(data===undefined?null:JSON.stringify({data}),{status});
    if(path.endsWith('/login'))return new Response('{}',{status:200,headers:{'set-cookie':'sesion=solo-prueba; HttpOnly'}});
    if(path.endsWith('/sesion'))return cerrada?respuesta(401):respuesta(200,{rol:'parroquial',iglesia_slug:'catedral',iglesia_id:'propia',csrf_token:'csrf-prueba'});
    if(path.endsWith('/logout')){cerrada=revocar;return respuesta(204);}
    if(path==='/api/admin/iglesias')return cerrada?respuesta(401):respuesta(200,[propia]);
    if(path==='/api/iglesias')return respuesta(200,catalogo);
    if(path.startsWith('/api/admin/iglesias/'))return respuesta(permitirAjena?200:403);
    if(path.endsWith('/documento'))return respuesta(path.startsWith('/api/admin/')?404:403);
    if(path.endsWith('/materiales'))return respuesta(200,[{id:'material-ajeno',visibilidad:'privado'}]);
    throw new Error('Ruta inesperada');
  }};
}
test('verificador HTTP exige ámbito, siete rechazos, privados y revocación sin escrituras de negocio',async()=>{
  const http=httpFalso();
  assert.equal(await verificarCuenta(cuentasDemo[0],randomBytes(20).toString('hex'),'http://localhost:5173',http),'HTTP_OK_7_AJENAS_PRIVADOS_RECHAZADOS');
  assert.equal(http.llamadas.filter(c=>c.path.startsWith('/api/admin/iglesias/')).length,7);
  assert.deepEqual(http.llamadas.filter(c=>c.method!=='GET').map(c=>c.path),['/api/admin/login','/api/admin/logout']);
  assert.deepEqual(http.llamadas.slice(-2).map(c=>c.path),['/api/admin/sesion','/api/admin/iglesias']);
  assert.ok(http.llamadas.slice(-2).every(c=>c.headers.cookie==='sesion=solo-prueba'));
});
test('el verificador falla si se autoriza una lectura ajena y revoca su sesión de prueba',async()=>{
  const http=httpFalso(true);
  await assert.rejects(verificarCuenta(cuentasDemo[0],randomBytes(20).toString('hex'),'http://localhost:5173',http),/HTTP_VERIFICATION_FAILED/);
  assert.ok(http.llamadas.some(c=>c.path.endsWith('/logout')));
  assert.ok(http.llamadas.at(-1).path.endsWith('/admin/iglesias'));
});
test('el verificador rechaza logout204 cuando la sesión anterior sigue válida',async()=>{
  const http=httpFalso(false,false);
  await assert.rejects(verificarCuenta(cuentasDemo[0],randomBytes(20).toString('hex'),'http://localhost:5173',http),/HTTP_VERIFICATION_FAILED/);
});
