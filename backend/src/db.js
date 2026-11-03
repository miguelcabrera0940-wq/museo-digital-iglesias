import { errorSeguro } from './diagnostico-neon.js';
import { performance } from 'node:perf_hooks';
import { medicionActual,medirEtapa,describirAdquisicion,registrarConexion } from './medicion-mapa.js';
// No conecta al importar. El driver se carga al primer uso, tras configurar el entorno.
let pool;

export function opcionesConexion(databaseUrl) {
  let url;
  try { url = new URL(databaseUrl); } catch { throw errorSeguro('DB_CONFIG_INVALID'); }
  if (!['postgres:', 'postgresql:'].includes(url.protocol) || !url.username || !url.password ||
      !url.hostname || !url.pathname.slice(1)) throw errorSeguro('DB_CONFIG_INVALID');
  // pg reemplaza el objeto ssl si la URL contiene opciones SSL. Configurar TLS en un solo lugar.
  const modo = url.searchParams.get('sslmode');
  if (modo && !['require', 'verify-full'].includes(modo)) throw errorSeguro('DB_TLS_REQUIRED');
  for (const nombre of ['sslmode', 'sslcert', 'sslkey', 'sslrootcert', 'ssl', 'options']) url.searchParams.delete(nombre);
  return { connectionString: url.toString(), ssl: { rejectUnauthorized: true },
    max: 3, connectionTimeoutMillis: 10000, idleTimeoutMillis: 10000, allowExitOnIdle: true,
    query_timeout: 10000, statement_timeout: 10000 };
}

export const comprobarRolSql = `
  SELECT current_user = session_user AS sin_cambio_rol,
    pg_has_role(session_user, 'iglesias_api', 'USAGE') AS puede_leer,
    EXISTS (SELECT 1 FROM pg_roles r WHERE pg_has_role(session_user,r.oid,'MEMBER')
      AND (r.rolsuper OR r.rolbypassrls OR r.rolcreatedb OR r.rolcreaterole
           OR r.rolreplication OR r.rolname IN ('pg_read_all_data','pg_write_all_data'))) AS privilegiado,
    EXISTS (SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace
      WHERE n.nspname='public' AND c.relname IN ('iglesias','categorias','materiales',
        'documentos','paginas','horarios','actividades','tramites','administrador')
      AND pg_has_role(session_user,c.relowner,'MEMBER')) AS propietario`;

// Mismas comprobaciones frescas por transacción, ejecutadas antes de cambiar de rol.
// Un envío simple al servidor, sin parámetros ni SQL de negocio interpolado.
const erroresPreparacion={P1001:'ROLE_CONTEXT_CHANGED',P1002:'ROLE_MEMBERSHIP_REQUIRED',
  P1003:'ROLE_PRIVILEGED',P1004:'ROLE_OWNER'};
export const prepararLecturaSql=`BEGIN READ ONLY;
DO $iglesias_guardia$
DECLARE rol record;
BEGIN
  SELECT * INTO rol FROM (${comprobarRolSql}) AS comprobacion;
  IF rol.sin_cambio_rol IS DISTINCT FROM true THEN
    RAISE EXCEPTION USING ERRCODE='P1001',MESSAGE='ROLE_CONTEXT_CHANGED';
  END IF;
  IF rol.puede_leer IS DISTINCT FROM true THEN
    RAISE EXCEPTION USING ERRCODE='P1002',MESSAGE='ROLE_MEMBERSHIP_REQUIRED';
  END IF;
  IF rol.privilegiado IS DISTINCT FROM false THEN
    RAISE EXCEPTION USING ERRCODE='P1003',MESSAGE='ROLE_PRIVILEGED';
  END IF;
  IF rol.propietario IS DISTINCT FROM false THEN
    RAISE EXCEPTION USING ERRCODE='P1004',MESSAGE='ROLE_OWNER';
  END IF;
END $iglesias_guardia$;
SET LOCAL ROLE iglesias_api;`;

export function crearConsulta(obtenerPool) {
  return async (sql, parametros = []) => {
    let cliente;
    try {
      const disponible=await medirEtapa('db_init',obtenerPool);
      const inicio=medicionActual()?performance.now():0;
      const enCola=medicionActual() && (disponible.waitingCount>0 || (disponible.idleCount===0 && disponible.totalCount>=disponible.options?.max));
      cliente=await medirEtapa('pool',()=>disponible.connect());
      if(medicionActual())describirAdquisicion(cliente,inicio,enCola,performance.now()-inicio);
    }
    catch (error) { error.etapaDb = 'conexion'; throw error; }
    let transaccion = false;
    let descartar = false;
    let etapa = 'conexion';
    try {
      // El BEGIN puede haber llegado al servidor aunque falle el resto del envío.
      transaccion = true;
      etapa = 'permisos';
      await medirEtapa('db_guard',()=>cliente.query(prepararLecturaSql));
      etapa = 'consulta';
      const resultado = await medirEtapa('sql_driver',()=>cliente.query(sql, parametros));
      await medirEtapa('commit',()=>cliente.query('COMMIT'));
      transaccion = false;
      return resultado.rows;
    } catch (error) {
      if(etapa==='permisos' && Object.hasOwn(erroresPreparacion,error.code)) {
        error=errorSeguro(erroresPreparacion[error.code]);
      }
      error.etapaDb = etapa;
      if (transaccion) {
        try { await cliente.query('ROLLBACK'); } catch { descartar = true; }
      }
      throw error;
    } finally {
      cliente.release(descartar);
    }
  };
}

export const consultar = crearConsulta(async () => {
  if (!pool) {
    const opciones = opcionesConexion(process.env.DATABASE_URL);
    const { Pool } = await import('pg');
    // El muestreo real mostró reconexión tras cada pausa de12s con el límite anterior de10s.
    // Retención acotada solo del pool público; max/allowExitOnIdle y guardias siguen iguales.
    pool = new Pool({...opciones,idleTimeoutMillis:60_000});
    pool.on('connect',registrarConexion);
    // Evitar errores no manejados y no imprimir diagnósticos que contengan secretos.
    pool.on('error', () => {});
  }
  return pool;
});

export async function cerrarConexion() {
  if (pool) { const anterior = pool; pool = undefined; await anterior.end(); }
}
