// Solo códigos constantes o incluidos en listas cerradas; nunca mensajes del driver.
const propios = {
  DB_CONFIG_INVALID: ['configuracion', 'DATABASE_URL_INVALID'],
  DB_TLS_REQUIRED: ['configuracion', 'TLS_MODE_INVALID'],
  ROLE_CONTEXT_CHANGED: ['permisos', 'ROLE_CONTEXT_CHANGED'],
  ROLE_MEMBERSHIP_REQUIRED: ['permisos', 'IGLESIAS_API_REQUIRED'],
  ROLE_PRIVILEGED: ['permisos', 'PRIVILEGED_LOGIN'],
  ROLE_OWNER: ['permisos', 'OWNER_LOGIN'],
  ENV_FILE_UNAVAILABLE: ['configuracion', 'ENV_FILE_UNAVAILABLE'],
  IGLESIAS_COUNT: ['configuracion', 'SEED_IGLESIAS_COUNT'],
  RLS_PRIVATE_VISIBLE: ['rls_documentos', 'PRIVATE_ROWS_VISIBLE'],
  RLS_RESULT_INVALID: ['rls_documentos', 'RESULT_INVALID'],
  RLS_PUBLIC_EMPTY: ['rls_documentos', 'PUBLIC_ROWS_EMPTY'],
  INTERNAL_NOTES_VISIBLE: ['permisos_notas', 'INTERNAL_NOTES_VISIBLE'],
  INTERNAL_NOTES_IN_PAYLOAD: ['rls_fichas', 'INTERNAL_NOTES_IN_PAYLOAD'],
  PRIVATE_FLAGS_INVALID: ['rls_fichas', 'PRIVATE_FLAGS_INVALID'],
  PRIVATE_DOCUMENT_ALLOWED: ['rls_documentos', 'PRIVATE_DOCUMENT_ALLOWED'],
  PRIVATE_FIXTURES_EMPTY: ['configuracion', 'PRIVATE_FIXTURES_EMPTY'],
};
const red = new Set(['EAI_AGAIN', 'ENOTFOUND', 'ECONNREFUSED', 'ECONNRESET',
  'ETIMEDOUT', 'ENETUNREACH', 'EHOSTUNREACH', 'EPERM', 'EACCES']);
const tls = new Set(['CERT_HAS_EXPIRED', 'DEPTH_ZERO_SELF_SIGNED_CERT', 'SELF_SIGNED_CERT_IN_CHAIN',
  'UNABLE_TO_VERIFY_LEAF_SIGNATURE', 'UNABLE_TO_GET_ISSUER_CERT_LOCALLY', 'ERR_TLS_CERT_ALTNAME_INVALID']);
const pg = {
  '28P01': ['autenticacion', 'PG_28P01'], '28000': ['autenticacion', 'PG_28000'],
  '42501': ['permisos', 'PG_42501'], '42704': ['permisos', 'PG_42704'],
  '3D000': ['configuracion', 'PG_3D000'], '42P01': ['configuracion', 'PG_42P01'],
  '42703': ['configuracion', 'PG_42703'], '53300': ['conexion', 'PG_53300'],
  '57P01': ['conexion', 'PG_57P01'], '57014': ['consulta', 'PG_57014'],
};

export function errorSeguro(codigo) {
  const error = new Error('La comprobación no se completó.');
  error.codigoDiagnostico = codigo;
  return error;
}

export function diagnosticar(error) {
  if (Object.hasOwn(propios, error?.codigoDiagnostico)) {
    const [etapa, codigo] = propios[error.codigoDiagnostico];
    return { etapa, codigo };
  }
  // AggregateError de conexión y causas TLS: inspección acotada, sin serializarlas.
  const candidatos = [error, error?.cause, ...(Array.isArray(error?.errors) ? error.errors.slice(0, 8) : [])];
  for (const candidato of candidatos) {
    const codigo = candidato?.code;
    if (Object.hasOwn(pg, codigo)) return { etapa: pg[codigo][0], codigo: pg[codigo][1] };
    if (red.has(codigo)) return { etapa: 'conexion', codigo: `NET_${codigo}` };
    if (tls.has(codigo)) return { etapa: 'conexion', codigo: 'TLS_CERTIFICATE_INVALID' };
    if (codigo === 'ERR_MODULE_NOT_FOUND') return { etapa: 'configuracion', codigo: 'DRIVER_UNAVAILABLE' };
  }
  const etapa = ['conexion', 'permisos', 'consulta', 'cierre'].includes(error?.etapaDb) ? error.etapaDb : 'consulta';
  return { etapa, codigo: `${etapa.toUpperCase()}_FAILED` };
}
