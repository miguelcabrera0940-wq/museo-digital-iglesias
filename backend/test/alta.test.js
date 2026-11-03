import test from 'node:test';
import assert from 'node:assert/strict';
import { randomBytes } from 'node:crypto';
import { crearAdministrador, validarEntradaAlta, diagnosticoAlta } from '../src/admin/alta.js';
const clave=n=>randomBytes(80).toString('hex').slice(0,n);
const email='temporal@example.invalid';
function dobles(ocupada) {
  const llamadas=[];
  return {llamadas,opciones:{origen:'http://localhost:5173',
    obtenerPool:async()=>{llamadas.push('conexion');return {query:async(sql,params)=>{
      if(sql.includes('AS permitido'))return {rows:[{permitido:true,elevado:false,propietario:false}]};
      if(sql.startsWith('SELECT id'))return {rows:sql.includes(ocupada??'NO_EXISTE')?[{id:'existente'}]:[]};
      llamadas.push({sql,params});return {rows:[]};
    }};},
    crearAuth:()=>{llamadas.push('auth');return {api:{signUpEmail:async({body})=>{
      llamadas.push({alta:true,body});return {user:{id:'usuario-temporal'}};
    }}};},
  }};
}
test('contraseñas de 0, 11 y 129 caracteres se rechazan antes de conectar o escribir',async()=>{
  for(const n of [0,11,129]) {
    const password=clave(n),d=dobles();
    await assert.rejects(crearAdministrador({email,password,confirmacion:password},d.opciones),error=>{
      const diagnostico=diagnosticoAlta(error);
      assert.equal(diagnostico.codigo,'PASSWORD_LENGTH_INVALID');
      assert.ok(diagnostico.mensaje.includes('12 y 128'));
      return true;
    });
    assert.equal(d.llamadas.length,0);
  }
});
test('confirmación distinta o ausente se rechaza antes de conectar, crear auth o escribir',async()=>{
  const password=clave(12);
  for(const confirmacion of [undefined,password+'x']) {
    const d=dobles();
    await assert.rejects(crearAdministrador({email,password,confirmacion},d.opciones),e=>diagnosticoAlta(e).codigo==='PASSWORD_MISMATCH');
    assert.equal(d.llamadas.length,0);
  }
});
test('límites 12/128 válidos pasan solo a dobles, sin trim de contraseña y con vínculo parametrizado',async()=>{
  for(const n of [12,128]) {
    const password=' '+clave(n-2)+' ',d=dobles();
    await crearAdministrador({email:' TEMPORAL@example.invalid ',password,confirmacion:password},d.opciones);
    const alta=d.llamadas.find(c=>c.alta);
    assert.ok(alta.body.password===password);assert.equal(alta.body.email,email);
    const insercion=d.llamadas.find(c=>c.sql?.startsWith('INSERT'));
    assert.ok(insercion.sql.includes('$1'));assert.deepEqual(insercion.params,['usuario-temporal','general',null]);
  }
});
test('correo inválido no inicia operaciones; el diagnóstico no traslada entradas o errores externos',async()=>{
  const password=clave(12),d=dobles();
  await assert.rejects(crearAdministrador({email:'invalido',password,confirmacion:password},d.opciones),e=>diagnosticoAlta(e).codigo==='EMAIL_INVALID');
  assert.equal(d.llamadas.length,0);
  const salida=JSON.stringify(diagnosticoAlta(new Error(password)));
  assert.ok(!salida.includes(password));
  assert.equal(diagnosticoAlta(new Error(password)).codigo,'PROVISION_FAILED_NO_RETRY_AUTOMATICO');
  assert.ok(validarEntradaAlta({email,password,confirmacion:password}).password===password);
});
test('cuenta, credencial o vínculo existentes impiden alta y escrituras',async()=>{
  const password=clave(12);
  for(const tabla of ['auth_user','auth_account','administrador']) {
    const d=dobles(tabla);
    await assert.rejects(crearAdministrador({email,password,confirmacion:password},d.opciones),/ACCOUNT_EXISTS/);
    assert.ok(!d.llamadas.includes('auth'));
    assert.ok(!d.llamadas.some(c=>c.sql?.startsWith('INSERT')));
  }
});

test('provisión parroquial conserva general y vincula solo la iglesia elegida',async()=>{
  const password=clave(12),llamadas=[],iglesia='00000000-0000-4000-8000-000000000002';
  const pool={query:async(sql,p)=>{
    llamadas.push({sql,p});
    if(sql.includes('AS permitido'))return {rows:[{permitido:true,elevado:false,propietario:false}]};
    if(sql.includes('FROM public.iglesias')){assert.deepEqual(p,['tercera-orden']);return {rows:[{id:iglesia}]};}
    if(sql.includes("rol='general'"))return {rows:[{id:'general-existente'}]};
    return {rows:[]};
  }};
  await crearAdministrador({email,password,confirmacion:password,rol:'parroquial',iglesia_slug:'tercera-orden'},
    {origen:'http://localhost:5173',obtenerPool:async()=>pool,crearAuth:()=>({api:{signUpEmail:async()=>({user:{id:'nuevo-parroquial'}})}})});
  const insert=llamadas.find(c=>c.sql.startsWith('INSERT'));
  assert.deepEqual(insert.p,['nuevo-parroquial','parroquial',iglesia]);
  assert.ok(llamadas.every(c=>!/^\s*(UPDATE|DELETE|ALTER|GRANT)/.test(c.sql)));
});
test('provisión rechaza rol/iglesia manipulados antes de conectar',async()=>{
  const password=clave(12);
  for(const ambito of [{rol:'superusuario'},{rol:'parroquial',iglesia_slug:'inexistente'},{rol:'general',iglesia_slug:'catedral'}]) {
    const d=dobles();
    await assert.rejects(crearAdministrador({email,password,confirmacion:password,...ambito},d.opciones),e=>['ROLE_INVALID','IGLESIA_INVALID'].includes(diagnosticoAlta(e).codigo));
    assert.equal(d.llamadas.length,0);
  }
});
