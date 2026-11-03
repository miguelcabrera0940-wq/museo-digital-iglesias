// Herramienta operativa; no se importa en Express. Ninguna contraseña predeterminada.
import { crearAdministrador, comprobarPoolAlta, validarEntradaAlta } from '../../src/admin/alta.js';
import { verifyPassword } from 'better-auth/crypto';

export const cuentasDemo = Object.freeze([
  ['prueba.catedral@example.invalid','catedral'],
  ['prueba.santaana@example.invalid','santa-ana'],
  ['terceraorden@demo.invalid','tercera-orden'],
  ['santalucia@demo.invalid','santa-lucia'],
  ['catedralcampeche@demo.invalid','catedral-campeche'],
  ['dulcenombrejesus@demo.invalid','dulce-nombre-jesus'],
  ['catedralpuebla@demo.invalid','catedral-puebla'],
  ['lacompania@demo.invalid','la-compania'],
].map(([correo,iglesia])=>Object.freeze({correo,iglesia})));

export async function revisarCuentas(pool,password,confirmacion) {
  validarEntradaAlta({email:cuentasDemo[0].correo,password,confirmacion});
  await comprobarPoolAlta(pool);
  const {rows:general}=await pool.query("SELECT id FROM public.administrador WHERE rol='general'");
  if(general.length!==1)throw new Error('GENERAL_REQUIRED');
  const resultados=[];
  // Se revisan las dos cuentas anteriores primero y todas antes de iniciar altas.
  for(const cuenta of cuentasDemo) {
    const {rows:iglesias}=await pool.query('SELECT id FROM public.iglesias WHERE slug=$1',[cuenta.iglesia]);
    if(iglesias.length!==1)throw new Error('IGLESIA_NOT_FOUND');
    const id=iglesias[0].id;
    const {rows:usuarios}=await pool.query(`SELECT u.id,a.activo,a.rol,a.iglesia_id,c.password
      FROM public.auth_user u LEFT JOIN public.administrador a ON a.auth_user_id=u.id
      LEFT JOIN public.auth_account c ON c."userId"=u.id AND c."providerId"='credential'
      WHERE lower(u.email)=$1`,[cuenta.correo]);
    const {rows:asignadas}=await pool.query('SELECT auth_user_id FROM public.administrador WHERE iglesia_id=$1',[id]);
    const u=usuarios[0];
    let resultado='FALTANTE';
    if(usuarios.length>1 || (u && (u.activo!==true || u.rol!=='parroquial' || u.iglesia_id!==id)) ||
       asignadas.length>(u?1:0) || (asignadas.length===1 && asignadas[0].auth_user_id!==u?.id)) resultado='CONFLICTO_ASIGNACION';
    else if(u) {
      let coincide=false;
      try { coincide=typeof u.password==='string' && await verifyPassword({hash:u.password,password}); } catch {}
      resultado=coincide?'EXISTENTE_CONSERVADA':'CONFLICTO_PASSWORD';
    }
    resultados.push({...cuenta,resultado}); // Nunca devolver hash, identidad ni contraseña.
  }
  return resultados;
}

export async function completarCuentas(resultados,password,opciones,emitir) {
  for(const fila of resultados) {
    if(fila.resultado==='FALTANTE') {
      try {
        await crearAdministrador({email:fila.correo,password,confirmacion:password,rol:'parroquial',iglesia_slug:fila.iglesia},opciones);
        fila.resultado='CREADA';
      } catch {
        fila.resultado='ALTA_FALLIDA_REVISAR_ESTADO';
        emitir({...fila});
        // Puede haber quedado usuario sin vínculo. No reintentar ni seguir creando.
        throw new Error('PROVISION_FAILED_NO_RETRY_AUTOMATICO');
      }
    }
    emitir({...fila});
  }
}

export async function verificarCuenta(fila,password,origin,{fetchImpl=fetch,base='http://localhost:3001'}={}) {
  let cookie='',csrf='',logueada=false;
  const pedir=async(path,method='GET',body)=>{
    const headers={'origin':origin,'x-iglesias-admin':'1',cookie};
    if(csrf)headers['x-csrf-token']=csrf;
    if(body!==undefined)headers['content-type']='application/json';
    return fetchImpl(base+'/api'+path,{method,headers,body:body===undefined?undefined:JSON.stringify(body),redirect:'error',signal:AbortSignal.timeout(15000)});
  };
  const exigir=(valor)=>{if(!valor)throw new Error('HTTP_VERIFICATION_FAILED');};
  let resultado;
  try {
    const login=await pedir('/admin/login','POST',{email:fila.correo,password});
    cookie=login.headers.getSetCookie().map(c=>c.split(';',1)[0]).join('; ');
    exigir(login.status===200 && cookie);logueada=true;
    const sesion=await pedir('/admin/sesion');exigir(sesion.status===200);
    const s=(await sesion.json()).data;csrf=s.csrf_token;
    exigir(s.rol==='parroquial' && s.iglesia_slug===fila.iglesia && csrf);
    const lista=await pedir('/admin/iglesias');exigir(lista.status===200);
    const propias=(await lista.json()).data;
    exigir(propias.length===1 && propias[0].slug===fila.iglesia && propias[0].id===s.iglesia_id);
    const catalogo=await pedir('/iglesias');exigir(catalogo.status===200);
    const otras=(await catalogo.json()).data.filter(i=>i.slug!==fila.iglesia);
    exigir(otras.length===7);
    let privado=false;
    for(const otra of otras) {
      const prohibida=await pedir('/admin/iglesias/'+otra.slug+'/materiales');exigir(prohibida.status===403);
      const materiales=await pedir('/iglesias/'+otra.slug+'/materiales');exigir(materiales.status===200);
      for(const m of (await materiales.json()).data.filter(m=>m.visibilidad==='privado')) {
        const documento=await pedir('/admin/materiales/'+m.id+'/documento');exigir(documento.status===404);
        const publico=await pedir('/materiales/'+m.id+'/documento');exigir(publico.status===403);
        privado=true;
      }
    }
    resultado=privado?'HTTP_OK_7_AJENAS_PRIVADOS_RECHAZADOS':'HTTP_PARCIAL_SIN_PRIVADO_AJENO';
  } finally {
    // Nunca persistir cookies. Revocar la sesión de prueba, también si falla una comprobación.
    if(logueada) {
      if(!csrf) {
        const respuesta=await pedir('/admin/sesion');
        if(respuesta.status===200)csrf=(await respuesta.json()).data.csrf_token;
      }
      const cierre=await pedir('/admin/logout','POST');exigir(cierre.status===204);
      // Conservar deliberadamente la cookie vieja: borrar la cookie del cliente no prueba revocación.
      const revocada=await pedir('/admin/sesion');exigir(revocada.status===401);
      const sinAcceso=await pedir('/admin/iglesias');exigir(sinAcceso.status===401);
    }
  }
  return resultado;
}
