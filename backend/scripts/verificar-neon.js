// Solo lecturas. Salida limitada a etapa/código de una lista cerrada, nunca mensajes SQL.
import { consultar, cerrarConexion } from '../src/db.js';
import { crearLecturas } from '../src/lecturas.js';
import { verificarNeon } from '../src/verificar-neon.js';
import { diagnosticar, errorSeguro } from '../src/diagnostico-neon.js';

let fallo;
try {
  try { process.loadEnvFile('.env'); }
  catch (error) {
    if (error.code !== 'ENOENT' || !process.env.DATABASE_URL) throw errorSeguro('ENV_FILE_UNAVAILABLE');
  }
  await verificarNeon(consultar, crearLecturas(consultar));
} catch (error) {
  fallo = diagnosticar(error);
} finally {
  try { await cerrarConexion(); }
  catch (error) {
    if (!fallo) { error.etapaDb = 'cierre'; fallo = diagnosticar(error); }
  }
}
if (fallo) {
  console.error(JSON.stringify(fallo));
  process.exitCode = 1;
} else {
  console.info(JSON.stringify({ etapa: 'completado', codigo: 'OK' }));
}
