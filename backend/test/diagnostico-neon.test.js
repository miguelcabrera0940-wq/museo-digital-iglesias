import { test } from 'node:test';
import assert from 'node:assert/strict';
import { diagnosticar, errorSeguro } from '../src/diagnostico-neon.js';
import { slugsIglesias } from '../src/catalogo.js';
import { verificarNeon } from '../src/verificar-neon.js';

function fallo(code) { return Object.assign(new Error('postgresql://NO_MOSTRAR:CLAVE@host/base'), { code }); }
function escenario({ conteos, notas = fallo('42501'), documento, material } = {}) {
  return {
    consultar: async (sql) => {
      if (sql.includes('descripcion_interna')) { if (notas) throw notas; return []; }
      return [conteos ?? { documentos_privados: '0', paginas_privadas: '0', documentos_visibles: '12', paginas_visibles: '84' }];
    },
    lecturas: {
      listarIglesias: async () => slugsIglesias.map(slug => ({slug})),
      listarMateriales: async () => [material ?? { id: 'ficticio', visibilidad: 'privado', bloqueado: true, tiene_documento: false }],
      obtenerDocumento: async () => {
        if (documento === false) return {};
        throw documento ?? Object.assign(new Error('reservado'), { status: 403, code: 'FORBIDDEN' });
      },
    },
  };
}

test('diagnóstico distingue configuración, red, autenticación, permisos y TLS sin mensajes', () => {
  const casos = [
    [errorSeguro('DB_CONFIG_INVALID'), { etapa: 'configuracion', codigo: 'DATABASE_URL_INVALID' }],
    [fallo('EAI_AGAIN'), { etapa: 'conexion', codigo: 'NET_EAI_AGAIN' }],
    [fallo('28P01'), { etapa: 'autenticacion', codigo: 'PG_28P01' }],
    [fallo('42501'), { etapa: 'permisos', codigo: 'PG_42501' }],
    [errorSeguro('ROLE_OWNER'), { etapa: 'permisos', codigo: 'OWNER_LOGIN' }],
    [fallo('ERR_TLS_CERT_ALTNAME_INVALID'), { etapa: 'conexion', codigo: 'TLS_CERTIFICATE_INVALID' }],
    [fallo('42P01'), { etapa: 'configuracion', codigo: 'PG_42P01' }],
  ];
  for (const [error, esperado] of casos) assert.deepEqual(diagnosticar(error), esperado);
});

test('códigos arbitrarios, mensajes, detalles, causas y AggregateError no se imprimen', () => {
  const desconocido = fallo('postgresql://NO_MOSTRAR:CLAVE@host/base');
  desconocido.detail = 'NO_MOSTRAR';
  desconocido.etapaDb = 'NO_MOSTRAR';
  assert.deepEqual(diagnosticar(desconocido), { etapa: 'consulta', codigo: 'CONSULTA_FAILED' });
  const agregado = new AggregateError([fallo('ECONNREFUSED')], 'NO_MOSTRAR');
  assert.deepEqual(diagnosticar(agregado), { etapa: 'conexion', codigo: 'NET_ECONNREFUSED' });
  assert.equal(JSON.stringify(diagnosticar(desconocido)).includes('NO_MOSTRAR'), false);
});

test('verificador acepta notas 42501 y documento privado 403 como denegaciones esperadas', async () => {
  const { consultar, lecturas } = escenario();
  await verificarNeon(consultar, lecturas);
});

test('pérdida de conexión en prueba de notas no se confunde con una comprobación RLS', async () => {
  const { consultar, lecturas } = escenario({ notas: fallo('ECONNRESET') });
  await assert.rejects(verificarNeon(consultar, lecturas), (e) => {
    assert.deepEqual(diagnosticar(e), { etapa: 'conexion', codigo: 'NET_ECONNRESET' });
    return true;
  });
});

test('error de autenticación al consultar documento no se oculta como 403 faltante', async () => {
  const { consultar, lecturas } = escenario({ documento: fallo('28P01') });
  await assert.rejects(verificarNeon(consultar, lecturas), (e) => diagnosticar(e).etapa === 'autenticacion');
});

test('fallos de RLS y notas visibles llevan códigos distintos', async () => {
  const casos = [
    [{ conteos: { documentos_privados: '1', paginas_privadas: '7', documentos_visibles: '12', paginas_visibles: '84' } }, 'PRIVATE_ROWS_VISIBLE'],
    [{ conteos: { documentos_privados: '0', paginas_privadas: '0', documentos_visibles: '0', paginas_visibles: '0' } }, 'PUBLIC_ROWS_EMPTY'],
    [{ conteos: {} }, 'RESULT_INVALID'],
    [{ notas: null }, 'INTERNAL_NOTES_VISIBLE'],
    [{ documento: false }, 'PRIVATE_DOCUMENT_ALLOWED'],
    [{ material: { visibilidad: 'privado', bloqueado: false, tiene_documento: true } }, 'PRIVATE_FLAGS_INVALID'],
  ];
  for (const [opciones, codigo] of casos) {
    const { consultar, lecturas } = escenario(opciones);
    await assert.rejects(verificarNeon(consultar, lecturas), (e) => diagnosticar(e).codigo === codigo);
  }
});
