import { opcionesConexion } from '../db.js';
import { denegado } from './seguridad.js';
import { validarAmbito } from './permisos.js';

export const comprobarAdminSql = `SELECT current_user=session_user AS contexto,
  pg_has_role(session_user,'iglesias_auth','USAGE') AND
  pg_has_role(session_user,'iglesias_gestion','USAGE') AS miembro,
  EXISTS(SELECT 1 FROM pg_roles r WHERE pg_has_role(session_user,r.oid,'MEMBER') AND
    (r.rolsuper OR r.rolbypassrls OR r.rolcreatedb OR r.rolcreaterole OR r.rolreplication OR
     r.rolname IN ('pg_read_all_data','pg_write_all_data'))) OR
  has_schema_privilege(session_user,'public','CREATE') OR
  has_database_privilege(session_user,current_database(),'CREATE') AS elevado,
  EXISTS(SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace
    WHERE n.nspname='public' AND c.relkind='r' AND pg_has_role(session_user,c.relowner,'MEMBER')) AS propietario`;
export async function verificarLogin(query) {
  const { rows: [r] } = await query(comprobarAdminSql);
  if (!r?.contexto || !r.miembro || r.elevado || r.propietario) throw new Error('ADMIN_ROLE_INVALID');
}
let pool, poolAuth;
export async function obtenerPoolAdmin() {
  if (!pool) {
    const { Pool } = await import('pg');
    pool = new Pool({...opcionesConexion(process.env.DATABASE_URL_ADMIN),max:2});
    pool.on('error', () => {});
  }
  return pool;
}
// Pool separado para Better Auth: evita que verificaciones esperando el mismo contador
// ocupen todas las conexiones necesarias para autenticar. Total máximo por instancia:2+1.
export async function obtenerPoolAuth() {
  if(!poolAuth) {
    const {Pool}=await import('pg');
    poolAuth=new Pool({...opcionesConexion(process.env.DATABASE_URL_ADMIN),max:1});
    poolAuth.on('error',()=>{});
  }
  return poolAuth;
}
export function crearTransaccionAdmin(getPool) {
  return async (rol, operacion, usuario) => {
    if (!['iglesias_auth', 'iglesias_gestion'].includes(rol)) throw new Error('ADMIN_ROLE_INVALID');
    const cliente = await (await getPool()).connect();
    let descartar = false;
    try {
      await cliente.query('BEGIN');
      await verificarLogin((...args) => cliente.query(...args));
      await cliente.query(`SET LOCAL ROLE ${rol}`); // rol de una lista cerrada, nunca del navegador
      let ambito;
      if (rol === 'iglesias_gestion') {
        const { rows } = await cliente.query('SELECT a.rol,a.iglesia_id,i.slug AS iglesia_slug FROM public.administrador a LEFT JOIN public.iglesias i ON i.id=a.iglesia_id WHERE a.auth_user_id=$1 AND a.activo=true', [usuario]);
        if (!rows.length) throw denegado();
        ambito=validarAmbito(rows[0]);
      }
      const resultado = await operacion((...args) => cliente.query(...args),ambito);
      await cliente.query('COMMIT');
      return resultado;
    } catch (error) {
      try { await cliente.query('ROLLBACK'); } catch { descartar = true; }
      throw error;
    } finally { cliente.release(descartar); }
  };
}
export const transaccionAdmin = crearTransaccionAdmin(obtenerPoolAdmin);
export async function esAdministrador(usuario) {
  return transaccionAdmin('iglesias_gestion', (_query,ambito) => ambito, usuario);
}
