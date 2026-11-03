// Operación local autorizada. Nunca importar desde Express ni guardar sus conexiones.
import { randomBytes } from 'node:crypto';
import { pathToFileURL } from 'node:url';
import { Pool } from 'pg';
import { betterAuth } from 'better-auth';
import { privado } from './lib/prompt-privado.js';
import { opcionesConexion } from '../src/db.js';
import { configuracion } from '../src/admin/seguridad.js';
import { opcionesAuth } from '../src/admin/auth.js';
import { validarEntradaAlta, diagnosticoAlta } from '../src/admin/alta.js';
import { diagnosticar } from '../src/diagnostico-neon.js';
import { cuentasDemo,revisarCuentas,completarCuentas,verificarCuenta } from './lib/cuentas-demo.js';

const fallo=codigo=>Object.assign(new Error('Operación detenida.'),{codigoSeguro:codigo});
const atributosSql=`SELECT rolcanlogin,rolinherit,rolsuper,rolcreatedb,rolcreaterole,
  rolreplication,rolbypassrls,rolconnlimit,rolvaliduntil,rolconfig,
  ARRAY(SELECT roleid::text FROM pg_auth_members WHERE member=r.oid ORDER BY roleid) AS membresias
  FROM pg_roles r WHERE rolname=$1`;

export function validarDestino(urlOperador,env) {
  const origen=new URL(opcionesConexion(urlOperador).connectionString);
  const destino=u=>[u.hostname.replace(/-pooler(?=\.)/,''),u.port||'5432',u.pathname].join('|');
  if(!origen.hostname.endsWith('.neon.tech'))throw fallo('NEON_HOST_REQUIRED');
  for(const clave of ['DATABASE_URL','DATABASE_URL_ADMIN']) {
    const runtime=new URL(opcionesConexion(env[clave]).connectionString);
    if(destino(runtime)!==destino(origen))throw fallo('RAMA_O_BASE_DISTINTA');
  }
  return origen;
}

export async function restablecerClave(cliente) {
  const {rows:[antes]}=await cliente.query(atributosSql,['iglesias_alta_admin']);
  if(!antes)throw fallo('ROL_OPERATIVO_INEXISTENTE');
  // No habilitar LOGIN ni siquiera si la contraseña se podría cambiar en NOLOGIN.
  if(!antes.rolcanlogin)throw fallo('IGLESIAS_ALTA_ADMIN_NOLOGIN_SIN_CAMBIOS');
  const clave=randomBytes(32).toString('hex');
  await cliente.query('BEGIN');
  try {
    // Neon exige contraseña original por TLS, no un hash SCRAM generado por psql.
    // El secreto se pasa como parámetro: no se interpola en el texto SQL del cliente.
    await cliente.query("SELECT set_config('iglesias_operacion.clave_temporal',$1,true)",[clave]);
    await cliente.query(`DO $operacion$
      BEGIN
        EXECUTE format('ALTER ROLE iglesias_alta_admin PASSWORD %L',
          current_setting('iglesias_operacion.clave_temporal'));
      END $operacion$`);
    const {rows:[despues]}=await cliente.query(atributosSql,['iglesias_alta_admin']);
    if(JSON.stringify(antes)!==JSON.stringify(despues))throw fallo('ATRIBUTOS_CAMBIADOS_ROLLBACK');
    await cliente.query('COMMIT');
    return clave; // Solo memoria; nunca salida, archivo, argumento o variable de entorno.
  } catch(error) {
    await cliente.query('ROLLBACK').catch(()=>{});
    throw error;
  }
}

async function apiLocal() {
  const base='http://127.0.0.1:3001';
  let servidor;
  try {
    const r=await fetch(base+'/api/iglesias',{signal:AbortSignal.timeout(10000)});
    if(r.status!==200)throw fallo('API_LOCAL_NO_DISPONIBLE');
  } catch(error) {
    if(error?.cause?.code!=='ECONNREFUSED')throw error;
    // No requiere otra terminal: solo inicia el backend existente si no está escuchando.
    const {crearApp}=await import('../src/app.js');
    servidor=await new Promise((resolve,reject)=>{
      const s=crearApp().listen(3001,'127.0.0.1',()=>resolve(s));s.once('error',reject);
    });
  }
  return {base,cerrar:async()=>{
    if(servidor)await new Promise((resolve,reject)=>{
      servidor.close(e=>e?reject(e):resolve());servidor.closeIdleConnections();
    });
  }};
}

export async function ejecutar() {
  const emitir=fila=>process.stdout.write(JSON.stringify(fila)+'\n');
  let etapa='configuracion',operador,provision,api;
  try {
    if(!process.stdin.isTTY)throw fallo('TERMINAL_INTERACTIVA_REQUERIDA');
    const config=configuracion();
    if(config.origen!=='http://localhost:5173')throw fallo('APP_ORIGIN_LOCAL_REQUIRED');
    // Solo reutiliza un acceso operativo expresamente facilitado en el entorno del proceso.
    // Nunca busca secretos en archivos ni intenta usar el login restringido como operador.
    const url=process.env.IGLESIAS_OPERADOR_URL || await privado('Conexión del operador autorizado para restablecer el rol (oculta; no se guarda): ');
    const destino=validarDestino(url,process.env);
    const password=await privado('Contraseña web de demostración ya acordada (oculta; no se guarda): ');
    validarEntradaAlta({email:cuentasDemo[0].correo,password,confirmacion:password});
    etapa='conexion_operador';
    operador=new Pool({...opcionesConexion(url),max:1});operador.on('error',()=>{});
    // Preflight de catálogo/modelo antes de cambiar la contraseña. Sin migraciones automáticas.
    const {rows:iglesias}=await operador.query('SELECT id,slug FROM public.iglesias ORDER BY slug');
    if(iglesias.length!==8 || cuentasDemo.some(c=>!iglesias.some(i=>i.slug===c.iglesia)))throw fallo('CATALOGO_NO_COINCIDE');
    const {rows:generales}=await operador.query("SELECT auth_user_id FROM public.administrador WHERE rol='general' AND iglesia_id IS NULL");
    if(generales.length!==1)throw fallo('GENERAL_NO_COINCIDE');
    const {rows:[rol]}=await operador.query(atributosSql,['iglesias_alta_admin']);
    if(!rol?.rolcanlogin)throw fallo(rol?'IGLESIAS_ALTA_ADMIN_NOLOGIN_SIN_CAMBIOS':'ROL_OPERATIVO_INEXISTENTE');
    etapa='api_local';
    api=await apiLocal();
    const respuesta=await fetch(api.base+'/api/iglesias',{signal:AbortSignal.timeout(10000)});
    if(respuesta.status!==200)throw fallo('API_LOCAL_NO_DISPONIBLE');
    const publicas=(await respuesta.json()).data;
    if(!Array.isArray(publicas) || publicas.length!==8 || iglesias.some(i=>!publicas.some(p=>p.id===i.id && p.slug===i.slug)))throw fallo('API_CATALOGO_DISTINTO');
    etapa='restablecimiento';
    const cliente=await operador.connect();
    let clave;
    try{clave=await restablecerClave(cliente);}finally{cliente.release();}
    emitir({etapa,codigo:'OK'});
    // La conexión elevada se cierra antes de provisionar/servir peticiones.
    await operador.end();operador=null;
    destino.username='iglesias_alta_admin';destino.password=clave;clave=undefined;
    etapa='conexion_provision';
    provision=new Pool({...opcionesConexion(destino.toString()),max:1});provision.on('error',()=>{});
    etapa='revision';
    const filas=await revisarCuentas(provision,password,password);
    for(const fila of filas)emitir({...fila,etapa});
    etapa='provision';
    await completarCuentas(filas,password,{origen:config.origen,obtenerPool:async()=>provision,
      crearAuth:database=>betterAuth(opcionesAuth(config,database,true))},emitir);
    etapa='verificacion_http';
    for(const fila of filas) {
      if(!['CREADA','EXISTENTE_CONSERVADA'].includes(fila.resultado)){process.exitCode=1;continue;}
      const verificacion=await verificarCuenta(fila,password,config.origen,{base:api.base});
      emitir({...fila,verificacion});
      if(verificacion!=='HTTP_OK_7_AJENAS_PRIVADOS_RECHAZADOS')process.exitCode=1;
    }
  } catch(error) {
    const entrada=diagnosticoAlta(error),seguro=diagnosticar(error);
    emitir({etapa,codigo:error.codigoSeguro??(entrada.etapa==='validacion'?entrada.codigo:
      seguro.codigo!=='CONSULTA_FAILED'?seguro.codigo:'OPERACION_DETENIDA_SIN_REINTENTO')});
    process.exitCode=1;
  } finally {
    if(operador)await operador.end().catch(()=>{});
    if(provision)await provision.end().catch(()=>{});
    if(api)await api.cerrar().catch(()=>{emitir({etapa:'cierre_api',codigo:'CIERRE_PENDIENTE'});process.exitCode=1;});
  }
}

if(process.argv[1] && import.meta.url===pathToFileURL(process.argv[1]).href)await ejecutar();
