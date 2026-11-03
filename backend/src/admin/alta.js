// Solo provisión local. No se importa desde las rutas HTTP.
import { slugsIglesias } from '../catalogo.js';
import { validarLogin } from './seguridad.js';

const mensajes = {
  PASSWORD_LENGTH_INVALID: 'La contraseña debe tener entre 12 y 128 caracteres. No se inició el alta.',
  PASSWORD_MISMATCH: 'Las contraseñas no coinciden. No se inició el alta.',
  ROLE_INVALID: 'Selecciona general o parroquial. No se inició el alta.',
  IGLESIA_INVALID: 'Selecciona una iglesia del catálogo para la cuenta parroquial. No se inició el alta.',
  EMAIL_INVALID: 'El correo no es válido. No se inició el alta.',
};
class ErrorEntradaAlta extends Error {
  constructor(codigo) { super(mensajes[codigo]); this.codigo=codigo; }
}
export function diagnosticoAlta(error) {
  if (error instanceof ErrorEntradaAlta && Object.hasOwn(mensajes,error.codigo)) {
    return {etapa:'validacion',codigo:error.codigo,mensaje:mensajes[error.codigo]};
  }
  // Nunca trasladar mensajes, causas, SQL, URL o datos de errores externos.
  return {etapa:'provision',codigo:'PROVISION_FAILED_NO_RETRY_AUTOMATICO'};
}
export function validarEntradaAlta({email,password,confirmacion}) {
  if (typeof password!=='string' || password.length<12 || password.length>128) {
    throw new ErrorEntradaAlta('PASSWORD_LENGTH_INVALID');
  }
  if (typeof confirmacion!=='string' || password!==confirmacion) throw new ErrorEntradaAlta('PASSWORD_MISMATCH');
  try { return validarLogin({email,password}); }
  catch { throw new ErrorEntradaAlta('EMAIL_INVALID'); }
}
export async function crearAdministrador(entrada,{obtenerPool,crearAuth,origen}) {
  // Antes incluso de conectar. No construir auth ni escribir con una entrada inválida.
  const body=validarEntradaAlta(entrada);
  const rol=entrada.rol??'general',slug=entrada.iglesia_slug??null;
  if(!['general','parroquial'].includes(rol))throw new ErrorEntradaAlta('ROLE_INVALID');
  if((rol==='general'&&slug!==null)||(rol==='parroquial'&&!slugsIglesias.includes(slug)))throw new ErrorEntradaAlta('IGLESIA_INVALID');
  const pool=await obtenerPool();
  await comprobarPoolAlta(pool);
  let iglesia_id=null;
  if(rol==='parroquial') {
    const {rows:[i]}=await pool.query('SELECT id FROM public.iglesias WHERE slug=$1',[slug]);
    if(!i)throw new Error('IGLESIA_NOT_FOUND');
    iglesia_id=i.id;
    const {rows:general}=await pool.query("SELECT id FROM public.administrador WHERE rol='general'");
    if(general.length!==1)throw new Error('GENERAL_REQUIRED');
    const {rows:asignada}=await pool.query('SELECT id FROM public.administrador WHERE iglesia_id=$1',[iglesia_id]);
    const {rows:existente}=await pool.query('SELECT id FROM public.auth_user WHERE email=$1',[body.email]);
    if(asignada.length||existente.length)throw new Error('ACCOUNT_EXISTS');
  } else {
    const {rows:cuentas}=await pool.query('SELECT id FROM public.auth_user');
    const {rows:credenciales}=await pool.query('SELECT id FROM public.auth_account');
    const {rows:vinculos}=await pool.query('SELECT id FROM public.administrador');
    if(cuentas.length||credenciales.length||vinculos.length)throw new Error('ACCOUNT_EXISTS');
  }
  const auth=crearAuth(pool);
  const creado=await auth.api.signUpEmail({body:{...body,name:rol==='general'?'Administrador general':'Administrador parroquial'},headers:new Headers({origin:origen})});
  await pool.query('INSERT INTO public.administrador (auth_user_id,activo,rol,iglesia_id) VALUES ($1,true,$2,$3)',[creado.user.id,rol,iglesia_id]);
}

// Compartido por la provisión individual y el lote operativo. Nunca admite propietario.
export async function comprobarPoolAlta(pool) {
  const {rows:[rolSql]}=await pool.query(`SELECT
    current_user=session_user AND pg_has_role(session_user,'iglesias_provision','USAGE') AS permitido,
    EXISTS(SELECT 1 FROM pg_roles WHERE pg_has_role(session_user,oid,'MEMBER') AND
      (rolsuper OR rolbypassrls OR rolcreatedb OR rolcreaterole OR rolreplication OR
       rolname IN ('pg_read_all_data','pg_write_all_data'))) OR
    has_schema_privilege(session_user,'public','CREATE') OR
    has_database_privilege(session_user,current_database(),'CREATE') AS elevado,
    EXISTS(SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace
      WHERE n.nspname='public' AND c.relkind='r' AND pg_has_role(session_user,c.relowner,'MEMBER')) AS propietario`);
  if (!rolSql?.permitido || rolSql.elevado || rolSql.propietario) throw new Error('PROVISION_ROLE_INVALID');
}
