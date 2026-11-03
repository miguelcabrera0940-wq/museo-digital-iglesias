// Operación local autorizada, nunca un endpoint público ni una semilla de contraseñas.
import { privado } from './lib/prompt-privado.js';
import { opcionesConexion } from '../src/db.js';
import { configuracion } from '../src/admin/seguridad.js';
import { opcionesAuth } from '../src/admin/auth.js';
import { diagnosticoAlta,validarEntradaAlta } from '../src/admin/alta.js';
import { diagnosticar } from '../src/diagnostico-neon.js';
import { cuentasDemo,revisarCuentas,completarCuentas,verificarCuenta } from './lib/cuentas-demo.js';

const emitir=fila=>process.stdout.write(JSON.stringify(fila)+'\n');
let pool,etapa='configuracion';
try {
  const modo=process.argv.slice(2);
  if(modo.length>1 || (modo.length && !['--revisar','--verificar'].includes(modo[0])))throw Object.assign(new Error(),{codigoSeguro:'ARGUMENTOS_INVALIDOS'});
  if(!process.stdin.isTTY) {
    for(const fila of cuentasDemo)emitir({...fila,resultado:'NO_VERIFICADA_SIN_TERMINAL_INTERACTIVA'});
    throw Object.assign(new Error(),{codigoSeguro:'TERMINAL_INTERACTIVA_REQUERIDA'});
  }
  const config=configuracion();
  if(config.origen!=='http://localhost:5173')throw Object.assign(new Error(),{codigoSeguro:'APP_ORIGIN_LOCAL_REQUIRED'});
  if(modo[0]==='--verificar') {
    // Solo API: no solicitar conexión operativa, revisar hashes ni ejecutar provisión.
    const password=await privado('Contraseña web de las cuentas existentes (oculta): ');
    validarEntradaAlta({email:cuentasDemo[0].correo,password,confirmacion:password});
    etapa='verificacion_http';
    for(const fila of cuentasDemo) {
      const verificacion=await verificarCuenta(fila,password,config.origen);
      emitir({...fila,verificacion});
      if(verificacion!=='HTTP_OK_7_AJENAS_PRIVADOS_RECHAZADOS')process.exitCode=1;
    }
  } else {
    const url=await privado('Conexión operativa iglesias_alta_admin (oculta; no se guarda): ');
    const password=await privado('Contraseña de demostración autorizada, 12–128 caracteres (oculta): ');
    const confirmacion=await privado('Repetir contraseña (oculta): ');
    const {Pool}=await import('pg');
    const {betterAuth}=await import('better-auth');
    pool=new Pool({...opcionesConexion(url),max:1});pool.on('error',()=>{});
    etapa='revision';
    const filas=await revisarCuentas(pool,password,confirmacion);
    for(const fila of filas)emitir({...fila,etapa:'revision_sin_escrituras'});
    if(modo[0]==='--revisar') {
      if(filas.some(f=>f.resultado.startsWith('CONFLICTO')))process.exitCode=1;
    } else {
      etapa='provision';
      await completarCuentas(filas,password,{origen:config.origen,obtenerPool:async()=>pool,
        crearAuth:database=>betterAuth(opcionesAuth(config,database,true))},emitir);
      etapa='verificacion_http';
      for(const fila of filas) {
        if(!['CREADA','EXISTENTE_CONSERVADA'].includes(fila.resultado)){process.exitCode=1;continue;}
        const verificacion=await verificarCuenta(fila,password,config.origen);
        emitir({...fila,verificacion});
        if(verificacion!=='HTTP_OK_7_AJENAS_PRIVADOS_RECHAZADOS')process.exitCode=1;
      }
    }
  }
} catch(error) {
  const entrada=diagnosticoAlta(error);
  const seguro=diagnosticar(error);
  const codigo=error.codigoSeguro??(entrada.etapa==='validacion'?entrada.codigo:
    seguro.codigo!=='CONSULTA_FAILED'?seguro.codigo:etapa==='provision'?'PROVISION_FAILED_NO_RETRY_AUTOMATICO':'COMPROBACION_FALLIDA_SIN_REINTENTO');
  process.stderr.write(JSON.stringify({etapa,codigo})+'\n');process.exitCode=1;
} finally {if(pool)await pool.end().catch(()=>{});}
